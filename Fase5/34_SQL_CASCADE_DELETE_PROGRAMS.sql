-- Añade ON DELETE CASCADE en la cadena de programas
-- y ON DELETE SET NULL en set_logs para conservar el historial

-- program_assignments
ALTER TABLE program_assignments
  DROP CONSTRAINT IF EXISTS program_assignments_program_id_fkey;
ALTER TABLE program_assignments
  ADD CONSTRAINT program_assignments_program_id_fkey
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE;

-- program_days
ALTER TABLE program_days
  DROP CONSTRAINT IF EXISTS program_days_program_id_fkey;
ALTER TABLE program_days
  ADD CONSTRAINT program_days_program_id_fkey
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE;

-- microcycles
ALTER TABLE microcycles
  DROP CONSTRAINT IF EXISTS microcycles_day_id_fkey;
ALTER TABLE microcycles
  ADD CONSTRAINT microcycles_day_id_fkey
  FOREIGN KEY (day_id) REFERENCES program_days(id) ON DELETE CASCADE;

-- microcycle_exercises
ALTER TABLE microcycle_exercises
  DROP CONSTRAINT IF EXISTS microcycle_exercises_microcycle_id_fkey;
ALTER TABLE microcycle_exercises
  ADD CONSTRAINT microcycle_exercises_microcycle_id_fkey
  FOREIGN KEY (microcycle_id) REFERENCES microcycles(id) ON DELETE CASCADE;

-- exercise_sets
ALTER TABLE exercise_sets
  DROP CONSTRAINT IF EXISTS exercise_sets_microcycle_exercise_id_fkey;
ALTER TABLE exercise_sets
  ADD CONSTRAINT exercise_sets_microcycle_exercise_id_fkey
  FOREIGN KEY (microcycle_exercise_id) REFERENCES microcycle_exercises(id) ON DELETE CASCADE;

-- set_logs: conservar logs históricos, solo poner exercise_set_id a NULL
ALTER TABLE set_logs
  DROP CONSTRAINT IF EXISTS set_logs_exercise_set_id_fkey;
ALTER TABLE set_logs
  ADD CONSTRAINT set_logs_exercise_set_id_fkey
  FOREIGN KEY (exercise_set_id) REFERENCES exercise_sets(id) ON DELETE SET NULL;

-- Verificar
SELECT tc.table_name, kcu.column_name, rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('program_assignments','program_days','microcycles',
                        'microcycle_exercises','exercise_sets','set_logs')
ORDER BY tc.table_name;
