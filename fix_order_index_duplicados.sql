-- Limpia order_index duplicados en microcycle_exercises del programa activo de franvyother.
-- Reasigna valores 0, 1, 2, ... únicos y secuenciales por microciclo,
-- respetando el orden relativo existente (order_index, luego id como desempate).

UPDATE microcycle_exercises me
SET order_index = subq.new_idx
FROM (
  SELECT
    me2.id,
    (ROW_NUMBER() OVER (
      PARTITION BY me2.microcycle_id
      ORDER BY me2.order_index, me2.id
    ) - 1) AS new_idx
  FROM microcycle_exercises me2
  WHERE me2.microcycle_id IN (
    SELECT mc.id
    FROM microcycles mc
    JOIN program_days pd ON mc.day_id = pd.id
    JOIN programs p      ON pd.program_id = p.id
    JOIN program_assignments pa ON pa.program_id = p.id
    JOIN profiles prof   ON pa.client_id = prof.id
    WHERE prof.full_name ILIKE '%franvyother%'
      AND pa.active = true
  )
) subq
WHERE me.id = subq.id
  AND me.order_index IS DISTINCT FROM subq.new_idx;
