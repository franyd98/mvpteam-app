BEGIN;

INSERT INTO diet_plans (name, kcal_on, kcal_off, created_at)
VALUES (
  'Plan 27.0 · TRANSICIÓN — Fran Villar',
  2350,
  2150,
  NOW()
);

DO $$
DECLARE
  v_plan_id uuid;
  meal_id   uuid;
BEGIN
  SELECT id INTO v_plan_id FROM diet_plans
  WHERE name = 'Plan 27.0 · TRANSICIÓN — Fran Villar'
  ORDER BY created_at DESC LIMIT 1;

  -- Meal: Desayuno (on)
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
    VALUES (v_plan_id, 'Desayuno', '🌅', 'on', 0)
    RETURNING id INTO meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción A · Tortitas/Bizcocho', '[{"label": "BASE", "slot": "proteina", "isChoice": false, "note": "", "items": ["125ml Claras + 1 huevo (60g)"]}, {"label": "HIDRATO — elige uno", "slot": "hidrato", "isChoice": true, "note": "", "items": ["65g Avena", "85g Pan centeno/espelta", "60g Pan tostado integral"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g AOVE", "5g Aceite de coco", "30g Aguacate", "30g Guacamole 95%", "10g Crema de cacahuete 100% (+2,6g prot)", "10g Chocolate 85%"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["120g Fruta"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción B · Lácteo + Cereal', '[{"label": "BASE", "slot": "proteina", "isChoice": false, "note": "", "items": ["60g Huevo"]}, {"label": "PROTEÍNA — elige una", "slot": "proteina", "isChoice": true, "note": "", "items": ["Yogur + 10g ISO", "20g ISO + 200ml Leche vegetal", "200g Yogur proteico (sin ISO)"]}, {"label": "CEREAL — elige uno", "slot": "hidrato", "isChoice": true, "note": "", "items": ["65g Avena", "50g Corn Flakes/Mix s/azúcar", "60g Weetabix", "50g Rice Krispies/Muesli"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g AOVE", "5g Aceite de coco", "30g Aguacate", "30g Guacamole 95%", "10g Crema de cacahuete 100% (+2,6g prot)", "10g Chocolate 85%"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["120g Fruta"]}]'::jsonb, 1);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción C · Pan + Proteína fría', '[{"label": "HIDRATO — elige uno", "slot": "hidrato", "isChoice": true, "note": "", "items": ["85g Pan centeno", "60g Pan tostado", "50g Tortas arroz/maíz"]}, {"label": "BASE", "slot": "proteina", "isChoice": false, "note": "", "items": ["60g Huevo"]}, {"label": "PROTEÍNA — elige una", "slot": "proteina", "isChoice": true, "note": "", "items": ["50g Embuchado/Pavo", "50g Arla Protein", "150g Cottage", "60g Jamón serrano", "1 lata Atún natural"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g AOVE", "5g Aceite de coco", "30g Aguacate", "30g Guacamole 95%", "10g Crema de cacahuete 100% (+2,6g prot)", "10g Chocolate 85%"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["120g Fruta"]}]'::jsonb, 2);

  -- Meal: Desayuno (off)
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
    VALUES (v_plan_id, 'Desayuno', '🌅', 'off', 1)
    RETURNING id INTO meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción A · Tortitas/Bizcocho', '[{"label": "BASE", "slot": "proteina", "isChoice": false, "note": "", "items": ["125ml Claras + 1 huevo (60g)"]}, {"label": "HIDRATO — elige uno", "slot": "hidrato", "isChoice": true, "note": "", "items": ["50g Avena", "65g Pan centeno", "50g Pan tostado"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g AOVE", "5g Aceite de coco", "30g Aguacate", "30g Guacamole 95%", "10g Crema de cacahuete 100% (+2,6g prot)", "10g Chocolate 85%"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["120g Fruta (o 100g frutos rojos)"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción B · Lácteo + Cereal', '[{"label": "BASE", "slot": "proteina", "isChoice": false, "note": "", "items": ["60g Huevo"]}, {"label": "PROTEÍNA — elige una", "slot": "proteina", "isChoice": true, "note": "", "items": ["Yogur + 10g ISO", "20g ISO + 200ml Leche vegetal", "200g Yogur proteico (sin ISO)"]}, {"label": "CEREAL — elige uno", "slot": "hidrato", "isChoice": true, "note": "", "items": ["50g Avena", "40g Corn Flakes/Mix s/azúcar", "45g Weetabix", "40g Rice Krispies/Muesli"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g AOVE", "5g Aceite de coco", "30g Aguacate", "30g Guacamole 95%", "10g Crema de cacahuete 100% (+2,6g prot)", "10g Chocolate 85%"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["120g Fruta"]}]'::jsonb, 1);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción C · Pan + Proteína fría', '[{"label": "HIDRATO — elige uno", "slot": "hidrato", "isChoice": true, "note": "", "items": ["65g Pan centeno", "50g Pan tostado", "40g Tortas arroz/maíz"]}, {"label": "BASE", "slot": "proteina", "isChoice": false, "note": "", "items": ["60g Huevo"]}, {"label": "PROTEÍNA — elige una", "slot": "proteina", "isChoice": true, "note": "", "items": ["50g Embuchado/Pavo", "50g Arla Protein", "150g Cottage", "60g Jamón serrano", "1 lata Atún natural"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g AOVE", "5g Aceite de coco", "30g Aguacate", "30g Guacamole 95%", "10g Crema de cacahuete 100% (+2,6g prot)", "10g Chocolate 85%"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["120g Fruta"]}]'::jsonb, 2);

  -- Meal: Almuerzo (both)
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
    VALUES (v_plan_id, 'Almuerzo', '🥪', 'both', 2)
    RETURNING id INTO meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción A · Sándwich frío o plancha', '[{"label": "HIDRATO — elige uno", "slot": "hidrato", "isChoice": true, "note": "", "items": ["50g Pan tostado integral", "80g Pan integral", "40g Tortas arroz/maíz"]}, {"label": "PROTEÍNA + GRASA — elige combo", "slot": "proteina", "isChoice": true, "note": "+ grasa en proteína = − guacamole", "items": ["75g Cottage + 50g Pavo + 30g Guac", "100g Cottage + 35g Pavo + 30g Guac", "1 lata Atún (80g) + 30g Guac", "90g Cottage + 20g Embuchado + 25g Guac", "40g Arla + 30g Pavo + 20g Guac", "50g Arla solo + 15g Guac", "60g Jamón serrano + 15g Guac", "50g Embuchado solo + 10g Guac"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["Verdura libre"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción B · Ensalada pasta fría', '[{"label": "HIDRATO", "slot": "hidrato", "isChoice": false, "note": "", "items": ["45g Pasta seca (cocida y enfriada)"]}, {"label": "PROTEÍNA — elige una", "slot": "proteina", "isChoice": true, "note": "", "items": ["1 lata Atún natural", "50g Arla Protein en dados", "100g Pavo en tiras"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["Cherry, pepino, cebolla, maíz 30-40g"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "", "items": ["5g AOVE", "30g Aguacate"]}]'::jsonb, 1);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción C · Bol de cottage', '[{"label": "HIDRATO", "slot": "hidrato", "isChoice": false, "note": "", "items": ["35g Tortas arroz/maíz"]}, {"label": "PROTEÍNA", "slot": "proteina", "isChoice": false, "note": "", "items": ["75g Cottage + 50g Pavo"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "", "items": ["30g Guacamole", "5g AOVE"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["Verdura libre"]}]'::jsonb, 2);

  -- Meal: Comida Principal (both)
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
    VALUES (v_plan_id, 'Comida Principal', '🍽', 'both', 3)
    RETURNING id INTO meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción A · Proteína + Hidrato + Verdura', '[{"label": "PROTEÍNA — elige una", "slot": "proteina", "isChoice": true, "note": "", "items": ["120g Pollo/Pavo", "130g Lomo de cerdo/Ternera", "160g Merluza", "170g Pescado blanco", "120g Atún a la plancha", "155g Carne picada/Hamburguesa"]}, {"label": "HIDRATO — elige uno (en seco)", "slot": "hidrato", "isChoice": true, "note": "", "items": ["85g Arroz", "90g Pasta", "375g Patata", "315g Boniato", "200g Ñoquis", "90g Cuscús", "95g Quinoa"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["250-400g Verdura o ensalada"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["120g Fruta"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g AOVE", "30g Aguacate", "37g Saté (−9g arroz en seco)", "45g Carbonara", "60g Boloñesa (−6g arroz)"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción B · Legumbre + Proteína', '[{"label": "LEGUMBRE", "slot": "hidrato", "isChoice": false, "note": "", "items": ["200g Legumbre cocida de bote (+50-75g si lleva verdura)"]}, {"label": "PROTEÍNA — elige una", "slot": "proteina", "isChoice": true, "note": "", "items": ["85g Pollo/Pavo", "95g Lomo de cerdo", "120g Merluza", "95g Ternera magra", "85g Atún natural"]}, {"label": "HC ADICIONAL", "slot": "hidrato", "isChoice": false, "note": "", "items": ["55g Arroz (seco)"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["Verdura libre"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g AOVE", "30g Aguacate", "37g Saté (−9g arroz en seco)", "45g Carbonara", "60g Boloñesa (−6g arroz)"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["120g Fruta"]}]'::jsonb, 1);

  -- Meal: Merienda (on)
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
    VALUES (v_plan_id, 'Merienda', '🫐', 'on', 4)
    RETURNING id INTO meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción A · Yogur/Lácteo + Cereal', '[{"label": "LÁCTEO — elige uno", "slot": "proteina", "isChoice": true, "note": "", "items": ["150g Yogur griego ligero + 12g ISO", "125g Queso batido desnatado + 12g ISO", "250g Yogur proteico (sin ISO)"]}, {"label": "CEREAL — elige uno", "slot": "hidrato", "isChoice": true, "note": "", "items": ["40g Avena Crunchy", "30g Choco Zero s/azúcar", "30g Corn Flakes s/azúcar"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["70g Plátano"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción B · ISO + Leche + Cereal', '[{"label": "BASE", "slot": "proteina", "isChoice": false, "note": "", "items": ["25g ISO + 300ml Leche de almendra s/azúcar"]}, {"label": "CEREAL — elige uno", "slot": "hidrato", "isChoice": true, "note": "", "items": ["40g Avena Crunchy", "30g Choco Zero s/azúcar", "30g Corn Flakes s/azúcar"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["70g Plátano"]}]'::jsonb, 1);

  -- Meal: Merienda (off)
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
    VALUES (v_plan_id, 'Merienda', '🫐', 'off', 5)
    RETURNING id INTO meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción A · Yogur/Lácteo + Cereal', '[{"label": "LÁCTEO — elige uno", "slot": "proteina", "isChoice": true, "note": "", "items": ["150g Yogur griego ligero + 15g ISO", "125g Queso batido desnatado + 15g ISO", "250g Yogur proteico (sin ISO)"]}, {"label": "CEREAL — elige uno", "slot": "hidrato", "isChoice": true, "note": "", "items": ["30g Avena Crunchy", "25g Choco Zero s/azúcar", "25g Corn Flakes s/azúcar"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["100g Frutos rojos o 50g Arándanos"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción B · ISO + Leche + Cereal', '[{"label": "BASE", "slot": "proteina", "isChoice": false, "note": "", "items": ["25g ISO + 300ml Leche de almendra s/azúcar"]}, {"label": "CEREAL — elige uno", "slot": "hidrato", "isChoice": true, "note": "", "items": ["30g Avena Crunchy", "25g Corn Flakes s/azúcar"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["100g Frutos rojos"]}]'::jsonb, 1);

  -- Meal: Cena (both)
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
    VALUES (v_plan_id, 'Cena', '🌙', 'both', 6)
    RETURNING id INTO meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción A · Pescado/Carne + Hidrato + Verdura', '[{"label": "PROTEÍNA — elige una", "slot": "proteina", "isChoice": true, "note": "", "items": ["120g Pollo/Pavo", "130g Lomo de cerdo/Ternera", "160g Merluza", "170g Pescado blanco", "120g Atún a la plancha", "155g Carne picada/Hamburguesa"]}, {"label": "HIDRATO — elige uno (en seco)", "slot": "hidrato", "isChoice": true, "note": "", "items": ["85g Arroz", "90g Pasta", "375g Patata", "315g Boniato", "200g Ñoquis", "90g Cuscús", "95g Quinoa"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["250-400g Verdura o ensalada"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g AOVE", "30g Aguacate", "37g Saté (−9g arroz en seco)", "45g Carbonara", "60g Boloñesa (−6g arroz)"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción B · Cena ligera + Legumbre', '[{"label": "LEGUMBRE", "slot": "hidrato", "isChoice": false, "note": "", "items": ["200g Legumbre cocida de bote"]}, {"label": "PROTEÍNA — elige una", "slot": "proteina", "isChoice": true, "note": "", "items": ["85g Pollo/Pavo", "95g Lomo de cerdo", "120g Merluza", "85g Atún natural"]}, {"label": "HC ADICIONAL", "slot": "hidrato", "isChoice": false, "note": "", "items": ["55g Arroz (seco)"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["Verdura libre"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g AOVE", "30g Aguacate", "37g Saté (−9g arroz en seco)", "45g Carbonara", "60g Boloñesa (−6g arroz)"]}]'::jsonb, 1);

  -- Desasignar dieta actual de franvyother y asignar la nueva
  UPDATE diet_assignments SET active = false
    WHERE client_id = (SELECT id FROM profiles WHERE full_name ILIKE '%franvyother%' LIMIT 1);

  INSERT INTO diet_assignments (plan_id, client_id, active)
    SELECT v_plan_id, p.id, true
    FROM profiles p
    WHERE p.full_name ILIKE '%franvyother%'
    LIMIT 1;

END $$;

-- Verificar resultado
SELECT dp.name, dp.kcal_on, dp.kcal_off, da.active
FROM diet_plans dp
JOIN diet_assignments da ON da.plan_id = dp.id
JOIN profiles p ON p.id = da.client_id
WHERE p.full_name ILIKE '%franvyother%'
ORDER BY da.active DESC, dp.created_at DESC
LIMIT 5;

COMMIT;
