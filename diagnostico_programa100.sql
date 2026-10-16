-- Ejercicios actuales del programa 100 (Post-recomp v2) en el microciclo 1
SELECT 
  pd.name AS dia,
  mc.number AS microciclo,
  me.order_index,
  e.name AS ejercicio,
  e.muscle_group,
  es.set_number,
  es.target_reps
FROM program_days pd
JOIN microcycles mc ON mc.day_id = pd.id
JOIN microcycle_exercises me ON me.microcycle_id = mc.id
JOIN exercises e ON e.id = me.exercise_id
LEFT JOIN exercise_sets es ON es.microcycle_exercise_id = me.id
WHERE pd.program_id = 100
  AND mc.number = 1
ORDER BY pd.order_index, me.order_index, es.set_number;
