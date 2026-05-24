-- ============================================================
-- 13_SQL_DIETA_ASIGNACIONES.sql
-- Rediseño del módulo de dietas:
--   · diet_plans  → planes genéricos (sin client_id)
--   · diet_meals  → comidas del plan
--   · diet_options→ opciones de cada comida
--   · diet_assignments → asignación plan ↔ cliente
--
-- ⚠️  EJECUTA ESTE ARCHIVO EN SUPABASE → SQL Editor
--     Si ya tenías la versión anterior (12_SQL_DIETA.sql),
--     este script la reemplaza por completo.
-- ============================================================

-- 1. Eliminar tablas anteriores (en orden por dependencias)
DROP TABLE IF EXISTS diet_options    CASCADE;
DROP TABLE IF EXISTS diet_meals      CASCADE;
DROP TABLE IF EXISTS diet_assignments CASCADE;
DROP TABLE IF EXISTS diet_plans      CASCADE;

-- ============================================================
-- 2. TABLAS
-- ============================================================

-- Planes de dieta (genéricos, no atados a ningún cliente)
CREATE TABLE diet_plans (
  id          uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text    NOT NULL,
  kcal_on     int,
  kcal_off    int,
  protein_on  numeric,
  protein_off numeric,
  carbs_on    numeric,
  carbs_off   numeric,
  fat_on      numeric,
  fat_off     numeric,
  notes       text,
  created_at  timestamptz DEFAULT now()
);

-- Comidas dentro de un plan
CREATE TABLE diet_meals (
  id         uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id    uuid  REFERENCES diet_plans(id) ON DELETE CASCADE NOT NULL,
  name       text  NOT NULL,
  emoji      text  DEFAULT '🍽️',
  day_type   text  CHECK (day_type IN ('on','off','both')) DEFAULT 'both',
  sort_order int   DEFAULT 0
);

-- Opciones dentro de cada comida (content = [{label,slot,isChoice,items:[{ingId,grams}],note}])
CREATE TABLE diet_options (
  id         uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id    uuid  REFERENCES diet_meals(id) ON DELETE CASCADE NOT NULL,
  name       text  NOT NULL,
  content    jsonb DEFAULT '[]',
  sort_order int   DEFAULT 0
);

-- Asignaciones: qué plan está asignado a qué cliente
CREATE TABLE diet_assignments (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id     uuid        REFERENCES diet_plans(id) ON DELETE CASCADE NOT NULL,
  client_id   uuid        REFERENCES profiles(id)   ON DELETE CASCADE NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  active      boolean     DEFAULT true,
  UNIQUE (client_id)   -- un cliente solo tiene una dieta activa
);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE diet_plans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_meals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_options     ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_assignments ENABLE ROW LEVEL SECURITY;

-- ── diet_plans ──────────────────────────────────────────────
-- Admin: acceso total
CREATE POLICY "admin_all_diet_plans" ON diet_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Cliente: puede leer los planes que tiene asignados
CREATE POLICY "client_read_assigned_plan" ON diet_plans
  FOR SELECT USING (
    id IN (
      SELECT plan_id FROM diet_assignments
      WHERE client_id = auth.uid() AND active = true
    )
  );

-- ── diet_meals ───────────────────────────────────────────────
CREATE POLICY "admin_all_diet_meals" ON diet_meals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "client_read_diet_meals" ON diet_meals
  FOR SELECT USING (
    plan_id IN (
      SELECT plan_id FROM diet_assignments
      WHERE client_id = auth.uid() AND active = true
    )
  );

-- ── diet_options ─────────────────────────────────────────────
CREATE POLICY "admin_all_diet_options" ON diet_options
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "client_read_diet_options" ON diet_options
  FOR SELECT USING (
    meal_id IN (
      SELECT dm.id FROM diet_meals dm
      JOIN diet_assignments da ON da.plan_id = dm.plan_id
      WHERE da.client_id = auth.uid() AND da.active = true
    )
  );

-- ── diet_assignments ─────────────────────────────────────────
CREATE POLICY "admin_all_diet_assignments" ON diet_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "client_read_own_assignment" ON diet_assignments
  FOR SELECT USING (client_id = auth.uid());
