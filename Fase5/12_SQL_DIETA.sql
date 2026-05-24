-- ================================================================
-- MÓDULO DIETA: Plan nutricional personalizado por cliente
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- ================================================================

-- Plan nutricional principal (uno por cliente)
CREATE TABLE IF NOT EXISTS diet_plans (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        text    NOT NULL DEFAULT 'Plan Nutricional',
  kcal_on     int,
  kcal_off    int,
  protein_on  numeric,
  carbs_on    numeric,
  fat_on      numeric,
  protein_off numeric,
  carbs_off   numeric,
  fat_off     numeric,
  notes       text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (client_id)
);

-- Comidas del plan (Desayuno, Media Mañana, Comida, Merienda, Cena)
CREATE TABLE IF NOT EXISTS diet_meals (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id    uuid NOT NULL REFERENCES diet_plans(id) ON DELETE CASCADE,
  name       text NOT NULL,
  emoji      text NOT NULL DEFAULT '🍽️',
  day_type   text NOT NULL DEFAULT 'both'
               CHECK (day_type IN ('on','off','both')),
  sort_order int  NOT NULL DEFAULT 0
);

-- Opciones dentro de cada comida (el cliente ve todas, elige la que prefiere)
-- content: array JSON de grupos de alimentos
-- [{ "label": "Proteína", "isChoice": true, "items": ["100gr pollo", "140gr merluza"], "note": "" }]
CREATE TABLE IF NOT EXISTS diet_options (
  id         uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id    uuid  NOT NULL REFERENCES diet_meals(id) ON DELETE CASCADE,
  name       text  NOT NULL DEFAULT 'Opción 1',
  content    jsonb NOT NULL DEFAULT '[]',
  sort_order int   NOT NULL DEFAULT 0
);

-- ── RLS ──────────────────────────────────────────────────────────

ALTER TABLE diet_plans   ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_meals   ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_options ENABLE ROW LEVEL SECURITY;

-- Cliente: sólo puede leer su propio plan
DROP POLICY IF EXISTS "client_read_plan"    ON diet_plans;
DROP POLICY IF EXISTS "client_read_meals"   ON diet_meals;
DROP POLICY IF EXISTS "client_read_options" ON diet_options;

CREATE POLICY "client_read_plan" ON diet_plans
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "client_read_meals" ON diet_meals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM diet_plans p
      WHERE p.id = diet_meals.plan_id AND p.client_id = auth.uid()
    )
  );

CREATE POLICY "client_read_options" ON diet_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM diet_meals m
      JOIN diet_plans p ON p.id = m.plan_id
      WHERE m.id = diet_options.meal_id AND p.client_id = auth.uid()
    )
  );

-- Admin: acceso total a todas las tablas
DROP POLICY IF EXISTS "admin_all_plans"   ON diet_plans;
DROP POLICY IF EXISTS "admin_all_meals"   ON diet_meals;
DROP POLICY IF EXISTS "admin_all_options" ON diet_options;

CREATE POLICY "admin_all_plans" ON diet_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_all_meals" ON diet_meals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_all_options" ON diet_options
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

SELECT 'OK: módulo dieta creado (diet_plans, diet_meals, diet_options)' AS resultado;
