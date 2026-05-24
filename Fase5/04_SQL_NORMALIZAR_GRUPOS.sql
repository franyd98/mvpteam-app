-- =====================================================
-- PASO 1: Ver todos los grupos actuales (diagnóstico)
-- Ejecútalo primero para ver qué hay
-- =====================================================
SELECT
  muscle_group,
  TRIM(muscle_group)         AS trimmed,
  INITCAP(LOWER(TRIM(muscle_group))) AS normalizado,
  COUNT(*)                   AS ejercicios
FROM exercises
GROUP BY muscle_group
ORDER BY LOWER(TRIM(muscle_group));


-- =====================================================
-- PASO 2: Normalizar (quitar espacios + capitalización uniforme)
-- Ejecútalo solo si el PASO 1 confirma que hay duplicados
-- =====================================================
UPDATE exercises
SET muscle_group = INITCAP(LOWER(TRIM(muscle_group)));


-- =====================================================
-- PASO 3: Verificar resultado final
-- =====================================================
SELECT muscle_group, COUNT(*) AS ejercicios
FROM exercises
GROUP BY muscle_group
ORDER BY muscle_group;
