
-- ═══════════════════════════════════════════════════════════════════
-- DUPLICADOS · PASO 2 · FUSIONAR Y BORRAR
-- Ejecuta antes duplicados_1_previsualizar.sql (crea la función _ex_key)
-- y revisa la lista.
--
-- Todo va en un bloque DO: es atómico (si algo falla, no se cambia nada).
--   1. Los programas que usan una copia pasan a usar el ejercicio "bueno".
--   2. Las copias se borran.
--   Los grupos con vídeos DISTINTOS no se tocan.
-- Los registros de pesos (set_logs) no se ven afectados: van por día/posición.
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_old bigint[];
  v_new bigint[];
  n_rep integer;
  n_del integer;
BEGIN
  WITH ex AS (
    SELECT
      e.id, e.name,
      CASE WHEN coalesce(e.video_ref, '') ~* '^https?://' THEN e.video_ref END AS vid,
      public._ex_key(e.name) AS k,
      (SELECT count(*) FROM microcycle_exercises me WHERE me.exercise_id = e.id) AS usos
    FROM exercises e
  ),
  grp AS (
    SELECT k, count(DISTINCT vid) AS nv
    FROM ex GROUP BY k HAVING count(*) > 1
  ),
  plan AS (
    SELECT ex.id,
      CASE
        WHEN g.nv <= 1 THEN first_value(ex.id) OVER w_grupo
        WHEN ex.vid IS NOT NULL THEN first_value(ex.id) OVER w_video
      END AS target_id
    FROM ex JOIN grp g USING (k)
    WINDOW
      w_grupo AS (PARTITION BY ex.k ORDER BY (ex.vid IS NOT NULL) DESC, ex.usos DESC,
                  (ex.name = upper(ex.name)) ASC, (ex.name ~ '^\S{1,10}\s*-\s') ASC, ex.id),
      w_video AS (PARTITION BY ex.k, ex.vid ORDER BY ex.usos DESC,
                  (ex.name = upper(ex.name)) ASC, (ex.name ~ '^\S{1,10}\s*-\s') ASC, ex.id)
  )
  SELECT array_agg(id), array_agg(target_id)
  INTO v_old, v_new
  FROM plan
  WHERE target_id IS NOT NULL AND target_id <> id;

  IF v_old IS NULL THEN
    RAISE NOTICE 'No hay duplicados que fusionar.';
    RETURN;
  END IF;

  -- 1. Repuntar programas
  UPDATE microcycle_exercises me
  SET exercise_id = m.new_id
  FROM unnest(v_old, v_new) AS m(old_id, new_id)
  WHERE me.exercise_id = m.old_id;
  GET DIAGNOSTICS n_rep = ROW_COUNT;

  -- 2. Borrar copias
  DELETE FROM exercises WHERE id = ANY (v_old);
  GET DIAGNOSTICS n_del = ROW_COUNT;

  RAISE NOTICE 'Filas de programas repuntadas: %', n_rep;
  RAISE NOTICE 'Ejercicios duplicados borrados: %', n_del;
END $$;

DROP FUNCTION IF EXISTS public._ex_key(text);
