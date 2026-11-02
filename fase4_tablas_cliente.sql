
-- ═══════════════════════════════════════════════════════════════════
-- FASE 4 · Guardar en Supabase lo que antes solo vivía en el móvil del cliente
--   · client_day_marks       → días marcados como "entrenado" o "descanso"
--   · client_substitutions   → ejercicios que el cliente ha cambiado en su entreno
--
-- Seguridad (RLS): cada cliente solo ve y modifica lo suyo; el admin puede leerlo todo.
-- Se puede ejecutar varias veces sin problema (IF NOT EXISTS / DROP POLICY IF EXISTS).
-- Hasta que no lo ejecutes, la app sigue funcionando como antes (guardado en el móvil).
-- ═══════════════════════════════════════════════════════════════════

-- 1) Días marcados
CREATE TABLE IF NOT EXISTS public.client_day_marks (
  client_id  uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day        date        NOT NULL,
  status     text        NOT NULL CHECK (status IN ('trained', 'rest')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (client_id, day)
);

-- 2) Cambios de ejercicio (ligados a la fila concreta del programa, no a la posición:
--    si el coach reordena ejercicios, el cambio sigue al ejercicio correcto)
CREATE TABLE IF NOT EXISTS public.client_substitutions (
  client_id              uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  microcycle_exercise_id bigint      NOT NULL REFERENCES public.microcycle_exercises(id) ON DELETE CASCADE,
  name                   text        NOT NULL,
  muscle_group           text,
  video_ref              text,
  updated_at             timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (client_id, microcycle_exercise_id)
);

ALTER TABLE public.client_day_marks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_substitutions ENABLE ROW LEVEL SECURITY;

-- Cliente: todo sobre sus propias filas
DROP POLICY IF EXISTS "own_day_marks" ON public.client_day_marks;
CREATE POLICY "own_day_marks" ON public.client_day_marks
  FOR ALL USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "own_substitutions" ON public.client_substitutions;
CREATE POLICY "own_substitutions" ON public.client_substitutions
  FOR ALL USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

-- Admin: lectura de todo
DROP POLICY IF EXISTS "admin_read_day_marks" ON public.client_day_marks;
CREATE POLICY "admin_read_day_marks" ON public.client_day_marks
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_read_substitutions" ON public.client_substitutions;
CREATE POLICY "admin_read_substitutions" ON public.client_substitutions
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Comprobación: deben salir las dos tablas con rls = true
SELECT tablename, rowsecurity AS rls
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('client_day_marks', 'client_substitutions');
