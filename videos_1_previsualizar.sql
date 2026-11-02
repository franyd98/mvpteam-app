-- ═══════════════════════════════════════════════════════════════════
-- VÍDEOS · PASO 1 · PREVISUALIZAR (no cambia ningún ejercicio)
--
-- Para cada ejercicio SIN vídeo que se usa en un programa ACTIVO, busca en el
-- catálogo el ejercicio CON vídeo de nombre más parecido (similitud de trigramas,
-- ignorando mayúsculas, acentos, º/°, prefijos tipo "TRí- " y signos).
--
--   ≥ 0,80  → AUTO     (el paso 2 copiará ese vídeo)
--   0,50–0,80 → REVISAR (parecido pero no seguro: no se toca)
--   < 0,50  → SIN VÍDEO (no hay nada parecido en el catálogo)
--
-- Crea 3 funciones auxiliares (_vid_*) que el paso 2 borra al terminar.
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public._vid_norm(s text) RETURNS text
LANGUAGE sql IMMUTABLE AS $f$
  SELECT trim(regexp_replace(
           regexp_replace(
             replace(
               translate(lower(normalize(coalesce(s, ''), NFC)), 'áéíóúüàèìòùº', 'aeiouuaeiou°'),
               'macuernas', 'mancuernas'),
             '^[a-z.]{1,10}\s*-\s*', ''),          -- prefijos "tri- ", "ea- ", "dorsal- "…
           '[^a-z0-9]+', ' ', 'g'))
$f$;

CREATE OR REPLACE FUNCTION public._vid_trg(s text) RETURNS text[]
LANGUAGE sql IMMUTABLE AS $f$
  SELECT coalesce(array_agg(DISTINCT substr('  ' || w || ' ', i, 3)), '{}')
  FROM regexp_split_to_table(public._vid_norm(s), ' ') AS w,
       generate_series(1, length(w) + 1) AS i
  WHERE w <> ''
$f$;

CREATE OR REPLACE FUNCTION public._vid_sim(a text[], b text[]) RETURNS numeric
LANGUAGE sql IMMUTABLE AS $f$
  SELECT round(
    (SELECT count(*) FROM (SELECT unnest(a) INTERSECT SELECT unnest(b)) x)::numeric
    / NULLIF((SELECT count(*) FROM (SELECT unnest(a) UNION SELECT unnest(b)) y), 0), 2)
$f$;

WITH usados AS (           -- ejercicios sin vídeo en programas activos
  SELECT DISTINCT e.id, e.name, prof.full_name AS cliente, p.name AS programa
  FROM program_assignments pa
  JOIN profiles prof          ON prof.id = pa.client_id
  JOIN programs p             ON p.id = pa.program_id
  JOIN program_days pd        ON pd.program_id = p.id
  JOIN microcycles mc         ON mc.day_id = pd.id
  JOIN microcycle_exercises me ON me.microcycle_id = mc.id
  JOIN exercises e            ON e.id = me.exercise_id
  WHERE pa.active = true
    AND NOT (coalesce(e.video_ref, '') ~* '^https?://')
),
con_video AS (
  SELECT id, name, video_ref, public._vid_trg(name) AS tg
  FROM exercises
  WHERE coalesce(video_ref, '') ~* '^https?://'
),
mejor AS (
  SELECT DISTINCT ON (u.id, u.cliente)
    u.cliente, u.programa, u.name AS ejercicio,
    cv.name AS video_de, cv.video_ref,
    public._vid_sim(public._vid_trg(u.name), cv.tg) AS similitud
  FROM usados u
  CROSS JOIN con_video cv
  ORDER BY u.id, u.cliente, public._vid_sim(public._vid_trg(u.name), cv.tg) DESC NULLS LAST, cv.id
)
SELECT
  CASE WHEN similitud >= 0.80 THEN '1 AUTO'
       WHEN similitud >= 0.50 THEN '2 REVISAR'
       ELSE                        '3 SIN VÍDEO' END AS accion,
  cliente, programa, ejercicio, similitud, video_de, video_ref
FROM mejor
ORDER BY accion, cliente, ejercicio;
