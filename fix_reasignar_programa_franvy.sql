-- 1. Limpiar assignments incorrectos (programas de otros clientes)
DELETE FROM program_assignments
WHERE client_id = (SELECT id FROM profiles WHERE full_name ILIKE '%franvyother%' LIMIT 1)
  AND program_id IN (1, 6);

-- 2. Activar el programa correcto de franvyother
UPDATE program_assignments
SET active = true
WHERE client_id = (SELECT id FROM profiles WHERE full_name ILIKE '%franvyother%' LIMIT 1)
  AND program_id = 88;

-- 3. Verificar
SELECT p.id, p.name, pa.active
FROM programs p
JOIN program_assignments pa ON pa.program_id = p.id
JOIN profiles pr ON pr.id = pa.client_id
WHERE pr.full_name ILIKE '%franvyother%'
ORDER BY pa.active DESC;
