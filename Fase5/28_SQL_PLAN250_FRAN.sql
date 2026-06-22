-- ============================================================
-- 28_SQL_PLAN250_FRAN.sql
-- Plan 25.0 · CUT — Fran Villar (franvyother)
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- ============================================================

-- Paso 1: Desactivar asignación anterior
UPDATE diet_assignments SET active = false
WHERE client_id = '5818e102-0d55-412d-90cc-54cc92051799';

-- Paso 2: Insertar plan completo con CTE encadenada
WITH

new_plan AS (
  INSERT INTO diet_plans (name, kcal_on, kcal_off, protein_on, carbs_on, fat_on,
                          protein_off, carbs_off, fat_off, notes)
  VALUES (
    'Plan 25.0 · CUT — Fran Villar', 2104, 1800,
    153, 271, 45,
    149, 208, 42,
    '🍱 TAPER ÚNICO PARA MEAL PREP' || chr(10) ||
    'La proteína y el hidrato del taper son IDÉNTICOS en: comida ON, cena ON y cena OFF → 120g pollo + 63g arroz (en seco). Cocina un solo lote y reparte en tapers iguales.' || chr(10) ||
    'El ÚNICO taper distinto es la comida del día OFF: mismo pollo, pero 35g de arroz. Ahí va todo el recorte del día de descanso.' || chr(10) || chr(10) ||
    '🥑 GRASAS · ELIGE UNA POR COMIDA (SON INTERCAMBIABLES)' || chr(10) ||
    '5g Aceite de Oliva V.E. ≈ 5g Aceite de Coco ≈ 30g Aguacate ≈ 30g Guacamole 95% ≈ 10g Chocolate Negro 85%.' || chr(10) || chr(10) ||
    'Pesa siempre los alimentos en crudo/seco.'
  ) RETURNING id
),

-- ── DESAYUNO ON (3 opciones) ─────────────────────────────────
c1_on AS (
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  SELECT id, 'Comida 1 — Desayuno', '🌅', 'on', 0 FROM new_plan
  RETURNING id
),
c1_on_a AS (
  INSERT INTO diet_options (meal_id, name, content, sort_order)
  SELECT id, 'Elaborada · Tortitas / Bizcocho',
  '[
    {"label": "BASE", "isChoice": false, "items": ["125ml Claras + 1 Huevo entero (60g)"], "note": "Tortitas: bate y cocina en sartén antiadherente. Bizcocho: + levadura, 6-10 min micro."},
    {"label": "HIDRATO", "isChoice": true, "items": ["55g Harina/Copos de Avena", "75g Pan Centeno o Espelta", "50g Pan tostado 100% integral"]},
    {"label": "GRASA", "isChoice": true, "items": ["5g Aceite de Oliva V.E.", "5g Aceite de Coco", "30g Aguacate", "30g Guacamole 95% aguacate", "10g Chocolate Negro 85%"]},
    {"label": "FRUTA", "isChoice": false, "items": ["120g Fruta (excepto plátano)"], "note": "Opcional: 30g mermelada sin azúcar."}
  ]'::jsonb, 0
  FROM c1_on RETURNING id
),
c1_on_b AS (
  INSERT INTO diet_options (meal_id, name, content, sort_order)
  SELECT id, 'Lácteo + Cereal',
  '[
    {"label": "BASE", "isChoice": false, "items": ["60g Huevo entero (cocido/revuelto/tortilla)"]},
    {"label": "PROTEÍNA", "isChoice": true, "items": ["1 Yogur s/lactosa o proteico + 10g ISO", "20g ISO + 200ml leche vegetal s/azúcar", "200g Yogur +Proteínas o Mousse Hacendado"]},
    {"label": "CEREAL", "isChoice": true, "items": ["55g Copos de Avena / Avena Crunchy", "40g Corn Flakes s/azúcar", "40g Cereal Mix s/azúcar", "50g Weetabix 95% integral", "40g Rice Krispies Kellogg''s", "50g Muesli s/azúcar"], "note": "Puedes combinar la mitad de dos cereales."},
    {"label": "GRASA", "isChoice": true, "items": ["5g Aceite de Oliva V.E.", "5g Aceite de Coco", "30g Aguacate", "30g Guacamole 95% aguacate", "10g Chocolate Negro 85%"]},
    {"label": "FRUTA", "isChoice": false, "items": ["120g Fruta (excepto plátano)"]}
  ]'::jsonb, 1
  FROM c1_on RETURNING id
),
c1_on_c AS (
  INSERT INTO diet_options (meal_id, name, content, sort_order)
  SELECT id, 'Pan + Proteína fría',
  '[
    {"label": "HIDRATO", "isChoice": true, "items": ["75g Pan Centeno o Espelta", "50g Pan tostado 100% integral", "40g Tortas de arroz/maíz"]},
    {"label": "BASE", "isChoice": false, "items": ["60g Huevo entero"]},
    {"label": "PROTEÍNA", "isChoice": true, "items": ["35g Lomo embuchado o pavo curado", "100g Queso Burgos + 30g pavo fiambre", "150g Queso fresco Burgos", "60g Jamón serrano (sin grasa)", "1 lata Atún natural"]},
    {"label": "GRASA", "isChoice": true, "items": ["5g Aceite de Oliva V.E.", "5g Aceite de Coco", "30g Aguacate", "30g Guacamole 95% aguacate", "10g Chocolate Negro 85%"]},
    {"label": "FRUTA", "isChoice": false, "items": ["120g Fruta (excepto plátano)"]}
  ]'::jsonb, 2
  FROM c1_on RETURNING id
),

