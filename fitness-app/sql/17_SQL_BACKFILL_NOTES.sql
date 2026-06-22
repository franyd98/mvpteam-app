-- ============================================================
-- 17_SQL_BACKFILL_NOTES.sql
-- Rellena el campo `note` en microcycle_exercises para todos
-- los ejercicios que actualmente tienen note = NULL.
--
-- Estrategia:
--   Para cada (program_day_id, exercise_id), si al menos un
--   microciclo ya tiene nota, propagarla a todos los demás.
--   Esto copia las notas existentes al resto de microciclos
--   del mismo día sin sobreescribir las que ya están puestas.
-- ============================================================

-- PASO 1: Ver cuántos registros tienen nota vs sin nota (diagnóstico).
-- Ejecuta esto primero para saber el estado actual.
SELECT
  COUNT(*) FILTER (WHERE note IS NOT NULL AND note <> '') AS con_nota,
  COUNT(*) FILTER (WHERE note IS NULL OR note = '')       AS sin_nota,
  COUNT(*)                                                 AS total
FROM microcycle_exercises;

-- ============================================================
-- PASO 2: Propagar notas existentes dentro de cada día.
--
-- Por cada programa_día + ejercicio, coge la primera nota
-- no nula que exista y la pone en todos los microciclos del
-- mismo día que tengan ese ejercicio y aún no tengan nota.
-- ============================================================
UPDATE microcycle_exercises me
SET note = sub.note
FROM (
  -- Para cada (day_id, exercise_id) busca la primera nota disponible
  SELECT
    mc.program_day_id,
    me2.exercise_id,
    MIN(me2.note) AS note          -- MIN sobre texto coge el primer valor no nulo
  FROM microcycle_exercises me2
  JOIN microcycles mc ON mc.id = me2.microcycle_id
  WHERE me2.note IS NOT NULL AND me2.note <> ''
  GROUP BY mc.program_day_id, me2.exercise_id
) sub
JOIN microcycles mc2 ON mc2.program_day_id = sub.program_day_id
WHERE me.microcycle_id = mc2.id
  AND me.exercise_id   = sub.exercise_id
  AND (me.note IS NULL OR me.note = '');

-- ============================================================
-- PASO 3 (OPCIONAL): Si quieres forzar "R&P Últ. Serie" en
-- TODOS los ejercicios de TODOS los microciclos que aún no
-- tengan ninguna nota, descomenta y ejecuta esto:
-- ============================================================
/*
UPDATE microcycle_exercises
SET note = 'R&P Últ. Serie'
WHERE note IS NULL OR note = '';
*/

-- ============================================================
-- PASO 4: Verificación final.
-- ============================================================
SELECT
  COUNT(*) FILTER (WHERE note IS NOT NULL AND note <> '') AS con_nota,
  COUNT(*) FILTER (WHERE note IS NULL OR note = '')       AS sin_nota,
  COUNT(*)                                                 AS total
FROM microcycle_exercises;
