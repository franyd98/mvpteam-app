-- ============================================================
-- 30_SQL_DIET_CLIENT_DELETE.sql
-- Permite al cliente borrar y actualizar sus propias asignaciones
-- de dieta (necesario para el picker de dietas en la app).
-- ⚠️  EJECUTAR EN: Supabase → SQL Editor
-- ============================================================

-- El cliente puede actualizar sus propias asignaciones
-- (necesario para cambiar la dieta activa con switchDiet)
CREATE POLICY "client_update_own_assignment" ON diet_assignments
  FOR UPDATE USING (client_id = auth.uid());

-- El cliente puede borrar sus propias asignaciones
-- (necesario para eliminar dietas del picker)
CREATE POLICY "client_delete_own_assignment" ON diet_assignments
  FOR DELETE USING (client_id = auth.uid());

-- El cliente puede leer sus planes asignados (activos e inactivos)
-- La política anterior solo permite leer plans activos; esta amplía a todos sus planes
DROP POLICY IF EXISTS "client_read_assigned_plan" ON diet_plans;
CREATE POLICY "client_read_assigned_plan" ON diet_plans
  FOR SELECT USING (
    id IN (
      SELECT plan_id FROM diet_assignments
      WHERE client_id = auth.uid()
    )
  );
