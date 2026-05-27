-- Fase 5 · Step 21 — Columna notes en fatigue_logs
-- Ejecutar en: Supabase SQL Editor

ALTER TABLE fatigue_logs
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Sin RLS adicional: la política existente de fatigue_logs ya cubre la columna.
