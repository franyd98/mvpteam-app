-- ============================================================
-- 25_SQL_SET_LOGS_RPE.sql
-- Añade columna rpe a set_logs para guardar el RPE por serie.
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- ============================================================

-- RPE / RIR registrado por el cliente al loggear cada serie
ALTER TABLE set_logs ADD COLUMN IF NOT EXISTS rpe numeric(4,1) DEFAULT 0;

-- Verificar estructura actual
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'set_logs'
ORDER BY ordinal_position;
