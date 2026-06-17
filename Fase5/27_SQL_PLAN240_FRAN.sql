-- ============================================================
-- 27_SQL_PLAN240_FRAN.sql
-- Inserta el Plan Nutricional 24.0 de Fran Villar como dieta
-- activa del usuario franvyother.
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

DO $$
DECLARE
  v_client_id UUID;
  v_plan_id   BIGINT;
  v_meal_id   BIGINT;
BEGIN

  -- Buscar franvyother por nombre o email
  SELECT id INTO v_client_id FROM profiles
  WHERE full_name ILIKE '%fran%' OR email ILIKE '%franvy%'
  ORDER BY created_at LIMIT 1;

  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró el perfil de franvyother';
  END IF;

  -- Desactivar todas las asignaciones previas (pasan a historial)
  UPDATE diet_assignments SET active = false WHERE client_id = v_client_id;

  -- ── Crear el plan ───────────────────────────────────────────────
  INSERT INTO diet_plans (name, kcal_on, kcal_off, protein_on, carbs_on, fat_on,
                          protein_off, carbs_off, fat_off, notes)
  VALUES (
    'Plan 24.0 — Fran Villar',
    2310, 2003,
    137, 359.5, 36,
    132.5, 276, 41,
    'NEAT: 12.000 pasos DÍA ON / 15.000 pasos DÍA OFF.' || chr(10) ||
    'Preentreno: 1 café solo o 1 cápsula de cafeína (solo si lo necesitas).' || chr(10) ||
    'Intraentreno: 1,5 litros de agua.' || chr(10) ||
    'Pesa siempre los alimentos en seco, antes de cocinar.' || chr(10) ||
    'Hidratación: 3-5 litros de agua al día.' || chr(10) ||
    'Puedes usar especias y salsas bajas en calorías (<100 kcal/100g).'
  ) RETURNING id INTO v_plan_id;

  -- ── Comida 1 — Desayuno (ON) ─────────────────────────
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  VALUES (v_plan_id, 'Comida 1 — Desayuno', '🌅', 'on', 0)
  RETURNING id INTO v_meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Elaborada — Tortitas / Bizcocho', '[{"label": "Base", "isChoice": false, "items": ["125ml Claras de huevo + 1 Huevo entero"], "note": "Para tortitas: bátelo todo y cocina en sartén engrasada. Para bizcocho: añade levadura y pon 6-10 min en el micro a máxima potencia."}, {"label": "Hidratos a elegir", "isChoice": true, "items": [{"ingId": "harina_avena", "grams": 80}, {"ingId": "avena_copos", "grams": 80}, "100g Pan de Centeno o Espelta", {"ingId": "pan_tostado", "grams": 80}]}, {"label": "Grasa a elegir", "isChoice": true, "items": [{"ingId": "aceite_coco", "grams": 5}, {"ingId": "chocolate85", "grams": 10}, {"ingId": "aceite_oliva", "grams": 5}]}, {"label": "Fruta", "isChoice": false, "items": ["100-150g Fruta variada (excepto plátano)"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Opción 1 — Lácteo + Cereal', '[{"label": "Base", "isChoice": false, "items": [{"ingId": "huevo", "grams": 60}]}, {"label": "Proteína a elegir", "isChoice": true, "items": ["1 Yogur Sin Lactosa o Proteico + 10g ISO", "20g Proteína ISO + 200ml Leche vegetal sin azúcar", "200g Yogur +Proteínas de sabor o Mousse Proteico Hacendado"]}, {"label": "Cereales a elegir", "isChoice": true, "items": [{"ingId": "corn_flakes", "grams": 60}, {"ingId": "copos_trigo", "grams": 60}, {"ingId": "rice_krispies", "grams": 60}, {"ingId": "choco_zero", "grams": 60}, {"ingId": "cereal_mix", "grams": 60}, {"ingId": "weetabix", "grams": 60}, "60g Tortas de arroz o maíz  ó  80g Pan tostado 100% integral", "140g Churros congelados (airfryer u horno)", {"ingId": "avena_crunchy", "grams": 80}, {"ingId": "avena_copos", "grams": 80}]}, {"label": "Grasa a elegir", "isChoice": true, "items": [{"ingId": "aceite_coco", "grams": 5}, {"ingId": "chocolate85", "grams": 10}, {"ingId": "aceite_oliva", "grams": 5}]}, {"label": "Fruta", "isChoice": false, "items": ["100-150g Fruta variada (excepto plátano)"]}]'::jsonb, 1);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Opción 2 — Pan + Proteína fría', '[{"label": "Hidratos a elegir", "isChoice": true, "items": ["100g Pan de Centeno o Espelta (molde o normal preferiblemente)", {"ingId": "pan_tostado", "grams": 80}, "60g Tortas de arroz o maíz"]}, {"label": "Base", "isChoice": false, "items": [{"ingId": "huevo", "grams": 60}]}, {"label": "Proteína a elegir", "isChoice": true, "items": [{"ingId": "lomo_embuchado", "grams": 35}, "100g Queso fresco desnatado + 30g Fiambre pechuga pavo", {"ingId": "qso_fresco", "grams": 150}, {"ingId": "jamon", "grams": 60}, {"ingId": "atun_lata", "grams": 80}, "60ml Claras de huevo + ½ de la ración de otra opción"]}, {"label": "Grasa a elegir", "isChoice": true, "items": [{"ingId": "aceite_coco", "grams": 5}, {"ingId": "chocolate85", "grams": 10}, {"ingId": "aceite_oliva", "grams": 5}]}, {"label": "Fruta", "isChoice": false, "items": ["100-150g Fruta variada (excepto plátano)"]}]'::jsonb, 2);

  -- ── Comida 1 — Desayuno (OFF) ─────────────────────────
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  VALUES (v_plan_id, 'Comida 1 — Desayuno', '🌅', 'off', 1)
  RETURNING id INTO v_meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Elaborada — Tortitas / Bizcocho', '[{"label": "Base", "isChoice": false, "items": ["125ml Claras de huevo + 1 Huevo entero"], "note": "Para tortitas: bátelo todo y cocina en sartén engrasada. Para bizcocho: añade levadura y pon 6-10 min en el micro a máxima potencia."}, {"label": "Hidratos a elegir", "isChoice": true, "items": [{"ingId": "harina_avena", "grams": 60}, {"ingId": "avena_copos", "grams": 60}, "80g Pan de Centeno o Espelta", {"ingId": "pan_tostado", "grams": 60}]}, {"label": "Grasa a elegir", "isChoice": true, "items": [{"ingId": "aceite_coco", "grams": 5}, {"ingId": "chocolate85", "grams": 10}, {"ingId": "aceite_oliva", "grams": 5}]}, {"label": "Fruta", "isChoice": false, "items": ["100-150g Fruta variada (excepto plátano)"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Opción 1 — Lácteo + Cereal', '[{"label": "Base", "isChoice": false, "items": [{"ingId": "huevo", "grams": 60}]}, {"label": "Proteína a elegir", "isChoice": true, "items": ["1 Yogur Sin Lactosa o Proteico + 10g ISO", "20g Proteína ISO + 200ml Leche vegetal sin azúcar", "200g Yogur +Proteínas de sabor o Mousse Proteico Hacendado"]}, {"label": "Cereales a elegir", "isChoice": true, "items": [{"ingId": "corn_flakes", "grams": 50}, {"ingId": "copos_trigo", "grams": 50}, {"ingId": "rice_krispies", "grams": 50}, {"ingId": "choco_zero", "grams": 50}, {"ingId": "cereal_mix", "grams": 50}, {"ingId": "weetabix", "grams": 50}, "50g Tortas de arroz o maíz  ó  70g Pan tostado 100% integral", "140g Churros congelados (airfryer u horno)", {"ingId": "avena_crunchy", "grams": 60}, {"ingId": "avena_copos", "grams": 60}]}, {"label": "Grasa a elegir", "isChoice": true, "items": [{"ingId": "aceite_coco", "grams": 5}, {"ingId": "chocolate85", "grams": 10}, {"ingId": "aceite_oliva", "grams": 5}]}, {"label": "Fruta", "isChoice": false, "items": ["50g Arándanos congelados  ó  100g Frutos rojos  ó  100g Fresas o Frambuesas"]}]'::jsonb, 1);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Opción 2 — Pan + Proteína fría', '[{"label": "Hidratos a elegir", "isChoice": true, "items": ["80g Pan de Centeno o Espelta (molde o normal preferiblemente)", {"ingId": "pan_tostado", "grams": 70}, "50g Tortas de arroz o maíz"]}, {"label": "Base", "isChoice": false, "items": [{"ingId": "huevo", "grams": 60}]}, {"label": "Proteína a elegir", "isChoice": true, "items": [{"ingId": "lomo_embuchado", "grams": 35}, "100g Queso fresco desnatado + 30g Fiambre pechuga pavo", {"ingId": "qso_fresco", "grams": 150}, {"ingId": "jamon", "grams": 60}, {"ingId": "atun_lata", "grams": 80}, "60ml Claras de huevo + ½ de la ración de otra opción"]}, {"label": "Grasa a elegir", "isChoice": true, "items": [{"ingId": "aceite_coco", "grams": 5}, {"ingId": "chocolate85", "grams": 10}, {"ingId": "aceite_oliva", "grams": 5}]}, {"label": "Fruta", "isChoice": false, "items": ["50g Arándanos congelados  ó  100g Frutos rojos  ó  100g Fresas o Frambuesas"]}]'::jsonb, 2);

  -- ── Comida 2 — Almuerzo (ON) ─────────────────────────
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  VALUES (v_plan_id, 'Comida 2 — Almuerzo', '☕', 'on', 2)
  RETURNING id INTO v_meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Pan + Proteína fría', '[{"label": "Hidratos a elegir", "isChoice": true, "items": ["125g Pan integral  ó  100g Pan tostado 100% integral", {"ingId": "tortas_arroz", "grams": 75}, {"ingId": "tortas_maiz", "grams": 75}]}, {"label": "Proteína a elegir", "isChoice": true, "items": [{"ingId": "lomo_embuchado", "grams": 50}, "100g Queso fresco desnatado + 60g Fiambre pechuga pavo", {"ingId": "qso_fresco", "grams": 250}, "100g Queso fresco desnatado + 30g Lomo embuchado", {"ingId": "jamon", "grams": 70}, {"ingId": "atun_lata", "grams": 90}, "100ml Claras de huevo + ½ de la ración de otra opción"]}, {"label": "Grasa", "isChoice": false, "items": [{"ingId": "aceite_oliva", "grams": 5}], "note": "Si comes pan añade tomate rallado para que no quede seco."}]'::jsonb, 0);

  -- ── Comida 2 — Almuerzo (OFF) ─────────────────────────
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  VALUES (v_plan_id, 'Comida 2 — Almuerzo', '☕', 'off', 3)
  RETURNING id INTO v_meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Pan + Proteína fría', '[{"label": "Hidratos a elegir", "isChoice": true, "items": ["80g Pan integral  ó  70g Pan tostado 100% integral", {"ingId": "tortas_arroz", "grams": 50}, {"ingId": "tortas_maiz", "grams": 50}]}, {"label": "Proteína a elegir", "isChoice": true, "items": [{"ingId": "lomo_embuchado", "grams": 50}, "100g Queso fresco desnatado + 60g Fiambre pechuga pavo", {"ingId": "qso_fresco", "grams": 250}, "100g Queso fresco desnatado + 30g Lomo embuchado", {"ingId": "jamon", "grams": 70}, {"ingId": "atun_lata", "grams": 90}, "100ml Claras de huevo + ½ de la ración de otra opción"]}, {"label": "Grasa", "isChoice": false, "items": [{"ingId": "aceite_oliva", "grams": 5}], "note": "Si comes pan añade tomate rallado para que no quede seco."}]'::jsonb, 0);

  -- ── Comida 3 — Comida principal (ON) ─────────────────────────
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  VALUES (v_plan_id, 'Comida 3 — Comida principal', '🍽️', 'on', 4)
  RETURNING id INTO v_meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Carne / Pescado + Hidratos', '[{"label": "Proteína a elegir", "isChoice": true, "items": [{"ingId": "pollo", "grams": 100}, {"ingId": "pavo", "grams": 100}, {"ingId": "lomo_cerdo", "grams": 100}, {"ingId": "merluza", "grams": 140}, {"ingId": "lenguado", "grams": 110}, {"ingId": "lubina", "grams": 110}, {"ingId": "ternera", "grams": 100}, {"ingId": "picada_pollo", "grams": 100}, {"ingId": "hamburguesa", "grams": 100}, "100g Atún a la plancha", "100g Salchichas de pollo tipo embutido Hacendado"]}, {"label": "Hidratos a elegir", "isChoice": true, "items": [{"ingId": "pasta", "grams": 75}, {"ingId": "pasta_integral", "grams": 75}, {"ingId": "arroz", "grams": 75}, {"ingId": "arroz_int", "grams": 75}, {"ingId": "patata", "grams": 300}, {"ingId": "boniato_rojo", "grams": 240}, {"ingId": "noquis", "grams": 150}, {"ingId": "cuscus", "grams": 90}, {"ingId": "noodles_arroz", "grams": 75}, {"ingId": "arroz_3del", "grams": 300}, {"ingId": "fajitas", "grams": 120}], "note": "Si eliges fajitas no añadas aceite."}, {"label": "Verdura libre", "isChoice": false, "items": ["100-400g Verdura variada (brócoli, judía verde, champiñones, espárragos, pimientos…) o ensalada"]}, {"label": "Grasa a elegir", "isChoice": true, "items": [{"ingId": "aceite_oliva", "grams": 5}, {"ingId": "aguacate", "grams": 30}, {"ingId": "guacamole", "grams": 30}]}, {"label": "Fruta", "isChoice": false, "items": ["100-150g Fruta (excepto plátano)"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Legumbre + Carne / Pescado', '[{"label": "Legumbre", "isChoice": false, "items": ["400g Legumbre cocida de bote (la que prefieras — si lleva verdura añade 50-75g extra)"], "note": "Puedes usar guisantes congelados como sustituto a igualdad de gramos."}, {"label": "Proteína a elegir", "isChoice": true, "items": [{"ingId": "pollo", "grams": 75}, {"ingId": "pavo", "grams": 75}, {"ingId": "lomo_cerdo", "grams": 75}, {"ingId": "merluza", "grams": 110}, {"ingId": "lenguado", "grams": 90}, {"ingId": "lubina", "grams": 90}, {"ingId": "ternera", "grams": 75}, {"ingId": "atun_lata", "grams": 75}, {"ingId": "picada_pollo", "grams": 75}]}, {"label": "HC adicional a elegir", "isChoice": true, "items": ["50g Arroz (en seco) + 200g Legumbre cocida de bote", "50g Arroz (en seco) + 200g Alubias con tomate Heinz"]}, {"label": "Verdura libre", "isChoice": false, "items": ["100-400g Verdura variada libre"]}, {"label": "Grasa a elegir", "isChoice": true, "items": [{"ingId": "aceite_oliva", "grams": 5}, {"ingId": "aguacate", "grams": 30}, {"ingId": "guacamole", "grams": 30}]}, {"label": "Fruta", "isChoice": false, "items": ["100-150g Fruta (excepto plátano)"]}]'::jsonb, 1);

  -- ── Comida 3 — Comida principal (OFF) ─────────────────────────
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  VALUES (v_plan_id, 'Comida 3 — Comida principal', '🍽️', 'off', 5)
  RETURNING id INTO v_meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Carne / Pescado + Hidratos', '[{"label": "Proteína a elegir", "isChoice": true, "items": [{"ingId": "pollo", "grams": 100}, {"ingId": "pavo", "grams": 100}, {"ingId": "lomo_cerdo", "grams": 100}, {"ingId": "merluza", "grams": 140}, {"ingId": "lenguado", "grams": 110}, {"ingId": "lubina", "grams": 110}, {"ingId": "ternera", "grams": 100}, {"ingId": "picada_pollo", "grams": 100}, {"ingId": "hamburguesa", "grams": 100}]}, {"label": "Hidratos a elegir", "isChoice": true, "items": [{"ingId": "pasta", "grams": 50}, {"ingId": "pasta_integral", "grams": 50}, {"ingId": "arroz", "grams": 50}, {"ingId": "arroz_int", "grams": 50}, {"ingId": "patata", "grams": 200}, {"ingId": "boniato_rojo", "grams": 160}, {"ingId": "noquis", "grams": 100}, {"ingId": "cuscus", "grams": 60}, {"ingId": "noodles_arroz", "grams": 50}, {"ingId": "arroz_3del", "grams": 200}, {"ingId": "fajitas", "grams": 80}], "note": "Si eliges fajitas no añadas aceite."}, {"label": "Verdura libre", "isChoice": false, "items": ["100-400g Verdura variada libre o ensalada"]}, {"label": "Grasa a elegir", "isChoice": true, "items": [{"ingId": "aceite_oliva", "grams": 5}, {"ingId": "aguacate", "grams": 30}, {"ingId": "guacamole", "grams": 30}]}, {"label": "Fruta", "isChoice": false, "items": ["100-150g Fruta (excepto plátano)"]}]'::jsonb, 0);

  -- ── Comida 4 — Merienda (ON) ─────────────────────────
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  VALUES (v_plan_id, 'Comida 4 — Merienda', '🫐', 'on', 6)
  RETURNING id INTO v_meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Opción 1 — Yogur / Lácteo + Cereal', '[{"label": "Proteína a elegir", "isChoice": true, "items": ["100g Yogur +Proteínas Hacendado + 15g Proteína ISO", "125g Queso fresco batido desnatado + 15g Proteína ISO", "150g Yogur Griego Ligero Natural + 15g Proteína ISO", "250g Yogur Proteico o Queso fresco batido desnatado (sin ISO)"]}, {"label": "Cereales a elegir", "isChoice": true, "items": [{"ingId": "avena_crunchy", "grams": 100}, {"ingId": "avena_copos", "grams": 100}, {"ingId": "corn_flakes", "grams": 75}, {"ingId": "copos_trigo", "grams": 75}, {"ingId": "cereal_mix", "grams": 75}, {"ingId": "weetabix", "grams": 75}, {"ingId": "rice_krispies", "grams": 75}], "note": "Puedes combinar la mitad de dos opciones distintas."}, {"label": "Fruta", "isChoice": false, "items": [{"ingId": "platano", "grams": 100}]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Opción 2 — ISO + Leche + Cereal', '[{"label": "Proteína", "isChoice": false, "items": ["25g Proteína ISO + 300ml Leche de almendra sin azúcar añadido"]}, {"label": "Cereales a elegir", "isChoice": true, "items": [{"ingId": "crema_arroz", "grams": 75}, {"ingId": "corn_flakes", "grams": 75}, {"ingId": "copos_trigo", "grams": 75}, {"ingId": "cereal_mix", "grams": 75}, {"ingId": "weetabix", "grams": 75}, {"ingId": "rice_krispies", "grams": 75}, {"ingId": "avena_crunchy", "grams": 100}, {"ingId": "avena_copos", "grams": 100}], "note": "Puedes combinar la mitad de dos opciones distintas."}, {"label": "Fruta", "isChoice": false, "items": [{"ingId": "platano", "grams": 100}]}]'::jsonb, 1);

  -- ── Comida 4 — Merienda (OFF) ─────────────────────────
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  VALUES (v_plan_id, 'Comida 4 — Merienda', '🫐', 'off', 7)
  RETURNING id INTO v_meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Opción 1 — Yogur / Lácteo + Cereal', '[{"label": "Proteína a elegir", "isChoice": true, "items": ["100g Yogur +Proteínas Hacendado + 15g Proteína ISO", "125g Queso fresco batido desnatado + 15g Proteína ISO", "150g Yogur Griego Ligero Natural + 15g Proteína ISO"]}, {"label": "Cereales a elegir", "isChoice": true, "items": [{"ingId": "avena_crunchy", "grams": 60}, {"ingId": "avena_copos", "grams": 60}, {"ingId": "corn_flakes", "grams": 50}, {"ingId": "copos_trigo", "grams": 50}, {"ingId": "cereal_mix", "grams": 50}, {"ingId": "weetabix", "grams": 50}, {"ingId": "rice_krispies", "grams": 50}]}, {"label": "Fruta", "isChoice": false, "items": ["50g Arándanos congelados  ó  100g Frutos rojos"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Opción 2 — ISO + Leche + Cereal', '[{"label": "Proteína", "isChoice": false, "items": ["25g Proteína ISO + 300ml Leche de almendra sin azúcar añadido"]}, {"label": "Cereales a elegir", "isChoice": true, "items": [{"ingId": "crema_arroz", "grams": 50}, {"ingId": "corn_flakes", "grams": 50}, {"ingId": "copos_trigo", "grams": 50}, {"ingId": "cereal_mix", "grams": 50}, {"ingId": "weetabix", "grams": 50}, {"ingId": "rice_krispies", "grams": 50}, {"ingId": "avena_crunchy", "grams": 60}, {"ingId": "avena_copos", "grams": 60}]}, {"label": "Fruta", "isChoice": false, "items": ["50g Arándanos congelados  ó  100g Frutos rojos"]}]'::jsonb, 1);

  -- ── Comida 5 — Cena (ON) ─────────────────────────
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  VALUES (v_plan_id, 'Comida 5 — Cena', '🌙', 'on', 8)
  RETURNING id INTO v_meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Carne / Pescado + Hidratos', '[{"label": "Proteína a elegir", "isChoice": true, "items": [{"ingId": "pollo", "grams": 100}, {"ingId": "pavo", "grams": 100}, {"ingId": "lomo_cerdo", "grams": 100}, {"ingId": "merluza", "grams": 140}, {"ingId": "lenguado", "grams": 110}, {"ingId": "lubina", "grams": 110}, {"ingId": "ternera", "grams": 100}, "100g Carne picada pollo/pavo o Hamburguesas", "150g Salchichas de pavo 3% MG Hacendado"]}, {"label": "Hidratos a elegir", "isChoice": true, "items": [{"ingId": "pasta", "grams": 75}, {"ingId": "pasta_integral", "grams": 75}, {"ingId": "arroz", "grams": 75}, {"ingId": "arroz_int", "grams": 75}, {"ingId": "patata", "grams": 300}, {"ingId": "boniato_rojo", "grams": 240}, {"ingId": "noquis", "grams": 150}, {"ingId": "cuscus", "grams": 90}, {"ingId": "noodles_arroz", "grams": 75}, {"ingId": "arroz_3del", "grams": 300}, {"ingId": "fajitas", "grams": 120}], "note": "Si eliges fajitas no añadas aceite."}, {"label": "Verdura libre", "isChoice": false, "items": ["100-400g Verdura variada libre o ensalada"]}, {"label": "Grasa a elegir", "isChoice": true, "items": [{"ingId": "aceite_oliva", "grams": 5}, {"ingId": "aguacate", "grams": 30}, {"ingId": "guacamole", "grams": 30}]}, {"label": "Fruta", "isChoice": false, "items": ["100-150g Fruta (excepto plátano)"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Legumbre + Carne / Pescado', '[{"label": "Legumbre", "isChoice": false, "items": ["400g Legumbre cocida de bote (si lleva verdura añade 50-75g extra)"]}, {"label": "Proteína a elegir", "isChoice": true, "items": [{"ingId": "pollo", "grams": 75}, {"ingId": "lomo_cerdo", "grams": 75}, {"ingId": "merluza", "grams": 110}, {"ingId": "lenguado", "grams": 90}, {"ingId": "ternera", "grams": 75}, {"ingId": "atun_lata", "grams": 75}, {"ingId": "picada_pollo", "grams": 75}, "125g Salchichas pavo 3% MG Hacendado"]}, {"label": "HC adicional a elegir", "isChoice": true, "items": ["50g Arroz (en seco) + 200g Legumbre cocida de bote", "50g Arroz (en seco) + 200g Alubias con tomate Heinz"]}, {"label": "Verdura libre", "isChoice": false, "items": ["100-400g Verdura variada libre"]}, {"label": "Grasa a elegir", "isChoice": true, "items": [{"ingId": "aceite_oliva", "grams": 5}, {"ingId": "aguacate", "grams": 30}]}, {"label": "Fruta", "isChoice": false, "items": ["100-150g Fruta (excepto plátano)"]}]'::jsonb, 1);

  -- ── Comida 5 — Cena (OFF) ─────────────────────────
  INSERT INTO diet_meals (plan_id, name, emoji, day_type, sort_order)
  VALUES (v_plan_id, 'Comida 5 — Cena', '🌙', 'off', 9)
  RETURNING id INTO v_meal_id;

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Carne / Pescado + Hidratos', '[{"label": "Proteína a elegir", "isChoice": true, "items": [{"ingId": "pollo", "grams": 100}, {"ingId": "pavo", "grams": 100}, {"ingId": "lomo_cerdo", "grams": 100}, {"ingId": "merluza", "grams": 140}, {"ingId": "lenguado", "grams": 110}, {"ingId": "lubina", "grams": 110}, {"ingId": "ternera", "grams": 100}, "100g Carne picada pollo/pavo o Hamburguesas"]}, {"label": "Hidratos a elegir", "isChoice": true, "items": [{"ingId": "pasta", "grams": 75}, {"ingId": "pasta_integral", "grams": 75}, {"ingId": "arroz", "grams": 75}, {"ingId": "arroz_int", "grams": 75}, {"ingId": "patata", "grams": 300}, {"ingId": "boniato_rojo", "grams": 240}, {"ingId": "noquis", "grams": 150}, {"ingId": "cuscus", "grams": 90}, {"ingId": "noodles_arroz", "grams": 75}, {"ingId": "arroz_3del", "grams": 300}, {"ingId": "fajitas", "grams": 120}]}, {"label": "Verdura libre", "isChoice": false, "items": ["100-400g Verdura variada libre o ensalada"]}, {"label": "Grasa", "isChoice": false, "items": ["7ml Aceite de oliva + 30g Aguacate  ó  10g Chocolate negro 85%"]}, {"label": "Fruta", "isChoice": false, "items": ["100-150g Fruta (excepto plátano)"]}]'::jsonb, 0);

  INSERT INTO diet_options (meal_id, name, content, sort_order)
  VALUES (v_meal_id, 'Cena ligera + Legumbre', '[{"label": "Hidratos a elegir", "isChoice": true, "items": ["25g Tortas de arroz o maíz", {"ingId": "patata", "grams": 100}, {"ingId": "pan_integral_pan", "grams": 40}]}, {"label": "Proteína a elegir", "isChoice": true, "items": [{"ingId": "pollo", "grams": 75}, {"ingId": "lomo_cerdo", "grams": 75}, {"ingId": "merluza", "grams": 110}, {"ingId": "lenguado", "grams": 90}, {"ingId": "ternera", "grams": 75}, {"ingId": "atun_lata", "grams": 75}, {"ingId": "picada_pollo", "grams": 75}, "125g Salchichas pavo 3% MG Hacendado"]}, {"label": "HC adicional a elegir", "isChoice": true, "items": ["50g Arroz (en seco) + 200g Legumbre cocida de bote", "50g Arroz (en seco) + 200g Alubias con tomate Heinz"]}, {"label": "Verdura libre", "isChoice": false, "items": ["100-400g Verdura variada libre"]}, {"label": "Grasa", "isChoice": false, "items": [{"ingId": "aceite_oliva", "grams": 5}, {"ingId": "aguacate", "grams": 40}]}, {"label": "Fruta", "isChoice": false, "items": ["100-150g Fruta (excepto plátano)"]}]'::jsonb, 1);

  -- ── Asignar el plan a franvyother como activo ──────────────────
  INSERT INTO diet_assignments (client_id, plan_id, active, source)
  VALUES (v_client_id, v_plan_id, true, 'trainer');

  RAISE NOTICE 'Plan 24.0 asignado correctamente (client_id: %)', v_client_id;
END $$;