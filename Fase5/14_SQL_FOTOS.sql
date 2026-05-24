-- ============================================================
-- 14_SQL_FOTOS.sql
-- Fotos de progreso del cliente en el Punto de Control
--   · checkin_photos → tabla de URLs de fotos
--   · Storage bucket  → checkin-photos (público)
--
-- ⚠️  EJECUTA ESTE ARCHIVO EN SUPABASE → SQL Editor
-- ============================================================

-- 1. Tabla de fotos
CREATE TABLE IF NOT EXISTS checkin_photos (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id  uuid        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  url        text        NOT NULL,
  caption    text,
  taken_at   date        DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE checkin_photos ENABLE ROW LEVEL SECURITY;

-- Admin: acceso total
CREATE POLICY "admin_all_checkin_photos" ON checkin_photos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Cliente: sólo sus propias fotos
CREATE POLICY "client_own_checkin_photos" ON checkin_photos
  FOR ALL USING (client_id = auth.uid());

-- ============================================================
-- 2. Bucket de storage (público — URLs directas sin expiración)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('checkin-photos', 'checkin-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Clientes pueden subir fotos a su propia carpeta (client_id/...)
CREATE POLICY "client_upload_own_photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'checkin-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Lectura pública (las URLs son públicas, no hay datos sensibles en el path)
CREATE POLICY "public_read_checkin_photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'checkin-photos');

-- Clientes pueden borrar sus propias fotos
CREATE POLICY "client_delete_own_photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'checkin-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
