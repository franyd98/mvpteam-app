
-- ═══════════════════════════════════════════════════════════════════
-- RENDIMIENTO 2 · Que la app descargue solo lo que necesita
--
-- A. client_activity_summary: el panel de admin descargaba TODAS las series del
--    último mes de todos los clientes (miles de filas) solo para mostrar
--    "último entreno" y "sesiones en 30 días". Ahora la base de datos devuelve
--    una fila por cliente. Además el "último entreno" ya no se limita a 30 días
--    (antes un cliente con 45 días sin entrenar salía como "nunca").
--
-- B. client_program_logs: la app del cliente descargaba las series de TODOS sus
--    programas pasados y luego tiraba las que no eran del programa actual.
--    Ahora solo recibe las del programa activo.
--
-- Ambas respetan los permisos (RLS): el admin ve todo; cada cliente solo lo suyo.
-- La app funciona igual sin este SQL (usa el método antiguo); con él, va más ligera.
-- Se puede ejecutar varias veces sin problema.
-- ═══════════════════════════════════════════════════════════════════

-- A. Resumen de actividad por cliente (para el panel de admin)
CREATE OR REPLACE FUNCTION public.client_activity_summary(p_client_ids uuid[])
RETURNS TABLE (client_id uuid, last_at timestamptz, sessions_30 integer)
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    sl.client_id,
    MAX(sl.logged_at) AS last_at,
    COUNT(DISTINCT (sl.logged_at AT TIME ZONE 'Europe/Madrid')::date)
      FILTER (WHERE sl.logged_at >= now() - interval '30 days')::int AS sessions_30
  FROM set_logs sl
  WHERE sl.client_id = ANY (p_client_ids)
  GROUP BY sl.client_id;
$$;

-- B. Series registradas por el cliente en un programa concreto (su programa activo)
CREATE OR REPLACE FUNCTION public.client_program_logs(p_program_id bigint)
RETURNS SETOF public.set_logs
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT sl.*
  FROM set_logs sl
  JOIN exercise_sets es        ON es.id = sl.exercise_set_id
  JOIN microcycle_exercises me ON me.id = es.microcycle_exercise_id
  JOIN microcycles mc          ON mc.id = me.microcycle_id
  JOIN program_days pd         ON pd.id = mc.day_id
  WHERE sl.client_id = auth.uid()
    AND pd.program_id = p_program_id;
$$;

-- Comprobación
SELECT
  CASE WHEN to_regprocedure('public.client_activity_summary(uuid[])') IS NOT NULL
       THEN '✅' ELSE '❌' END || ' client_activity_summary' AS funcion
UNION ALL
SELECT
  CASE WHEN to_regprocedure('public.client_program_logs(bigint)') IS NOT NULL
       THEN '✅' ELSE '❌' END || ' client_program_logs';
