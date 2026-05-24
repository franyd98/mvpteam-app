-- ================================================================
-- PUNTO DE CONTROL: tablas de seguimiento corporal
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- ================================================================

-- 1. PESO
CREATE TABLE IF NOT EXISTS weight_logs (
  id          bigserial PRIMARY KEY,
  client_id   uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date        date NOT NULL DEFAULT CURRENT_DATE,
  weight_fasting  numeric(5,2),
  weight_evening  numeric(5,2),
  notes       text,
  created_at  timestamptz DEFAULT now()
);

-- 2. PERÍMETROS (contraído y relajado)
CREATE TABLE IF NOT EXISTS perimeter_logs (
  id          bigserial PRIMARY KEY,
  client_id   uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date        date NOT NULL DEFAULT CURRENT_DATE,
  -- Contraído
  bicep_r_c   numeric(5,1), bicep_l_c   numeric(5,1),
  chest_c     numeric(5,1), back_c      numeric(5,1),
  iliac_c     numeric(5,1),
  abd_upper_c numeric(5,1), abd_navel_c numeric(5,1),
  hip_c       numeric(5,1),
  quad_r_c    numeric(5,1), quad_l_c    numeric(5,1),
  calf_r_c    numeric(5,1), calf_l_c    numeric(5,1),
  -- Relajado
  bicep_r_r   numeric(5,1), bicep_l_r   numeric(5,1),
  chest_r     numeric(5,1), back_r      numeric(5,1),
  iliac_r     numeric(5,1),
  abd_upper_r numeric(5,1), abd_navel_r numeric(5,1),
  hip_r       numeric(5,1),
  quad_r_r    numeric(5,1), quad_l_r    numeric(5,1),
  calf_r_r    numeric(5,1), calf_l_r    numeric(5,1),
  created_at  timestamptz DEFAULT now()
);

-- 3. FATIGA por músculo (escala 1-10)
CREATE TABLE IF NOT EXISTS fatigue_logs (
  id           bigserial PRIMARY KEY,
  client_id    uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date         date NOT NULL DEFAULT CURRENT_DATE,
  microcycle   integer,
  session_type text,  -- 'Empuje', 'Tirón', 'Pierna'
  shoulder     smallint, chest       smallint,
  bicep        smallint, tricep      smallint,
  back         smallint, upper_back  smallint,
  quad         smallint, adductor    smallint,
  hamstring    smallint, glute       smallint,
  calf         smallint,
  created_at   timestamptz DEFAULT now()
);

-- 4. PLIEGUES cutáneos (mm)
CREATE TABLE IF NOT EXISTS fold_logs (
  id           bigserial PRIMARY KEY,
  client_id    uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date         date NOT NULL DEFAULT CURRENT_DATE,
  navel        numeric(5,1),
  tricep       numeric(5,1),
  quad         numeric(5,1),
  chest        numeric(5,1),
  subscapular  numeric(5,1),
  iliac_crest  numeric(5,1),
  lumbar       numeric(5,1),
  created_at   timestamptz DEFAULT now()
);

-- ── RLS ─────────────────────────────────────────────────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['weight_logs','perimeter_logs','fatigue_logs','fold_logs'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "client_own" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "admin_read" ON %I', t);
    EXECUTE format(
      'CREATE POLICY "client_own" ON %I USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid())', t);
    EXECUTE format(
      'CREATE POLICY "admin_read" ON %I FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
      )', t);
  END LOOP;
END $$;

SELECT 'OK: tablas de Punto de Control creadas' AS resultado;
