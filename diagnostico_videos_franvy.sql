-- Diagnóstico de vídeos (solo lectura). Ejecuta cada bloque por separado
-- (selecciónalo y pulsa Run) y pégame los resultados.

-- 1) ¿Qué permisos (RLS) tiene la tabla exercises?
--    Si hay una política que solo deja leer a los clientes los ejercicios de su
--    programa, la app no puede ver el catálogo completo con los vídeos.
SELECT policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'exercises';

-- 2) ¿Qué vídeo tiene cada ejercicio del programa ACTIVO de franvyother?
SELECT DISTINCT pd.name AS dia, me.order_index AS pos, e.id, e.name, e.video_ref
FROM program_assignments pa
JOIN profiles prof           ON prof.id = pa.client_id
JOIN program_days pd         ON pd.program_id = pa.program_id
JOIN microcycles mc          ON mc.day_id = pd.id AND mc.number = 1
JOIN microcycle_exercises me ON me.microcycle_id = mc.id
JOIN exercises e             ON e.id = me.exercise_id
WHERE prof.full_name ILIKE '%franvyother%' AND pa.active = true
ORDER BY pd.name, me.order_index;

-- 3) Todas las versiones de "press banca plano" en el catálogo
SELECT id, name, video_ref
FROM exercises
WHERE name ILIKE '%press banca plano%'
ORDER BY name;
