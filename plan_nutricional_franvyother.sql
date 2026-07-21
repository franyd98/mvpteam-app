-- ============================================================
-- Plan Nutricional 26.0 RECOMP — Fran Villar (franvyother)
-- Generado automáticamente el 2026-07-21
-- INSTRUCCIONES:
-- 1. Ejecutar en Supabase SQL Editor
-- 2. El script crea el plan nuevo, desasigna el antiguo y asigna el nuevo
-- ============================================================

BEGIN;

-- Crear el plan nutricional
INSERT INTO diet_plans (name, kcal_on, kcal_off, protein_on, protein_off, carbs_on, carbs_off, fat_on, fat_off, notes)
VALUES (
  'Plan 26.0 · RECOMP — Fran Villar',
  2104, 1800,
  153, 149,
  271, 208,
  45, 42,
  'Elige 1 opción por comida · Plan 26.0 · RECOMP · Definición · meal prep

🍱 TAPER ÚNICO PARA MEAL PREP
La proteína y el hidrato del taper son IDÉNTICOS en comida ON, cena ON y cena OFF → 120g pollo + 65g arroz. Cocina un solo lote y reparte en tapers iguales. El ÚNICO taper distinto es la comida del día OFF: mismo pollo, pero 35g de arroz.

🥑 GRASAS · ELIGE UNA POR COMIDA (TODAS ≈ 5g DE GRASA)
Neutras: 5g AOVE · 5g Aceite de Coco · 30g Aguacate · 30g Guacamole 95%
Dulces: 10g Crema de cacahuete 100% · 10g Chocolate 85%
Saladas: 37g Salsa de saté · 45g Salsa carbonara · 60g Salsa boloñesa
Regla de oro: si pones salsa o crema, ese plato NO lleva aceite ni aguacate.

📝 NOTAS DE ALIMENTOS
· Queso Arla Protein (lonchas): 34g prot/100g · Cottage: 12g prot/100g. Para la misma proteína necesitas casi el triple de cottage.
· Crema de cacahuete: usa la 100% (bote rojo). 10g = una cucharadita RASA. Pésala siempre.
· Salsa de saté: 37g trae 7g HC → resta 9g de arroz en seco de ese plato.
· Salsa boloñesa: 60g trae 5g HC → resta 6g de arroz. Con 50g no hace falta restar.
· Salsa carbonara: 45g, casi sin HC. Consumir en 3 días tras abrir.
· Chuletas de lomo: pesa solo la carne sin hueso, quita el borde de grasa.
· Sandía: 200g equivalen a tu ración de fruta.
· Pesos: todo en crudo y en seco. Pollo pierde ~35% al cocinarse.

🧂 SAL: no pasar de ~5g/día
· Sazonador Carmencita: 58,8g sal/100g · Soja: 12,5g sal/100g (máx 1 cuchara/comida) · Pavo fiambre: 1,8g/100g
Nunca añadas sal a un plato que ya lleve sazonador, soja, pavo o salsa.

💧 NEAT 12-15.000 pasos/día · Hidratación 3-5 L/día'
) RETURNING id;

-- Usaremos un DO block para capturar el ID generado y crear comidas y opciones
DO $$
DECLARE
  plan_id uuid;
  meal_id uuid;
