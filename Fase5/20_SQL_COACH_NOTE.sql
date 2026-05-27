-- Fase 5 · Step 20 — Notas de técnica del entrenador por ejercicio
-- Ejecutar en: Supabase SQL Editor

ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS coach_note TEXT;

-- Sin RLS adicional: la columna es pública (exercises es de sólo lectura para clientes)
