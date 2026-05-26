-- ──────────────────────────────────────────────────────────────────────────────
-- 19_SQL_DIET_SOURCE.sql
-- Añade columna 'source' a diet_assignments para distinguir planes del
-- entrenador ('trainer') de planes auto-generados por el cliente ('client').
-- Esto permite que un cliente tenga DOS asignaciones activas simultáneas.
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. Añadir la columna (safe si ya existe)
ALTER TABLE diet_assignments
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'trainer';

-- 2. Rellenar registros existentes
UPDATE diet_assignments SET source = 'trainer' WHERE source IS NULL OR source = '';

-- 3. Eliminar el índice/constraint único antiguo (solo clave client_id)
--    Prueba los nombres más habituales que genera Supabase:
ALTER TABLE diet_assignments DROP CONSTRAINT IF EXISTS diet_assignments_client_id_key;
ALTER TABLE diet_assignments DROP CONSTRAINT IF EXISTS diet_assignments_client_id_unique;
DROP INDEX IF EXISTS diet_assignments_client_id_idx;

-- 4. Nuevo índice único: (client_id, source) cuando active = true
--    Así cada cliente puede tener un plan 'trainer' activo Y un plan 'client' activo.
CREATE UNIQUE INDEX IF NOT EXISTS diet_assignments_client_source_active_idx
  ON diet_assignments(client_id, source)
  WHERE active = true;
