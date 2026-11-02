-- Diagnóstico: ejercicios de TIRÓN en cada microciclo del programa activo de franvyother.
-- Marca con ⚠ los ejercicios repetidos dentro del mismo microciclo
-- y muestra cuántas series tienen reps pautadas (0 = fila creada vacía por la sincronización).

SELECT
  mc.number                                   AS mc,
  me.order_index                              AS pos,
  me.id                                       AS me_id,
  e.name                                      AS ejercicio,
  COUNT(es.id)                                AS series,
  COUNT(es.target_reps)                       AS series_con_reps,
  MIN(es.target_reps)                         AS reps_ejemplo,
  CASE WHEN COUNT(*) OVER (PARTITION BY mc.id, me.exercise_id) > 1
       THEN '⚠ DUPLICADO' ELSE '' END         AS aviso
FROM microcycle_exercises me
JOIN microcycles mc   ON mc.id = me.microcycle_id
JOIN program_days pd  ON pd.id = mc.day_id
JOIN exercises e      ON e.id  = me.exercise_id
LEFT JOIN exercise_sets es ON es.microcycle_exercise_id = me.id
WHERE pd.name ILIKE 'tir%n'
  AND pd.program_id = (
    SELECT pa.program_id
    FROM program_assignments pa
    JOIN profiles p ON p.id = pa.client_id
    WHERE p.full_name ILIKE '%franvyother%' AND pa.active = true
    LIMIT 1
  )
GROUP BY mc.id, mc.number, me.id, me.order_index, me.exercise_id, e.name
ORDER BY mc.number, me.order_index, me.id;
