-- ================================================================
-- FASE 5 – LOGS EN SUPABASE
-- Ejecutar completo en Supabase → SQL Editor → New query → Run
-- ================================================================

-- 1. Añadir columna logged_at (si no existe)
ALTER TABLE set_logs ADD COLUMN IF NOT EXISTS logged_at timestamptz DEFAULT now();

-- 2. Unique constraint para que el upsert funcione
--    (un log por cliente por serie; si ya existe, se actualiza)
ALTER TABLE set_logs DROP CONSTRAINT IF EXISTS set_logs_client_exercise_unique;
ALTER TABLE set_logs ADD CONSTRAINT set_logs_client_exercise_unique
  UNIQUE (client_id, exercise_set_id);

-- 3. Activar RLS
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;

-- 4. Políticas
DROP POLICY IF EXISTS "Clients manage own logs" ON set_logs;
DROP POLICY IF EXISTS "Admins read all logs"    ON set_logs;

-- El cliente puede leer, insertar, actualizar y borrar sus propios logs
CREATE POLICY "Clients manage own logs" ON set_logs
  USING     (client_id = auth.uid())
  WITH CHECK(client_id = auth.uid());

-- El admin puede leer los logs de todos los clientes
CREATE POLICY "Admins read all logs" ON set_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Verificar
SELECT 'OK: set_logs configurado correctamente' AS resultado;
