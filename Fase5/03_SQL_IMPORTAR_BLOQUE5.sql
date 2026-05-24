DO $$
DECLARE
  v_program_id integer;
  v_day_id integer;
  v_mc_id integer;
  v_ex_id integer;
  v_mic_ex_id integer;
BEGIN
  INSERT INTO programs (name, description) VALUES ('Bloque 5 - Fran Villar', '4 días + 1 opcional (Repaso Torso)') RETURNING id INTO v_program_id;

  -- Día: Tirón
  INSERT INTO program_days (program_id, name, order_index, optional)
  VALUES (v_program_id, 'Tirón', 1, false) RETURNING id INTO v_day_id;

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 1) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Rueda abdominal' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ABDOMEN', 'Rueda abdominal', 'A.8') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo en T agarre prono' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ESPALDA ALTA', 'Remo en T agarre prono', 'EA.5') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Jalón al pecho unilateral banco inclinado a 60° desde polea alta (dorsal)' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Jalón al pecho unilateral banco inclinado a 60° desde polea alta (dorsal)', 'D.16') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 3, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo unilateral máquina de palanca neutro' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Remo unilateral máquina de palanca neutro', 'D.6') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Pullover unilateral con muñequera desde polea alta' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Pullover unilateral con muñequera desde polea alta', 'D.22') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 5, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO POSTERIOR', 'Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HP.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps barra Z agarre supino de pie' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps barra Z agarre supino de pie', 'B.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 7, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps tumbado banco a 45º unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps tumbado banco a 45º unilateral', 'B. 25') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 2) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Rueda abdominal' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ABDOMEN', 'Rueda abdominal', 'A.8') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo en T agarre prono' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ESPALDA ALTA', 'Remo en T agarre prono', 'EA.5') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Jalón al pecho unilateral banco inclinado a 60° desde polea alta (dorsal)' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Jalón al pecho unilateral banco inclinado a 60° desde polea alta (dorsal)', 'D.16') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 3, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo unilateral máquina de palanca neutro' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Remo unilateral máquina de palanca neutro', 'D.6') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Pullover unilateral con muñequera desde polea alta' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Pullover unilateral con muñequera desde polea alta', 'D.22') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 5, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO POSTERIOR', 'Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HP.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps barra Z agarre supino de pie' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps barra Z agarre supino de pie', 'B.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 7, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps tumbado banco a 45º unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps tumbado banco a 45º unilateral', 'B. 25') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 3) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Rueda abdominal' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ABDOMEN', 'Rueda abdominal', 'A.8') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo en T agarre prono' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ESPALDA ALTA', 'Remo en T agarre prono', 'EA.5') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Jalón al pecho unilateral banco inclinado a 60° desde polea alta (dorsal)' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Jalón al pecho unilateral banco inclinado a 60° desde polea alta (dorsal)', 'D.16') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 3, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo unilateral máquina de palanca neutro' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Remo unilateral máquina de palanca neutro', 'D.6') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Pullover unilateral con muñequera desde polea alta' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Pullover unilateral con muñequera desde polea alta', 'D.22') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 5, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO POSTERIOR', 'Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HP.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps barra Z agarre supino de pie' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps barra Z agarre supino de pie', 'B.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 7, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps tumbado banco a 45º unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps tumbado banco a 45º unilateral', 'B. 25') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 4) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Rueda abdominal' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ABDOMEN', 'Rueda abdominal', 'A.8') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo en T agarre prono' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ESPALDA ALTA', 'Remo en T agarre prono', 'EA.5') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Jalón al pecho unilateral banco inclinado a 60° desde polea alta (dorsal)' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Jalón al pecho unilateral banco inclinado a 60° desde polea alta (dorsal)', 'D.16') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 3, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo unilateral máquina de palanca neutro' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Remo unilateral máquina de palanca neutro', 'D.6') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Pullover unilateral con muñequera desde polea alta' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Pullover unilateral con muñequera desde polea alta', 'D.22') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 5, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO POSTERIOR', 'Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HP.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps barra Z agarre supino de pie' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps barra Z agarre supino de pie', 'B.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 7, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps tumbado banco a 45º unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps tumbado banco a 45º unilateral', 'B. 25') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 5) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Rueda abdominal' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ABDOMEN', 'Rueda abdominal', 'A.8') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo en T agarre prono' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ESPALDA ALTA', 'Remo en T agarre prono', 'EA.5') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Jalón al pecho unilateral banco inclinado a 60° desde polea alta (dorsal)' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Jalón al pecho unilateral banco inclinado a 60° desde polea alta (dorsal)', 'D.16') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 3, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo unilateral máquina de palanca neutro' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Remo unilateral máquina de palanca neutro', 'D.6') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Pullover unilateral con muñequera desde polea alta' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Pullover unilateral con muñequera desde polea alta', 'D.22') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 5, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO POSTERIOR', 'Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HP.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps barra Z agarre supino de pie' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps barra Z agarre supino de pie', 'B.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 7, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps tumbado banco a 45º unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps tumbado banco a 45º unilateral', 'B. 25') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 6) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Rueda abdominal' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ABDOMEN', 'Rueda abdominal', 'A.8') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo en T agarre prono' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ESPALDA ALTA', 'Remo en T agarre prono', 'EA.5') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Jalón al pecho unilateral banco inclinado a 60° desde polea alta (dorsal)' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Jalón al pecho unilateral banco inclinado a 60° desde polea alta (dorsal)', 'D.16') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 3, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo unilateral máquina de palanca neutro' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Remo unilateral máquina de palanca neutro', 'D.6') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Pullover unilateral con muñequera desde polea alta' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Pullover unilateral con muñequera desde polea alta', 'D.22') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 5, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO POSTERIOR', 'Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HP.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps barra Z agarre supino de pie' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps barra Z agarre supino de pie', 'B.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 7, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps tumbado banco a 45º unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps tumbado banco a 45º unilateral', 'B. 25') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 7) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Rueda abdominal' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ABDOMEN', 'Rueda abdominal', 'A.8') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo en T agarre prono' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ESPALDA ALTA', 'Remo en T agarre prono', 'EA.5') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Jalón al pecho unilateral banco inclinado a 60° desde polea alta (dorsal)' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Jalón al pecho unilateral banco inclinado a 60° desde polea alta (dorsal)', 'D.16') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 3, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo unilateral máquina de palanca neutro' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Remo unilateral máquina de palanca neutro', 'D.6') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Pullover unilateral con muñequera desde polea alta' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Pullover unilateral con muñequera desde polea alta', 'D.22') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 5, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO POSTERIOR', 'Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HP.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps barra Z agarre supino de pie' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps barra Z agarre supino de pie', 'B.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 7, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps tumbado banco a 45º unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps tumbado banco a 45º unilateral', 'B. 25') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 8) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Rueda abdominal' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ABDOMEN', 'Rueda abdominal', 'A.8') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (2)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo en T agarre prono' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ESPALDA ALTA', 'Remo en T agarre prono', 'EA.5') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Jalón al pecho unilateral banco inclinado a 60° desde polea alta (dorsal)' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Jalón al pecho unilateral banco inclinado a 60° desde polea alta (dorsal)', 'D.16') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo unilateral máquina de palanca neutro' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Remo unilateral máquina de palanca neutro', 'D.6') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Pullover unilateral con muñequera desde polea alta' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Pullover unilateral con muñequera desde polea alta', 'D.22') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 5, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '9 a 12 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO POSTERIOR', 'Hombro posterior agarre prono con mancuernas pecho apoyado en banco a 45°', 'HP.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 6, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps barra Z agarre supino de pie' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps barra Z agarre supino de pie', 'B.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 7, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps tumbado banco a 45º unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps tumbado banco a 45º unilateral', 'B. 25') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 8, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (2)', NULL, NULL);

  -- Día: Cuádriceps
  INSERT INTO program_days (program_id, name, order_index, optional)
  VALUES (v_program_id, 'Cuádriceps', 2, false) RETURNING id INTO v_day_id;

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 1) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Gemelo hack a 60 º no vídeo pero sabes hacerlo' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name) VALUES ('GEMELO', 'Gemelo hack a 60 º no vídeo pero sabes hacerlo') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 1, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aductor sentado en máquina' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CADERA', 'Aductor sentado en máquina', 'CA.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Sentadilla hack 60° inclinada' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Sentadilla hack 60° inclinada', 'CUA.12') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Prensa 45° guiada unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Prensa 45° guiada unilateral', 'CUA. 20') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de cuádriceps unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps unilateral', 'CUA.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Femoral tumbado' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEMORAL', 'Femoral tumbado', 'F.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 2) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Gemelo hack a 60 º no vídeo pero sabes hacerlo' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name) VALUES ('GEMELO', 'Gemelo hack a 60 º no vídeo pero sabes hacerlo') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 1, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, '8.0');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', '100/14', '8.0');
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aductor sentado en máquina' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CADERA', 'Aductor sentado en máquina', 'CA.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Sentadilla hack 60° inclinada' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Sentadilla hack 60° inclinada', 'CUA.12') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Prensa 45° guiada bilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Prensa 45° guiada bilateral', 'CUA. 21') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de cuádriceps unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps unilateral', 'CUA.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Femoral tumbado' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEMORAL', 'Femoral tumbado', 'F.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 3) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Gemelo hack a 60 º no vídeo pero sabes hacerlo' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name) VALUES ('GEMELO', 'Gemelo hack a 60 º no vídeo pero sabes hacerlo') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 1, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aductor sentado en máquina' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CADERA', 'Aductor sentado en máquina', 'CA.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Sentadilla hack 60° inclinada' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Sentadilla hack 60° inclinada', 'CUA.12') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Prensa 45° guiada bilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Prensa 45° guiada bilateral', 'CUA. 21') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de cuádriceps unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps unilateral', 'CUA.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Femoral tumbado' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEMORAL', 'Femoral tumbado', 'F.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 4) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Gemelo hack a 60 º no vídeo pero sabes hacerlo' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name) VALUES ('GEMELO', 'Gemelo hack a 60 º no vídeo pero sabes hacerlo') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 1, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aductor sentado en máquina' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CADERA', 'Aductor sentado en máquina', 'CA.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Sentadilla hack 60° inclinada' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Sentadilla hack 60° inclinada', 'CUA.12') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Prensa 45° guiada bilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Prensa 45° guiada bilateral', 'CUA. 21') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de cuádriceps unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps unilateral', 'CUA.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Femoral tumbado' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEMORAL', 'Femoral tumbado', 'F.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 5) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Gemelo hack a 60 º no vídeo pero sabes hacerlo' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name) VALUES ('GEMELO', 'Gemelo hack a 60 º no vídeo pero sabes hacerlo') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 1, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aductor sentado en máquina' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CADERA', 'Aductor sentado en máquina', 'CA.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Sentadilla hack 60° inclinada' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Sentadilla hack 60° inclinada', 'CUA.12') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Prensa 45° guiada bilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Prensa 45° guiada bilateral', 'CUA. 21') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de cuádriceps unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps unilateral', 'CUA.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Femoral tumbado' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEMORAL', 'Femoral tumbado', 'F.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 6) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Gemelo hack a 60 º no vídeo pero sabes hacerlo' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name) VALUES ('GEMELO', 'Gemelo hack a 60 º no vídeo pero sabes hacerlo') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 1, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aductor sentado en máquina' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CADERA', 'Aductor sentado en máquina', 'CA.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Sentadilla hack 60° inclinada' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Sentadilla hack 60° inclinada', 'CUA.12') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Prensa 45° guiada bilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Prensa 45° guiada bilateral', 'CUA. 21') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de cuádriceps unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps unilateral', 'CUA.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Femoral tumbado' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEMORAL', 'Femoral tumbado', 'F.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 7) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Gemelo hack a 60 º no vídeo pero sabes hacerlo' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name) VALUES ('GEMELO', 'Gemelo hack a 60 º no vídeo pero sabes hacerlo') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 1, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aductor sentado en máquina' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CADERA', 'Aductor sentado en máquina', 'CA.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Sentadilla hack 60° inclinada' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Sentadilla hack 60° inclinada', 'CUA.12') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 7 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Prensa 45° guiada bilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Prensa 45° guiada bilateral', 'CUA. 21') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de cuádriceps unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps unilateral', 'CUA.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Femoral tumbado' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEMORAL', 'Femoral tumbado', 'F.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 8) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Gemelo hack a 60 º no vídeo pero sabes hacerlo' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name) VALUES ('GEMELO', 'Gemelo hack a 60 º no vídeo pero sabes hacerlo') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aductor sentado en máquina' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CADERA', 'Aductor sentado en máquina', 'CA.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Sentadilla hack 60° inclinada' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Sentadilla hack 60° inclinada', 'CUA.12') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Prensa 45° guiada bilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Prensa 45° guiada bilateral', 'CUA. 21') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de cuádriceps unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps unilateral', 'CUA.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 5, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Femoral tumbado' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEMORAL', 'Femoral tumbado', 'F.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 6, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (2)', NULL, NULL);

  -- Día: Empuje
  INSERT INTO program_days (program_id, name, order_index, optional)
  VALUES (v_program_id, 'Empuje', 3, false) RETURNING id INTO v_day_id;

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 1) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press militar en multipower sentado en banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Press militar en multipower sentado en banco a 75º', 'H.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca inclinado a 45º en multipower' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca inclinado a 45º en multipower', 'P.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca tumbado en máquina de palanca' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca tumbado en máquina de palanca', 'P.10') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aperturas desde polea baja sentado en banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Aperturas desde polea baja sentado en banco a 75º', 'P.17') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 4, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales cruzadas desde polea media a dos brazos' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales cruzadas desde polea media a dos brazos', 'H.16') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales sentado con mancuernas' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales sentado con mancuernas', 'H.12') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Kaz press en multipower banco inclinado a 30º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Kaz press en multipower banco inclinado a 30º', 'T.24') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 7, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 8 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de tríceps desde polea alta unilateral con muñequera' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Extensión de tríceps desde polea alta unilateral con muñequera', 'T.14') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 2) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press militar en multipower sentado en banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Press militar en multipower sentado en banco a 75º', 'H.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca inclinado a 45º en multipower' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca inclinado a 45º en multipower', 'P.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca tumbado en máquina de palanca' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca tumbado en máquina de palanca', 'P.10') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aperturas desde polea baja sentado en banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Aperturas desde polea baja sentado en banco a 75º', 'P.17') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 4, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales cruzadas desde polea media a dos brazos' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales cruzadas desde polea media a dos brazos', 'H.16') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales sentado con mancuernas' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales sentado con mancuernas', 'H.12') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Kaz press en multipower banco inclinado a 30º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Kaz press en multipower banco inclinado a 30º', 'T.24') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 7, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 8 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de tríceps desde polea alta unilateral con muñequera' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Extensión de tríceps desde polea alta unilateral con muñequera', 'T.14') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 3) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press militar en multipower sentado en banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Press militar en multipower sentado en banco a 75º', 'H.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca inclinado a 45º en multipower' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca inclinado a 45º en multipower', 'P.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca tumbado en máquina de palanca' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca tumbado en máquina de palanca', 'P.10') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aperturas desde polea baja sentado en banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Aperturas desde polea baja sentado en banco a 75º', 'P.17') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 4, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales cruzadas desde polea media a dos brazos' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales cruzadas desde polea media a dos brazos', 'H.16') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales sentado con mancuernas' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales sentado con mancuernas', 'H.12') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Kaz press en multipower banco inclinado a 30º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Kaz press en multipower banco inclinado a 30º', 'T.24') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 7, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 8 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de tríceps desde polea alta unilateral con muñequera' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Extensión de tríceps desde polea alta unilateral con muñequera', 'T.14') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 4) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press militar en multipower sentado en banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Press militar en multipower sentado en banco a 75º', 'H.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca inclinado a 45º en multipower' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca inclinado a 45º en multipower', 'P.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca tumbado en máquina de palanca' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca tumbado en máquina de palanca', 'P.10') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aperturas desde polea baja sentado en banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Aperturas desde polea baja sentado en banco a 75º', 'P.17') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 4, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales cruzadas desde polea media a dos brazos' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales cruzadas desde polea media a dos brazos', 'H.16') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales sentado con mancuernas' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales sentado con mancuernas', 'H.12') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Kaz press en multipower banco inclinado a 30º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Kaz press en multipower banco inclinado a 30º', 'T.24') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 7, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 8 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de tríceps desde polea alta unilateral con muñequera' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Extensión de tríceps desde polea alta unilateral con muñequera', 'T.14') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 5) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press militar en multipower sentado en banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Press militar en multipower sentado en banco a 75º', 'H.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca inclinado a 45º en multipower' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca inclinado a 45º en multipower', 'P.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca tumbado en máquina de palanca' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca tumbado en máquina de palanca', 'P.10') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aperturas desde polea baja sentado en banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Aperturas desde polea baja sentado en banco a 75º', 'P.17') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 4, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales cruzadas desde polea media a dos brazos' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales cruzadas desde polea media a dos brazos', 'H.16') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales sentado con mancuernas' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales sentado con mancuernas', 'H.12') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Kaz press en multipower banco inclinado a 30º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Kaz press en multipower banco inclinado a 30º', 'T.24') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 7, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 8 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de tríceps desde polea alta unilateral con muñequera' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Extensión de tríceps desde polea alta unilateral con muñequera', 'T.14') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 6) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press militar en multipower sentado en banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Press militar en multipower sentado en banco a 75º', 'H.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca inclinado a 45º en multipower' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca inclinado a 45º en multipower', 'P.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca tumbado en máquina de palanca' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca tumbado en máquina de palanca', 'P.10') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aperturas desde polea baja sentado en banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Aperturas desde polea baja sentado en banco a 75º', 'P.17') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 4, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales cruzadas desde polea media a dos brazos' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales cruzadas desde polea media a dos brazos', 'H.16') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales sentado con mancuernas' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales sentado con mancuernas', 'H.12') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Kaz press en multipower banco inclinado a 30º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Kaz press en multipower banco inclinado a 30º', 'T.24') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 7, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 8 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de tríceps desde polea alta unilateral con muñequera' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Extensión de tríceps desde polea alta unilateral con muñequera', 'T.14') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 7) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press militar en multipower sentado en banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Press militar en multipower sentado en banco a 75º', 'H.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca inclinado a 45º en multipower' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca inclinado a 45º en multipower', 'P.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca tumbado en máquina de palanca' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca tumbado en máquina de palanca', 'P.10') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aperturas desde polea baja sentado en banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Aperturas desde polea baja sentado en banco a 75º', 'P.17') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 4, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales cruzadas desde polea media a dos brazos' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales cruzadas desde polea media a dos brazos', 'H.16') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales sentado con mancuernas' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales sentado con mancuernas', 'H.12') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Kaz press en multipower banco inclinado a 30º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Kaz press en multipower banco inclinado a 30º', 'T.24') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 7, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '5 a 8 (1)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de tríceps desde polea alta unilateral con muñequera' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Extensión de tríceps desde polea alta unilateral con muñequera', 'T.14') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '10 a 12 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 8) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press militar en multipower sentado en banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Press militar en multipower sentado en banco a 75º', 'H.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca inclinado a 45º en multipower' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca inclinado a 45º en multipower', 'P.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca tumbado en máquina de palanca' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca tumbado en máquina de palanca', 'P.10') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aperturas desde polea baja sentado en banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Aperturas desde polea baja sentado en banco a 75º', 'P.17') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales cruzadas desde polea media a dos brazos' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales cruzadas desde polea media a dos brazos', 'H.16') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 5, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales sentado con mancuernas' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales sentado con mancuernas', 'H.12') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 6, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Kaz press en multipower banco inclinado a 30º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Kaz press en multipower banco inclinado a 30º', 'T.24') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 7, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de tríceps desde polea alta unilateral con muñequera' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Extensión de tríceps desde polea alta unilateral con muñequera', 'T.14') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 8, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (2)', NULL, NULL);

  -- Día: Femoral / Glúteo
  INSERT INTO program_days (program_id, name, order_index, optional)
  VALUES (v_program_id, 'Femoral / Glúteo', 4, false) RETURNING id INTO v_day_id;

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 1) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Gemelo prensa 45°' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('GEMELO', 'Gemelo prensa 45°', 'G.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 1, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Abductor de pie desde polea baja' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CADERA', 'Abductor de pie desde polea baja', 'CA.4') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Hip trust en máquina de palanca' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('GLÚTEO', 'Hip trust en máquina de palanca', 'G.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Peso muerto rumano con barra libre piernas rígidas' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEM./GLÚT.', 'Peso muerto rumano con barra libre piernas rígidas', 'F.9') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Femoral sentado unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEMORAL', 'Femoral sentado unilateral', 'F.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de cuádriceps' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps', 'CUA.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 2) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Gemelo prensa 45°' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('GEMELO', 'Gemelo prensa 45°', 'G.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 1, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Abductor de pie desde polea baja' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CADERA', 'Abductor de pie desde polea baja', 'CA.4') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Hip trust en máquina de palanca' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('GLÚTEO', 'Hip trust en máquina de palanca', 'G.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Peso muerto rumano con barra libre piernas rígidas' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEM./GLÚT.', 'Peso muerto rumano con barra libre piernas rígidas', 'F.9') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Femoral sentado unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEMORAL', 'Femoral sentado unilateral', 'F.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de cuádriceps' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps', 'CUA.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 3) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Gemelo prensa 45°' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('GEMELO', 'Gemelo prensa 45°', 'G.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 1, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Abductor de pie desde polea baja' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CADERA', 'Abductor de pie desde polea baja', 'CA.4') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Hip trust en máquina de palanca' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('GLÚTEO', 'Hip trust en máquina de palanca', 'G.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Peso muerto rumano con barra libre piernas rígidas' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEM./GLÚT.', 'Peso muerto rumano con barra libre piernas rígidas', 'F.9') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Femoral sentado unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEMORAL', 'Femoral sentado unilateral', 'F.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de cuádriceps' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps', 'CUA.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 4) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Gemelo prensa 45°' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('GEMELO', 'Gemelo prensa 45°', 'G.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 1, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Abductor de pie desde polea baja' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CADERA', 'Abductor de pie desde polea baja', 'CA.4') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Hip trust en máquina de palanca' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('GLÚTEO', 'Hip trust en máquina de palanca', 'G.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Peso muerto rumano con barra libre piernas rígidas' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEM./GLÚT.', 'Peso muerto rumano con barra libre piernas rígidas', 'F.9') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Femoral sentado unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEMORAL', 'Femoral sentado unilateral', 'F.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de cuádriceps' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps', 'CUA.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 5) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Gemelo prensa 45°' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('GEMELO', 'Gemelo prensa 45°', 'G.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 1, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Abductor de pie desde polea baja' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CADERA', 'Abductor de pie desde polea baja', 'CA.4') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Hip trust en máquina de palanca' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('GLÚTEO', 'Hip trust en máquina de palanca', 'G.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Peso muerto rumano con barra libre piernas rígidas' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEM./GLÚT.', 'Peso muerto rumano con barra libre piernas rígidas', 'F.9') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Femoral sentado unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEMORAL', 'Femoral sentado unilateral', 'F.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de cuádriceps' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps', 'CUA.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 6) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Gemelo prensa 45°' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('GEMELO', 'Gemelo prensa 45°', 'G.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 1, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Abductor de pie desde polea baja' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CADERA', 'Abductor de pie desde polea baja', 'CA.4') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Hip trust en máquina de palanca' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('GLÚTEO', 'Hip trust en máquina de palanca', 'G.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Peso muerto rumano con barra libre piernas rígidas' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEM./GLÚT.', 'Peso muerto rumano con barra libre piernas rígidas', 'F.9') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Femoral sentado unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEMORAL', 'Femoral sentado unilateral', 'F.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de cuádriceps' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps', 'CUA.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 7) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Gemelo prensa 45°' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('GEMELO', 'Gemelo prensa 45°', 'G.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 1, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Abductor de pie desde polea baja' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CADERA', 'Abductor de pie desde polea baja', 'CA.4') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 3, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Hip trust en máquina de palanca' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('GLÚTEO', 'Hip trust en máquina de palanca', 'G.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Peso muerto rumano con barra libre piernas rígidas' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEM./GLÚT.', 'Peso muerto rumano con barra libre piernas rígidas', 'F.9') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Femoral sentado unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEMORAL', 'Femoral sentado unilateral', 'F.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de cuádriceps' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps', 'CUA.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 6, 2, 'R&P Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 8) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Gemelo prensa 45°' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('GEMELO', 'Gemelo prensa 45°', 'G.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Abductor de pie desde polea baja' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CADERA', 'Abductor de pie desde polea baja', 'CA.4') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Hip trust en máquina de palanca' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('GLÚTEO', 'Hip trust en máquina de palanca', 'G.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Peso muerto rumano con barra libre piernas rígidas' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEM./GLÚT.', 'Peso muerto rumano con barra libre piernas rígidas', 'F.9') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Femoral sentado unilateral' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('FEMORAL', 'Femoral sentado unilateral', 'F.2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 5, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Extensión de cuádriceps' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps', 'CUA.1') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 6, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (2)', NULL, NULL);

  -- Día: Repaso Torso
  INSERT INTO program_days (program_id, name, order_index, optional)
  VALUES (v_program_id, 'Repaso Torso', 5, true) RETURNING id INTO v_day_id;

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 1) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Encogimientos desde polea alta sentado' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ABDOMEN', 'Encogimientos desde polea alta sentado', 'A. 2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '15 a 20 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales con banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales con banco a 75º', 'H.32') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo con mancuerna (Dorsal)' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Remo con mancuerna (Dorsal)', 'D.4') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Jalón al pecho agarre neutro y ancho' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ESPALDA ALTA', 'Jalón al pecho agarre neutro y ancho', 'EA.13') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 4, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aperturas desde polea baja de pie' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Aperturas desde polea baja de pie', 'P.18') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca plano en multipower' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca plano en multipower', 'P.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 6, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps concentrado unilateral con mancuerna' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps concentrado unilateral con mancuerna', 'B.15') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 7, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press francés unilateral tumbado con mancuerna' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Press francés unilateral tumbado con mancuerna', 'T.9') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 2) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Encogimientos desde polea alta sentado' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ABDOMEN', 'Encogimientos desde polea alta sentado', 'A. 2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '15 a 20 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales con banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales con banco a 75º', 'H.32') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo con mancuerna (Dorsal)' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Remo con mancuerna (Dorsal)', 'D.4') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Jalón al pecho agarre neutro y ancho' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ESPALDA ALTA', 'Jalón al pecho agarre neutro y ancho', 'EA.13') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 4, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aperturas desde polea baja de pie' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Aperturas desde polea baja de pie', 'P.18') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca plano en multipower' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca plano en multipower', 'P.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 6, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps concentrado unilateral con mancuerna' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps concentrado unilateral con mancuerna', 'B.15') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 7, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press francés unilateral tumbado con mancuerna' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Press francés unilateral tumbado con mancuerna', 'T.9') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 3) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Encogimientos desde polea alta sentado' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ABDOMEN', 'Encogimientos desde polea alta sentado', 'A. 2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '15 a 20 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales con banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales con banco a 75º', 'H.32') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo con mancuerna (Dorsal)' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Remo con mancuerna (Dorsal)', 'D.4') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Jalón al pecho agarre neutro y ancho' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ESPALDA ALTA', 'Jalón al pecho agarre neutro y ancho', 'EA.13') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 4, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aperturas desde polea baja de pie' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Aperturas desde polea baja de pie', 'P.18') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca plano en multipower' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca plano en multipower', 'P.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 6, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps concentrado unilateral con mancuerna' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps concentrado unilateral con mancuerna', 'B.15') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 7, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press francés unilateral tumbado con mancuerna' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Press francés unilateral tumbado con mancuerna', 'T.9') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 4) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Encogimientos desde polea alta sentado' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ABDOMEN', 'Encogimientos desde polea alta sentado', 'A. 2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '15 a 20 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales con banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales con banco a 75º', 'H.32') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo con mancuerna (Dorsal)' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Remo con mancuerna (Dorsal)', 'D.4') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Jalón al pecho agarre neutro y ancho' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ESPALDA ALTA', 'Jalón al pecho agarre neutro y ancho', 'EA.13') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 4, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aperturas desde polea baja de pie' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Aperturas desde polea baja de pie', 'P.18') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca plano en multipower' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca plano en multipower', 'P.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 6, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps concentrado unilateral con mancuerna' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps concentrado unilateral con mancuerna', 'B.15') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 7, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press francés unilateral tumbado con mancuerna' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Press francés unilateral tumbado con mancuerna', 'T.9') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 2, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 5) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Encogimientos desde polea alta sentado' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ABDOMEN', 'Encogimientos desde polea alta sentado', 'A. 2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '15 a 20 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales con banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales con banco a 75º', 'H.32') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo con mancuerna (Dorsal)' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Remo con mancuerna (Dorsal)', 'D.4') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Jalón al pecho agarre neutro y ancho' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ESPALDA ALTA', 'Jalón al pecho agarre neutro y ancho', 'EA.13') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 4, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aperturas desde polea baja de pie' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Aperturas desde polea baja de pie', 'P.18') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca plano en multipower' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca plano en multipower', 'P.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 6, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps concentrado unilateral con mancuerna' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps concentrado unilateral con mancuerna', 'B.15') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 7, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press francés unilateral tumbado con mancuerna' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Press francés unilateral tumbado con mancuerna', 'T.9') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 6) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Encogimientos desde polea alta sentado' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ABDOMEN', 'Encogimientos desde polea alta sentado', 'A. 2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '15 a 20 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales con banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales con banco a 75º', 'H.32') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo con mancuerna (Dorsal)' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Remo con mancuerna (Dorsal)', 'D.4') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Jalón al pecho agarre neutro y ancho' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ESPALDA ALTA', 'Jalón al pecho agarre neutro y ancho', 'EA.13') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 4, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aperturas desde polea baja de pie' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Aperturas desde polea baja de pie', 'P.18') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca plano en multipower' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca plano en multipower', 'P.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 6, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps concentrado unilateral con mancuerna' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps concentrado unilateral con mancuerna', 'B.15') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 7, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press francés unilateral tumbado con mancuerna' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Press francés unilateral tumbado con mancuerna', 'T.9') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 7) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Encogimientos desde polea alta sentado' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ABDOMEN', 'Encogimientos desde polea alta sentado', 'A. 2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '15 a 20 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales con banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales con banco a 75º', 'H.32') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 2, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo con mancuerna (Dorsal)' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Remo con mancuerna (Dorsal)', 'D.4') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 3) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Jalón al pecho agarre neutro y ancho' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ESPALDA ALTA', 'Jalón al pecho agarre neutro y ancho', 'EA.13') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 4, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 9 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '9 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aperturas desde polea baja de pie' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Aperturas desde polea baja de pie', 'P.18') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 5, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (fallo)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (fallo)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca plano en multipower' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca plano en multipower', 'P.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 6, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps concentrado unilateral con mancuerna' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps concentrado unilateral con mancuerna', 'B.15') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 7, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press francés unilateral tumbado con mancuerna' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Press francés unilateral tumbado con mancuerna', 'T.9') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
  VALUES (v_mc_id, v_ex_id, 8, 3, 'DS Últ. Serie') RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (0)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 3, '12 a 15 (0)', NULL, NULL);

  INSERT INTO microcycles (day_id, number) VALUES (v_day_id, 8) RETURNING id INTO v_mc_id;
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Encogimientos desde polea alta sentado' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ABDOMEN', 'Encogimientos desde polea alta sentado', 'A. 2') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 1, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '12 a 15 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Elevaciones laterales con banco a 75º' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('HOMBRO', 'Elevaciones laterales con banco a 75º', 'H.32') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 2, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Remo con mancuerna (Dorsal)' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('DORSAL', 'Remo con mancuerna (Dorsal)', 'D.4') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 3, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Jalón al pecho agarre neutro y ancho' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('ESPALDA ALTA', 'Jalón al pecho agarre neutro y ancho', 'EA.13') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 4, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '6 a 8 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '8 a 10 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Aperturas desde polea baja de pie' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Aperturas desde polea baja de pie', 'P.18') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 5, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '10 a 12 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '12 a 15 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press banca plano en multipower' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('PECTORAL', 'Press banca plano en multipower', 'P.3') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 6, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Curl de bíceps concentrado unilateral con mancuerna' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('BÍCEPS', 'Curl de bíceps concentrado unilateral con mancuerna', 'B.15') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 7, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (2)', NULL, NULL);
  SELECT id INTO v_ex_id FROM exercises WHERE name = 'Press francés unilateral tumbado con mancuerna' LIMIT 1;
  IF v_ex_id IS NULL THEN
    INSERT INTO exercises (muscle_group, name, video_ref) VALUES ('TRÍCEPS', 'Press francés unilateral tumbado con mancuerna', 'T.9') RETURNING id INTO v_ex_id;
  END IF;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets)
  VALUES (v_mc_id, v_ex_id, 8, 2) RETURNING id INTO v_mic_ex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 1, '8 a 10 (3)', NULL, NULL);
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps, target_weight, target_rpe)
  VALUES (v_mic_ex_id, 2, '10 a 12 (2)', NULL, NULL);

  RAISE NOTICE 'Programa importado con éxito';
END $$;