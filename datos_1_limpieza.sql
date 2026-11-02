
-- ═══════════════════════════════════════════════════════════════════
-- DATOS 1 · Limpiar inconsistencias y añadir reglas para que no se repitan
--
--   A. Cliente con DOS programas activos → se queda activo el más reciente
--      (es el que la app ya le está enseñando).
--   B. Asignaciones duplicadas (mismo cliente y programa) → se deja una.
--   C. Microciclos con dos ejercicios en la misma posición → se renumeran 0,1,2…
--      respetando el orden actual.
--   D. Reglas nuevas: un solo programa activo por cliente; sin asignaciones duplicadas.
--   E. Informe: registros de pesos que se quedaron sueltos al borrar series.
--
-- Los pasos A–C van en un bloque atómico (si algo falla, no se cambia nada).
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  n_a integer; n_b integer; n_c integer;
BEGIN
  -- A. Un solo programa activo por cliente: el de program_id más alto
  UPDATE public.program_assignments pa
  SET active = false
  WHERE pa.active
    AND EXISTS (SELECT 1 FROM public.program_assignments o
                WHERE o.client_id = pa.client_id AND o.active AND o.program_id > pa.program_id);
  GET DIAGNOSTICS n_a = ROW_COUNT;

  -- B. Duplicados (mismo cliente y programa): quedarse con uno, preferentemente el activo
  DELETE FROM public.program_assignments pa
  USING (
    SELECT ctid AS keep_ctid, client_id, program_id
    FROM (
      SELECT ctid, client_id, program_id,
             row_number() OVER (PARTITION BY client_id, program_id ORDER BY active DESC, ctid) AS rn
      FROM public.program_assignments
    ) r WHERE rn = 1
  ) k
  WHERE pa.client_id = k.client_id AND pa.program_id = k.program_id AND pa.ctid <> k.keep_ctid;
  GET DIAGNOSTICS n_b = ROW_COUNT;

  -- C. Renumerar posiciones en los microciclos que tienen repetidas
  UPDATE public.microcycle_exercises me
  SET order_index = r.new_idx
  FROM (
    SELECT id, (row_number() OVER (PARTITION BY microcycle_id ORDER BY order_index, id) - 1) AS new_idx
    FROM public.microcycle_exercises
    WHERE microcycle_id IN (
      SELECT microcycle_id FROM public.microcycle_exercises
      GROUP BY microcycle_id, order_index HAVING COUNT(*) > 1)
  ) r
  WHERE me.id = r.id AND me.order_index IS DISTINCT FROM r.new_idx;
  GET DIAGNOSTICS n_c = ROW_COUNT;

  RAISE NOTICE 'A. Asignaciones activas sobrantes desactivadas: %', n_a;
  RAISE NOTICE 'B. Asignaciones duplicadas borradas: %', n_b;
  RAISE NOTICE 'C. Ejercicios recolocados: %', n_c;
END $$;

-- D. Reglas para que no vuelva a pasar
CREATE UNIQUE INDEX IF NOT EXISTS program_assignments_one_active_per_client
  ON public.program_assignments (client_id) WHERE active;

CREATE UNIQUE INDEX IF NOT EXISTS program_assignments_client_program_unique
  ON public.program_assignments (client_id, program_id);

-- E. Informe (solo lectura)
SELECT 'Clientes con más de un programa activo' AS comprobacion,
       (SELECT COUNT(*) FROM (SELECT client_id FROM program_assignments WHERE active GROUP BY 1 HAVING COUNT(*) > 1) x)::text AS resultado
UNION ALL
SELECT 'Microciclos con posiciones repetidas',
       (SELECT COUNT(*) FROM (SELECT microcycle_id, order_index FROM microcycle_exercises GROUP BY 1, 2 HAVING COUNT(*) > 1) x)::text
UNION ALL
SELECT 'Registros de pesos sueltos (su serie se borró del programa)',
       (SELECT COUNT(*) FROM set_logs WHERE exercise_set_id IS NULL)::text
UNION ALL
SELECT 'Reglas nuevas activas',
       (SELECT COUNT(*) FROM pg_indexes WHERE indexname IN
          ('program_assignments_one_active_per_client', 'program_assignments_client_program_unique'))::text || ' de 2';
