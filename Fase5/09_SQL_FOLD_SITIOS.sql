-- ================================================================
-- MIGRACIÓN: añadir los 4 sitios de pliegue que faltan
-- Los 10 sitios del Excel (SUMA(C18:C27)/1000 = % GRASA):
--   1. Gemelo       → calf
--   2. Cuádriceps   → quad         (ya existe)
--   3. Abd. Baja    → navel        (ya existe)
--   4. Abd. Alta    → abd_upper
--   5. Pecho        → chest        (ya existe)
--   6. Hombro       → shoulder
--   7. Bíceps       → bicep
--   8. Tríceps      → tricep       (ya existe)
--   9. Subescapular → subscapular  (ya existe)
--  10. Lumbar       → lumbar       (ya existe)
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- ================================================================

ALTER TABLE fold_logs
  ADD COLUMN IF NOT EXISTS calf       numeric(5,1),   -- 1. Gemelo
  ADD COLUMN IF NOT EXISTS abd_upper  numeric(5,1),   -- 4. Parte Alta Abdomen
  ADD COLUMN IF NOT EXISTS shoulder   numeric(5,1),   -- 6. Hombro
  ADD COLUMN IF NOT EXISTS bicep      numeric(5,1);   -- 7. Bíceps

SELECT 'OK: sitios de pliegue añadidos a fold_logs' AS resultado;
