-- ============================================================
-- 31_SQL_REPLICA_TECNICAS_FRANVY.sql
-- Replica los marcadores R&P y Dropset del microciclo que los
-- tenga a TODOS los microciclos del mismo ejercicio+serie en el
-- programa asignado a franvyother.
--
-- PASO 1: Diagnóstico (ejecutar primero para verificar)
-- PASO 2: Actualización (ejecutar después de confirmar)
-- ⚠️  EJECUTAR EN: Supabase → SQL Editor
-- ============================================================

-- ── PASO 1: Diagnóstico ─────────────────────────────────────
-- Ver qué ejercicios+series tienen R&P o Dropset y en qué microciclos

SELECT
  pd.name                   AS dia,
  e.name                    AS ejercicio,
  es.set_number             AS serie,
  mc.number                 AS microciclo,
  es.target_reps            AS reps_actual
FROM exercise_sets es
JOIN microcycle_exercises me ON me.id  = es.microcycle_exercise_id
JOIN microcycles          mc ON mc.id  = me.microcycle_id
JOIN program_days         pd ON pd.id  = mc.day_id
JOIN exercises             e ON e.id   = me.exercise_id
JOIN program_assignments  pa ON pa.program_id = pd.program_id
JOIN profiles              p ON p.id   = pa.client_id
WHERE p.full_name ILIKE '%franvy%'
  AND (es.target_reps ILIKE '%R&P%' OR es.target_reps ILIKE '%dropset%' OR es.target_reps ILIKE '%drop%')
ORDER BY pd.name, e.name, es.set_number, mc.number;


-- ── PASO 2: Propagación ─────────────────────────────────────
-- Para cada (día, ejercicio, serie) que tenga R&P o Dropset en
-- ALGÚN microciclo, copia ese valor a TODOS los microciclos.
-- Si hay varios Mcs con técnica, se usa el de número más ALTO como plantilla.

WITH franvy_program AS (
  SELECT DISTINCT pd.program_id
  FROM program_assignments pa
  JOIN profiles p ON p.id = pa.client_id
  JOIN program_days pd ON pd.program_id = pa.program_id
  WHERE p.full_name ILIKE '%franvy%'
),

-- Plantilla: por cada (day_id, exercise_id, set_number) con técnica,
-- toma el target_reps del microciclo con número más alto
template AS (
  SELECT DISTINCT ON (pd.id, me.exercise_id, es.set_number)
    pd.id           AS day_id,
    me.exercise_id,
    es.set_number,
    es.target_reps  AS reps_tecnica,
    es.target_rpe   AS rpe_tecnica
  FROM exercise_sets es
  JOIN microcycle_exercises me ON me.id  = es.microcycle_exercise_id
  JOIN microcycles          mc ON mc.id  = me.microcycle_id
  JOIN program_days         pd ON pd.id  = mc.day_id
  WHERE pd.program_id IN (SELECT program_id FROM franvy_program)
    AND (es.target_reps ILIKE '%R&P%' OR es.target_reps ILIKE '%dropset%' OR es.target_reps ILIKE '%drop%')
  ORDER BY pd.id, me.exercise_id, es.set_number, mc.number DESC
)

-- Actualizar TODOS los exercise_sets del mismo (día, ejercicio, serie)
UPDATE exercise_sets es
SET
  target_reps = t.reps_tecnica,
  target_rpe  = t.rpe_tecnica
FROM microcycle_exercises me
JOIN microcycles          mc ON mc.id = me.microcycle_id
JOIN program_days         pd ON pd.id = mc.day_id
JOIN template             t  ON t.day_id      = pd.id
                             AND t.exercise_id = me.exercise_id
WHERE es.microcycle_exercise_id = me.id
  AND es.set_number = t.set_number
  AND pd.program_id IN (SELECT program_id FROM franvy_program);

-- ── VERIFICACIÓN FINAL ──────────────────────────────────────
-- Vuelve a ejecutar el PASO 1 para confirmar que todos los Mcs tienen la técnica
