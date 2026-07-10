-- ============================================================
-- 33_SQL_SET_LOGS_UNIT.sql
-- Añade columna unit a set_logs si no existe (kg / lb).
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- ============================================================

ALTER TABLE set_logs ADD COLUMN IF NOT EXISTS unit text DEFAULT 'kg';

-- Verificar estructura actual de set_logs
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'set_logs'
ORDER BY ordinal_position;
