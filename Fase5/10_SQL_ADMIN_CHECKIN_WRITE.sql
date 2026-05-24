-- ================================================================
-- MIGRACIÓN: permisos de escritura del admin en tablas de check-in
-- Permite al entrenador insertar registros en nombre del cliente
-- desde la pantalla "Visita Presencial"
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- ================================================================

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['weight_logs','perimeter_logs','fatigue_logs','fold_logs'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "admin_write" ON %I', t);
    EXECUTE format(
      'CREATE POLICY "admin_write" ON %I FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
      )', t);
  END LOOP;
END $$;

SELECT 'OK: admin puede insertar en tablas de check-in' AS resultado;
