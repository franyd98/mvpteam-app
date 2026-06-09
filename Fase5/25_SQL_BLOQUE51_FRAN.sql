-- ============================================================
-- Bloque 5.1 - Fran Villar
-- Generado automáticamente desde Excel
-- ============================================================

DO $$
DECLARE
  prog_id   integer;
  day_0_id  integer;
  day_1_id  integer;
  day_2_id  integer;
  day_3_id  integer;
  day_4_id  integer;
  mc_id     integer;
  ex_id     integer;
  mex_id    integer;
BEGIN

  -- Programa
  INSERT INTO programs (name, description)
    VALUES ('Bloque 5.1 - Fran Villar', '4 días + 1 opcional')
    RETURNING id INTO prog_id;

  -- Días
  INSERT INTO program_days (program_id, name, order_index, optional)
    VALUES (prog_id, 'Tirón', 0, false)
    RETURNING id INTO day_0_id;
  INSERT INTO program_days (program_id, name, order_index, optional)
    VALUES (prog_id, 'Cuádriceps', 1, false)
    RETURNING id INTO day_1_id;
  INSERT INTO program_days (program_id, name, order_index, optional)
    VALUES (prog_id, 'Empuje', 2, false)
    RETURNING id INTO day_2_id;
  INSERT INTO program_days (program_id, name, order_index, optional)
    VALUES (prog_id, 'Femoral / Glúteo', 3, false)
    RETURNING id INTO day_3_id;
  INSERT INTO program_days (program_id, name, order_index, optional)
    VALUES (prog_id, 'Repaso Torso', 4, true)
    RETURNING id INTO day_4_id;

  -- === Día: Tirón ===
  -- Microciclo 1
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_0_id, 1)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ABDOMEN', 'Rueda abdominal', 'A.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Remo agarre prono en máquina de palanca', 'EA.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Remo bajo unilateral', 'EA.19')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'D.14')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Remo unilateral neutro desde polea media banco inclinado a 60° (dorsal)', 'D.7')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO POSTERIOR', 'Hombro posterior desde polea alta-media a un brazo', 'HP.6')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl de bíceps Martillo con mancuernas alterno sentado en banco inclinado a 75º', 'B.13')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl de bíceps banco scott unilateral con mancuerna', 'B.18')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');

  -- Microciclo 2
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_0_id, 2)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ABDOMEN', 'Rueda abdominal', 'A.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Remo agarre prono en máquina de palanca', 'EA.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Remo bajo unilateral', 'EA.19')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'D.14')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Remo unilateral neutro desde polea media banco inclinado a 60° (dorsal)', 'D.7')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO POSTERIOR', 'Hombro posterior desde polea alta-media a un brazo', 'HP.6')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl de bíceps Martillo con mancuernas alterno sentado en banco inclinado a 75º', 'B.13')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl de bíceps banco scott unilateral con mancuerna', 'B.18')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');

  -- Microciclo 3
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_0_id, 3)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ABDOMEN', 'Rueda abdominal', 'A.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Remo agarre prono en máquina de palanca', 'EA.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Remo bajo unilateral', 'EA.19')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'D.14')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Remo unilateral neutro desde polea media banco inclinado a 60° (dorsal)', 'D.7')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO POSTERIOR', 'Hombro posterior desde polea alta-media a un brazo', 'HP.6')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl de bíceps Martillo con mancuernas alterno sentado en banco inclinado a 75º', 'B.13')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl de bíceps banco scott unilateral con mancuerna', 'B.18')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');

  -- Microciclo 4
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_0_id, 4)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ABDOMEN', 'Rueda abdominal', 'A.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Remo agarre prono en máquina de palanca', 'EA.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Remo bajo unilateral', 'EA.19')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'D.14')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Remo unilateral neutro desde polea media banco inclinado a 60° (dorsal)', 'D.7')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO POSTERIOR', 'Hombro posterior desde polea alta-media a un brazo', 'HP.6')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl de bíceps Martillo con mancuernas alterno sentado en banco inclinado a 75º', 'B.13')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl de bíceps banco scott unilateral con mancuerna', 'B.18')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');

  -- Microciclo 5
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_0_id, 5)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ABDOMEN', 'Rueda abdominal', 'A.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Remo agarre prono en máquina de palanca', 'EA.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Remo bajo unilateral', 'EA.19')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'D.14')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Remo unilateral neutro desde polea media banco inclinado a 60° (dorsal)', 'D.7')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO POSTERIOR', 'Hombro posterior desde polea alta-media a un brazo', 'HP.6')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl de bíceps Martillo con mancuernas alterno sentado en banco inclinado a 75º', 'B.13')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl de bíceps banco scott unilateral con mancuerna', 'B.18')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');

  -- Microciclo 6
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_0_id, 6)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ABDOMEN', 'Rueda abdominal', 'A.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Remo agarre prono en máquina de palanca', 'EA.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Remo bajo unilateral', 'EA.19')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'D.14')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Remo unilateral neutro desde polea media banco inclinado a 60° (dorsal)', 'D.7')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO POSTERIOR', 'Hombro posterior desde polea alta-media a un brazo', 'HP.6')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl de bíceps Martillo con mancuernas alterno sentado en banco inclinado a 75º', 'B.13')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl de bíceps banco scott unilateral con mancuerna', 'B.18')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');

  -- Microciclo 7
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_0_id, 7)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ABDOMEN', 'Rueda abdominal', 'A.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Remo agarre prono en máquina de palanca', 'EA.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Remo bajo unilateral', 'EA.19')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'D.14')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Remo unilateral neutro desde polea media banco inclinado a 60° (dorsal)', 'D.7')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO POSTERIOR', 'Hombro posterior desde polea alta-media a un brazo', 'HP.6')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl de bíceps Martillo con mancuernas alterno sentado en banco inclinado a 75º', 'B.13')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl de bíceps banco scott unilateral con mancuerna', 'B.18')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');

  -- Microciclo 8
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_0_id, 8)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ABDOMEN', 'Rueda abdominal', 'A.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Remo agarre prono en máquina de palanca', 'EA.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Remo bajo unilateral', 'EA.19')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Jalón al pecho agarre neutro en multiestación (manos anchura hombros)', 'D.14')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Remo unilateral neutro desde polea media banco inclinado a 60° (dorsal)', 'D.7')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO POSTERIOR', 'Hombro posterior desde polea alta-media a un brazo', 'HP.6')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl de bíceps Martillo con mancuernas alterno sentado en banco inclinado a 75º', 'B.13')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl de bíceps banco scott unilateral con mancuerna', 'B.18')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (2)');

  -- === Día: Cuádriceps ===
  -- Microciclo 1
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_1_id, 1)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GEMELO', 'Gemelo de pie en multipower sobre step', 'G.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CADERA', 'Aductor sentado en máquina', 'CA.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Prensa 45° guiada bilateral', 'CUA. 21')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Sentadilla pendular en máquina de palanca', 'CUA.9')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps unilateral', 'CUA.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEMORAL', 'Femoral tumbado', 'F.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');

  -- Microciclo 2
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_1_id, 2)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GEMELO', 'Gemelo de pie en multipower sobre step', 'G.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CADERA', 'Aductor sentado en máquina', 'CA.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Prensa 45° guiada bilateral', 'CUA. 21')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Sentadilla pendular en máquina de palanca', 'CUA.9')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps unilateral', 'CUA.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEMORAL', 'Femoral tumbado', 'F.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');

  -- Microciclo 3
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_1_id, 3)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GEMELO', 'Gemelo de pie en multipower sobre step', 'G.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CADERA', 'Aductor sentado en máquina', 'CA.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Prensa 45° guiada bilateral', 'CUA. 21')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Sentadilla pendular en máquina de palanca', 'CUA.9')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps unilateral', 'CUA.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEMORAL', 'Femoral tumbado', 'F.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  -- Microciclo 4
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_1_id, 4)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GEMELO', 'Gemelo de pie en multipower sobre step', 'G.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CADERA', 'Aductor sentado en máquina', 'CA.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Prensa 45° guiada bilateral', 'CUA. 21')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Sentadilla pendular en máquina de palanca', 'CUA.9')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps unilateral', 'CUA.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEMORAL', 'Femoral tumbado', 'F.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');

  -- Microciclo 5
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_1_id, 5)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GEMELO', 'Gemelo de pie en multipower sobre step', 'G.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CADERA', 'Aductor sentado en máquina', 'CA.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Prensa 45° guiada bilateral', 'CUA. 21')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Sentadilla pendular en máquina de palanca', 'CUA.9')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps unilateral', 'CUA.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEMORAL', 'Femoral tumbado', 'F.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');

  -- Microciclo 6
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_1_id, 6)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GEMELO', 'Gemelo de pie en multipower sobre step', 'G.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CADERA', 'Aductor sentado en máquina', 'CA.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Prensa 45° guiada bilateral', 'CUA. 21')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Sentadilla pendular en máquina de palanca', 'CUA.9')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps unilateral', 'CUA.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEMORAL', 'Femoral tumbado', 'F.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');

  -- Microciclo 7
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_1_id, 7)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GEMELO', 'Gemelo de pie en multipower sobre step', 'G.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CADERA', 'Aductor sentado en máquina', 'CA.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Prensa 45° guiada bilateral', 'CUA. 21')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '5 a 7 (1)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Sentadilla pendular en máquina de palanca', 'CUA.9')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps unilateral', 'CUA.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEMORAL', 'Femoral tumbado', 'F.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');

  -- Microciclo 8
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_1_id, 8)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GEMELO', 'Gemelo de pie en multipower sobre step', 'G.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CADERA', 'Aductor sentado en máquina', 'CA.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Prensa 45° guiada bilateral', 'CUA. 21')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Sentadilla pendular en máquina de palanca', 'CUA.9')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps unilateral', 'CUA.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEMORAL', 'Femoral tumbado', 'F.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (2)');

  -- === Día: Empuje ===
  -- Microciclo 1
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_2_id, 1)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Elevación lateral desde polea media a un brazo', 'H.17')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca plano en multipower', 'P.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca agarre neutro máquina de placas', 'P.29')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Aperturas en máquina de placas', 'P.21')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Elevaciones laterales con restricción banco inclinado a 60º con mancuernas', 'H.13')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Press militar máquina de palanca (CYBEX)', 'H.33')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Extensión de tríceps desde polea alta con barra corta', 'T.12')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Extensión de tríceps Katana', 'T.16')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');

  -- Microciclo 2
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_2_id, 2)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Elevación lateral desde polea media a un brazo', 'H.17')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca plano en multipower', 'P.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca agarre neutro máquina de placas', 'P.29')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Aperturas en máquina de placas', 'P.21')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Elevaciones laterales con restricción banco inclinado a 60º con mancuernas', 'H.13')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Press militar máquina de palanca (CYBEX)', 'H.33')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Extensión de tríceps desde polea alta con barra corta', 'T.12')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Extensión de tríceps Katana', 'T.16')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');

  -- Microciclo 3
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_2_id, 3)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Elevación lateral desde polea media a un brazo', 'H.17')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca plano en multipower', 'P.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca agarre neutro máquina de placas', 'P.29')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Aperturas en máquina de placas', 'P.21')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Elevaciones laterales con restricción banco inclinado a 60º con mancuernas', 'H.13')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Press militar máquina de palanca (CYBEX)', 'H.33')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Extensión de tríceps desde polea alta con barra corta', 'T.12')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Extensión de tríceps Katana', 'T.16')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  -- Microciclo 4
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_2_id, 4)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Elevación lateral desde polea media a un brazo', 'H.17')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca plano en multipower', 'P.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca agarre neutro máquina de placas', 'P.29')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Aperturas en máquina de placas', 'P.21')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Elevaciones laterales con restricción banco inclinado a 60º con mancuernas', 'H.13')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Press militar máquina de palanca (CYBEX)', 'H.33')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Extensión de tríceps desde polea alta con barra corta', 'T.12')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Extensión de tríceps Katana', 'T.16')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  -- Microciclo 5
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_2_id, 5)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Elevación lateral desde polea media a un brazo', 'H.17')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca plano en multipower', 'P.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca agarre neutro máquina de placas', 'P.29')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Aperturas en máquina de placas', 'P.21')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Elevaciones laterales con restricción banco inclinado a 60º con mancuernas', 'H.13')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Press militar máquina de palanca (CYBEX)', 'H.33')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Extensión de tríceps desde polea alta con barra corta', 'T.12')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Extensión de tríceps Katana', 'T.16')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  -- Microciclo 6
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_2_id, 6)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Elevación lateral desde polea media a un brazo', 'H.17')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca plano en multipower', 'P.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca agarre neutro máquina de placas', 'P.29')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Aperturas en máquina de placas', 'P.21')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Elevaciones laterales con restricción banco inclinado a 60º con mancuernas', 'H.13')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Press militar máquina de palanca (CYBEX)', 'H.33')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Extensión de tríceps desde polea alta con barra corta', 'T.12')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Extensión de tríceps Katana', 'T.16')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  -- Microciclo 7
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_2_id, 7)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Elevación lateral desde polea media a un brazo', 'H.17')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca plano en multipower', 'P.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca agarre neutro máquina de placas', 'P.29')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Aperturas en máquina de placas', 'P.21')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Elevaciones laterales con restricción banco inclinado a 60º con mancuernas', 'H.13')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Press militar máquina de palanca (CYBEX)', 'H.33')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Extensión de tríceps desde polea alta con barra corta', 'T.12')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Extensión de tríceps Katana', 'T.16')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '10 a 12 (fallo)');

  -- Microciclo 8
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_2_id, 8)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Elevación lateral desde polea media a un brazo', 'H.17')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca plano en multipower', 'P.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca agarre neutro máquina de placas', 'P.29')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Aperturas en máquina de placas', 'P.21')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Elevaciones laterales con restricción banco inclinado a 60º con mancuernas', 'H.13')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Press militar máquina de palanca (CYBEX)', 'H.33')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Extensión de tríceps desde polea alta con barra corta', 'T.12')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Extensión de tríceps Katana', 'T.16')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (2)');

  -- === Día: Femoral / Glúteo ===
  -- Microciclo 1
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_3_id, 1)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GEMELO', 'Gemelo prensa 45°', 'G.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CADERA', 'Abductor sentado en máquina', 'CA.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GLÚTEO', 'Hip trust en máquina de palanca', 'G.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEM./GLÚT.', 'Prensa 45° pies parte alta', 'F.6')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '7 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEMORAL', 'Femoral sentado unilateral', 'F.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps', 'CUA.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');

  -- Microciclo 2
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_3_id, 2)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GEMELO', 'Gemelo prensa 45°', 'G.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CADERA', 'Abductor sentado en máquina', 'CA.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GLÚTEO', 'Hip trust en máquina de palanca', 'G.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEM./GLÚT.', 'Prensa 45° pies parte alta', 'F.6')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '7 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEMORAL', 'Femoral sentado unilateral', 'F.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps', 'CUA.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');

  -- Microciclo 3
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_3_id, 3)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GEMELO', 'Gemelo prensa 45°', 'G.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CADERA', 'Abductor sentado en máquina', 'CA.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GLÚTEO', 'Hip trust en máquina de palanca', 'G.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEM./GLÚT.', 'Prensa 45° pies parte alta', 'F.6')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '7 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEMORAL', 'Femoral sentado unilateral', 'F.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps', 'CUA.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');

  -- Microciclo 4
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_3_id, 4)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GEMELO', 'Gemelo prensa 45°', 'G.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CADERA', 'Abductor sentado en máquina', 'CA.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GLÚTEO', 'Hip trust en máquina de palanca', 'G.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEM./GLÚT.', 'Prensa 45° pies parte alta', 'F.6')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '7 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEMORAL', 'Femoral sentado unilateral', 'F.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps', 'CUA.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');

  -- Microciclo 5
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_3_id, 5)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GEMELO', 'Gemelo prensa 45°', 'G.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CADERA', 'Abductor sentado en máquina', 'CA.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GLÚTEO', 'Hip trust en máquina de palanca', 'G.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEM./GLÚT.', 'Prensa 45° pies parte alta', 'F.6')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '7 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEMORAL', 'Femoral sentado unilateral', 'F.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps', 'CUA.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');

  -- Microciclo 6
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_3_id, 6)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GEMELO', 'Gemelo prensa 45°', 'G.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CADERA', 'Abductor sentado en máquina', 'CA.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GLÚTEO', 'Hip trust en máquina de palanca', 'G.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEM./GLÚT.', 'Prensa 45° pies parte alta', 'F.6')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '7 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEMORAL', 'Femoral sentado unilateral', 'F.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps', 'CUA.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');

  -- Microciclo 7
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_3_id, 7)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GEMELO', 'Gemelo prensa 45°', 'G.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CADERA', 'Abductor sentado en máquina', 'CA.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GLÚTEO', 'Hip trust en máquina de palanca', 'G.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEM./GLÚT.', 'Prensa 45° pies parte alta', 'F.6')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '7 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEMORAL', 'Femoral sentado unilateral', 'F.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps', 'CUA.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, 'R&P Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');

  -- Microciclo 8
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_3_id, 8)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GEMELO', 'Gemelo prensa 45°', 'G.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CADERA', 'Abductor sentado en máquina', 'CA.3')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('GLÚTEO', 'Hip trust en máquina de palanca', 'G.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEM./GLÚT.', 'Prensa 45° pies parte alta', 'F.6')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('FEMORAL', 'Femoral sentado unilateral', 'F.2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '10 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('CUÁDRICEPS', 'Extensión de cuádriceps', 'CUA.1')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (2)');

  -- === Día: Repaso Torso ===
  -- Microciclo 1
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_4_id, 1)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ABDOMEN', 'Encogimientos desde polea alta sentado', 'A. 2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Hombro lateral acostado de lado con mancuerna en banco inclinado a 45º', 'H.14')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Seal row agarre prono con mancuernas', 'EA.16')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Pullover con barra desde polea alta', 'D.20')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Aperturas desde polea media banco a 75º', 'P.15')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca inclinado en máquina de palanca', 'P.7')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Press francés unilateral tumbado con mancuerna', 'T.9')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl Bayesian', 'B.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');

  -- Microciclo 2
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_4_id, 2)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ABDOMEN', 'Encogimientos desde polea alta sentado', 'A. 2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Hombro lateral acostado de lado con mancuerna en banco inclinado a 45º', 'H.14')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Seal row agarre prono con mancuernas', 'EA.16')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Pullover con barra desde polea alta', 'D.20')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Aperturas desde polea media banco a 75º', 'P.15')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca inclinado en máquina de palanca', 'P.7')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Press francés unilateral tumbado con mancuerna', 'T.9')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl Bayesian', 'B.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');

  -- Microciclo 3
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_4_id, 3)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ABDOMEN', 'Encogimientos desde polea alta sentado', 'A. 2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Hombro lateral acostado de lado con mancuerna en banco inclinado a 45º', 'H.14')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Seal row agarre prono con mancuernas', 'EA.16')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Pullover con barra desde polea alta', 'D.20')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Aperturas desde polea media banco a 75º', 'P.15')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca inclinado en máquina de palanca', 'P.7')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Press francés unilateral tumbado con mancuerna', 'T.9')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl Bayesian', 'B.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');

  -- Microciclo 4
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_4_id, 4)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ABDOMEN', 'Encogimientos desde polea alta sentado', 'A. 2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Hombro lateral acostado de lado con mancuerna en banco inclinado a 45º', 'H.14')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Seal row agarre prono con mancuernas', 'EA.16')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Pullover con barra desde polea alta', 'D.20')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Aperturas desde polea media banco a 75º', 'P.15')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca inclinado en máquina de palanca', 'P.7')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Press francés unilateral tumbado con mancuerna', 'T.9')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl Bayesian', 'B.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');

  -- Microciclo 5
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_4_id, 5)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ABDOMEN', 'Encogimientos desde polea alta sentado', 'A. 2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Hombro lateral acostado de lado con mancuerna en banco inclinado a 45º', 'H.14')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Seal row agarre prono con mancuernas', 'EA.16')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Pullover con barra desde polea alta', 'D.20')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Aperturas desde polea media banco a 75º', 'P.15')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca inclinado en máquina de palanca', 'P.7')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Press francés unilateral tumbado con mancuerna', 'T.9')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl Bayesian', 'B.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');

  -- Microciclo 6
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_4_id, 6)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ABDOMEN', 'Encogimientos desde polea alta sentado', 'A. 2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Hombro lateral acostado de lado con mancuerna en banco inclinado a 45º', 'H.14')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Seal row agarre prono con mancuernas', 'EA.16')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Pullover con barra desde polea alta', 'D.20')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Aperturas desde polea media banco a 75º', 'P.15')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca inclinado en máquina de palanca', 'P.7')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Press francés unilateral tumbado con mancuerna', 'T.9')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl Bayesian', 'B.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');

  -- Microciclo 7
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_4_id, 7)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ABDOMEN', 'Encogimientos desde polea alta sentado', 'A. 2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '15 a 20 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Hombro lateral acostado de lado con mancuerna en banco inclinado a 45º', 'H.14')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Seal row agarre prono con mancuernas', 'EA.16')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 9 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Pullover con barra desde polea alta', 'D.20')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Aperturas desde polea media banco a 75º', 'P.15')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (fallo)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (fallo)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca inclinado en máquina de palanca', 'P.7')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Press francés unilateral tumbado con mancuerna', 'T.9')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl Bayesian', 'B.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, 'DS Últ. Serie')
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (0)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 3, '12 a 15 (0)');

  -- Microciclo 8
  INSERT INTO day_microcycles (day_id, number)
    VALUES (day_4_id, 8)
    RETURNING id INTO mc_id;
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ABDOMEN', 'Encogimientos desde polea alta sentado', 'A. 2')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 0, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '12 a 15 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '15 a 20 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('HOMBRO', 'Hombro lateral acostado de lado con mancuerna en banco inclinado a 45º', 'H.14')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 1, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (2)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('ESPALDA ALTA', 'Seal row agarre prono con mancuernas', 'EA.16')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 2, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '6 a 8 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '8 a 10 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('DORSAL', 'Pullover con barra desde polea alta', 'D.20')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 3, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Aperturas desde polea media banco a 75º', 'P.15')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 4, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '9 a 12 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '12 a 15 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('PECTORAL', 'Press banca inclinado en máquina de palanca', 'P.7')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 5, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('TRÍCEPS', 'Press francés unilateral tumbado con mancuerna', 'T.9')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 6, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (2)');
  INSERT INTO exercises (muscle_group, name, video_ref)
    VALUES ('BÍCEPS', 'Curl Bayesian', 'B.8')
    ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, video_ref=EXCLUDED.video_ref
    RETURNING id INTO ex_id;
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, note)
    VALUES (mc_id, ex_id, 7, NULL)
    RETURNING id INTO mex_id;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 1, '8 a 10 (3)');
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    VALUES (mex_id, 2, '10 a 12 (2)');

  RAISE NOTICE 'Bloque 5.1 - Fran Villar creado con id=%', prog_id;
END $$;