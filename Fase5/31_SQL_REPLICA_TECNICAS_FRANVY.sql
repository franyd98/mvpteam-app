-- ============================================================
-- 31_SQL_REPLICA_TECNICAS_FRANVY.sql  (v2 — corregido)
-- Replica los marcadores R&P y Drop Set del campo NOTE de
-- microcycle_exercises a TODOS los microciclos del mismo
-- ejercicio (misma posición/order_index en el día) del
-- programa asignado a franvyother.
--
-- PASO 1: Diagnóstico (ejecutar primero para verificar)
-- PASO 2: Actualización (ejecutar después de confirmar)
-- ⚠️  EJECUTAR EN: Supabase → SQL Editor
-- ============================================================

-- ── PASO 1: Diagnóstico ─────────────────────────────────────
-- Ver qué ejercicios tienen R&P o Drop en el campo note,
-- y en qué microciclos aparece.

SELECT
  pd.name                        AS dia,
  e.name                         AS ejercicio,
  me.order_index,
  mc.number                      AS microciclo_con_tecnica,
  me.note                        AS nota
FROM microcycle_exercises me
JOIN microcycles          mc ON mc.id  = me.microcycle_id
JOIN program_days         pd ON pd.id  = mc.day_id
JOIN exercises             e ON e.id   = me.exercise_id
JOIN program_assignments  pa ON pa.program_id = pd.program_id
JOIN profiles              p  ON p.id  = pa.client_id
WHERE p.full_name ILIKE '%franvy%'
  AND (
    me.note ILIKE '%R&P%'
    OR me.note ILIKE '%drop%'
    OR me.note ILIKE '%DS Últ%'
  )
ORDER BY pd.name, me.order_index, mc.number;


-- ── PASO 2: Propagación ─────────────────────────────────────
-- Para cada (día, order_index) que tenga técnica en ALGÚN mc,
-- copia esa nota a TODOS los microciclos del mismo día+posición.
-- Usa el mc con número más ALTO como plantilla.

WITH franvy_program AS (
  SELECT DISTINCT pd.program_id
  FROM program_assignments pa
  JOIN profiles p   ON p.id = pa.client_id
  JOIN program_days pd ON pd.program_id = pa.program_id
  WHERE p.full_name ILIKE '%franvy%'
),

-- Plantilla: por cada (day_id, order_index) con técnica,
-- toma la note del microciclo con número más alto
template AS (
  SELECT DISTINCT ON (pd.id, me.order_index)
    pd.id          AS day_id,
    me.order_index,
    me.note        AS note_tecnica
  FROM microcycle_exercises me
  JOIN microcycles mc ON mc.id = me.microcycle_id
  JOIN program_days pd ON pd.id = mc.day_id
  WHERE pd.program_id IN (SELECT program_id FROM franvy_program)
    AND (
      me.note ILIKE '%R&P%'
      OR me.note ILIKE '%drop%'
      OR me.note ILIKE '%DS Últ%'
    )
  ORDER BY pd.id, me.order_index, mc.number DESC
)

-- Actualizar TODOS los microcycle_exercises con la misma posición en el mismo día
UPDATE microcycle_exercises me
SET note = t.note_tecnica
FROM microcycles mc
JOIN program_days pd ON pd.id = mc.day_id,
template t
WHERE me.microcycle_id = mc.id
  AND pd.id            = t.day_id
  AND me.order_index   = t.order_index
  AND pd.program_id IN (SELECT program_id FROM franvy_program);


-- ── VERIFICACIÓN FINAL ──────────────────────────────────────
-- Vuelve a ejecutar el PASO 1 para confirmar que todos los Mcs tienen la técnica.
