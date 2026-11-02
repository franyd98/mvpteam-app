
-- ═══════════════════════════════════════════════════════════════════
-- SEGURIDAD 4 · Fotos de check-in privadas
--
-- Problema: el bucket checkin-photos era PÚBLICO y la política
-- public_read_checkin_photos dejaba LISTAR y descargar todas las fotos a cualquiera,
-- incluso sin iniciar sesión (basta la clave pública que va dentro de la web).
--
-- Después de esto:
--   · Bucket privado: los enlaces públicos antiguos dejan de funcionar.
--   · Cada cliente solo puede ver/subir/borrar fotos en SU carpeta.
--   · El admin puede ver todas.
--   · La app muestra las fotos con enlaces temporales (1 hora).
--
-- ⚠️ EJECUTAR DESPUÉS de que Vercel haya publicado la versión de la app con
--    "fotos con enlaces temporales". Si se ejecuta antes, las fotos no se verán
--    hasta que se publique.
-- Se puede ejecutar varias veces sin problema.
-- ═══════════════════════════════════════════════════════════════════

-- Función auxiliar: ¿el usuario actual es admin? (también la crea seguridad_2; repetirla no pasa nada)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- 1. Bucket privado
UPDATE storage.buckets SET public = false WHERE id = 'checkin-photos';

-- 2. Quitar la lectura pública
DROP POLICY IF EXISTS "public_read_checkin_photos" ON storage.objects;

-- 3. Lectura: el cliente su carpeta; el admin todo
DROP POLICY IF EXISTS "client_read_own_photos" ON storage.objects;
CREATE POLICY "client_read_own_photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'checkin-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "admin_read_all_photos" ON storage.objects;
CREATE POLICY "admin_read_all_photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'checkin-photos' AND public.is_admin());

-- 4. Subida: solo en su propia carpeta (se recrea para asegurar la condición)
DROP POLICY IF EXISTS "client_upload_own_photos" ON storage.objects;
CREATE POLICY "client_upload_own_photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'checkin-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- (client_delete_own_photos ya estaba bien: solo su carpeta)

-- Comprobación
SELECT 'Bucket checkin-photos' AS que,
       CASE WHEN public THEN 'PÚBLICO ⚠️' ELSE 'Privado ✓' END AS estado
FROM storage.buckets WHERE id = 'checkin-photos'
UNION ALL
SELECT 'Permiso de Storage', policyname || ' · ' || cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
