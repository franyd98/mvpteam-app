-- ═══════════════════════════════════════════════════════════════════
-- AUDITORÍA DE LA BASE DE DATOS (solo lectura: no cambia nada)
-- Ejecuta cada bloque por separado (selecciónalo y pulsa Run) y pégame los resultados.
-- ═══════════════════════════════════════════════════════════════════

-- 1) TABLAS SIN SEGURIDAD (RLS desactivado)
--    Cualquiera con la clave pública de la app podría leer/escribir estas tablas.
SELECT tablename AS tabla_sin_rls
FROM pg_tables
WHERE schemaname = 'public' AND NOT rowsecurity
ORDER BY 1;

-- 2) PERMISOS DE CADA TABLA (quién puede hacer qué)
SELECT tablename AS tabla, policyname AS politica, cmd AS accion, roles,
       qual AS condicion, with_check AS condicion_escritura
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- 3) ¿QUÉ LE PASA AL HISTORIAL SI SE BORRA UN PROGRAMA?
--    Si set_logs → exercise_sets sale como CASCADE, borrar un programa BORRA los pesos del cliente.
SELECT
  tc.table_name  AS tabla,
  kcu.column_name AS columna,
  ccu.table_name AS apunta_a,
  rc.delete_rule AS al_borrar
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
ORDER BY 1, 2;

-- 4) DATOS INCONSISTENTES
SELECT 'Clientes con MÁS DE UN programa activo' AS problema, COUNT(*) AS casos
FROM (SELECT client_id FROM program_assignments WHERE active GROUP BY client_id HAVING COUNT(*) > 1) x
UNION ALL
SELECT 'Asignaciones duplicadas (mismo cliente y programa)', COUNT(*)
FROM (SELECT client_id, program_id FROM program_assignments GROUP BY 1, 2 HAVING COUNT(*) > 1) x
UNION ALL
SELECT 'Microciclos con ejercicios en la MISMA posición', COUNT(*)
FROM (SELECT microcycle_id, order_index FROM microcycle_exercises GROUP BY 1, 2 HAVING COUNT(*) > 1) x
UNION ALL
SELECT 'Clientes con más de una dieta activa', COUNT(*)
FROM (SELECT client_id FROM diet_assignments WHERE active GROUP BY client_id HAVING COUNT(*) > 1) x
UNION ALL
SELECT 'Programas sin ningún cliente (huérfanos)', COUNT(*)
FROM programs p WHERE NOT EXISTS (SELECT 1 FROM program_assignments pa WHERE pa.program_id = p.id);

-- 5) ¿PUEDE UN CLIENTE HACERSE ADMIN? (políticas de UPDATE sobre profiles)
--    Si hay una política que deja al cliente editar su propia fila sin restringir columnas,
--    podría cambiarse role = 'admin'.
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles' AND cmd IN ('UPDATE', 'ALL');
