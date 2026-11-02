-- ═══════════════════════════════════════════════════════════════════
-- SEGURIDAD 1 · Impedir que un cliente se haga admin
--
-- Problema: la política "Usuarios actualizan su propio perfil" (UPDATE, auth.uid() = id)
-- deja editar TODA la fila, incluida la columna role. Un cliente podía ponerse
-- role = 'admin' desde la consola del navegador y ver el panel de admin completo.
--
-- Solución: un trigger que rechaza cualquier cambio de role salvo que lo haga
--   · un admin desde la app, o
--   · tú desde el SQL Editor de Supabase / funciones del servidor (sin sesión de usuario).
-- El resto de columnas del perfil se siguen pudiendo editar como hasta ahora.
-- Se puede ejecutar varias veces sin problema.
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Sin sesión de usuario = SQL Editor o funciones del servidor: permitido
    IF auth.uid() IS NULL THEN
      RETURN NEW;
    END IF;
    -- Con sesión: solo un admin puede cambiar roles
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
      RAISE EXCEPTION 'No tienes permiso para cambiar el rol de un usuario'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- Lo mismo al CREAR perfiles: nadie puede registrarse directamente como admin
CREATE OR REPLACE FUNCTION public.protect_profile_role_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin' AND auth.uid() IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'No tienes permiso para crear un usuario admin'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role_insert ON public.profiles;
CREATE TRIGGER trg_protect_profile_role_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role_insert();

-- ── Comprobación: ¿quién es admin ahora mismo? ──
-- Debe salir SOLO tu cuenta. Si aparece alguien más, avísame.
SELECT p.id, p.full_name, u.email, p.role
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE p.role = 'admin';