-- ── DESAYUNO OFF (3 opciones, HC reducidos) ──────────────────
c1_off AS (
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  SELECT id, 'Comida 1 — Desayuno', '🌅', 'off', 0 FROM new_plan
  RETURNING id
),
c1_off_a AS (
  INSERT INTO diet_options (meal_id, name, content, sort_order)
  SELECT id, 'Elaborada · Tortitas / Bizcocho',
  '[
    {"label": "BASE", "isChoice": false, "items": ["125ml Claras + 1 Huevo entero (60g)"], "note": "Tortitas: bate y cocina en sartén antiadherente. Bizcocho: + levadura, 6-10 min micro."},
    {"label": "HIDRATO", "isChoice": true, "items": ["40g Harina/Copos de Avena", "55g Pan Centeno o Espelta", "40g Pan tostado 100% integral"]},
    {"label": "GRASA", "isChoice": true, "items": ["5g Aceite de Oliva V.E.", "5g Aceite de Coco", "30g Aguacate", "30g Guacamole 95% aguacate", "10g Chocolate Negro 85%"]},
    {"label": "FRUTA", "isChoice": false, "items": ["100g Fruta o 100g frutos rojos"], "note": "Opcional: 30g mermelada sin azúcar."}
  ]'::jsonb, 0
  FROM c1_off RETURNING id
),
c1_off_b AS (
  INSERT INTO diet_options (meal_id, name, content, sort_order)
  SELECT id, 'Lácteo + Cereal',
  '[
    {"label": "BASE", "isChoice": false, "items": ["60g Huevo entero (cocido/revuelto/tortilla)"]},
    {"label": "PROTEÍNA", "isChoice": true, "items": ["1 Yogur s/lactosa o proteico + 10g ISO", "20g ISO + 200ml leche vegetal s/azúcar", "200g Yogur +Proteínas o Mousse Hacendado"]},
    {"label": "CEREAL", "isChoice": true, "items": ["40g Copos de Avena / Avena Crunchy", "30g Corn Flakes s/azúcar", "30g Cereal Mix s/azúcar", "35g Weetabix 95% integral", "30g Rice Krispies Kellogg''s", "35g Muesli s/azúcar"], "note": "Puedes combinar la mitad de dos cereales."},
    {"label": "GRASA", "isChoice": true, "items": ["5g Aceite de Oliva V.E.", "5g Aceite de Coco", "30g Aguacate", "30g Guacamole 95% aguacate", "10g Chocolate Negro 85%"]},
    {"label": "FRUTA", "isChoice": false, "items": ["100g Fruta o 100g frutos rojos"]}
  ]'::jsonb, 1
  FROM c1_off RETURNING id
),
c1_off_c AS (
  INSERT INTO diet_options (meal_id, name, content, sort_order)
  SELECT id, 'Pan + Proteína fría',
  '[
    {"label": "HIDRATO", "isChoice": true, "items": ["55g Pan Centeno o Espelta", "40g Pan tostado 100% integral", "30g Tortas de arroz/maíz"]},
    {"label": "BASE", "isChoice": false, "items": ["60g Huevo entero"]},
    {"label": "PROTEÍNA", "isChoice": true, "items": ["35g Lomo embuchado o pavo curado", "100g Queso Burgos + 30g pavo fiambre", "150g Queso fresco Burgos", "60g Jamón serrano (sin grasa)", "1 lata Atún natural"]},
    {"label": "GRASA", "isChoice": true, "items": ["5g Aceite de Oliva V.E.", "5g Aceite de Coco", "30g Aguacate", "30g Guacamole 95% aguacate", "10g Chocolate Negro 85%"]},
    {"label": "FRUTA", "isChoice": false, "items": ["100g Fruta o 100g frutos rojos"]}
  ]'::jsonb, 2
  FROM c1_off RETURNING id
),

