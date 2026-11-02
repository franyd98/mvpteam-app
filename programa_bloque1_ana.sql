-- ═══════════════════════════════════════════════════════════════════
-- Programa: BLOQUE 1 - ANA   (sin asignar a ningún cliente)
-- 3 días de gimnasio: Pierna A · Tren superior + carrera · Pierna B
-- (El miércoles de Pole no se crea como día porque no lleva ejercicios.)
--
-- Nº de microciclos: cambia v_num_mc si quieres más o menos semanas.
-- Todos los microciclos se crean con las mismas series/reps.
-- El descanso va en la nota de cada ejercicio (la app no tiene campo de descanso).
-- ═══════════════════════════════════════════════════════════════════

-- Funciones auxiliares (se borran al final). No se usan funciones temporales
-- porque el SQL Editor de Supabase no las mantiene entre sentencias.

-- Busca un ejercicio del catálogo por varios nombres posibles (sin distinguir
-- mayúsculas). Si no existe ninguno, crea uno nuevo con el primer nombre.
CREATE OR REPLACE FUNCTION public._tmp_ex_id(cands text[], mg text)
RETURNS integer LANGUAGE plpgsql AS $f$
DECLARE
  v_id integer;
  c    text;
BEGIN
  FOREACH c IN ARRAY cands LOOP
    -- Ignora mayúsculas, acentos, º/° y espacios dobles; prefiere la versión con vídeo
    SELECT id INTO v_id FROM exercises
    WHERE regexp_replace(translate(lower(trim(normalize(name, NFC))), 'áéíóúüàèìòùº', 'aeiouuaeiou°'), '\s+', ' ', 'g')
        = regexp_replace(translate(lower(trim(normalize(c,    NFC))), 'áéíóúüàèìòùº', 'aeiouuaeiou°'), '\s+', ' ', 'g')
    ORDER BY (coalesce(video_ref, '') ~* '^https?://') DESC, id
    LIMIT 1;
    IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  END LOOP;
  INSERT INTO exercises (name, muscle_group) VALUES (cands[1], mg)
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_id;
  RETURN v_id;
END $f$;

-- Inserta un ejercicio con N series iguales en un microciclo.
CREATE OR REPLACE FUNCTION public._tmp_add_ex(p_mc integer, p_ex integer, p_ord integer,
                                          p_sets integer, p_reps text, p_note text)
RETURNS void LANGUAGE plpgsql AS $f$
DECLARE
  v_me integer;
BEGIN
  INSERT INTO microcycle_exercises (microcycle_id, exercise_id, order_index, total_sets, note)
    VALUES (p_mc, p_ex, p_ord, p_sets, p_note)
    RETURNING id INTO v_me;
  INSERT INTO exercise_sets (microcycle_exercise_id, set_number, target_reps)
    SELECT v_me, n, p_reps FROM generate_series(1, p_sets) AS n;
END $f$;

DO $$
DECLARE
  v_num_mc  integer := 16;     -- ← nº de microciclos (semanas) del bloque
  prog_id   integer;
  d1 integer; d2 integer; d3 integer;
  mc integer;
  i  integer;
  -- ejercicios
  e_pm integer; e_pat integer; e_ext integer; e_adu integer; e_pre integer; e_abd1 integer;
  e_dom integer; e_jal integer; e_flx integer; e_pmil integer; e_mar integer; e_tri integer; e_abd2 integer; e_car integer;
  e_sen integer; e_hip integer; e_abdu integer; e_zan integer; e_pla integer; e_esc integer;
