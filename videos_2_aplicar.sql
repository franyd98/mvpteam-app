-- ═══════════════════════════════════════════════════════════════════
-- VÍDEOS · PASO 2 · APLICAR
-- Ejecuta antes videos_1_previsualizar.sql (crea las funciones _vid_*).
--
-- Copia la URL del vídeo a cada ejercicio SIN vídeo usado en un programa
-- ACTIVO cuando el ejercicio con vídeo más parecido tiene similitud ≥ 0,80.
-- No cambia nombres ni programas: solo rellena video_ref.
-- Todo en un bloque DO (atómico). Al final borra las funciones auxiliares.
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  n integer;
BEGIN
  WITH usados AS (
    SELECT DISTINCT e.id, e.name
    FROM program_assignments pa
    JOIN program_days pd         ON pd.program_id = pa.program_id
    JOIN microcycles mc          ON mc.day_id = pd.id
    JOIN microcycle_exercises me ON me.microcycle_id = mc.id
    JOIN exercises e             ON e.id = me.exercise_id
    WHERE pa.active = true
      AND NOT (coalesce(e.video_ref, '') ~* '^https?://')
  ),
  con_video AS (
    SELECT id, video_ref, public._vid_trg(name) AS tg
    FROM exercises
    WHERE coalesce(video_ref, '') ~* '^https?://'
  ),
  mejor AS (
    SELECT DISTINCT ON (u.id)
      u.id, cv.video_ref,
      public._vid_sim(public._vid_trg(u.name), cv.tg) AS similitud
    FROM usados u
    CROSS JOIN con_video cv
    ORDER BY u.id, public._vid_sim(public._vid_trg(u.name), cv.tg) DESC NULLS LAST, cv.id
  )
  UPDATE exercises e
  SET video_ref = m.video_ref
  FROM mejor m
  WHERE e.id = m.id
    AND m.similitud >= 0.80;
  GET DIAGNOSTICS n = ROW_COUNT;
  RAISE NOTICE 'Ejercicios a los que se ha puesto vídeo: %', n;
END $$;

DROP FUNCTION IF EXISTS public._vid_sim(text[], text[]);
DROP FUNCTION IF EXISTS public._vid_trg(text);
DROP FUNCTION IF EXISTS public._vid_norm(text);
