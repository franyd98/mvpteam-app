-- ================================================================
-- MIGRACIÓN: campo is_presencial para distinguir visitas del entrenador
-- vs auto-registros del cliente
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- ================================================================

ALTER TABLE weight_logs
  ADD COLUMN IF NOT EXISTS is_presencial boolean NOT NULL DEFAULT false;

ALTER TABLE perimeter_logs
  ADD COLUMN IF NOT EXISTS is_presencial boolean NOT NULL DEFAULT false;

ALTER TABLE fold_logs
  ADD COLUMN IF NOT EXISTS is_presencial boolean NOT NULL DEFAULT false;

SELECT 'OK: campo is_presencial añadido a weight_logs, perimeter_logs y fold_logs' AS resultado;