-- ── ALMUERZO (BOTH — igual todos los días) ───────────────────
c2 AS (
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  SELECT id, 'Comida 2 — Almuerzo', '☕', 'both', 1 FROM new_plan
  RETURNING id
),
c2_a AS (
  INSERT INTO diet_options (meal_id, name, content, sort_order)
  SELECT id, 'Pan + Proteína fría (sin cocinar)',
  '[
    {"label": "HIDRATO", "isChoice": true, "items": ["50g Pan tostado 100% integral", "80g Pan integral", "40g Tortas de arroz/maíz"]},
    {"label": "PROTEÍNA", "isChoice": true, "items": ["30g Lomo embuchado o pavo curado", "100g Queso Burgos + 30g pavo fiambre", "130g Queso fresco Burgos", "60g Jamón serrano (sin grasa)", "1 lata Atún natural (80g)"]},
    {"label": "GRASA", "isChoice": false, "items": ["5g Aceite de Oliva V.E."], "note": "Tomate rallado para el pan."}
  ]'::jsonb, 0
  FROM c2 RETURNING id
),

-- ── COMIDA PRINCIPAL ON ──────────────────────────────────────
c3_on AS (
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  SELECT id, 'Comida 3 — Comida Principal', '🍽️', 'on', 2 FROM new_plan
  RETURNING id
),
c3_on_a AS (
  INSERT INTO diet_options (meal_id, name, content, sort_order)
  SELECT id, 'Proteína + Hidrato + Verdura',
  '[
    {"label": "PROTEÍNA", "isChoice": true, "items": ["120g Pechuga de Pollo o Pavo", "130g Lomo de Cerdo", "160g Merluza", "170g Lenguado / Lubina / Pescado blanco", "130g Ternera magra (picada o filetes)", "120g Atún a la plancha", "155g Carne picada / Hamburguesa pavo-pollo"]},
    {"label": "HIDRATO (en seco)", "isChoice": true, "items": ["65g Arroz (todas variedades)", "70g Pasta (todas variedades)", "290g Patata", "245g Boniato Rojo", "155g Ñoquis de patata", "70g Cuscús (seco)", "75g Quinoa (seco)"]},
    {"label": "VERDURA LIBRE", "isChoice": false, "items": ["250-400g Verdura o ensalada"]},
    {"label": "GRASA", "isChoice": true, "items": ["5g Aceite de Oliva V.E.", "30g Aguacate", "30g Guacamole 95% aguacate", "10g Chocolate Negro 85%"]},
    {"label": "FRUTA", "isChoice": false, "items": ["120g Fruta (excepto plátano)"]}
  ]'::jsonb, 0
  FROM c3_on RETURNING id
),
c3_on_b AS (
  INSERT INTO diet_options (meal_id, name, content, sort_order)
  SELECT id, 'Legumbre + Proteína',
  '[
    {"label": "LEGUMBRE", "isChoice": false, "items": ["200g Legumbre cocida de bote (+50-75g si lleva verdura)"], "note": "Guisantes congelados a igualdad de gramos."},
    {"label": "PROTEÍNA", "isChoice": true, "items": ["85g Pollo / Pavo", "95g Lomo de Cerdo", "120g Merluza", "95g Ternera magra", "85g Atún natural"]},
    {"label": "HC ADICIONAL", "isChoice": false, "items": ["40g Arroz (seco)"]},
    {"label": "VERDURA LIBRE", "isChoice": false, "items": ["100-400g Verdura variada"]},
    {"label": "GRASA", "isChoice": true, "items": ["5g Aceite de Oliva V.E.", "30g Aguacate", "30g Guacamole 95% aguacate", "10g Chocolate Negro 85%"]},
    {"label": "FRUTA", "isChoice": false, "items": ["120g Fruta (excepto plátano)"]}
  ]'::jsonb, 1
  FROM c3_on RETURNING id
),

