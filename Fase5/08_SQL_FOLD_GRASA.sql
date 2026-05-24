-- ================================================================
-- MIGRACIÓN: campos de composición corporal en fold_logs
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- ================================================================

ALTER TABLE fold_logs
  ADD COLUMN IF NOT EXISTS critical_abdomen  numeric(5,1),   -- Pliegue Crítico Abdomen (mm)
  ADD COLUMN IF NOT EXISTS critical_lumbar   numeric(5,1),   -- Pliegue Crítico Lumbar (mm)
  ADD COLUMN IF NOT EXISTS fat_pct_real      numeric(5,2);   -- % Grasa Real (introducido por el entrenador)

SELECT 'OK: campos de grasa real añadidos a fold_logs' AS resultado;
