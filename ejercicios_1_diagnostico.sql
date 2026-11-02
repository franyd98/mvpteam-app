-- ═══════════════════════════════════════════════════════════════════
-- PASO 1 · DIAGNÓSTICO DEL CATÁLOGO DE EJERCICIOS (solo lectura, no cambia nada)
--
-- "Clave" = nombre normalizado: minúsculas, sin acentos, º→°, sin espacios dobles.
-- Dos ejercicios con la misma clave son el mismo ejercicio escrito distinto.
-- ═══════════════════════════════════════════════════════════════════

WITH ex AS (
  SELECT
    e.id,
    e.name,
    e.muscle_group,
    e.video_ref,
    (coalesce(e.video_ref, '') ~* '^https?://') AS tiene_video,
    regexp_replace(
      translate(lower(trim(normalize(e.name, NFC))), 'áéíóúüàèìòùº', 'aeiouuaeiou°'),
      '\s+', ' ', 'g'
    ) AS clave,
    (SELECT COUNT(*) FROM microcycle_exercises me WHERE me.exercise_id = e.id) AS usos
  FROM exercises e
),
gemela AS (
  SELECT DISTINCT ON (a.id) a.id, b.id AS gemela_id, b.name AS gemela_nombre
  FROM ex a
  JOIN ex b ON b.clave = a.clave AND b.id <> a.id AND b.tiene_video
  WHERE NOT a.tiene_video
  ORDER BY a.id, b.id
)

-- 1) RESUMEN
SELECT 'Total ejercicios'                                     AS concepto, COUNT(*)::text AS valor FROM ex
UNION ALL SELECT 'Con vídeo',                                   COUNT(*)::text FROM ex WHERE tiene_video
UNION ALL SELECT 'Sin vídeo',                                   COUNT(*)::text FROM ex WHERE NOT tiene_video
UNION ALL SELECT 'Sin vídeo pero con gemela CON vídeo (se fusionan)', COUNT(*)::text FROM gemela
UNION ALL SELECT 'Sin vídeo, sin gemela y SIN usar (se borran)',
          COUNT(*)::text FROM ex WHERE NOT tiene_video AND usos = 0 AND id NOT IN (SELECT id FROM gemela)
UNION ALL SELECT 'Sin vídeo, sin gemela y USADOS en programas (se quedan, revisar)',
          COUNT(*)::text FROM ex WHERE NOT tiene_video AND usos > 0 AND id NOT IN (SELECT id FROM gemela);


-- 2) DETALLE: todos los ejercicios sin vídeo y qué pasará con cada uno
--    (ejecuta esta consulta por separado si quieres ver la lista completa)
/*
WITH ex AS (
  SELECT e.id, e.name, e.muscle_group, (coalesce(e.video_ref, '') ~* '^https?://') AS tiene_video,
    regexp_replace(translate(lower(trim(normalize(e.name, NFC))), 'áéíóúüàèìòùº', 'aeiouuaeiou°'), '\s+', ' ', 'g') AS clave,
    (SELECT COUNT(*) FROM microcycle_exercises me WHERE me.exercise_id = e.id) AS usos
  FROM exercises e
),
gemela AS (
  SELECT DISTINCT ON (a.id) a.id, b.name AS gemela_nombre
  FROM ex a JOIN ex b ON b.clave = a.clave AND b.id <> a.id AND b.tiene_video
  WHERE NOT a.tiene_video ORDER BY a.id, b.id
)
SELECT
  CASE WHEN g.id IS NOT NULL THEN '1 FUSIONAR'
       WHEN ex.usos = 0      THEN '2 BORRAR'
       ELSE                       '3 REVISAR (usado, sin vídeo)' END AS accion,
  ex.muscle_group, ex.name, ex.usos AS usos_en_programas, g.gemela_nombre AS se_fusiona_con
FROM ex LEFT JOIN gemela g ON g.id = ex.id
WHERE NOT ex.tiene_video
ORDER BY accion, ex.muscle_group, ex.name;
*/
