BEGIN;

DO $$
DECLARE
  v_client_id uuid;
  prog_id     integer;
  day_0_id   integer;
  day_1_id   integer;
  day_2_id   integer;
  day_3_id   integer;
  day_4_id   integer;
  mc_id       integer;
  ex_id       integer;
  mex_id      integer;
BEGIN

  -- Ejercicios nuevos al catálogo
  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla hack 90°', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group;
  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla Hammer', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group;

  SELECT id INTO v_client_id FROM profiles WHERE full_name ILIKE '%franvyother%' LIMIT 1;

  INSERT INTO programs (name, description, owner_client_id)
    VALUES ('Post-recomp construcción + prep moto',
            '5 días · 16 microciclos · Hipertrofia + transferencia moto',
            v_client_id)
    RETURNING id INTO prog_id;

  INSERT INTO program_days (program_id, name, order_index, optional)
    VALUES (prog_id, 'Tirón', 0, false)
    RETURNING id INTO day_0_id;
  INSERT INTO program_days (program_id, name, order_index, optional)
    VALUES (prog_id, 'Cuádriceps + Gemelo', 1, false)
    RETURNING id INTO day_1_id;
  INSERT INTO program_days (program_id, name, order_index, optional)
    VALUES (prog_id, 'Empuje', 2, false)
    RETURNING id INTO day_2_id;
  INSERT INTO program_days (program_id, name, order_index, optional)
    VALUES (prog_id, 'Glúteo + Femoral + Gemelo', 3, false)
    RETURNING id INTO day_3_id;
  INSERT INTO program_days (program_id, name, order_index, optional)
    VALUES (prog_id, 'Torso completo repaso', 4, true)
    RETURNING id INTO day_4_id;

  -- ══ DÍA 1: TIRÓN ══
  -- Microciclo 1
  INSERT INTO microcycles (day_id, number)
    VALUES (day_0_id, 1)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo en T agarre prono', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Postura sobre la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo sentado en polea agarre neutro', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 Control del manillar')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps banco scott unilateral con mancuerna', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro estrecho (triángulo)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevación de piernas colgado en barra', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen inferior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 15 (fallo)');

  -- Microciclo 2
  INSERT INTO microcycles (day_id, number)
    VALUES (day_0_id, 2)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo en T agarre prono', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Postura sobre la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo sentado en polea agarre neutro', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 Control del manillar')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps banco scott unilateral con mancuerna', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro estrecho (triángulo)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevación de piernas colgado en barra', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen inferior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 15 (fallo)');

  -- Microciclo 3
  INSERT INTO microcycles (day_id, number)
    VALUES (day_0_id, 3)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo en T agarre prono', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Postura sobre la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo sentado en polea agarre neutro', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 Control del manillar')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps banco scott unilateral con mancuerna', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro estrecho (triángulo)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevación de piernas colgado en barra', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen inferior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 15 (fallo)');

  -- Microciclo 4
  INSERT INTO microcycles (day_id, number)
    VALUES (day_0_id, 4)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo en T agarre prono', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Postura sobre la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo sentado en polea agarre neutro', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 Control del manillar')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps banco scott unilateral con mancuerna', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro estrecho (triángulo)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevación de piernas colgado en barra', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen inferior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 15 (fallo)');

  -- Microciclo 5
  INSERT INTO microcycles (day_id, number)
    VALUES (day_0_id, 5)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo en T agarre prono', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Postura sobre la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo sentado en polea agarre neutro', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 Control del manillar')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps banco scott unilateral con mancuerna', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro estrecho (triángulo)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevación de piernas colgado en barra', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen inferior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 15 (fallo)');

  -- Microciclo 6
  INSERT INTO microcycles (day_id, number)
    VALUES (day_0_id, 6)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo en T agarre prono', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Postura sobre la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo sentado en polea agarre neutro', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 Control del manillar')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps banco scott unilateral con mancuerna', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro estrecho (triángulo)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevación de piernas colgado en barra', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen inferior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 15 (fallo)');

  -- Microciclo 7
  INSERT INTO microcycles (day_id, number)
    VALUES (day_0_id, 7)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo en T agarre prono', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Postura sobre la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo sentado en polea agarre neutro', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 Control del manillar')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps banco scott unilateral con mancuerna', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro estrecho (triángulo)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevación de piernas colgado en barra', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen inferior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 15 (fallo)');

  -- Microciclo 8
  INSERT INTO microcycles (day_id, number)
    VALUES (day_0_id, 8)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo en T agarre prono', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Postura sobre la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo sentado en polea agarre neutro', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 Control del manillar')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps banco scott unilateral con mancuerna', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro estrecho (triángulo)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevación de piernas colgado en barra', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen inferior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 15 (fallo)');

  -- Microciclo 9
  INSERT INTO microcycles (day_id, number)
    VALUES (day_0_id, 9)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo en T agarre prono', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Postura sobre la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo sentado en polea agarre neutro', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 Control del manillar')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps banco scott unilateral con mancuerna', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro estrecho (triángulo)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevación de piernas colgado en barra', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen inferior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 15 (fallo)');

  -- Microciclo 10
  INSERT INTO microcycles (day_id, number)
    VALUES (day_0_id, 10)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo en T agarre prono', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Postura sobre la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo sentado en polea agarre neutro', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 Control del manillar')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps banco scott unilateral con mancuerna', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro estrecho (triángulo)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevación de piernas colgado en barra', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen inferior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 15 (fallo)');

  -- Microciclo 11
  INSERT INTO microcycles (day_id, number)
    VALUES (day_0_id, 11)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo en T agarre prono', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Postura sobre la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo sentado en polea agarre neutro', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 Control del manillar')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps banco scott unilateral con mancuerna', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro estrecho (triángulo)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevación de piernas colgado en barra', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen inferior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 15 (fallo)');

  -- Microciclo 12
  INSERT INTO microcycles (day_id, number)
    VALUES (day_0_id, 12)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo en T agarre prono', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Postura sobre la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo sentado en polea agarre neutro', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 Control del manillar')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps banco scott unilateral con mancuerna', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro estrecho (triángulo)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevación de piernas colgado en barra', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen inferior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 15 (fallo)');

  -- Microciclo 13 🏖 DELOAD
  INSERT INTO microcycles (day_id, number)
    VALUES (day_0_id, 13)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo en T agarre prono', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Postura sobre la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo sentado en polea agarre neutro', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 Control del manillar')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps banco scott unilateral con mancuerna', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro estrecho (triángulo)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevación de piernas colgado en barra', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen inferior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 15 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 15 (2)');

  -- Microciclo 14
  INSERT INTO microcycles (day_id, number)
    VALUES (day_0_id, 14)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo en T agarre prono', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Postura sobre la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo sentado en polea agarre neutro', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 Control del manillar')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps banco scott unilateral con mancuerna', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro estrecho (triángulo)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevación de piernas colgado en barra', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen inferior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 15 (fallo)');

  -- Microciclo 15
  INSERT INTO microcycles (day_id, number)
    VALUES (day_0_id, 15)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo en T agarre prono', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Postura sobre la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo sentado en polea agarre neutro', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 Control del manillar')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps banco scott unilateral con mancuerna', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro estrecho (triángulo)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevación de piernas colgado en barra', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen inferior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 15 (fallo)');

  -- Microciclo 16
  INSERT INTO microcycles (day_id, number)
    VALUES (day_0_id, 16)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo en T agarre prono', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Postura sobre la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo sentado en polea agarre neutro', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 Control del manillar')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps banco scott unilateral con mancuerna', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro estrecho (triángulo)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevación de piernas colgado en barra', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen inferior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 15 (fallo)');

  -- ══ DÍA 2: CUÁDRICEPS + GEMELO ══
  -- Microciclo 1
  INSERT INTO microcycles (day_id, number)
    VALUES (day_1_id, 1)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla Hammer', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Base de fuerza — aguantar y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Prensa 45° guiada bilateral', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Split squat zancada búlgara o caminando', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Aguantar con una pierna en parado')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de cuádriceps', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo de pie en multipower sobre step', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍 Estabilización anti-rotación')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  -- Microciclo 2
  INSERT INTO microcycles (day_id, number)
    VALUES (day_1_id, 2)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla Hammer', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Base de fuerza — aguantar y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Prensa 45° guiada bilateral', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Split squat zancada búlgara o caminando', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Aguantar con una pierna en parado')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de cuádriceps', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo de pie en multipower sobre step', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍 Estabilización anti-rotación')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  -- Microciclo 3
  INSERT INTO microcycles (day_id, number)
    VALUES (day_1_id, 3)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla Hammer', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Base de fuerza — aguantar y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Prensa 45° guiada bilateral', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Split squat zancada búlgara o caminando', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Aguantar con una pierna en parado')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de cuádriceps', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo de pie en multipower sobre step', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍 Estabilización anti-rotación')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  -- Microciclo 4
  INSERT INTO microcycles (day_id, number)
    VALUES (day_1_id, 4)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla Hammer', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Base de fuerza — aguantar y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Prensa 45° guiada bilateral', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Split squat zancada búlgara o caminando', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Aguantar con una pierna en parado')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de cuádriceps', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo de pie en multipower sobre step', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍 Estabilización anti-rotación')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  -- Microciclo 5
  INSERT INTO microcycles (day_id, number)
    VALUES (day_1_id, 5)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla Hammer', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Base de fuerza — aguantar y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Prensa 45° guiada bilateral', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Split squat zancada búlgara o caminando', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Aguantar con una pierna en parado')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de cuádriceps', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo de pie en multipower sobre step', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍 Estabilización anti-rotación')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  -- Microciclo 6
  INSERT INTO microcycles (day_id, number)
    VALUES (day_1_id, 6)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla Hammer', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Base de fuerza — aguantar y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Prensa 45° guiada bilateral', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Split squat zancada búlgara o caminando', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Aguantar con una pierna en parado')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de cuádriceps', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo de pie en multipower sobre step', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍 Estabilización anti-rotación')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  -- Microciclo 7
  INSERT INTO microcycles (day_id, number)
    VALUES (day_1_id, 7)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla Hammer', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Base de fuerza — aguantar y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Prensa 45° guiada bilateral', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Split squat zancada búlgara o caminando', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Aguantar con una pierna en parado')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de cuádriceps', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo de pie en multipower sobre step', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍 Estabilización anti-rotación')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  -- Microciclo 8
  INSERT INTO microcycles (day_id, number)
    VALUES (day_1_id, 8)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla Hammer', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Base de fuerza — aguantar y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Prensa 45° guiada bilateral', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Split squat zancada búlgara o caminando', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Aguantar con una pierna en parado')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de cuádriceps', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo de pie en multipower sobre step', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍 Estabilización anti-rotación')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  -- Microciclo 9
  INSERT INTO microcycles (day_id, number)
    VALUES (day_1_id, 9)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla Hammer', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Base de fuerza — aguantar y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Prensa 45° guiada bilateral', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Split squat zancada búlgara o caminando', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Aguantar con una pierna en parado')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de cuádriceps', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo de pie en multipower sobre step', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍 Estabilización anti-rotación')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  -- Microciclo 10
  INSERT INTO microcycles (day_id, number)
    VALUES (day_1_id, 10)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla Hammer', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Base de fuerza — aguantar y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Prensa 45° guiada bilateral', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Split squat zancada búlgara o caminando', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Aguantar con una pierna en parado')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de cuádriceps', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo de pie en multipower sobre step', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍 Estabilización anti-rotación')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  -- Microciclo 11
  INSERT INTO microcycles (day_id, number)
    VALUES (day_1_id, 11)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla Hammer', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Base de fuerza — aguantar y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Prensa 45° guiada bilateral', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Split squat zancada búlgara o caminando', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Aguantar con una pierna en parado')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de cuádriceps', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo de pie en multipower sobre step', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍 Estabilización anti-rotación')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  -- Microciclo 12
  INSERT INTO microcycles (day_id, number)
    VALUES (day_1_id, 12)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla Hammer', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Base de fuerza — aguantar y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Prensa 45° guiada bilateral', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Split squat zancada búlgara o caminando', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Aguantar con una pierna en parado')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de cuádriceps', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo de pie en multipower sobre step', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍 Estabilización anti-rotación')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  -- Microciclo 13 🏖 DELOAD
  INSERT INTO microcycles (day_id, number)
    VALUES (day_1_id, 13)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla Hammer', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Base de fuerza — aguantar y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Prensa 45° guiada bilateral', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Split squat zancada búlgara o caminando', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Aguantar con una pierna en parado')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de cuádriceps', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo de pie en multipower sobre step', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '12 a 15 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍 Estabilización anti-rotación')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (2)');

  -- Microciclo 14
  INSERT INTO microcycles (day_id, number)
    VALUES (day_1_id, 14)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla Hammer', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Base de fuerza — aguantar y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Prensa 45° guiada bilateral', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Split squat zancada búlgara o caminando', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Aguantar con una pierna en parado')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de cuádriceps', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo de pie en multipower sobre step', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍 Estabilización anti-rotación')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  -- Microciclo 15
  INSERT INTO microcycles (day_id, number)
    VALUES (day_1_id, 15)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla Hammer', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Base de fuerza — aguantar y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Prensa 45° guiada bilateral', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Split squat zancada búlgara o caminando', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Aguantar con una pierna en parado')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de cuádriceps', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo de pie en multipower sobre step', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍 Estabilización anti-rotación')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  -- Microciclo 16
  INSERT INTO microcycles (day_id, number)
    VALUES (day_1_id, 16)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Sentadilla Hammer', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Base de fuerza — aguantar y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Prensa 45° guiada bilateral', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Split squat zancada búlgara o caminando', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Aguantar con una pierna en parado')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de cuádriceps', 'CUÁDRICEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo de pie en multipower sobre step', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍 Estabilización anti-rotación')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  -- ══ DÍA 3: EMPUJE ══
  -- Microciclo 1
  INSERT INTO microcycles (day_id, number)
    VALUES (day_2_id, 1)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado a 45º en multipower', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'Referencia principal de progresión')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press con mancuernas en banco plano', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar 75 grados mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Control del tren superior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevaciones laterales sentado con mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Aperturas en máquina de placas', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de tríceps desde polea alta con barra corta', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Fondos en paralelas o torre lastrados', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Encogimientos desde polea alta sentado', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen con carga progresable — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  -- Microciclo 2
  INSERT INTO microcycles (day_id, number)
    VALUES (day_2_id, 2)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado a 45º en multipower', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'Referencia principal de progresión')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press con mancuernas en banco plano', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar 75 grados mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Control del tren superior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevaciones laterales sentado con mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Aperturas en máquina de placas', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de tríceps desde polea alta con barra corta', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Fondos en paralelas o torre lastrados', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Encogimientos desde polea alta sentado', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen con carga progresable — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  -- Microciclo 3
  INSERT INTO microcycles (day_id, number)
    VALUES (day_2_id, 3)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado a 45º en multipower', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'Referencia principal de progresión')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press con mancuernas en banco plano', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar 75 grados mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Control del tren superior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevaciones laterales sentado con mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Aperturas en máquina de placas', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de tríceps desde polea alta con barra corta', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Fondos en paralelas o torre lastrados', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Encogimientos desde polea alta sentado', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen con carga progresable — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  -- Microciclo 4
  INSERT INTO microcycles (day_id, number)
    VALUES (day_2_id, 4)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado a 45º en multipower', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'Referencia principal de progresión')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press con mancuernas en banco plano', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar 75 grados mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Control del tren superior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevaciones laterales sentado con mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Aperturas en máquina de placas', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de tríceps desde polea alta con barra corta', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Fondos en paralelas o torre lastrados', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Encogimientos desde polea alta sentado', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen con carga progresable — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 5
  INSERT INTO microcycles (day_id, number)
    VALUES (day_2_id, 5)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado a 45º en multipower', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'Referencia principal de progresión')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press con mancuernas en banco plano', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar 75 grados mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Control del tren superior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevaciones laterales sentado con mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Aperturas en máquina de placas', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de tríceps desde polea alta con barra corta', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Fondos en paralelas o torre lastrados', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Encogimientos desde polea alta sentado', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen con carga progresable — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 6
  INSERT INTO microcycles (day_id, number)
    VALUES (day_2_id, 6)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado a 45º en multipower', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'Referencia principal de progresión')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press con mancuernas en banco plano', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar 75 grados mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Control del tren superior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevaciones laterales sentado con mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Aperturas en máquina de placas', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de tríceps desde polea alta con barra corta', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Fondos en paralelas o torre lastrados', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Encogimientos desde polea alta sentado', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen con carga progresable — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 7
  INSERT INTO microcycles (day_id, number)
    VALUES (day_2_id, 7)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado a 45º en multipower', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'Referencia principal de progresión')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press con mancuernas en banco plano', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar 75 grados mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Control del tren superior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevaciones laterales sentado con mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Aperturas en máquina de placas', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de tríceps desde polea alta con barra corta', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Fondos en paralelas o torre lastrados', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Encogimientos desde polea alta sentado', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen con carga progresable — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  -- Microciclo 8
  INSERT INTO microcycles (day_id, number)
    VALUES (day_2_id, 8)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado a 45º en multipower', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'Referencia principal de progresión')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press con mancuernas en banco plano', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar 75 grados mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Control del tren superior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevaciones laterales sentado con mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Aperturas en máquina de placas', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de tríceps desde polea alta con barra corta', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Fondos en paralelas o torre lastrados', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Encogimientos desde polea alta sentado', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen con carga progresable — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  -- Microciclo 9
  INSERT INTO microcycles (day_id, number)
    VALUES (day_2_id, 9)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado a 45º en multipower', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'Referencia principal de progresión')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press con mancuernas en banco plano', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar 75 grados mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Control del tren superior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevaciones laterales sentado con mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Aperturas en máquina de placas', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de tríceps desde polea alta con barra corta', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Fondos en paralelas o torre lastrados', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Encogimientos desde polea alta sentado', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen con carga progresable — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  -- Microciclo 10
  INSERT INTO microcycles (day_id, number)
    VALUES (day_2_id, 10)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado a 45º en multipower', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'Referencia principal de progresión')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press con mancuernas en banco plano', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar 75 grados mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Control del tren superior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevaciones laterales sentado con mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Aperturas en máquina de placas', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de tríceps desde polea alta con barra corta', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Fondos en paralelas o torre lastrados', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Encogimientos desde polea alta sentado', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen con carga progresable — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  -- Microciclo 11
  INSERT INTO microcycles (day_id, number)
    VALUES (day_2_id, 11)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado a 45º en multipower', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'Referencia principal de progresión')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press con mancuernas en banco plano', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar 75 grados mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Control del tren superior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevaciones laterales sentado con mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Aperturas en máquina de placas', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de tríceps desde polea alta con barra corta', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Fondos en paralelas o torre lastrados', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Encogimientos desde polea alta sentado', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen con carga progresable — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  -- Microciclo 12
  INSERT INTO microcycles (day_id, number)
    VALUES (day_2_id, 12)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado a 45º en multipower', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'Referencia principal de progresión')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press con mancuernas en banco plano', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar 75 grados mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Control del tren superior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevaciones laterales sentado con mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Aperturas en máquina de placas', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de tríceps desde polea alta con barra corta', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Fondos en paralelas o torre lastrados', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Encogimientos desde polea alta sentado', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen con carga progresable — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  -- Microciclo 13 🏖 DELOAD
  INSERT INTO microcycles (day_id, number)
    VALUES (day_2_id, 13)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado a 45º en multipower', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'Referencia principal de progresión')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press con mancuernas en banco plano', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar 75 grados mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Control del tren superior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevaciones laterales sentado con mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Aperturas en máquina de placas', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de tríceps desde polea alta con barra corta', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Fondos en paralelas o torre lastrados', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Encogimientos desde polea alta sentado', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen con carga progresable')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (3)');

  -- Microciclo 14
  INSERT INTO microcycles (day_id, number)
    VALUES (day_2_id, 14)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado a 45º en multipower', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'Referencia principal de progresión')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press con mancuernas en banco plano', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar 75 grados mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Control del tren superior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevaciones laterales sentado con mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Aperturas en máquina de placas', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de tríceps desde polea alta con barra corta', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Fondos en paralelas o torre lastrados', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Encogimientos desde polea alta sentado', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen con carga progresable — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  -- Microciclo 15
  INSERT INTO microcycles (day_id, number)
    VALUES (day_2_id, 15)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado a 45º en multipower', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'Referencia principal de progresión')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press con mancuernas en banco plano', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar 75 grados mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Control del tren superior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevaciones laterales sentado con mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Aperturas en máquina de placas', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de tríceps desde polea alta con barra corta', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Fondos en paralelas o torre lastrados', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Encogimientos desde polea alta sentado', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen con carga progresable — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 16
  INSERT INTO microcycles (day_id, number)
    VALUES (day_2_id, 16)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado a 45º en multipower', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'Referencia principal de progresión')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 8 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '6 a 8 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press con mancuernas en banco plano', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar 75 grados mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, '🏍 Control del tren superior')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Elevaciones laterales sentado con mancuernas', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Aperturas en máquina de placas', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Extensión de tríceps desde polea alta con barra corta', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Fondos en paralelas o torre lastrados', 'TRÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '6 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '6 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Encogimientos desde polea alta sentado', 'ABDOMEN')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'Abdomen con carga progresable — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  -- ══ DÍA 4: GLÚTEO + FEMORAL + GEMELO ══
  -- Microciclo 1
  INSERT INTO microcycles (day_id, number)
    VALUES (day_3_id, 1)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hip trust en máquina de palanca', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Cadena posterior — sacar del caballete y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 12 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 12 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 12 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Peso muerto rumano con barra libre piernas rígidas', 'FEM./GLÚT.')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Bisagra de cadera — mover y levantar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral tumbado', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral sentado unilateral', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Zancada paso largo foco glúteo', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo sentado', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '15 a 20 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Dead hang en barra', 'AGARRE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍 Agarre — lo más transferible')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, 'Máx tiempo (control)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, 'Máx tiempo (control)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, 'Máx tiempo (control)');

  -- Microciclo 2
  INSERT INTO microcycles (day_id, number)
    VALUES (day_3_id, 2)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hip trust en máquina de palanca', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Cadena posterior — sacar del caballete y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 12 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 12 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 12 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Peso muerto rumano con barra libre piernas rígidas', 'FEM./GLÚT.')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Bisagra de cadera — mover y levantar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral tumbado', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral sentado unilateral', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Zancada paso largo foco glúteo', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo sentado', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '15 a 20 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Dead hang en barra', 'AGARRE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍 Agarre — lo más transferible')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, 'Máx tiempo (control)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, 'Máx tiempo (control)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, 'Máx tiempo (control)');

  -- Microciclo 3
  INSERT INTO microcycles (day_id, number)
    VALUES (day_3_id, 3)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hip trust en máquina de palanca', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Cadena posterior — sacar del caballete y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Peso muerto rumano con barra libre piernas rígidas', 'FEM./GLÚT.')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Bisagra de cadera — mover y levantar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral tumbado', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral sentado unilateral', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Zancada paso largo foco glúteo', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo sentado', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '15 a 20 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Dead hang en barra', 'AGARRE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍 Agarre — lo más transferible')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, 'Máx tiempo (control)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, 'Máx tiempo (control)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, 'Máx tiempo (control)');

  -- Microciclo 4
  INSERT INTO microcycles (day_id, number)
    VALUES (day_3_id, 4)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hip trust en máquina de palanca', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Cadena posterior — sacar del caballete y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Peso muerto rumano con barra libre piernas rígidas', 'FEM./GLÚT.')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Bisagra de cadera — mover y levantar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral tumbado', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral sentado unilateral', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Zancada paso largo foco glúteo', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo sentado', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '15 a 20 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Dead hang en barra', 'AGARRE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍 Agarre — lo más transferible')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, 'Máx tiempo — anotar segundos');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, 'Máx tiempo — anotar segundos');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, 'Máx tiempo — anotar segundos');

  -- Microciclo 5
  INSERT INTO microcycles (day_id, number)
    VALUES (day_3_id, 5)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hip trust en máquina de palanca', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Cadena posterior — sacar del caballete y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Peso muerto rumano con barra libre piernas rígidas', 'FEM./GLÚT.')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Bisagra de cadera — mover y levantar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral tumbado', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral sentado unilateral', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Zancada paso largo foco glúteo', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo sentado', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '15 a 20 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Dead hang en barra', 'AGARRE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍 Agarre — lo más transferible')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, 'Máx tiempo — anotar segundos');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, 'Máx tiempo — anotar segundos');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, 'Máx tiempo — anotar segundos');

  -- Microciclo 6
  INSERT INTO microcycles (day_id, number)
    VALUES (day_3_id, 6)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hip trust en máquina de palanca', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Cadena posterior — sacar del caballete y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Peso muerto rumano con barra libre piernas rígidas', 'FEM./GLÚT.')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Bisagra de cadera — mover y levantar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral tumbado', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral sentado unilateral', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Zancada paso largo foco glúteo', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 10 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo sentado', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '15 a 20 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Dead hang en barra', 'AGARRE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍 Agarre — lo más transferible')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, 'Máx tiempo — anotar segundos');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, 'Máx tiempo — anotar segundos');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, 'Máx tiempo — anotar segundos');

  -- Microciclo 7
  INSERT INTO microcycles (day_id, number)
    VALUES (day_3_id, 7)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hip trust en máquina de palanca', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Cadena posterior — sacar del caballete y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Peso muerto rumano con barra libre piernas rígidas', 'FEM./GLÚT.')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Bisagra de cadera — mover y levantar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral tumbado', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral sentado unilateral', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Zancada paso largo foco glúteo', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo sentado', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '15 a 20 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Dead hang en barra', 'AGARRE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍 Agarre — lo más transferible')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, 'Máx tiempo — bate tu marca');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, 'Máx tiempo — bate tu marca');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, 'Máx tiempo — bate tu marca');

  -- Microciclo 8
  INSERT INTO microcycles (day_id, number)
    VALUES (day_3_id, 8)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hip trust en máquina de palanca', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Cadena posterior — sacar del caballete y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Peso muerto rumano con barra libre piernas rígidas', 'FEM./GLÚT.')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Bisagra de cadera — mover y levantar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral tumbado', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral sentado unilateral', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Zancada paso largo foco glúteo', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo sentado', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '15 a 20 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Dead hang en barra', 'AGARRE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍 Agarre — lo más transferible')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, 'Máx tiempo — bate tu marca');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, 'Máx tiempo — bate tu marca');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, 'Máx tiempo — bate tu marca');

  -- Microciclo 9
  INSERT INTO microcycles (day_id, number)
    VALUES (day_3_id, 9)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hip trust en máquina de palanca', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Cadena posterior — sacar del caballete y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Peso muerto rumano con barra libre piernas rígidas', 'FEM./GLÚT.')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Bisagra de cadera — mover y levantar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral tumbado', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral sentado unilateral', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Zancada paso largo foco glúteo', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '10 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo sentado', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '15 a 20 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Dead hang en barra', 'AGARRE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍 Agarre — lo más transferible')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, 'Máx tiempo — bate tu marca');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, 'Máx tiempo — bate tu marca');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, 'Máx tiempo — bate tu marca');

  -- Microciclo 10
  INSERT INTO microcycles (day_id, number)
    VALUES (day_3_id, 10)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hip trust en máquina de palanca', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Cadena posterior — sacar del caballete y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Peso muerto rumano con barra libre piernas rígidas', 'FEM./GLÚT.')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Bisagra de cadera — mover y levantar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral tumbado', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral sentado unilateral', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Zancada paso largo foco glúteo', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '10 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo sentado', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '15 a 20 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Dead hang en barra', 'AGARRE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍 Agarre — lo más transferible')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, 'Máx tiempo — bate tu marca');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, 'Máx tiempo — bate tu marca');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, 'Máx tiempo — bate tu marca');

  -- Microciclo 11
  INSERT INTO microcycles (day_id, number)
    VALUES (day_3_id, 11)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hip trust en máquina de palanca', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Cadena posterior — sacar del caballete y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Peso muerto rumano con barra libre piernas rígidas', 'FEM./GLÚT.')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Bisagra de cadera — mover y levantar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral tumbado', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral sentado unilateral', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Zancada paso largo foco glúteo', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '10 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo sentado', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '15 a 20 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Dead hang en barra', 'AGARRE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍 Agarre — lo más transferible')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, 'Máx tiempo — bate tu marca');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, 'Máx tiempo — bate tu marca');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, 'Máx tiempo — bate tu marca');

  -- Microciclo 12
  INSERT INTO microcycles (day_id, number)
    VALUES (day_3_id, 12)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hip trust en máquina de palanca', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Cadena posterior — sacar del caballete y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Peso muerto rumano con barra libre piernas rígidas', 'FEM./GLÚT.')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Bisagra de cadera — mover y levantar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral tumbado', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral sentado unilateral', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Zancada paso largo foco glúteo', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '10 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo sentado', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '15 a 20 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Dead hang en barra', 'AGARRE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍 Agarre — lo más transferible')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, 'Máx tiempo — bate tu marca');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, 'Máx tiempo — bate tu marca');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, 'Máx tiempo — bate tu marca');

  -- Microciclo 13 🏖 DELOAD
  INSERT INTO microcycles (day_id, number)
    VALUES (day_3_id, 13)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hip trust en máquina de palanca', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Cadena posterior — sacar del caballete y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 12 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Peso muerto rumano con barra libre piernas rígidas', 'FEM./GLÚT.')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Bisagra de cadera — mover y levantar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral tumbado', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral sentado unilateral', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Zancada paso largo foco glúteo', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 10 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo sentado', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '15 a 20 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Dead hang en barra', 'AGARRE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍 Agarre — lo más transferible')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, 'Máx tiempo (deload)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, 'Máx tiempo (deload)');

  -- Microciclo 14
  INSERT INTO microcycles (day_id, number)
    VALUES (day_3_id, 14)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hip trust en máquina de palanca', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Cadena posterior — sacar del caballete y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 12 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 12 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 12 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Peso muerto rumano con barra libre piernas rígidas', 'FEM./GLÚT.')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Bisagra de cadera — mover y levantar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral tumbado', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral sentado unilateral', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Zancada paso largo foco glúteo', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo sentado', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Dead hang en barra', 'AGARRE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍 Agarre — lo más transferible')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, 'Máx tiempo — anotar segundos');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, 'Máx tiempo — anotar segundos');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, 'Máx tiempo — anotar segundos');

  -- Microciclo 15
  INSERT INTO microcycles (day_id, number)
    VALUES (day_3_id, 15)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hip trust en máquina de palanca', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Cadena posterior — sacar del caballete y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Peso muerto rumano con barra libre piernas rígidas', 'FEM./GLÚT.')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Bisagra de cadera — mover y levantar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral tumbado', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral sentado unilateral', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Zancada paso largo foco glúteo', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo sentado', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Dead hang en barra', 'AGARRE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍 Agarre — lo más transferible')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, 'Máx tiempo — bate tu marca');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, 'Máx tiempo — bate tu marca');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, 'Máx tiempo — bate tu marca');

  -- Microciclo 16
  INSERT INTO microcycles (day_id, number)
    VALUES (day_3_id, 16)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Hip trust en máquina de palanca', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, '🏍 Cadena posterior — sacar del caballete y empujar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Peso muerto rumano con barra libre piernas rígidas', 'FEM./GLÚT.')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 Bisagra de cadera — mover y levantar la moto')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral tumbado', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Femoral sentado unilateral', 'FEMORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Zancada paso largo foco glúteo', 'GLÚTEO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Gemelo sentado', 'GEMELO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 4, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Dead hang en barra', 'AGARRE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍 Agarre — lo más transferible')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, 'Máx tiempo — bate tu marca');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, 'Máx tiempo — bate tu marca');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, 'Máx tiempo — bate tu marca');

  -- ══ DÍA 5: TORSO COMPLETO REPASO ══
  -- Microciclo 1
  INSERT INTO microcycles (day_id, number)
    VALUES (day_4_id, 1)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con mancuerna (Dorsal)', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado en máquina de palanca', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar en multipower sentado en banco a 75º', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps más tríceps polea superserie', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Plancha abdominal', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '30 a 60 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '30 a 60 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '30 a 60 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Leñador en polea giro oblicuos', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 8, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 2
  INSERT INTO microcycles (day_id, number)
    VALUES (day_4_id, 2)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con mancuerna (Dorsal)', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado en máquina de palanca', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar en multipower sentado en banco a 75º', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps más tríceps polea superserie', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Plancha abdominal', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '30 a 60 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '30 a 60 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '30 a 60 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Leñador en polea giro oblicuos', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 8, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 3
  INSERT INTO microcycles (day_id, number)
    VALUES (day_4_id, 3)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con mancuerna (Dorsal)', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado en máquina de palanca', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar en multipower sentado en banco a 75º', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps más tríceps polea superserie', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Plancha abdominal', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '30 a 60 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '30 a 60 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '30 a 60 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Leñador en polea giro oblicuos', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 8, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 4
  INSERT INTO microcycles (day_id, number)
    VALUES (day_4_id, 4)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con mancuerna (Dorsal)', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado en máquina de palanca', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar en multipower sentado en banco a 75º', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps más tríceps polea superserie', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Plancha abdominal', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '30 a 60 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '30 a 60 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '30 a 60 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Leñador en polea giro oblicuos', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 8, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 5
  INSERT INTO microcycles (day_id, number)
    VALUES (day_4_id, 5)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con mancuerna (Dorsal)', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado en máquina de palanca', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar en multipower sentado en banco a 75º', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps más tríceps polea superserie', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Plancha abdominal', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '30 a 60 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '30 a 60 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '30 a 60 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Leñador en polea giro oblicuos', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 8, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 6
  INSERT INTO microcycles (day_id, number)
    VALUES (day_4_id, 6)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con mancuerna (Dorsal)', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado en máquina de palanca', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar en multipower sentado en banco a 75º', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps más tríceps polea superserie', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Plancha abdominal', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '30 a 60 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '30 a 60 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '30 a 60 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Leñador en polea giro oblicuos', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 8, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 7
  INSERT INTO microcycles (day_id, number)
    VALUES (day_4_id, 7)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con mancuerna (Dorsal)', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado en máquina de palanca', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar en multipower sentado en banco a 75º', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps más tríceps polea superserie', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Plancha abdominal', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '30 a 60 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '30 a 60 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '30 a 60 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Leñador en polea giro oblicuos', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 8, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 8
  INSERT INTO microcycles (day_id, number)
    VALUES (day_4_id, 8)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con mancuerna (Dorsal)', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado en máquina de palanca', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar en multipower sentado en banco a 75º', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps más tríceps polea superserie', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Plancha abdominal', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '30 a 60 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '30 a 60 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '30 a 60 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Leñador en polea giro oblicuos', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 8, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 9
  INSERT INTO microcycles (day_id, number)
    VALUES (day_4_id, 9)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con mancuerna (Dorsal)', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado en máquina de palanca', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar en multipower sentado en banco a 75º', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps más tríceps polea superserie', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Plancha abdominal', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '30 a 60 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '30 a 60 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '30 a 60 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Leñador en polea giro oblicuos', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 8, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 10
  INSERT INTO microcycles (day_id, number)
    VALUES (day_4_id, 10)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con mancuerna (Dorsal)', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado en máquina de palanca', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar en multipower sentado en banco a 75º', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps más tríceps polea superserie', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Plancha abdominal', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '30 a 60 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '30 a 60 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '30 a 60 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Leñador en polea giro oblicuos', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 8, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 11
  INSERT INTO microcycles (day_id, number)
    VALUES (day_4_id, 11)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con mancuerna (Dorsal)', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado en máquina de palanca', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar en multipower sentado en banco a 75º', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps más tríceps polea superserie', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Plancha abdominal', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '30 a 60 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '30 a 60 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '30 a 60 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Leñador en polea giro oblicuos', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 8, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 12
  INSERT INTO microcycles (day_id, number)
    VALUES (day_4_id, 12)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con mancuerna (Dorsal)', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado en máquina de palanca', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar en multipower sentado en banco a 75º', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps más tríceps polea superserie', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Plancha abdominal', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '30 a 60 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '30 a 60 (0-1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '30 a 60 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Leñador en polea giro oblicuos', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 8, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 13 🏖 DELOAD
  INSERT INTO microcycles (day_id, number)
    VALUES (day_4_id, 13)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con mancuerna (Dorsal)', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado en máquina de palanca', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar en multipower sentado en banco a 75º', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps más tríceps polea superserie', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (3)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Plancha abdominal', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '30 a 60 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '30 a 60 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Leñador en polea giro oblicuos', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 8, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (2)');

  -- Microciclo 14
  INSERT INTO microcycles (day_id, number)
    VALUES (day_4_id, 14)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con mancuerna (Dorsal)', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado en máquina de palanca', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar en multipower sentado en banco a 75º', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps más tríceps polea superserie', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Plancha abdominal', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '30 a 60 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '30 a 60 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '30 a 60 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Leñador en polea giro oblicuos', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 8, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 15
  INSERT INTO microcycles (day_id, number)
    VALUES (day_4_id, 15)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1-2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (1-2)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con mancuerna (Dorsal)', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado en máquina de palanca', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar en multipower sentado en banco a 75º', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps más tríceps polea superserie', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Plancha abdominal', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '30 a 60 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '30 a 60 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '30 a 60 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Leñador en polea giro oblicuos', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 8, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  -- Microciclo 16
  INSERT INTO microcycles (day_id, number)
    VALUES (day_4_id, 16)
    RETURNING id INTO mc_id;

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'DORSAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '8 a 10 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con mancuerna (Dorsal)', 'ESPALDA ALTA')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press banca inclinado en máquina de palanca', 'PECTORAL')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Press militar en multipower sentado en banco a 75º', 'HOMBRO')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, '🏍 — R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Curl de bíceps más tríceps polea superserie', 'BÍCEPS')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Remo con cuerda desde polea alta', 'HOMBRO POSTERIOR')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Plancha abdominal', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '30 a 60 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '30 a 60 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '30 a 60 (fallo)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Pallof press en polea anti-rotación', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 12 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 12 (1)');

  INSERT INTO exercises (name, muscle_group)
    VALUES ('Leñador en polea giro oblicuos', 'CORE')
    ON CONFLICT (name) DO UPDATE SET muscle_group = EXCLUDED.muscle_group
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 8, '🏍')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (1)');

  INSERT INTO program_assignments (program_id, client_id, active)
    VALUES (prog_id, v_client_id, false);

END $$;

SELECT p.name, pa.active,
       (SELECT COUNT(*) FROM program_days WHERE program_id=p.id) AS dias,
       (SELECT MAX(mc.number) FROM microcycles mc
        JOIN program_days pd ON pd.id=mc.day_id WHERE pd.program_id=p.id) AS microciclos
FROM programs p
JOIN program_assignments pa ON pa.program_id=p.id
JOIN profiles pr ON pr.id=pa.client_id
WHERE pr.full_name ILIKE '%franvyother%'
  AND p.name='Post-recomp construcción + prep moto';

COMMIT;