BEGIN

  -- Obtener el ID del plan recién creado
  SELECT id INTO plan_id FROM diet_plans
    WHERE name = 'Plan 26.0 · RECOMP — Fran Villar'
    ORDER BY created_at DESC LIMIT 1;

  -- Meal: Desayuno (on)
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
    VALUES (plan_id, 'Desayuno', '🌅', 'on', 0)
    RETURNING id INTO meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción A · Elaborada — Tortitas / Bizcocho', '[{"label": "BASE", "slot": "proteina", "isChoice": false, "note": "Tortitas: bate y cocina en sartén antiadherente. Bizcocho: añade levadura, 6-10 min micro.", "items": ["125ml Claras de huevo + 1 Huevo entero (60g)"]}, {"label": "HIDRATO — elige uno", "slot": "hidrato", "isChoice": true, "note": "", "items": ["55g Harina/Copos de Avena", "75g Pan de Centeno o Espelta", "50g Pan tostado 100% integral"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "", "items": ["5g Aceite de Oliva V.E.", "30g Aguacate / Guacamole 95%", "10g Crema de cacahuete 100% ⭐", "10g Chocolate Negro 85%"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["120g Fruta (excepto plátano) · Opcional: 30g mermelada sin azúcar"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción B · Lácteo + Cereal', '[{"label": "BASE", "slot": "proteina", "isChoice": false, "note": "", "items": ["60g Huevo entero (cocido / revuelto / tortilla)"]}, {"label": "PROTEÍNA — elige uno", "slot": "proteina", "isChoice": true, "note": "", "items": ["1 Yogur s/lactosa o proteico + 10g ISO", "20g ISO + 200ml leche vegetal s/azúcar", "200g Yogur +Proteínas o Mousse Hacendado"]}, {"label": "CEREAL — elige uno", "slot": "hidrato", "isChoice": true, "note": "Puedes combinar la mitad de dos cereales.", "items": ["55g Copos de Avena / Avena Crunchy", "40g Corn Flakes s/azúcar", "40g Cereal Mix s/azúcar", "50g Weetabix 95% integral", "40g Rice Krispies Kellogg''s", "50g Muesli s/azúcar"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "", "items": ["5g Aceite de Oliva V.E.", "30g Aguacate / Guacamole 95%", "10g Crema de cacahuete 100% ⭐", "10g Chocolate Negro 85%"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["120g Fruta (excepto plátano)"]}]'::jsonb, 1);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción C · Pan + Proteína fría', '[{"label": "HIDRATO — elige uno", "slot": "hidrato", "isChoice": true, "note": "", "items": ["75g Pan de Centeno o Espelta", "50g Pan tostado 100% integral", "40g Tortas de arroz/maíz"]}, {"label": "BASE", "slot": "proteina", "isChoice": false, "note": "", "items": ["60g Huevo entero"]}, {"label": "PROTEÍNA — elige uno", "slot": "proteina", "isChoice": true, "note": "", "items": ["50g Lomo embuchado o pavo curado", "50g Queso Arla Protein (lonchas)", "150g Queso cottage", "60g Jamón serrano (sin grasa)", "1 lata Atún natural"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "", "items": ["5g Aceite de Oliva V.E.", "30g Aguacate / Guacamole 95%", "10g Crema de cacahuete 100% ⭐", "10g Chocolate Negro 85%"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["120g Fruta (excepto plátano)"]}]'::jsonb, 2);

  -- Meal: Desayuno (off)
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
    VALUES (plan_id, 'Desayuno', '🌅', 'off', 1)
    RETURNING id INTO meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción A · Elaborada — Tortitas / Bizcocho', '[{"label": "BASE", "slot": "proteina", "isChoice": false, "note": "Tortitas: bate y cocina en sartén antiadherente. Bizcocho: añade levadura, 6-10 min micro.", "items": ["125ml Claras de huevo + 1 Huevo entero (60g)"]}, {"label": "HIDRATO — elige uno", "slot": "hidrato", "isChoice": true, "note": "", "items": ["40g Harina/Copos de Avena", "55g Pan de Centeno o Espelta", "40g Pan tostado 100% integral"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "", "items": ["5g Aceite de Oliva V.E.", "30g Aguacate / Guacamole 95%", "10g Crema de cacahuete 100% ⭐", "10g Chocolate Negro 85%"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["100g Fruta o 100g frutos rojos · Opcional: 30g mermelada sin azúcar"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción B · Lácteo + Cereal', '[{"label": "BASE", "slot": "proteina", "isChoice": false, "note": "", "items": ["60g Huevo entero (cocido / revuelto / tortilla)"]}, {"label": "PROTEÍNA — elige uno", "slot": "proteina", "isChoice": true, "note": "", "items": ["1 Yogur s/lactosa o proteico + 10g ISO", "20g ISO + 200ml leche vegetal s/azúcar", "200g Yogur +Proteínas o Mousse Hacendado"]}, {"label": "CEREAL — elige uno", "slot": "hidrato", "isChoice": true, "note": "Puedes combinar la mitad de dos cereales.", "items": ["40g Copos de Avena / Avena Crunchy", "30g Corn Flakes s/azúcar", "30g Cereal Mix s/azúcar", "35g Weetabix 95% integral", "30g Rice Krispies Kellogg''s", "35g Muesli s/azúcar"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "", "items": ["5g Aceite de Oliva V.E.", "30g Aguacate / Guacamole 95%", "10g Crema de cacahuete 100% ⭐", "10g Chocolate Negro 85%"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["100g Fruta o 100g frutos rojos"]}]'::jsonb, 1);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción C · Pan + Proteína fría', '[{"label": "HIDRATO — elige uno", "slot": "hidrato", "isChoice": true, "note": "", "items": ["55g Pan de Centeno o Espelta", "40g Pan tostado 100% integral", "30g Tortas de arroz/maíz"]}, {"label": "BASE", "slot": "proteina", "isChoice": false, "note": "", "items": ["60g Huevo entero"]}, {"label": "PROTEÍNA — elige uno", "slot": "proteina", "isChoice": true, "note": "", "items": ["50g Lomo embuchado o pavo curado", "50g Queso Arla Protein (lonchas)", "150g Queso cottage", "60g Jamón serrano (sin grasa)", "1 lata Atún natural"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "", "items": ["5g Aceite de Oliva V.E.", "30g Aguacate / Guacamole 95%", "10g Crema de cacahuete 100% ⭐", "10g Chocolate Negro 85%"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["100g Fruta o 100g frutos rojos"]}]'::jsonb, 2);

  -- Meal: Almuerzo (both)
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
    VALUES (plan_id, 'Almuerzo', '☕', 'both', 2)
    RETURNING id INTO meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción A · Sándwich frío o a la plancha', '[{"label": "HIDRATO — elige uno", "slot": "hidrato", "isChoice": true, "note": "", "items": ["50g Pan tostado 100% integral", "80g Pan integral", "40g Tortas de arroz/maíz"]}, {"label": "PROTEÍNA + GRASA — elige una combinación", "slot": "proteina", "isChoice": true, "note": "⚠ Queso Arla: 34g prot/100g · Cottage: 12g prot/100g. NO son intercambiables gramo a gramo. Si prefieres aceite en vez de guac: 5g con cottage/atún, 3g con Arla, 2g con embuchado.", "items": ["75g Queso cottage + 50g Pavo fiambre → 30g Guac", "100g Queso cottage + 35g Pavo fiambre → 30g Guac", "60g Queso cottage + 60g Pavo fiambre → 30g Guac", "120g Queso cottage + 25g Pavo fiambre → 30g Guac", "1 lata Atún natural (80g) → 30g Guac", "90g Queso cottage + 20g Lomo embuchado → 25g Guac", "30g Queso Arla + 40g Pavo fiambre → 20g Guac", "40g Queso Arla + 30g Pavo fiambre → 20g Guac", "50g Queso Arla Protein (solo) → 15g Guac", "25g Queso Arla + 25g Lomo embuchado → 15g Guac", "60g Jamón serrano (sin grasa) → 15g Guac", "50g Lomo embuchado (solo) → 10g Guac"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["Tomate / pepino / pimiento a discreción"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción B · Ensalada de pasta fría (meal prep)', '[{"label": "HIDRATO", "slot": "hidrato", "isChoice": false, "note": "", "items": ["45g Pasta en seco (cocida y enfriada)"]}, {"label": "PROTEÍNA — elige una", "slot": "proteina", "isChoice": true, "note": "", "items": ["1 lata Atún al natural escurrido (80g)", "50g Queso Arla Protein en dados", "100g Pavo en tiras"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["Tomate cherry, pepino, cebolla, pimiento, maíz (30-40g)"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "Se prepara para 2-3 días. Aliña con vinagre, orégano y limón.", "items": ["5g Aceite de Oliva V.E.", "30g Aguacate / Guacamole 95%"]}]'::jsonb, 1);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción C · Bol de cottage salado (2 min, sin cocinar)', '[{"label": "HIDRATO", "slot": "hidrato", "isChoice": false, "note": "", "items": ["35g Tortas de arroz o maíz"]}, {"label": "PROTEÍNA", "slot": "proteina", "isChoice": false, "note": "", "items": ["75g Queso cottage + 50g Pavo fiambre"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["Tomate cherry, pepino, orégano, albahaca"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "Mezcla el cottage con el tomate y el orégano; las tortitas para mojar.", "items": ["30g Aguacate / Guacamole 95%", "5g Aceite de Oliva V.E."]}]'::jsonb, 2);

  -- Meal: Comida Principal (on)
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
    VALUES (plan_id, 'Comida Principal', '🍽️', 'on', 3)
    RETURNING id INTO meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción A · Proteína + Hidrato + Verdura', '[{"label": "PROTEÍNA — elige uno", "slot": "proteina", "isChoice": true, "note": "", "items": ["120g Pechuga de Pollo o Pavo", "130g Lomo de Cerdo / Chuleta (sin hueso)", "160g Merluza", "170g Lenguado / Lubina / Pescado blanco", "130g Ternera magra (picada o filetes)", "120g Atún a la plancha", "155g Carne picada / Hamburguesa pavo-pollo"]}, {"label": "HIDRATO — elige uno (en seco)", "slot": "hidrato", "isChoice": true, "note": "", "items": ["65g Arroz (todas variedades)", "70g Pasta (todas variedades)", "290g Patata", "245g Boniato Rojo", "155g Ñoquis de patata", "70g Cuscús (seco)", "75g Quinoa (seco)"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["250-400g Verdura o ensalada"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g Aceite de Oliva V.E.", "30g Aguacate / Guacamole 95%", "37g Salsa de saté (− 9g de arroz en seco)", "45g Salsa carbonara", "60g Salsa boloñesa (− 6g de arroz)"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["120g Fruta (excepto plátano)"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción B · Legumbre + Proteína', '[{"label": "LEGUMBRE", "slot": "hidrato", "isChoice": false, "note": "", "items": ["200g Legumbre cocida de bote (+50-75g si lleva verdura) · Guisantes congelados a igualdad de gramos"]}, {"label": "PROTEÍNA — elige uno", "slot": "proteina", "isChoice": true, "note": "", "items": ["85g Pollo / Pavo", "95g Lomo de Cerdo", "120g Merluza", "95g Ternera magra", "85g Atún natural"]}, {"label": "HC ADICIONAL", "slot": "hidrato", "isChoice": false, "note": "", "items": ["40g Arroz (seco)"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["100-400g Verdura variada"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g Aceite de Oliva V.E.", "30g Aguacate / Guacamole 95%", "37g Salsa de saté (− 9g de arroz en seco)", "45g Salsa carbonara", "60g Salsa boloñesa (− 6g de arroz)"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["120g Fruta (excepto plátano)"]}]'::jsonb, 1);

  -- Meal: Comida Principal (off)
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
    VALUES (plan_id, 'Comida Principal', '🍽️', 'off', 4)
    RETURNING id INTO meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción A · Proteína + Hidrato + Verdura', '[{"label": "PROTEÍNA — elige uno", "slot": "proteina", "isChoice": true, "note": "", "items": ["120g Pechuga de Pollo o Pavo", "130g Lomo de Cerdo / Chuleta (sin hueso)", "160g Merluza", "170g Lenguado / Lubina / Pescado blanco", "130g Ternera magra (picada o filetes)", "120g Atún a la plancha", "155g Carne picada / Hamburguesa pavo-pollo"]}, {"label": "HIDRATO — elige uno (en seco)", "slot": "hidrato", "isChoice": true, "note": "", "items": ["35g Arroz (todas variedades)", "40g Pasta (todas variedades)", "160g Patata", "135g Boniato Rojo", "85g Ñoquis de patata", "40g Cuscús (seco)", "45g Quinoa (seco)"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["300-400g Verdura o ensalada"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g Aceite de Oliva V.E.", "30g Aguacate / Guacamole 95%", "37g Salsa de saté (− 9g de arroz en seco)", "45g Salsa carbonara", "60g Salsa boloñesa (− 6g de arroz)"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["120g Fruta (excepto plátano)"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción B · Legumbre + Proteína', '[{"label": "LEGUMBRE", "slot": "hidrato", "isChoice": false, "note": "", "items": ["200g Legumbre cocida de bote (+50-75g si lleva verdura)"]}, {"label": "PROTEÍNA — elige uno", "slot": "proteina", "isChoice": true, "note": "", "items": ["85g Pollo / Pavo", "95g Lomo de Cerdo", "120g Merluza", "95g Ternera magra", "85g Atún natural"]}, {"label": "HC ADICIONAL", "slot": "hidrato", "isChoice": false, "note": "", "items": ["40g Arroz (seco)"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["100-400g Verdura variada"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g Aceite de Oliva V.E.", "30g Aguacate / Guacamole 95%", "37g Salsa de saté (− 9g de arroz en seco)", "45g Salsa carbonara", "60g Salsa boloñesa (− 6g de arroz)"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["120g Fruta (excepto plátano)"]}]'::jsonb, 1);

  -- Meal: Merienda (on)
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
    VALUES (plan_id, 'Merienda', '🫐', 'on', 5)
    RETURNING id INTO meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción A · Yogur / Lácteo + Cereal', '[{"label": "PROTEÍNA — elige uno", "slot": "proteina", "isChoice": true, "note": "", "items": ["150g Yogur +Proteínas Hacendado + 12g ISO", "125g Queso batido desnatado + 12g ISO", "150g Yogur Griego Ligero + 12g ISO", "250g Yogur proteico o queso batido (sin ISO)"]}, {"label": "CEREAL — elige uno", "slot": "hidrato", "isChoice": true, "note": "Puedes combinar la mitad de dos cereales.", "items": ["40g Copos de Avena / Avena Crunchy", "30g Corn Flakes s/azúcar", "30g Cereal Mix s/azúcar", "35g Weetabix 95% integral", "30g Rice Krispies Kellogg''s", "35g Muesli s/azúcar"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["70g Plátano"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción B · ISO + Leche + Cereal', '[{"label": "PROTEÍNA", "slot": "proteina", "isChoice": false, "note": "", "items": ["25g ISO + 300ml Leche de almendra s/azúcar"]}, {"label": "CEREAL — elige uno", "slot": "hidrato", "isChoice": true, "note": "", "items": ["30g Crema de Arroz / Papilla s/azúcar", "40g Copos de Avena / Avena Crunchy", "30g Corn Flakes s/azúcar", "30g Cereal Mix s/azúcar", "35g Weetabix 95% integral", "30g Rice Krispies Kellogg''s", "35g Muesli s/azúcar"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["70g Plátano"]}]'::jsonb, 1);

  -- Meal: Merienda (off)
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
    VALUES (plan_id, 'Merienda', '🫐', 'off', 6)
    RETURNING id INTO meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción A · Yogur / Lácteo', '[{"label": "PROTEÍNA — elige uno", "slot": "proteina", "isChoice": true, "note": "Sin cereal en día OFF", "items": ["180g Yogur +Proteínas Hacendado + 15g ISO", "125g Queso batido desnatado + 15g ISO", "150g Yogur Griego Ligero + 15g ISO", "250g Yogur proteico o queso batido (sin ISO)"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["100g Frutos rojos o 50g Arándanos"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción B · ISO + Leche', '[{"label": "PROTEÍNA", "slot": "proteina", "isChoice": false, "note": "Sin cereal en día OFF", "items": ["25g ISO + 300ml Leche de almendra s/azúcar"]}, {"label": "FRUTA", "slot": "extra", "isChoice": false, "note": "", "items": ["100g Frutos rojos o 50g Arándanos"]}]'::jsonb, 1);

  -- Meal: Cena (on)
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
    VALUES (plan_id, 'Cena', '🌙', 'on', 7)
    RETURNING id INTO meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción A · Pescado/Carne + Hidrato + Verdura', '[{"label": "PROTEÍNA — elige uno", "slot": "proteina", "isChoice": true, "note": "", "items": ["120g Pechuga de Pollo o Pavo", "130g Lomo de Cerdo / Chuleta (sin hueso)", "160g Merluza", "170g Lenguado / Lubina / Pescado blanco", "130g Ternera magra (picada o filetes)", "120g Atún a la plancha", "155g Carne picada / Hamburguesa pavo-pollo"]}, {"label": "HIDRATO — elige uno (en seco)", "slot": "hidrato", "isChoice": true, "note": "", "items": ["65g Arroz (todas variedades)", "70g Pasta (todas variedades)", "290g Patata", "245g Boniato Rojo", "155g Ñoquis de patata", "70g Cuscús (seco)", "75g Quinoa (seco)"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["250-400g Verdura o ensalada"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g Aceite de Oliva V.E.", "30g Aguacate / Guacamole 95%", "37g Salsa de saté (− 9g de arroz en seco)", "45g Salsa carbonara", "60g Salsa boloñesa (− 6g de arroz)"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción B · Cena ligera + Legumbre', '[{"label": "LEGUMBRE", "slot": "hidrato", "isChoice": false, "note": "", "items": ["200g Legumbre cocida de bote"]}, {"label": "PROTEÍNA — elige uno", "slot": "proteina", "isChoice": true, "note": "", "items": ["85g Pollo / Pavo", "95g Lomo de Cerdo", "120g Merluza", "85g Atún natural"]}, {"label": "HC ADICIONAL", "slot": "hidrato", "isChoice": false, "note": "", "items": ["40g Arroz (seco)"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["100-400g Verdura variada"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g Aceite de Oliva V.E.", "30g Aguacate / Guacamole 95%", "37g Salsa de saté (− 9g de arroz en seco)", "45g Salsa carbonara", "60g Salsa boloñesa (− 6g de arroz)"]}]'::jsonb, 1);

  -- Meal: Cena (off)
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
    VALUES (plan_id, 'Cena', '🌙', 'off', 8)
    RETURNING id INTO meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción A · Pescado/Carne + Hidrato + Verdura', '[{"label": "PROTEÍNA — elige uno", "slot": "proteina", "isChoice": true, "note": "", "items": ["120g Pechuga de Pollo o Pavo", "130g Lomo de Cerdo / Chuleta (sin hueso)", "160g Merluza", "170g Lenguado / Lubina / Pescado blanco", "130g Ternera magra (picada o filetes)", "120g Atún a la plancha", "155g Carne picada / Hamburguesa pavo-pollo"]}, {"label": "HIDRATO — elige uno (en seco)", "slot": "hidrato", "isChoice": true, "note": "", "items": ["65g Arroz (todas variedades)", "70g Pasta (todas variedades)", "290g Patata", "245g Boniato Rojo", "155g Ñoquis de patata", "70g Cuscús (seco)", "75g Quinoa (seco)"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["300-400g Verdura o ensalada"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g Aceite de Oliva V.E.", "30g Aguacate / Guacamole 95%", "37g Salsa de saté (− 9g de arroz en seco)", "45g Salsa carbonara", "60g Salsa boloñesa (− 6g de arroz)"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
    VALUES (meal_id, 'Opción B · Cena ligera + Legumbre', '[{"label": "LEGUMBRE", "slot": "hidrato", "isChoice": false, "note": "", "items": ["200g Legumbre cocida de bote"]}, {"label": "PROTEÍNA — elige uno", "slot": "proteina", "isChoice": true, "note": "", "items": ["85g Pollo / Pavo", "95g Lomo de Cerdo", "120g Merluza", "85g Atún natural"]}, {"label": "HC ADICIONAL", "slot": "hidrato", "isChoice": false, "note": "", "items": ["40g Arroz (seco)"]}, {"label": "VERDURA LIBRE", "slot": "verdura", "isChoice": false, "note": "", "items": ["100-400g Verdura variada"]}, {"label": "GRASA — elige una", "slot": "grasa", "isChoice": true, "note": "La salsa ES la grasa: ese plato NO lleva aceite ni aguacate.", "items": ["5g Aceite de Oliva V.E.", "30g Aguacate / Guacamole 95%", "37g Salsa de saté (− 9g de arroz en seco)", "45g Salsa carbonara", "60g Salsa boloñesa (− 6g de arroz)"]}]'::jsonb, 1);


  -- Desasignar dieta actual de franvyother y asignar la nueva
  UPDATE diet_assignments SET active = false
    WHERE client_id = (SELECT id FROM profiles WHERE full_name ILIKE '%franvyother%' OR full_name ILIKE '%franvyother%' LIMIT 1);

  INSERT INTO diet_assignments (plan_id, client_id, active)
    SELECT plan_id, p.id, true
    FROM profiles p
    WHERE p.full_name ILIKE '%franvyother%' OR p.email ILIKE '%franvyother%'
    LIMIT 1
    ON CONFLICT (client_id, plan_id) DO UPDATE SET active = true;

END $$;

-- Verificar resultado
SELECT dp.name, dp.kcal_on, dp.kcal_off, da.active
FROM diet_plans dp
JOIN diet_assignments da ON da.plan_id = dp.id
JOIN profiles p ON p.id = da.client_id
WHERE p.full_name ILIKE '%franvyother%' OR p.email ILIKE '%franvyother%'
ORDER BY da.active DESC;

-- Diagnóstico: comprobar si existen logs de mayo
SELECT DATE(logged_at) as dia, COUNT(*) as series
FROM set_logs sl
JOIN profiles p ON p.id = sl.client_id
WHERE (p.full_name ILIKE '%franvyother%' OR p.email ILIKE '%franvyother%')
  AND logged_at >= '2026-05-01' AND logged_at < '2026-06-01'
GROUP BY DATE(logged_at) ORDER BY dia;

COMMIT;