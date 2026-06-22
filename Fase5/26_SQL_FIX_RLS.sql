-- ============================================================
-- 26_SQL_FIX_RLS.sql
-- Activa ROW LEVEL SECURITY en todas las tablas públicas que
-- aún no lo tienen habilitado.
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- Tablas del esquema de entrenamiento (creadas en fase inicial)
ALTER TABLE IF EXISTS public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exercises           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.programs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.program_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.program_days        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.microcycles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.microcycle_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exercise_sets       ENABLE ROW LEVEL SECURITY;

-- Tablas de logs corporales
ALTER TABLE IF EXISTS public.weight_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fold_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.perimeter_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fatigue_logs        ENABLE ROW LEVEL SECURITY;

-- Tablas de dieta y macros (por si acaso, las que ya lo tienen lo ignoran)
ALTER TABLE IF EXISTS public.diet_plans          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.diet_meals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.diet_options        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.diet_assignments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.daily_food_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client_macros       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shop_list_items     ENABLE ROW LEVEL SECURITY;

-- Otras
ALTER TABLE IF EXISTS public.checkin_photos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.locked_microcycles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.custom_ingredients  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.set_logs            ENABLE ROW LEVEL SECURITY;

-- ── Verificación: muestra qué tablas tienen RLS activado ahora ──────────────
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