BEGIN
  -- ── Catálogo (reutiliza si existe, si no lo crea) ──
  e_pm   := public._tmp_ex_id(ARRAY['Peso muerto rumano con barra libre','PESO MUERTO RUMANO BARRA LIBRE','Peso Muerto Rumano Barra Libre'], 'FEMORAL');
  e_pat  := public._tmp_ex_id(ARRAY['Patada de glúteo desde polea baja','PATADA DE GLÚTEO DESDE POLEA BAJA'], 'GLÚTEO');
  e_ext  := public._tmp_ex_id(ARRAY['Extensión de cuádriceps unilateral','EXTENSIÓN DE CUÁDRICEPS UNILATERAL'], 'CUÁDRICEPS');
  e_adu  := public._tmp_ex_id(ARRAY['Aductor sentado en máquina','ADUCTOR SENTADO EN MÁQUINA'], 'ADUCTOR');
  e_pre  := public._tmp_ex_id(ARRAY['Prensa 45°','Prensa 45º','PRENSA 45°'], 'CUÁDRICEPS');
  e_abd1 := public._tmp_ex_id(ARRAY['Crunch completo + pelota de lado a lado'], 'ABDOMEN');

  e_dom  := public._tmp_ex_id(ARRAY['Dominadas asistidas con goma'], 'DORSAL');
  e_jal  := public._tmp_ex_id(ARRAY['Jalón al pecho unilateral en máquina de placas','Dorsal- Jalón al pecho unilateral en máquina de placas','Jalón unilateral'], 'DORSAL');
  e_flx  := public._tmp_ex_id(ARRAY['Flexiones inclinadas'], 'PECTORAL');
  e_pmil := public._tmp_ex_id(ARRAY['Press militar con mancuernas banco a 75º','Press militar con mancuernas banco a 75°','PRESS MILITAR CON MANCUERNAS BANCO A 75°'], 'HOMBRO');
  e_mar  := public._tmp_ex_id(ARRAY['Curl de bíceps Martillo con mancuernas alterno sentado en banco inclinado a 75º','Curl de Bíceps Martillo con Macuernas Alterno Sentado Banco Inclinado a 75º','CURL DE BÍCEPS MARTILLO CON MACUERNAS ALTERNO SENTADO BANCO INCLINADO A 75°'], 'BÍCEPS');
  e_tri  := public._tmp_ex_id(ARRAY['Extensión de tríceps desde polea alta con cuerda','Extensión de Tríceps desde Polea Alta con Cuerda','EXTENSIÓN DE TRÍCEPS DESDE POLEA ALTA CON CUERDA'], 'TRÍCEPS');
  e_abd2 := public._tmp_ex_id(ARRAY['Elevación de piernas'], 'ABDOMEN');
  e_car  := public._tmp_ex_id(ARRAY['Carrera por intervalos'], 'CARDIO');

  e_sen  := public._tmp_ex_id(ARRAY['Sentadilla en multipower','SENTADILLA EN MULTIPOWER','Sentadilla en Smith'], 'CUÁDRICEPS');
  e_hip  := public._tmp_ex_id(ARRAY['Hip thrust'], 'GLÚTEO');
  e_abdu := public._tmp_ex_id(ARRAY['Abductor sentado en máquina','ABDUCTOR SENTADO EN MÁQUINA'], 'ABDUCTOR');
  e_zan  := public._tmp_ex_id(ARRAY['Zancadas desplazadas'], 'GLÚTEO');
  e_pla  := public._tmp_ex_id(ARRAY['Plancha abdominal','PLANCHA ABDOMINAL'], 'ABDOMEN');
  e_esc  := public._tmp_ex_id(ARRAY['Escaleras'], 'CARDIO');

  -- ── Programa (sin cliente) ──
  INSERT INTO programs (name, description, owner_client_id)
    VALUES ('BLOQUE 1 - ANA', '3 días gym + Pole · Pierna A · Tren superior + carrera · Pierna B', NULL)
    RETURNING id INTO prog_id;

  INSERT INTO program_days (program_id, name, order_index, optional) VALUES (prog_id, 'Lunes – Pierna A (+ polea)',        0, false) RETURNING id INTO d1;
  INSERT INTO program_days (program_id, name, order_index, optional) VALUES (prog_id, 'Martes – Tren superior + carrera',  1, false) RETURNING id INTO d2;
  INSERT INTO program_days (program_id, name, order_index, optional) VALUES (prog_id, 'Jueves – Pierna B',                 2, false) RETURNING id INTO d3;

  FOR i IN 1..v_num_mc LOOP
    -- ── LUNES – PIERNA A ──
    INSERT INTO microcycles (day_id, number) VALUES (d1, i) RETURNING id INTO mc;
    PERFORM public._tmp_add_ex(mc, e_pm,   0, 3, '12',      'Descanso 1′');
    PERFORM public._tmp_add_ex(mc, e_pat,  1, 3, '15',      'Descanso 1′');
    PERFORM public._tmp_add_ex(mc, e_ext,  2, 3, '12',      'Descanso 1′');
    PERFORM public._tmp_add_ex(mc, e_adu,  3, 3, '15',      'Descanso 1′');
    PERFORM public._tmp_add_ex(mc, e_pre,  4, 3, '12',      'Descanso 1′');
    PERFORM public._tmp_add_ex(mc, e_abd1, 5, 3, '10 + 10', 'Crunch completo + pelota de lado a lado · Descanso 1′');

    -- ── MARTES – TREN SUPERIOR + CARRERA ──
    INSERT INTO microcycles (day_id, number) VALUES (d2, i) RETURNING id INTO mc;
    PERFORM public._tmp_add_ex(mc, e_dom,  0, 3, '10', 'Con goma · Descanso 2′');
    PERFORM public._tmp_add_ex(mc, e_jal,  1, 3, '12', 'Descanso 1′');
    PERFORM public._tmp_add_ex(mc, e_flx,  2, 3, '12', 'Descanso 1′');
    PERFORM public._tmp_add_ex(mc, e_pmil, 3, 3, '15', 'Sentada · Descanso 1′');
    PERFORM public._tmp_add_ex(mc, e_mar,  4, 3, '15', 'Sentada · Descanso 1′');
    PERFORM public._tmp_add_ex(mc, e_tri,  5, 3, '15', 'Descanso 1′');
    PERFORM public._tmp_add_ex(mc, e_abd2, 6, 3, '12', 'Descanso 1′');
    PERFORM public._tmp_add_ex(mc, e_car,  7, 4, '5′ suave + 2′ caminando', '4 bloques · 28′ en total');

    -- ── JUEVES – PIERNA B ──
    INSERT INTO microcycles (day_id, number) VALUES (d3, i) RETURNING id INTO mc;
    PERFORM public._tmp_add_ex(mc, e_sen,  0, 3, '12',              'Descanso 1′');
    PERFORM public._tmp_add_ex(mc, e_hip,  1, 3, '10',              'Aguantar 3″ arriba · Descanso 1′');
    PERFORM public._tmp_add_ex(mc, e_abdu, 2, 4, '12',              '2 series inclinada hacia delante + 2 apoyada en el respaldo · Descanso 1′');
    PERFORM public._tmp_add_ex(mc, e_zan,  3, 3, '10 por pierna',   'Descanso 1′');
    PERFORM public._tmp_add_ex(mc, e_pla,  4, 3, '45″ + 45″ c/lado', 'Plancha frontal + plancha lateral cada lado · Descanso 1′');
    PERFORM public._tmp_add_ex(mc, e_esc,  5, 1, '10′ nivel 8',     NULL);
  END LOOP;

  RAISE NOTICE 'Programa BLOQUE 1 - ANA creado con id % (% microciclos)', prog_id, v_num_mc;
END $$;

DROP FUNCTION public._tmp_ex_id(text[], text);
DROP FUNCTION public._tmp_add_ex(integer, integer, integer, integer, text, text);
