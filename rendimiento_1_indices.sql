
-- ═══════════════════════════════════════════════════════════════════
-- RENDIMIENTO 1 · Índices en las columnas que enlazan tablas
--
-- Postgres NO crea índices automáticamente en las claves foráneas (client_id,
-- exercise_set_id, plan_id, microcycle_id…). Sin índice, cada consulta que filtra
-- por ellas —y cada permiso (RLS) que las comprueba— recorre la tabla entera.
-- Con pocos datos no se nota; con meses de registros de varios clientes, sí.
--
-- Este script busca TODAS las claves foráneas sin índice y se lo crea.
-- No cambia ningún dato. Se puede ejecutar varias veces sin problema.
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  r record;
  n integer := 0;
BEGIN
  FOR r IN
    SELECT c.conrelid::regclass AS tabla,
           a.attname            AS columna,
           c.conrelid, c.conkey[1] AS attnum
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
    JOIN pg_namespace ns ON ns.oid = c.connamespace
    WHERE c.contype = 'f'
      AND ns.nspname = 'public'
      AND array_length(c.conkey, 1) = 1
      -- sin ningún índice cuya PRIMERA columna sea esta
      AND NOT EXISTS (
        SELECT 1 FROM pg_index i
        WHERE i.indrelid = c.conrelid AND i.indkey[0] = c.conkey[1])
  LOOP
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %s (%I)',
                   'idx_' || replace(r.tabla::text, 'public.', '') || '_' || r.columna,
                   r.tabla, r.columna);
    RAISE NOTICE 'Índice creado: %.%', r.tabla, r.columna;
    n := n + 1;
  END LOOP;
  RAISE NOTICE 'Total de índices creados: %', n;
END $$;

-- Índices compuestos para las consultas más frecuentes de la app
CREATE INDEX IF NOT EXISTS idx_set_logs_client_logged   ON public.set_logs (client_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_weight_logs_client_date  ON public.weight_logs (client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_checkin_photos_client    ON public.checkin_photos (client_id, created_at DESC);

-- Comprobación: claves foráneas que siguen sin índice (debería salir vacío)
SELECT c.conrelid::regclass AS tabla_sin_indice, a.attname AS columna
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
JOIN pg_namespace ns ON ns.oid = c.connamespace
WHERE c.contype = 'f' AND ns.nspname = 'public' AND array_length(c.conkey, 1) = 1
  AND NOT EXISTS (SELECT 1 FROM pg_index i WHERE i.indrelid = c.conrelid AND i.indkey[0] = c.conkey[1]);
