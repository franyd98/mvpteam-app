-- ============================================================
-- 29_SQL_AI_PLAN.sql
-- Soporte para planes generados por IA (Tu Plan)
-- ⚠️  EJECUTAR EN: Supabase → SQL Editor
-- ============================================================

-- 1. Columna source en programs ('manual' | 'ai')
ALTER TABLE programs ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';

-- 2. Columna source en diet_plans ('manual' | 'ai')
ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';

-- 3. Tabla tracking de generaciones IA
CREATE TABLE IF NOT EXISTS ai_plan_generations (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id   int         REFERENCES programs(id)   ON DELETE SET NULL,
  diet_plan_id uuid        REFERENCES diet_plans(id) ON DELETE SET NULL,
  analysis     text,
  photo_used   boolean     DEFAULT false,
  model_used   text        DEFAULT 'claude-haiku-4-5-20251001',
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE ai_plan_generations ENABLE ROW LEVEL SECURITY;

-- Clientes pueden leer sus propias generaciones
CREATE POLICY "ai_gen: client read own"
  ON ai_plan_generations FOR SELECT
  USING (auth.uid() = client_id);

-- Admin: acceso total
CREATE POLICY "ai_gen: admin all"
  ON ai_plan_generations FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Service role para Edge Function
CREATE POLICY "ai_gen: service role"
  ON ai_plan_generations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 4. Añadir columna goal a client_macros (si no existe)
ALTER TABLE client_macros ADD COLUMN IF NOT EXISTS goal text;
ALTER TABLE client_macros ADD COLUMN IF NOT EXISTS days_on integer DEFAULT 4;
ALTER TABLE client_macros ADD COLUMN IF NOT EXISTS off_reduction numeric DEFAULT 0.13;

-- 5. Índice para consultas IA por cliente
CREATE INDEX IF NOT EXISTS idx_ai_gen_client ON ai_plan_generations(client_id);
