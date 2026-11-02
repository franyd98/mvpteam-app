
-- AUDITORÍA DE LA BASE DE DATOS · todo en una sola tabla (solo lectura: no cambia nada)
-- Ejecuta el archivo completo y pégame el resultado (o expórtalo a CSV).

WITH
sin_rls AS (
  SELECT '1 Tabla SIN seguridad (RLS)'::text AS seccion, tablename::text AS detalle
  FROM pg_tables
  WHERE schemaname = 'public' AND NOT rowsecurity
),
politicas AS (
  SELECT '2 Permiso'::text,
         tablename || ' · ' || cmd || ' · ' || policyname
         || ' · USING: ' || coalesce(qual, '-')
         || ' · CHECK: ' || coalesce(with_check, '-')
  FROM pg_policies
  WHERE schemaname = 'public'
),
borrados AS (
  SELECT '3 Al borrar'::text,
         tc.table_name || '.' || kcu.column_name || ' → ' || ccu.table_name || ' : ' || rc.delete_rule
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
  JOIN information_schema.referential_constraints rc
    ON rc.constraint_name = tc.constraint_name AND rc.constraint_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    AND tc.table_name IN ('set_logs', 'exercise_sets', 'microcycle_exercises', 'microcycles',
                          'program_days', 'program_assignments', 'locked_microcycles')
),
inconsistencias AS (
  SELECT '4 Datos'::text, 'Clientes con más de un programa activo: '
         || (SELECT COUNT(*) FROM (SELECT client_id FROM program_assignments WHERE active GROUP BY client_id HAVING COUNT(*) > 1) x)
  UNION ALL
  SELECT '4 Datos', 'Asignaciones duplicadas (mismo cliente y programa): '
         || (SELECT COUNT(*) FROM (SELECT client_id, program_id FROM program_assignments GROUP BY 1, 2 HAVING COUNT(*) > 1) x)
  UNION ALL
  SELECT '4 Datos', 'Microciclos con ejercicios en la misma posición: '
         || (SELECT COUNT(*) FROM (SELECT microcycle_id, order_index FROM microcycle_exercises GROUP BY 1, 2 HAVING COUNT(*) > 1) x)
  UNION ALL
  SELECT '4 Datos', 'Clientes con más de una dieta activa: '
         || (SELECT COUNT(*) FROM (SELECT client_id FROM diet_assignments WHERE active GROUP BY client_id HAVING COUNT(*) > 1) x)
  UNION ALL
  SELECT '4 Datos', 'Programas sin ningún cliente: '
         || (SELECT COUNT(*) FROM programs p WHERE NOT EXISTS (SELECT 1 FROM program_assignments pa WHERE pa.program_id = p.id))
),
proteccion_rol AS (
  SELECT '5 Protección de rol'::text,
         CASE WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_protect_profile_role')
              THEN 'OK: un cliente ya NO puede hacerse admin'
              ELSE 'FALTA: ejecuta seguridad_1_roles.sql' END
),
admins AS (
  SELECT '6 Admin'::text, coalesce(p.full_name, '?') || ' · ' || coalesce(u.email, '?')
  FROM public.profiles p LEFT JOIN auth.users u ON u.id = p.id
  WHERE p.role = 'admin'
)
SELECT * FROM sin_rls
UNION ALL SELECT * FROM politicas
UNION ALL SELECT * FROM borrados
UNION ALL SELECT * FROM inconsistencias
UNION ALL SELECT * FROM proteccion_rol
UNION ALL SELECT * FROM admins
ORDER BY 1, 2;
