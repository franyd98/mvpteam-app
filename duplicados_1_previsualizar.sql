
-- ═══════════════════════════════════════════════════════════════════
-- DUPLICADOS · PASO 1 · PREVISUALIZAR (no cambia ningún ejercicio)
--
-- Clave de un ejercicio = nombre sin mayúsculas, acentos, º/°, prefijos
-- tipo "TRí- " / "EA- " y signos. Misma clave = mismo ejercicio escrito distinto.
--
-- En cada grupo con la misma clave se elige UN ejercicio "bueno":
--   1º el que tiene vídeo · 2º el más usado en programas
--   3º el que no está TODO EN MAYÚSCULAS · 4º el que no lleva prefijo · 5º el más antiguo
--
-- Acciones:
--   FUSIONAR → los programas pasan al ejercicio bueno y la copia se borra (paso 2).
--   REVISAR  → mismo nombre pero vídeos DISTINTOS (p. ej. "D- Jalón…" vs "EA- Jalón…").
--              No se toca: decide tú cuál vale.
--
-- Ejecuta las consultas una a una (selecciona cada bloque y pulsa Run)
-- o el archivo completo: el editor muestra el resultado de la última.
-- ═══════════════════════════════════════════════════════════════════

-- Función auxiliar (el paso 2 la borra al terminar)
CREATE OR REPLACE FUNCTION public._ex_key(s text) RETURNS text
LANGUAGE sql IMMUTABLE AS $f$
  SELECT trim(regexp_replace(
           regexp_replace(
             replace(
               translate(lower(normalize(coalesce(s, ''), NFC)), 'áéíóúüàèìòùº', 'aeiouuaeiou°'),
               'macuernas', 'mancuernas'),
             '^[a-z.]{1,10}\s*-\s*', ''),
           '[^a-z0-9]+', ' ', 'g'))
$f$;


-- ── A) DETALLE: qué pasará con cada copia ─────────────────────────
WITH ex AS (
  SELECT
    e.id, e.name, e.muscle_group,
    CASE WHEN coalesce(e.video_ref, '') ~* '^https?://' THEN e.video_ref END AS vid,
    public._ex_key(e.name) AS k,
    (SELECT count(*) FROM microcycle_exercises me WHERE me.exercise_id = e.id) AS usos
  FROM exercises e
),
grp AS (
  SELECT k, count(*) AS n, count(DISTINCT vid) AS nv
  FROM ex GROUP BY k HAVING count(*) > 1
),
plan AS (
  SELECT ex.*, g.nv,
    CASE
      WHEN g.nv <= 1 THEN first_value(ex.id) OVER w_grupo
      WHEN ex.vid IS NOT NULL THEN first_value(ex.id) OVER w_video
    END AS target_id
  FROM ex JOIN grp g USING (k)
  WINDOW
    w_grupo AS (PARTITION BY ex.k ORDER BY (ex.vid IS NOT NULL) DESC, ex.usos DESC,
                (ex.name = upper(ex.name)) ASC, (ex.name ~ '^\S{1,10}\s*-\s') ASC, ex.id),
    w_video AS (PARTITION BY ex.k, ex.vid ORDER BY ex.usos DESC,
                (ex.name = upper(ex.name)) ASC, (ex.name ~ '^\S{1,10}\s*-\s') ASC, ex.id)
)
SELECT
  CASE WHEN p.target_id IS NULL      THEN '2 REVISAR (vídeos distintos)'
       WHEN p.target_id = p.id       THEN '0 SE QUEDA'
       ELSE                               '1 FUSIONAR → ' || t.name END AS accion,
  p.k            AS clave,
  p.name         AS ejercicio,
  p.muscle_group AS grupo,
  p.usos         AS usos_en_programas,
  (p.vid IS NOT NULL) AS tiene_video
FROM plan p
LEFT JOIN exercises t ON t.id = p.target_id
ORDER BY p.k, (p.target_id = p.id) DESC NULLS LAST, p.name;


-- ── B) RESUMEN ─────────────────────────────────────────────────────
/*
WITH ex AS (
  SELECT e.id, CASE WHEN coalesce(e.video_ref,'') ~* '^https?://' THEN e.video_ref END AS vid,
         public._ex_key(e.name) AS k
  FROM exercises e
),
grp AS (SELECT k, count(*) n, count(DISTINCT vid) nv FROM ex GROUP BY k HAVING count(*) > 1)
SELECT 'Ejercicios en total'                         AS concepto, (SELECT count(*) FROM exercises)::text AS valor
UNION ALL SELECT 'Ejercicios únicos (por clave)',  (SELECT count(DISTINCT k) FROM ex)::text
UNION ALL SELECT 'Grupos con duplicados',          (SELECT count(*) FROM grp)::text
UNION ALL SELECT 'Copias que se borrarán (fusionar)',
  ((SELECT coalesce(sum(n - 1), 0) FROM grp WHERE nv <= 1)
 + (SELECT count(*) FROM ex JOIN grp USING (k) WHERE grp.nv > 1 AND ex.vid IS NOT NULL)
 - (SELECT count(*) FROM (SELECT DISTINCT ex.k, ex.vid FROM ex JOIN grp USING (k) WHERE grp.nv > 1 AND ex.vid IS NOT NULL) s))::text
UNION ALL SELECT 'Grupos a REVISAR (vídeos distintos)', (SELECT count(*) FROM grp WHERE nv > 1)::text;
*/


-- ── C) POSIBLES DUPLICADOS que NO se fusionan solos ───────────────
--    (palabras de más/menos u otro orden; ej. "Six way con mancuernas de pie"
--     vs "Six Way de Pie con Mancuernas"). Para revisar a mano.
/*
WITH ex AS (
  SELECT id, name, public._ex_key(name) AS k,
         string_to_array(public._ex_key(name), ' ') AS w
  FROM exercises
)
SELECT a.name AS ejercicio_a, b.name AS ejercicio_b
FROM ex a JOIN ex b ON a.id < b.id AND a.k <> b.k
WHERE (SELECT array_agg(x ORDER BY x) FROM unnest(a.w) x WHERE x NOT IN ('de','con','en','a','la','el','al','y'))
    = (SELECT array_agg(x ORDER BY x) FROM unnest(b.w) x WHERE x NOT IN ('de','con','en','a','la','el','al','y'))
ORDER BY a.name;
*/