-- ── COMIDA PRINCIPAL OFF (HC reducidos en Opc A) ─────────────
c3_off AS (
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  SELECT id, 'Comida 3 — Comida Principal', '🍽️', 'off', 2 FROM new_plan
  RETURNING id
),
c3_off_a AS (
  INSERT INTO diet_options (meal_id, name, content, sort_order)
  SELECT id, 'Proteína + Hidrato + Verdura',
  '[
    {"label": "PROTEÍNA", "isChoice": true, "items": ["120g Pechuga de Pollo o Pavo", "130g Lomo de Cerdo", "160g Merluza", "170g Lenguado / Lubina / Pescado blanco", "130g Ternera magra (picada o filetes)", "120g Atún a la plancha", "155g Carne picada / Hamburguesa pavo-pollo"]},
    {"label": "HIDRATO (en seco)", "isChoice": true, "items": ["35g Arroz (todas variedades)", "40g Pasta (todas variedades)", "160g Patata", "135g Boniato Rojo", "85g Ñoquis de patata", "40g Cuscús (seco)", "45g Quinoa (seco)"]},
    {"label": "VERDURA LIBRE", "isChoice": false, "items": ["300-400g Verdura o ensalada"]},
    {"label": "GRASA", "isChoice": true, "items": ["5g Aceite de Oliva V.E.", "30g Aguacate", "30g Guacamole 95% aguacate", "10g Chocolate Negro 85%"]},
    {"label": "FRUTA", "isChoice": false, "items": ["120g Fruta (excepto plátano)"]}
  ]'::jsonb, 0
  FROM c3_off RETURNING id
),
c3_off_b AS (
  INSERT INTO diet_options (meal_id, name, content, sort_order)
  SELECT id, 'Legumbre + Proteína',
  '[
    {"label": "LEGUMBRE", "isChoice": false, "items": ["200g Legumbre cocida de bote (+50-75g si lleva verdura)"], "note": "Guisantes congelados a igualdad de gramos."},
    {"label": "PROTEÍNA", "isChoice": true, "items": ["85g Pollo / Pavo", "95g Lomo de Cerdo", "120g Merluza", "95g Ternera magra", "85g Atún natural"]},
    {"label": "HC ADICIONAL", "isChoice": false, "items": ["40g Arroz (seco)"]},
    {"label": "VERDURA LIBRE", "isChoice": false, "items": ["100-400g Verdura variada"]},
    {"label": "GRASA", "isChoice": true, "items": ["5g Aceite de Oliva V.E.", "30g Aguacate", "30g Guacamole 95% aguacate", "10g Chocolate Negro 85%"]},
    {"label": "FRUTA", "isChoice": false, "items": ["120g Fruta (excepto plátano)"]}
  ]'::jsonb, 1
  FROM c3_off RETURNING id
),

-- ── MERIENDA ON ──────────────────────────────────────────────
c4_on AS (
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  SELECT id, 'Comida 4 — Merienda', '🫐', 'on', 3 FROM new_plan
  RETURNING id
),
c4_on_a AS (
  INSERT INTO diet_options (meal_id, name, content, sort_order)
  SELECT id, 'Yogur / Lácteo + Cereal',
  '[
    {"label": "PROTEÍNA", "isChoice": true, "items": ["150g Yogur +Proteínas Hacendado + 12g ISO", "125g Queso batido desnatado + 12g ISO", "150g Yogur Griego Ligero + 12g ISO", "250g Yogur proteico o queso batido (sin ISO)"]},
    {"label": "CEREAL", "isChoice": true, "items": ["40g Copos de Avena / Avena Crunchy", "30g Corn Flakes s/azúcar", "30g Cereal Mix s/azúcar", "35g Weetabix 95% integral", "30g Rice Krispies Kellogg''s", "35g Muesli s/azúcar"], "note": "Puedes combinar la mitad de dos cereales."},
    {"label": "FRUTA", "isChoice": false, "items": ["70g Plátano"]}
  ]'::jsonb, 0
  FROM c4_on RETURNING id
),
c4_on_b AS (
  INSERT INTO diet_options (meal_id, name, content, sort_order)
  SELECT id, 'ISO + Leche + Cereal',
  '[
    {"label": "PROTEÍNA", "isChoice": false, "items": ["25g ISO + 300ml Leche de almendra s/azúcar"]},
    {"label": "CEREAL", "isChoice": true, "items": ["30g Crema de Arroz/Papilla s/azúcar", "40g Copos de Avena / Avena Crunchy", "30g Corn Flakes s/azúcar", "30g Cereal Mix s/azúcar", "35g Weetabix 95% integral", "30g Rice Krispies Kellogg''s", "35g Muesli s/azúcar"]},
    {"label": "FRUTA", "isChoice": false, "items": ["70g Plátano"]}
  ]'::jsonb, 1
  FROM c4_on RETURNING id
),

