-- ═══════════════════════════════════════════════════════════════════
-- SEGURIDAD 2 · Permisos de programas y dietas
--
-- Problema: programs, program_days, microcycles, microcycle_exercises, exercise_sets y
-- program_assignments tenían "Autenticados gestionan…" (ALL para cualquier usuario):
-- cualquier cliente podía borrar o modificar programas de otros y cambiar asignaciones.
-- En dietas, cualquier cliente podía asignar dietas a otros y meter comidas en planes ajenos.
--
-- Después de esto:
--   · Admin: todo, como antes.
--   · Cliente: LEE programas; cambia/borra SUS asignaciones; borra SUS planes de IA.
--     Crea SUS dietas (y solo puede añadir comidas a dietas creadas por él).
--   · Funciones del servidor (IA): no les afecta (usan la clave de servicio).
--
-- Se puede ejecutar varias veces sin problema.
-- ═══════════════════════════════════════════════════════════════════

-- Función auxiliar: ¿el usuario actual es admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- ── 1. Estructura de programas: solo el admin modifica ───────────────
DROP POLICY IF EXISTS "Autenticados gestionan programas"      ON public.programs;
DROP POLICY IF EXISTS "Autenticados gestionan dias"           ON public.program_days;
DROP POLICY IF EXISTS "Autenticados gestionan microciclos"    ON public.microcycles;
DROP POLICY IF EXISTS "Autenticados gestionan mic ejercicios" ON public.microcycle_exercises;
DROP POLICY IF EXISTS "Autenticados gestionan series"         ON public.exercise_sets;

DROP POLICY IF EXISTS "admin_all_programs"             ON public.programs;
DROP POLICY IF EXISTS "admin_all_program_days"         ON public.program_days;
DROP POLICY IF EXISTS "admin_all_microcycles"          ON public.microcycles;
DROP POLICY IF EXISTS "admin_all_microcycle_exercises" ON public.microcycle_exercises;
DROP POLICY IF EXISTS "admin_all_exercise_sets"        ON public.exercise_sets;
CREATE POLICY "admin_all_programs"             ON public.programs             FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_all_program_days"         ON public.program_days         FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_all_microcycles"          ON public.microcycles          FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_all_microcycle_exercises" ON public.microcycle_exercises FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_all_exercise_sets"        ON public.exercise_sets        FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
-- (Las políticas "Autenticados leen …" de SELECT se mantienen: el cliente necesita leer su programa)

-- El cliente puede borrar SOLO sus planes generados con IA (el borrado en cascada de
-- días/microciclos/series lo hace la propia base de datos y no necesita más permisos)
DROP POLICY IF EXISTS "client_delete_own_ai_program" ON public.programs;
CREATE POLICY "client_delete_own_ai_program" ON public.programs
  FOR DELETE USING (owner_client_id = auth.uid() AND source = 'ai');

-- ── 2. Asignaciones de programa: cada cliente solo las suyas ────────
DROP POLICY IF EXISTS "Autenticados gestionan asignaciones" ON public.program_assignments;
DROP POLICY IF EXISTS "Autenticados leen asignaciones"      ON public.program_assignments;

DROP POLICY IF EXISTS "admin_all_program_assignments"  ON public.program_assignments;
DROP POLICY IF EXISTS "client_read_own_assignments"    ON public.program_assignments;
DROP POLICY IF EXISTS "client_update_own_assignments"  ON public.program_assignments;
DROP POLICY IF EXISTS "client_delete_own_assignments"  ON public.program_assignments;
CREATE POLICY "admin_all_program_assignments" ON public.program_assignments
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "client_read_own_assignments" ON public.program_assignments
  FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "client_update_own_assignments" ON public.program_assignments
  FOR UPDATE USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
CREATE POLICY "client_delete_own_assignments" ON public.program_assignments
  FOR DELETE USING (client_id = auth.uid());

-- ── 3. Dietas creadas por el cliente ────────────────────────────────
-- Saber quién creó cada plan (se rellena solo al crear; los existentes quedan vacíos)
ALTER TABLE public.diet_plans ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT auth.uid();

-- El cliente puede ver los planes que ha creado él (antes no podía hasta asignárselo,
-- y por eso fallaba guardar una dieta generada desde el móvil del cliente)
DROP POLICY IF EXISTS "client_read_own_created_plans" ON public.diet_plans;
CREATE POLICY "client_read_own_created_plans" ON public.diet_plans
  FOR SELECT USING (created_by = auth.uid());

-- Comidas: solo en planes creados por él
DROP POLICY IF EXISTS "clients_insert_diet_meals"          ON public.diet_meals;
DROP POLICY IF EXISTS "client_insert_meals_own_plan"       ON public.diet_meals;
DROP POLICY IF EXISTS "client_read_meals_own_created_plan" ON public.diet_meals;
CREATE POLICY "client_insert_meals_own_plan" ON public.diet_meals
  FOR INSERT WITH CHECK (plan_id IN (SELECT id FROM public.diet_plans WHERE created_by = auth.uid()));
CREATE POLICY "client_read_meals_own_created_plan" ON public.diet_meals
  FOR SELECT USING (plan_id IN (SELECT id FROM public.diet_plans WHERE created_by = auth.uid()));

-- Opciones de comida: solo en comidas de planes creados por él
DROP POLICY IF EXISTS "clients_insert_diet_options"          ON public.diet_options;
DROP POLICY IF EXISTS "client_insert_options_own_plan"       ON public.diet_options;
DROP POLICY IF EXISTS "client_read_options_own_created_plan" ON public.diet_options;
CREATE POLICY "client_insert_options_own_plan" ON public.diet_options
  FOR INSERT WITH CHECK (meal_id IN (
    SELECT dm.id FROM public.diet_meals dm
    JOIN public.diet_plans dp ON dp.id = dm.plan_id
    WHERE dp.created_by = auth.uid()));
CREATE POLICY "client_read_options_own_created_plan" ON public.diet_options
  FOR SELECT USING (meal_id IN (
    SELECT dm.id FROM public.diet_meals dm
    JOIN public.diet_plans dp ON dp.id = dm.plan_id
    WHERE dp.created_by = auth.uid()));

-- Asignaciones de dieta: un cliente solo se asigna dietas a sí mismo
DROP POLICY IF EXISTS "clients_insert_diet_assignments" ON public.diet_assignments;
DROP POLICY IF EXISTS "client_insert_own_assignment"    ON public.diet_assignments;
CREATE POLICY "client_insert_own_assignment" ON public.diet_assignments
  FOR INSERT WITH CHECK (client_id = auth.uid());

-- ── Comprobación: políticas resultantes de las tablas tocadas ───────
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('programs','program_days','microcycles','microcycle_exercises','exercise_sets',
                    'program_assignments','diet_plans','diet_meals','diet_options','diet_assignments')
ORDER BY tablename, cmd, policyname;
