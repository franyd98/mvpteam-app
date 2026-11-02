-- ═══════════════════════════════════════════════════════════════════
-- PASO 2 · LIMPIEZA DEL CATÁLOGO DE EJERCICIOS
-- Ejecuta primero ejercicios_1_diagnostico.sql y revisa los números.
--
-- Va en un único bloque DO: se ejecuta de una vez y es atómico
-- (si algo falla, no se cambia nada). Sin tablas temporales, porque el
-- SQL Editor de Supabase no las mantiene entre sentencias.
--
--   A. FUSIONAR: cada ejercicio sin vídeo que tiene una "gemela" con vídeo
--      (mismo nombre salvo mayúsculas/acentos/º°/espacios) → los programas
--      pasan a apuntar a la gemela con vídeo.
--   B. BORRAR: ejercicios sin vídeo que ya no usa ningún programa
--      (incluye las copias fusionadas en A).
--   C. Los ejercicios sin vídeo que SÍ se usan y no tienen gemela se quedan.
--      La consulta de abajo del todo los lista para revisarlos.
--
-- Los registros de pesos (set_logs) no se ven afectados: van por día/posición.
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  n_repuntados integer;
  n_borrados   integer;
BEGIN
  -- A. Repuntar los programas a la gemela con vídeo (la de id más bajo)
  WITH ex AS (
    SELECT
      e.id,
      (coalesce(e.video_ref, '') ~* '^https?://') AS tiene_video,
      regexp_replace(
        translate(lower(trim(normalize(e.name, NFC))), 'áéíóúüàèìòùº', 'aeiouuaeiou°'),
        '\s+', ' ', 'g'
      ) AS clave
    FROM exercises e
  ),
  fusion AS (
    SELECT DISTINCT ON (a.id) a.id AS viejo_id, b.id AS nuevo_id
    FROM ex a
    JOIN ex b ON b.clave = a.clave AND b.id <> a.id AND b.tiene_video
    WHERE NOT a.tiene_video
    ORDER BY a.id, b.id
  )
  UPDATE microcycle_exercises me
  SET exercise_id = f.nuevo_id
  FROM fusion f
  WHERE me.exercise_id = f.viejo_id;
  GET DIAGNOSTICS n_repuntados = ROW_COUNT;

  -- B. Borrar ejercicios sin vídeo que ya no usa ningún programa
  DELETE FROM exercises e
  WHERE NOT (coalesce(e.video_ref, '') ~* '^https?://')
    AND NOT EXISTS (SELECT 1 FROM microcycle_exercises me WHERE me.exercise_id = e.id);
  GET DIAGNOSTICS n_borrados = ROW_COUNT;

  RAISE NOTICE 'Filas de programas repuntadas a la versión con vídeo: %', n_repuntados;
  RAISE NOTICE 'Ejercicios sin vídeo borrados: %', n_borrados;
END $$;

-- C. Lo que queda sin vídeo (usado en programas) → revisar a mano
SELECT
  e.muscle_group,
  e.name,
  (SELECT COUNT(*) FROM microcycle_exercises me WHERE me.exercise_id = e.id) AS usos_en_programas
FROM exercises e
WHERE NOT (coalesce(e.video_ref, '') ~* '^https?://')
ORDER BY e.muscle_group, e.name;
