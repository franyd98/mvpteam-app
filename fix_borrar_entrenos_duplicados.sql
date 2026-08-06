-- Ver cuáles hay (ejecuta esto primero para confirmar)
SELECT p.id, p.name, pa.active, pa.client_id,
       (SELECT COUNT(*) FROM program_days WHERE program_id = p.id) AS dias
FROM programs p
JOIN program_assignments pa ON pa.program_id = p.id
JOIN profiles pr ON pr.id = pa.client_id
WHERE pr.full_name ILIKE '%franvyother%'
  AND p.name = 'Post-recomp construcción + prep moto'
ORDER BY p.id;

-- ──────────────────────────────────────────────────────────────────────
-- Borrar LOS 3 — luego se vuelve a insertar el correcto desde el SQL
-- ──────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_client_id uuid;
BEGIN
  SELECT id INTO v_client_id FROM profiles WHERE full_name ILIKE '%franvyother%' LIMIT 1;

  DELETE FROM programs
  WHERE name = 'Post-recomp construcción + prep moto'
    AND id IN (
      SELECT p.id FROM programs p
      JOIN program_assignments pa ON pa.program_id = p.id
      WHERE pa.client_id = v_client_id
    );

  RAISE NOTICE 'Todos los programas "Post-recomp" de franvyother eliminados.';
END $$;

-- Verificar resultado final
SELECT p.id, p.name, pa.active,
       (SELECT COUNT(*) FROM program_days WHERE program_id = p.id) AS dias,
       (SELECT MAX(mc.number)
        FROM microcycles mc
        JOIN program_days pd ON pd.id = mc.day_id
        WHERE pd.program_id = p.id) AS microciclos
FROM programs p
JOIN program_assignments pa ON pa.program_id = p.id
JOIN profiles pr ON pr.id = pa.client_id
WHERE pr.full_name ILIKE '%franvyother%'
  AND p.name = 'Post-recomp construcción + prep moto';
-- Resultado esperado: 1 fila · dias=5 · microciclos=16
