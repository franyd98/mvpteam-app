
-- ESTADO · ¿Qué está hecho y qué falta? (solo lectura: no cambia nada)
-- Ejecuta el archivo completo. Cada fila es una tarea: ✅ hecha / ⏳ pendiente (y qué hacer).

WITH checks AS (

  SELECT 1 AS n, 'Un cliente no puede hacerse admin' AS tarea,
    EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_protect_profile_role') AS hecho,
    'Ejecutar seguridad_1_roles.sql' AS que_hacer

  UNION ALL SELECT 2, 'Solo el admin modifica programas',
    NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND policyname LIKE 'Autenticados gestionan%')
    AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND policyname = 'admin_all_programs'),
    'Ejecutar seguridad_2_permisos.sql'

  UNION ALL SELECT 3, 'Dietas: cada cliente solo las suyas',
    NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND policyname IN
                ('clients_insert_diet_meals', 'clients_insert_diet_options', 'clients_insert_diet_assignments')),
    'Ejecutar seguridad_2_permisos.sql'

  UNION ALL SELECT 4, 'Cada cliente solo ve su perfil',
    NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles'
                AND policyname = 'Autenticados leen perfiles'),
    'Ejecutar seguridad_3_privacidad.sql'

  UNION ALL SELECT 5, 'Fotos de check-in privadas',
    EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'checkin-photos' AND NOT public)
    AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND policyname = 'public_read_checkin_photos'),
    'Ejecutar seguridad_4_fotos.sql'

  UNION ALL SELECT 6, 'Un solo programa activo por cliente y sin duplicados',
    (SELECT COUNT(*) FROM pg_indexes WHERE indexname IN
       ('program_assignments_one_active_per_client', 'program_assignments_client_program_unique')) = 2,
    'Ejecutar datos_1_limpieza.sql'

  UNION ALL SELECT 7, 'Días marcados y cambios de ejercicio guardados en Supabase',
    to_regclass('public.client_day_marks') IS NOT NULL AND to_regclass('public.client_substitutions') IS NOT NULL,
    'Ejecutar fase4_tablas_cliente.sql'

  UNION ALL SELECT 8, 'Solo tu cuenta es admin',
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') = 1,
    'Hay ' || (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') ||
    ' admins (mike.admin, vicent.admin…): dime si deben seguir siéndolo'

  UNION ALL SELECT 9, 'Catálogo de ejercicios sin duplicados',
    NOT EXISTS (
      SELECT 1 FROM public.exercises
      GROUP BY trim(regexp_replace(regexp_replace(replace(
                 translate(lower(normalize(name, NFC)), 'áéíóúüàèìòùº', 'aeiouuaeiou°'),
                 'macuernas', 'mancuernas'), '^[a-z.]{1,10}\s*-\s*', ''), '[^a-z0-9]+', ' ', 'g'))
      HAVING COUNT(DISTINCT CASE WHEN coalesce(video_ref, '') ~* '^https?://' THEN video_ref END) <= 1
         AND COUNT(*) > 1),
    'Ejecutar duplicados_1_previsualizar.sql (revisar) y luego duplicados_2_aplicar.sql'

  UNION ALL SELECT 10, 'Sincronizar estructura en una sola operación',
    to_regprocedure('public.sync_microcycle_structure(bigint)') IS NOT NULL,
    'Ejecutar editor_1_sincronizar.sql'
)
SELECT
  n AS "#",
  tarea,
  CASE WHEN hecho THEN '✅ Hecho' ELSE '⏳ Pendiente' END AS estado,
  CASE WHEN hecho THEN '' ELSE que_hacer END AS que_hacer
FROM checks

UNION ALL SELECT 11, 'Función ai-generate-plan protegida', '❓ Comprobar a mano',
  'No se ve desde SQL: desplegar con "npx supabase functions deploy ai-generate-plan"'
UNION ALL SELECT 12, 'Función delete-diet eliminada', '❓ Comprobar a mano',
  'No se ve desde SQL: Supabase → Edge Functions → delete-diet → Delete'

ORDER BY 1;
