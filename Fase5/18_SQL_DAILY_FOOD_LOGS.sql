-- ============================================================
-- 17_SQL_DAILY_FOOD_LOGS.sql
-- Registro diario de comidas del cliente
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_food_logs (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date          date NOT NULL,
  meal_id       text NOT NULL,          -- id de la comida (ej. "meal_1", "meal_2"…)
  meal_name     text,                   -- nombre legible para display
  proteina_id   text,
  proteina_g    numeric,
  hidrato_id    text,
  hidrato_g     numeric,
  grasa_id      text,
  grasa_g       numeric,
  extras        jsonb    DEFAULT '[]',  -- [{ingId, grams}]
  note          text,
  updated_at    timestamptz DEFAULT now(),

  UNIQUE (client_id, date, meal_id)     -- un registro por comida por día
);

-- Actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_daily_food_logs_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_daily_food_logs_updated_at ON daily_food_logs;
CREATE TRIGGER trg_daily_food_logs_updated_at
  BEFORE UPDATE ON daily_food_logs
  FOR EACH ROW EXECUTE FUNCTION update_daily_food_logs_updated_at();

-- RLS
ALTER TABLE daily_food_logs ENABLE ROW LEVEL SECURITY;

-- El cliente gestiona sus propios registros
CREATE POLICY "client_own_food_logs" ON daily_food_logs
  FOR ALL
  USING  (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- El admin puede leer todos
CREATE POLICY "admin_read_food_logs" ON daily_food_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