-- ── MERIENDA OFF (sin cereal) ─────────────────────────────────
c4_off AS (
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  SELECT id, 'Comida 4 — Merienda', '🫐', 'off', 3 FROM new_plan
  RETURNING id
),
c4_off_a AS (
  INSERT INTO diet_options (meal_id, name, content, sort_order)
  SELECT id, 'Yogur / Lácteo',
  '[
    {"label": "PROTEÍNA", "isChoice": true, "items": ["180g Yogur +Proteínas Hacendado + 15g ISO", "125g Queso batido desnatado + 15g ISO", "150g Yogur Griego Ligero + 15g ISO", "250g Yogur proteico o queso batido (sin ISO)"]},
    {"label": "FRUTA", "isChoice": false, "items": ["100g Frutos rojos o 50g arándanos"]}
  ]'::jsonb, 0
  FROM c4_off RETURNING id
),
c4_off_b AS (
  INSERT INTO diet_options (meal_id, name, content, sort_order)
  SELECT id, 'ISO + Leche',
  '[
    {"label": "PROTEÍNA", "isChoice": false, "items": ["25g ISO + 300ml Leche de almendra s/azúcar"]},
    {"label": "CEREAL", "isChoice": false, "items": ["— sin cereal en día OFF —"]},
    {"label": "FRUTA", "isChoice": false, "items": ["100g Frutos rojos o 50g arándanos"]}
  ]'::jsonb, 1
  FROM c4_off RETURNING id
),

-- ── CENA (BOTH — mismas cantidades ON y OFF según diseño taper) ──
c5 AS (
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  SELECT id, 'Comida 5 — Cena', '🌙', 'both', 4 FROM new_plan
  RETURNING id
),
c5_a AS (
  INSERT INTO diet_options (meal_id, name, content, sort_order)
  SELECT id, 'Pescado/Carne + Hidrato + Verdura',
  '[
    {"label": "PROTEÍNA", "isChoice": true, "items": ["120g Pechuga de Pollo o Pavo", "130g Lomo de Cerdo", "160g Merluza", "170g Lenguado / Lubina / Pescado blanco", "130g Ternera magra (picada o filetes)", "120g Atún a la plancha", "155g Carne picada / Hamburguesa pavo-pollo"]},
    {"label": "HIDRATO (en seco)", "isChoice": true, "items": ["65g Arroz (todas variedades)", "70g Pasta (todas variedades)", "290g Patata", "245g Boniato Rojo", "155g Ñoquis de patata", "70g Cuscús (seco)", "75g Quinoa (seco)"]},
    {"label": "VERDURA LIBRE", "isChoice": false, "items": ["250-400g Verdura o ensalada"]},
    {"label": "GRASA", "isChoice": true, "items": ["5g Aceite de Oliva V.E.", "30g Aguacate", "30g Guacamole 95% aguacate", "10g Chocolate Negro 85%"]}
  ]'::jsonb, 0
  FROM c5 RETURNING id
),
c5_b AS (
  INSERT INTO diet_options (meal_id, name, content, sort_order)
  SELECT id, 'Cena ligera + Legumbre',
  '[
    {"label": "LEGUMBRE", "isChoice": false, "items": ["200g Legumbre cocida de bote"]},
    {"label": "PROTEÍNA", "isChoice": true, "items": ["85g Pollo / Pavo", "95g Lomo de Cerdo", "120g Merluza", "85g Atún natural"]},
    {"label": "HC ADICIONAL", "isChoice": false, "items": ["40g Arroz (seco)"]},
    {"label": "VERDURA LIBRE", "isChoice": false, "items": ["100-400g Verdura variada"]},
    {"label": "GRASA", "isChoice": true, "items": ["5g Aceite de Oliva V.E.", "30g Aguacate", "30g Guacamole 95% aguacate", "10g Chocolate Negro 85%"]}
  ]'::jsonb, 1
  FROM c5 RETURNING id
),

-- ── ASIGNACIÓN ───────────────────────────────────────────────
new_assignment AS (
  INSERT INTO diet_assignments (plan_id, client_id, active)
  SELECT id, '5818e102-0d55-412d-90cc-54cc92051799', true
  FROM new_plan
  RETURNING id
)

SELECT
  'OK: Plan 25.0 · CUT Fran Villar insertado y asignado — ' ||
  'ON 2104kcal (153P/271HC/45G) · OFF 1800kcal (149P/208HC/42G) · ' ||
  '5 comidas · taper único meal prep' AS resultado
FROM new_assignment;
