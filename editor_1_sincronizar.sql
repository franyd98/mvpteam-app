
-- ═══════════════════════════════════════════════════════════════════
-- EDITOR 1 · "Sincronizar estructura" en UNA sola operación
--
-- Antes la app enviaba cientos de peticiones seguidas (una por ejercicio y serie
-- de cada microciclo): era lento y, si se cortaba la red a mitad, el programa
-- quedaba medio sincronizado. Ahora la app llama a esta función una sola vez y la
-- base de datos lo hace entero o no hace nada (si algo falla, no cambia nada).
--
-- Hace exactamente lo mismo que antes:
--   · Copia los ejercicios y el nº de series del microciclo origen al resto del día.
--   · Empareja 1 a 1 por ejercicio (mismo exercise_id, en orden).
--   · Añade los que faltan (series sin reps/RIR) y quita los que sobran.
--   · Ajusta el nº de series. NO toca reps/RIR que ya existan.
--
-- Solo puede usarla el admin. Se puede ejecutar varias veces sin problema.
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.sync_microcycle_structure(p_src_mc_id bigint)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_day       bigint;
  v_mc        record;
  v_src       record;
  v_dest_id   bigint;
  v_used      bigint[];
  v_new_me    bigint;
  v_dest_n    integer;
  v_max_set   integer;
  v_count     integer := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo el admin puede sincronizar la estructura' USING ERRCODE = '42501';
  END IF;

  SELECT day_id INTO v_day FROM microcycles WHERE id = p_src_mc_id;
  IF v_day IS NULL THEN
    RAISE EXCEPTION 'Microciclo % no encontrado', p_src_mc_id;
  END IF;

  FOR v_mc IN SELECT id FROM microcycles WHERE day_id = v_day AND id <> p_src_mc_id LOOP
    v_used := '{}';

    FOR v_src IN
      SELECT me.id, me.exercise_id, me.order_index, me.note,
             (SELECT COUNT(*) FROM exercise_sets es WHERE es.microcycle_exercise_id = me.id)::int AS nsets
      FROM microcycle_exercises me
      WHERE me.microcycle_id = p_src_mc_id
      ORDER BY me.order_index, me.id
    LOOP
      -- Pareja en el destino: mismo ejercicio, aún sin usar, la primera por orden
      SELECT d.id INTO v_dest_id
      FROM microcycle_exercises d
      WHERE d.microcycle_id = v_mc.id
        AND d.exercise_id = v_src.exercise_id
        AND NOT (d.id = ANY (v_used))
      ORDER BY d.order_index, d.id
      LIMIT 1;

      IF v_dest_id IS NULL THEN
        -- Falta: crear con series vacías (sin reps/RIR)
        INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
        VALUES (v_mc.id, v_src.exercise_id, v_src.order_index, v_src.nsets, v_src.note)
        RETURNING id INTO v_new_me;
        INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_rpe)
        SELECT v_new_me, n, NULL, NULL FROM generate_series(1, v_src.nsets) AS n;
        v_used := v_used || v_new_me;
      ELSE
        -- Existe: ajustar orden, nº de series y técnica; reps/RIR existentes intactos
        v_used := v_used || v_dest_id;
        UPDATE microcycle_exercises
        SET order_index = v_src.order_index, total_sets = v_src.nsets, note = v_src.note
        WHERE id = v_dest_id;

        SELECT COUNT(*)::int, COALESCE(MAX(set_number), 0) INTO v_dest_n, v_max_set
        FROM exercise_sets WHERE microcycle_exercise_id = v_dest_id;

        IF v_dest_n < v_src.nsets THEN
          INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_rpe)
          SELECT v_dest_id, v_max_set + n, NULL, NULL
          FROM generate_series(1, v_src.nsets - v_dest_n) AS n;
        ELSIF v_dest_n > v_src.nsets THEN
          DELETE FROM exercise_sets
          WHERE id IN (SELECT id FROM exercise_sets
                       WHERE microcycle_exercise_id = v_dest_id
                       ORDER BY set_number DESC
                       LIMIT v_dest_n - v_src.nsets);
        END IF;
      END IF;
    END LOOP;

    -- Sobran: ejercicios del destino sin pareja en el origen
    DELETE FROM microcycle_exercises WHERE microcycle_id = v_mc.id AND NOT (id = ANY (v_used));

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- Comprobación
SELECT CASE WHEN to_regprocedure('public.sync_microcycle_structure(bigint)') IS NOT NULL
            THEN '✅ Función sync_microcycle_structure creada'
            ELSE '❌ No se ha creado' END AS resultado;
