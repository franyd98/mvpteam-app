-- ============================================================
-- 15_SQL_MACROS.sql
-- Requerimientos calóricos y de macros por cliente
--   · client_macros → una fila por cliente (upsert)
--
-- ⚠️  EJECUTA ESTE ARCHIVO EN SUPABASE → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS client_macros (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id     uuid        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Inputs del cálculo
  sex           text        NOT NULL CHECK (sex IN ('male','female')),
  age           integer     NOT NULL,
  height_cm     numeric     NOT NULL,
  weight_kg     numeric     NOT NULL,
  activity_factor numeric   NOT NULL,
  protein_mult  numeric     NOT NULL,
  fat_mult      numeric     NOT NULL,

  -- Resultados
  bmr           integer,
  tdee          integer,
  protein_g     numeric,
  carbs_g       numeric,
  fat_g         numeric,

  -- Auditoría
  updated_at    timestamptz DEFAULT now(),
  updated_by    uuid        REFERENCES profiles(id)
);

ALTER TABLE client_macros ENABLE ROW LEVEL SECURITY;

-- Admin: acceso total
CREATE POLICY "admin_all_client_macros" ON client_macros
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Cliente: solo puede leer y actualizar sus propios datos
CREATE POLICY "client_own_macros_select" ON client_macros
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "client_own_macros_upsert" ON client_macros
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "client_own_macros_update" ON client_macros
  FOR UPDATE USING (client_id = auth.uid());
