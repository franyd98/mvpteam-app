-- ──────────────────────────────────────────────────────────────────────────
-- 17_SQL_INGREDIENTS.sql
-- Tabla custom_ingredients — ingredientes añadidos / modificados por admins
-- ──────────────────────────────────────────────────────────────────────────

-- 1. Tabla
CREATE TABLE IF NOT EXISTS public.custom_ingredients (
  id           TEXT        PRIMARY KEY,           -- mismo id que ingredients.ts para override
  name         TEXT        NOT NULL,
  category     TEXT        NOT NULL,              -- IngredientCategory values
  kcal         NUMERIC(7,2) NOT NULL,
  protein      NUMERIC(7,2) NOT NULL,
  carbs        NUMERIC(7,2) NOT NULL,
  fat          NUMERIC(7,2) NOT NULL,
  created_by   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Índice por categoría (útil para filtros en admin)
CREATE INDEX IF NOT EXISTS idx_custom_ingredients_category
  ON public.custom_ingredients (category);

-- 3. updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_custom_ingredients_updated_at ON public.custom_ingredients;
CREATE TRIGGER trg_custom_ingredients_updated_at
  BEFORE UPDATE ON public.custom_ingredients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. RLS — sólo admins pueden escribir; todos los usuarios autenticados pueden leer
ALTER TABLE public.custom_ingredients ENABLE ROW LEVEL SECURITY;

-- Lectura: cualquier usuario autenticado
CREATE POLICY "custom_ingredients_select"
  ON public.custom_ingredients FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insertar: sólo admins (role = 'admin' en user_metadata)
CREATE POLICY "custom_ingredients_insert"
  ON public.custom_ingredients FOR INSERT
  WITH CHECK (
    (auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.profiles
       WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Actualizar: sólo admins
CREATE POLICY "custom_ingredients_update"
  ON public.custom_ingredients FOR UPDATE
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.profiles
       WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Eliminar: sólo admins
CREATE POLICY "custom_ingredients_delete"
  ON public.custom_ingredients FOR DELETE
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.profiles
       WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ──────────────────────────────────────────────────────────────────────────
-- Listo. En el frontend, al cargar ingredientes:
--   1. Carga ingredients.ts (base estática)
--   2. Hace SELECT * FROM custom_ingredients
--   3. Fusiona: custom_ingredients sobreescribe si el id coincide,
--      o añade al array si es nuevo.
-- ──────────────────────────────────────────────────────────────────────────
