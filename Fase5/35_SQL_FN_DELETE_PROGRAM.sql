-- Función que borra un programa completo en orden correcto
-- SECURITY DEFINER: se ejecuta con privilegios del owner, sin problemas de RLS

CREATE OR REPLACE FUNCTION delete_program(p_program_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Nullify logs (conservar historial del cliente)
  UPDATE set_logs SET exercise_set_id = NULL
  WHERE exercise_set_id IN (
    SELECT es.id FROM exercise_sets es
    JOIN microcycle_exercises mex ON mex.id = es.microcycle_exercise_id
    JOIN microcycles mc           ON mc.id  = mex.microcycle_id
    JOIN program_days pd          ON pd.id  = mc.day_id
    WHERE pd.program_id = p_program_id
  );

  -- 2. exercise_sets
  DELETE FROM exercise_sets WHERE microcycle_exercise_id IN (
    SELECT mex.id FROM microcycle_exercises mex
    JOIN microcycles mc  ON mc.id = mex.microcycle_id
    JOIN program_days pd ON pd.id = mc.day_id
    WHERE pd.program_id = p_program_id
  );

  -- 3. microcycle_exercises
  DELETE FROM microcycle_exercises WHERE microcycle_id IN (
    SELECT mc.id FROM microcycles mc
    JOIN program_days pd ON pd.id = mc.day_id
    WHERE pd.program_id = p_program_id
  );

  -- 4. locked_microcycles (usa day_id como TEXT)
  DELETE FROM locked_microcycles WHERE day_id IN (
    SELECT id::text FROM program_days WHERE program_id = p_program_id
  );

  -- 5. microcycles
  DELETE FROM microcycles WHERE day_id IN (
    SELECT id FROM program_days WHERE program_id = p_program_id
  );

  -- 6. program_days
  DELETE FROM program_days WHERE program_id = p_program_id;

  -- 7. program_assignments
  DELETE FROM program_assignments WHERE program_id = p_program_id;

  -- 8. programs
  DELETE FROM programs WHERE id = p_program_id;
END;
$$;
