-- ── Tabla: locked_microcycles ────────────────────────────────────────────
-- Permite que un cliente marque un microciclo como "bloqueado" para
-- no modificar accidentalmente registros ya guardados.
--
-- EJECUTAR EN: Supabase → SQL Editor

CREATE TABLE IF NOT EXISTS locked_microcycles (
  id                 BIGSERIAL PRIMARY KEY,
  client_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_id             TEXT        NOT NULL,   -- string del program_day id
  microcycle_number  INTEGER     NOT NULL,
  locked_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, day_id, microcycle_number)
);

-- ── Row Level Security ───────────────────────────────────────────────────
ALTER TABLE locked_microcycles ENABLE ROW LEVEL SECURITY;

-- El cliente solo puede ver y gestionar sus propios bloqueos
CREATE POLICY "client: manage own locks"
  ON locked_microcycles
  FOR ALL
  USING  (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);
