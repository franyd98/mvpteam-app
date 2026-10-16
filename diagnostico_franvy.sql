-- Estado actual de program_assignments para franvyother
SELECT 
  pa.id,
  pa.program_id,
  pa.active,
  p.name as program_name,
  p.description
FROM program_assignments pa
JOIN programs p ON p.id = pa.program_id
JOIN profiles pr ON pr.id = pa.client_id
WHERE pr.full_name ILIKE '%franvyother%'
ORDER BY pa.active DESC, pa.program_id DESC;
