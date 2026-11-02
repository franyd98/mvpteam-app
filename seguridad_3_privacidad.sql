-- ═══════════════════════════════════════════════════════════════════
-- SEGURIDAD 3 · Privacidad
--
-- A. Perfiles: la política "Autenticados leen perfiles" deja a CUALQUIER cliente
--    ver la lista completa de tus clientes (nombres y el resto de columnas).
--    La app de cliente solo lee su propio perfil; el panel de admin, todos.
--    → Cada uno ve el suyo; el admin, todos.
--
-- B. Fotos de check-in: solo diagnóstico (no cambia nada). La app guarda las fotos
--    con enlace PÚBLICO (getPublicUrl): quien tenga el enlace las ve sin iniciar sesión,
--    para siempre. Ver resultado al final.
--
-- Se puede ejecutar varias veces sin problema.
-- ═══════════════════════════════════════════════════════════════════

-- A. Perfiles
DROP POLICY IF EXISTS "Autenticados leen perfiles" ON public.profiles;
DROP POLICY IF EXISTS "own_profile_read"           ON public.profiles;
DROP POLICY IF EXISTS "admin_read_profiles"        ON public.profiles;
CREATE POLICY "own_profile_read"    ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "admin_read_profiles" ON public.profiles FOR SELECT USING (public.is_admin());
-- (is_admin() la crea seguridad_2_permisos.sql: ejecútalo antes que este)

-- B. Diagnóstico de las fotos
SELECT 'Bucket checkin-photos' AS que,
       CASE WHEN public THEN 'PÚBLICO: cualquiera con el enlace ve las fotos'
            ELSE 'Privado' END AS estado
FROM storage.buckets WHERE id = 'checkin-photos'
UNION ALL
SELECT 'Permiso de Storage', policyname || ' · ' || cmd || ' · ' || coalesce(qual, '-')
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
