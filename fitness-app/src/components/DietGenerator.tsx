// ─────────────────────────────────────────────────────────────────────────────
// DietGenerator.tsx  v2
// Genera plan ON/OFF con 3 opciones por comida. Cada opción agrupa alimentos
// con sentido culinario (lácteos+avena, ISO+cereales, etc.).
// El admin puede cambiar cualquier ingrediente dentro de cada opción via select.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { ingredients, type Ingredient } from "../data/ingredients";

// ── Calculadora de macros (copiada de MacroCalculator para no crear dependencia circular) ──

const ACTIVITY_LEVELS = [
  { value: 1.2, label: "1.2 – 3 días gym y menos de 10.000 pasos / poca masa muscular" },
  { value: 1.3, label: "1.3 – 3 días gym y más de 10.000 pasos / poca masa muscular" },
  { value: 1.4, label: "1.4 – 4 días gym y más de 10.000 pasos / poca masa muscular" },
  { value: 1.5, label: "1.5 – 4 días gym y más de 10.000 pasos y experiencia entrenando" },
  { value: 1.6, label: "1.6 – 4 días gym y más de 10.000 pasos y atleta fuera de forma" },
  { value: 1.7, label: "1.7 – 4 días gym y más de 10.000 pasos y atleta en forma" },
  { value: 1.8, label: "1.8 – 5 días gym y más de 10.000 pasos y atleta en forma" },
];

const GOAL_OPTIONS = [
  { label: "Pérdida de grasa intensa",  sublabel: "−20% · máx. déficit",    value: -0.20, protein: 2.0, fat: 0.5, color: "text-red-400" },
  { label: "Pérdida de grasa",          sublabel: "−15% · déficit moderado", value: -0.15, protein: 1.8, fat: 0.5, color: "text-orange-400" },
  { label: "Pérdida de grasa suave",    sublabel: "−10% · déficit leve",     value: -0.10, protein: 1.8, fat: 0.6, color: "text-yellow-400" },
  { label: "Mantenimiento",             sublabel: "0% · sostener peso",      value:  0.00, protein: 1.7, fat: 0.7, color: "text-neutral-300" },
  { label: "Ganancia muscular",         sublabel: "+5% · ligero superávit",  value:  0.05, protein: 1.8, fat: 0.7, color: "text-emerald-400" },
  { label: "Volumen / masa",            sublabel: "+10% · superávit amplio", value:  0.10, protein: 1.9, fat: 0.8, color: "text-blue-400" },
];

function computeMacros(
  sex: "male" | "female", age: number, height: number, weight: number,
  activityFactor: number, proteinMult: number, fatMult: number, deficit: number,
) {
  const bmr = sex === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  const tdeeMaint = Math.round(bmr * activityFactor);
  const tdee      = Math.round(tdeeMaint * (1 + deficit));
  const protein_g = round1(weight * proteinMult);
  const fat_g     = round1(weight * fatMult);
  const carbs_g   = round1(Math.max(0, tdee - protein_g * 4 - fat_g * 9) / 4);
  return { tdee, protein_g, carbs_g, fat_g };
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface DailyMacros {
  protein_g: number;
  carbs_g:   number;
  fat_g:     number;
  kcal:      number;
}

type MacroKey = "protein" | "carbs" | "fat";

interface ProfileSlotDef {
  id:           string;
  label:        string;
  ingIds:       string[];          // pool de ingredientes coherentes para este slot
  macro:        MacroKey | "fixed";
  pct:          number;            // % del macro diario, o gramos si macro="fixed"
  fixedG?:      number;
  noteText?:    string;
  autoAddIso?:  boolean;   // en slots proteína-láctea: calcula gramos ISO complementarios para cuadrar macros
}

interface MealProfileDef {
  id:    string;
  label: string;                // etiqueta corta, ej. "Lácteos + Avena"
  slots: ProfileSlotDef[];
}

interface MealDef {
  id:       string;
  name:     string;
  emoji:    string;
  profiles: MealProfileDef[];  // siempre 3 opciones
}

interface GeneratedFood {
  slotId:        string;
  label:         string;
  ing:           Ingredient;
  grams:         number;
  macro:         MacroKey | "fixed";
  targetG:       number;
  pct:           number;           // % del macro diario asignado a este slot
  availablePool: Ingredient[];  // opciones del desplegable para este slot
  noteText?:     string;
}

interface GeneratedOption {
  profileId:    string;
  profileLabel: string;
  foods:        GeneratedFood[];
}

interface GeneratedMeal {
  mealId:  string;
  name:    string;
  emoji:   string;
  options: GeneratedOption[];   // 3 opciones
}

// ── Definición de perfiles por comida ─────────────────────────────────────────
// Cada comida tiene 3 perfiles con combinaciones culinariamente coherentes.
// Los ingIds son los IDs exactos de ingredients.ts.

const MEAL_DEFS: MealDef[] = [

  // ── COMIDA 1 — Desayuno ────────────────────────────────────────────────────
  // Sigue exactamente las 3 opciones del Plan Nutricional 24.0:
  //   · Elaborada: Huevo/Claras + Avena o Pan → Tortitas / Bizcocho
  //   · Opción 1:  Huevo + Lácteo (yogur/mousse) con cereal — sin queso fresco
  //   · Opción 2:  Huevo + Pan/Tortas + Proteína fría (jamón/atún/queso fresco)
  {
    id: "c1", name: "Comida 1 — Desayuno", emoji: "🌅",
    profiles: [
      {
        id: "c1_a", label: "Elaborada — Tortitas / Bizcocho",
        slots: [
          // Huevo/claras es la proteína base de esta opción
          { id: "huevo", label: "Base", macro: "fixed", pct: 0, fixedG: 60,
            ingIds: ["huevo"],
            noteText: "Puedes usar 125ml claras + 1 huevo entero. Bátelo todo con el hidrato para hacer tortitas o bizcocho de micro." },
          // Solo avena o pan para batir — NO cereales de cuchara
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 25,
            ingIds: ["harina_avena","avena_copos","pan_centeno","pan_tostado","pan_integral_pan","pan_fibra"] },
          { id: "fat", label: "Grasa", macro: "fat", pct: 10,
            ingIds: ["aceite_coco","chocolate85","aceite_oliva"] },
          { id: "fruta", label: "Fruta", macro: "fixed", pct: 0, fixedG: 150,
            ingIds: ["fresas","frambuesas","arandanos","kiwi","melocoton","manzana","pera","platano"] },
        ],
      },
      {
        // Lácteos que van con cereales: yogur, queso batido, mousse, leche proteica
        // ⚠️ NO queso fresco tipo burgos (va con pan en Opción 2)
        id: "c1_b", label: "Opción 1 — Lácteo + Cereal",
        slots: [
          { id: "huevo", label: "Huevo base", macro: "fixed", pct: 0, fixedG: 60,
            ingIds: ["huevo"] },
          { id: "prot", label: "Proteína láctea", macro: "protein", pct: 20,
            // Solo lácteos que funcionan como base para cereales
            ingIds: ["yogur_prot","yogur_sln","mousse_prot","yogur_griego","qso_batido","leche_prot"],
            autoAddIso: true },  // ISO calculado dinámicamente para completar el objetivo proteico
          { id: "hc", label: "Cereales", macro: "carbs", pct: 25,
            ingIds: ["avena_crunchy","avena_copos","harina_avena",
                     "corn_flakes","weetabix","copos_trigo","rice_krispies","cereal_mix","crema_arroz","choco_zero"] },
          { id: "fat", label: "Grasa", macro: "fat", pct: 10,
            ingIds: ["aceite_coco","chocolate85","aceite_oliva"] },
          { id: "fruta", label: "Fruta", macro: "fixed", pct: 0, fixedG: 150,
            ingIds: ["fresas","frambuesas","arandanos","kiwi","melocoton","manzana","platano","pera"] },
        ],
      },
      {
        // Pan/Tortas + Proteína fría: jamón, lomo, queso fresco, atún
        // ⚠️ NO yogur ni mousse (van con cereales en Opción 1)
        id: "c1_c", label: "Opción 2 — Pan + Proteína fría",
        slots: [
          { id: "huevo", label: "Huevo base", macro: "fixed", pct: 0, fixedG: 60,
            ingIds: ["huevo"] },
          // Solo pan y tortas — NO cereales de cuchara
          { id: "hc", label: "Pan / Tortas", macro: "carbs", pct: 25,
            ingIds: ["pan_centeno","pan_tostado","pan_integral_pan","pan_fibra","pan_wasa","tortas_arroz","tortas_maiz"] },
          // Solo proteínas frías que van encima del pan: fiambre, queso, jamón, atún
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["lomo_embuchado","lomo_curado_pavo","jamon","fiambre_pavo","qso_fresco","atun_lata"] },
          { id: "fat", label: "Grasa", macro: "fat", pct: 10,
            ingIds: ["aceite_coco","chocolate85","aceite_oliva"] },
          { id: "fruta", label: "Fruta", macro: "fixed", pct: 0, fixedG: 150,
            ingIds: ["platano","manzana","fresas","arandanos","pera","kiwi","melocoton"] },
        ],
      },
    ],
  },

  // ── COMIDA 2 — Almuerzo ────────────────────────────────────────────────────
  // Todas las opciones son pan/tortas + proteína fría (igual que desayuno Opción 2)
  {
    id: "c2", name: "Comida 2 — Almuerzo", emoji: "☕",
    profiles: [
      {
        id: "c2_a", label: "Pan + Embutido / Jamón",
        slots: [
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 20,
            ingIds: ["pan_fibra","pan_centeno","pan_tostado","pan_integral_pan",
                     "pan_wasa","tortas_arroz","tortas_maiz"] },
          { id: "prot", label: "Proteína", macro: "protein", pct: 15,
            ingIds: ["lomo_embuchado","lomo_curado_pavo","jamon","fiambre_pavo","salchi_pavo_3"] },
          { id: "fat", label: "Grasa", macro: "fat", pct: 5,
            ingIds: ["aceite_oliva","aguacate","guacamole"],
            noteText: "Si comes pan añade tomate rallado para que no quede seco." },
        ],
      },
      {
        id: "c2_b", label: "Pan + Queso fresco / Atún",
        slots: [
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 20,
            ingIds: ["pan_fibra","pan_centeno","pan_tostado","pan_integral_pan",
                     "pan_wasa","tortas_arroz","tortas_maiz"] },
          { id: "prot", label: "Proteína", macro: "protein", pct: 15,
            ingIds: ["qso_fresco","atun_lata","fiambre_pavo","lomo_curado_pavo","jamon"] },
          { id: "fat", label: "Grasa", macro: "fat", pct: 5,
            ingIds: ["aceite_oliva","aguacate","guacamole","aceitunas"],
            noteText: "Si comes pan añade tomate rallado para que no quede seco." },
        ],
      },
      {
        id: "c2_c", label: "Bocadillo / Wrap (pan de molde o fajita)",
        slots: [
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 20,
            ingIds: ["pan_molde","fajitas","pan_blanco","pan_centeno","pan_integral_pan"] },
          { id: "prot", label: "Proteína", macro: "protein", pct: 15,
            ingIds: ["qso_eatlean","mozza_light","fiambre_pavo","jamon","lomo_curado_pavo","qso_fresco","atun_lata"] },
          { id: "fat", label: "Grasa", macro: "fat", pct: 5,
            ingIds: ["aceite_oliva","aguacate","guacamole","aceitunas"] },
        ],
      },
    ],
  },

  // ── COMIDA 3 — Comida principal ────────────────────────────────────────────
  // Sigue la Opción 1 y 2 del PDF: carne/pescado + HC variado, con verdura libre
  {
    id: "c3", name: "Comida 3 — Comida principal", emoji: "🍽️",
    profiles: [
      {
        // Opción 1: Carne / Pescado + HC (pasta, arroz, patata…)
        id: "c3_a", label: "Carne / Pescado + Pasta / Arroz",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 25,
            // Exactamente los mismos que en el PDF
            ingIds: ["pollo","pavo","lomo_cerdo","ternera","picada_pollo","hamburguesa",
                     "merluza","lenguado","lubina","tilapia","atun_lata","gambas","sepia"] },
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 30,
            ingIds: ["pasta","pasta_integral","arroz","arroz_int","patata","boniato","boniato_rojo",
                     "noquis","cuscus","noodles_arroz","arroz_3del","fajitas"] },
          { id: "fat", label: "Grasa", macro: "fat", pct: 35,
            ingIds: ["aceite_oliva","aguacate","guacamole"],
            noteText: "🥦 100-400g Verdura variada (libre): brócoli, judías, champiñones, espárragos, pimientos, berenjena, coliflor…" },
          { id: "fruta", label: "Fruta", macro: "fixed", pct: 0, fixedG: 150,
            ingIds: ["manzana","pera","melocoton","kiwi","platano","cerezas","fresas"] },
        ],
      },
      {
        // Opción 2: Carne o Pescado + Arroz ligero + indica legumbre de bote
        id: "c3_b", label: "Pescado + Patata / Boniato",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 25,
            ingIds: ["merluza","tilapia","lenguado","lubina","sepia","gambas","calamar","salmon","trucha"] },
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 30,
            ingIds: ["patata","patata_bote","boniato","boniato_rojo","noquis","arroz","arroz_int","cuscus"] },
          { id: "fat", label: "Grasa", macro: "fat", pct: 35,
            ingIds: ["aceite_oliva","aguacate","guacamole"],
            noteText: "🥦 100-400g Verdura variada libre. Opcional: añade 200g legumbre cocida de bote para más saciedad." },
          { id: "fruta", label: "Fruta", macro: "fixed", pct: 0, fixedG: 150,
            ingIds: ["pera","manzana","melocoton","kiwi","fresas","cerezas"] },
        ],
      },
      {
        // Opción 3: Salmón / Ternera + HC libre
        id: "c3_c", label: "Salmón / Ternera + HC libre",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 25,
            ingIds: ["salmon","ternera","trucha","lomo_atun","pollo","pavo","lomo_cerdo"] },
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 30,
            ingIds: ["arroz","pasta","patata","boniato","noodles_arroz","cuscus","arroz_int","pasta_integral","noquis"] },
          { id: "fat", label: "Grasa", macro: "fat", pct: 35,
            ingIds: ["aceite_oliva","aguacate","guacamole"],
            noteText: "🥦 100-400g Verdura variada libre." },
          { id: "fruta", label: "Fruta", macro: "fixed", pct: 0, fixedG: 150,
            ingIds: ["fresas","arandanos","kiwi","frambuesas","pera","manzana"] },
        ],
      },
    ],
  },

  // ── COMIDA 4 — Merienda ────────────────────────────────────────────────────
  // Opción 1: Lácteo + cereal (idéntico a desayuno Opción 1 en proporción)
  // Opción 2: ISO/Whey + leche vegetal + cereal (batido)
  // Opción 3: Queso fresco / Fiambre + Pan/Tortas (equivalente a desayuno Opción 2)
  {
    id: "c4", name: "Comida 4 — Merienda", emoji: "🫐",
    profiles: [
      {
        // ⚠️ Solo lácteos con cereales — NO queso fresco tipo burgos aquí
        id: "c4_a", label: "Opción 1 — Yogur / Mousse + Cereal",
        slots: [
          { id: "prot", label: "Proteína láctea", macro: "protein", pct: 20,
            ingIds: ["yogur_prot","yogur_griego","mousse_prot","qso_batido","leche_prot","yogur_sln"],
            autoAddIso: true },  // ISO calculado dinámicamente para completar el objetivo proteico
          { id: "hc", label: "Cereales", macro: "carbs", pct: 15,
            ingIds: ["avena_crunchy","avena_copos","harina_avena","weetabix","corn_flakes",
                     "cereal_mix","rice_krispies","copos_trigo","crema_arroz","choco_zero"] },
          { id: "fruta", label: "Fruta", macro: "fixed", pct: 0, fixedG: 100,
            ingIds: ["platano","fresas","arandanos","manzana","frambuesas","melocoton","pera"] },
        ],
      },
      {
        // ISO/Whey siempre mezclado con leche vegetal — nunca en seco
        id: "c4_b", label: "Opción 2 — ISO / Whey + Leche + Cereal",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["iso","whey"],
            noteText: "Mezcla siempre con 200-300ml de leche vegetal o de almendra sin azúcar." },
          { id: "hc", label: "Cereales", macro: "carbs", pct: 15,
            ingIds: ["avena_crunchy","avena_copos","harina_avena","crema_arroz",
                     "corn_flakes","weetabix","cereal_mix","rice_krispies","copos_trigo"] },
          { id: "fruta", label: "Fruta", macro: "fixed", pct: 0, fixedG: 100,
            ingIds: ["platano","manzana","pera","kiwi","fresas","arandanos"] },
        ],
      },
      {
        // Proteína fría sobre pan/tortas — igual que desayuno Opción 2 pero menos cantidad
        // ⚠️ NO yogur ni mousse aquí (van con cereales)
        id: "c4_c", label: "Opción 3 — Pan / Tortas + Proteína fría",
        slots: [
          { id: "hc", label: "Pan / Tortas", macro: "carbs", pct: 15,
            ingIds: ["pan_tostado","pan_fibra","pan_wasa","tortas_arroz","tortas_maiz","pan_centeno","pan_integral_pan"] },
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["qso_fresco","qso_batido","fiambre_pavo","lomo_curado_pavo","atun_lata","jamon","lomo_embuchado"] },
          { id: "fruta", label: "Fruta", macro: "fixed", pct: 0, fixedG: 100,
            ingIds: ["platano","manzana","pera","fresas","melocoton","arandanos","kiwi"] },
        ],
      },
    ],
  },

  // ── COMIDA 5 — Cena ────────────────────────────────────────────────────────
  // Igual que comida 3: carne/pescado + HC, con verdura libre
  {
    id: "c5", name: "Comida 5 — Cena", emoji: "🌙",
    profiles: [
      {
        id: "c5_a", label: "Pescado blanco + Patata / Boniato",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["merluza","tilapia","lenguado","lubina","gambas","sepia","calamar"] },
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 10,
            ingIds: ["patata","patata_bote","boniato","boniato_rojo","noquis","arroz","arroz_int","cuscus"] },
          { id: "fat", label: "Grasa", macro: "fat", pct: 50,
            ingIds: ["aceite_oliva","aguacate","guacamole"],
            noteText: "🥦 Verdura variada a gusto (libre)" },
          { id: "fruta", label: "Fruta", macro: "fixed", pct: 0, fixedG: 150,
            ingIds: ["fresas","frambuesas","arandanos","melocoton","pera","kiwi"] },
        ],
      },
      {
        id: "c5_b", label: "Carne / Aves + Arroz / Pasta",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["pollo","pavo","picada_pollo","lomo_cerdo","ternera","hamburguesa","salchi_pavo_3"] },
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 10,
            ingIds: ["arroz","arroz_int","pasta","pasta_integral","cuscus","noodles_arroz","patata","boniato","noquis"] },
          { id: "fat", label: "Grasa", macro: "fat", pct: 50,
            ingIds: ["aceite_oliva","aguacate","guacamole"],
            noteText: "🥦 Verdura variada a gusto (libre)" },
          { id: "fruta", label: "Fruta", macro: "fixed", pct: 0, fixedG: 150,
            ingIds: ["manzana","pera","kiwi","sandia","melon","cerezas"] },
        ],
      },
      {
        id: "c5_c", label: "Salmón / Ternera + HC libre",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["salmon","ternera","trucha","lomo_atun","atun_lata","calamar","sepia","gambas"] },
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 10,
            ingIds: ["arroz","patata","boniato","noodles_arroz","cuscus","noquis","arroz_int","pasta","pasta_integral"] },
          { id: "fat", label: "Grasa", macro: "fat", pct: 50,
            ingIds: ["aceite_oliva","aguacate","guacamole"],
            noteText: "🥦 Verdura variada a gusto (libre)" },
          { id: "fruta", label: "Fruta", macro: "fixed", pct: 0, fixedG: 150,
            ingIds: ["sandia","melon","cerezas","uva","melocoton","fresas","pera"] },
        ],
      },
    ],
  },
];

// ── Porciones estándar (gramos) ───────────────────────────────────────────────
// Basadas en el plan nutricional real del cliente. Día ON por defecto.
// Las claves que aparecen en STANDARD_PORTIONS_OFF sobreescriben en días OFF.

const STANDARD_PORTIONS: Record<string, number> = {
  // Carnes / proteína animal
  huevo:             60,   // 1 huevo entero ≈ 60 g
  pollo:            100,
  pavo:             100,
  picada_pollo:     100,
  hamburguesa:      100,
  lomo_cerdo:       100,
  ternera:          100,
  salmon:           100,
  trucha:           100,
  lomo_atun:         80,
  atun_lata:         80,
  merluza:          140,
  tilapia:          140,
  lenguado:         140,
  lubina:           140,
  sepia:            150,
  gambas:           150,
  calamar:          150,
  // Embutidos
  lomo_embuchado:    50,
  jamon:             60,
  fiambre_pavo:      50,
  lomo_curado_pavo:  50,
  salchi_pavo_3:     60,
  salchi_pavo_ff:    60,
  // Lácteos / proteína
  iso:               30,
  whey:              30,
  yogur_prot:       200,
  yogur_griego:     200,
  yogur_sln:        200,
  qso_batido:       200,
  qso_fresco:       150,
  mousse_prot:      200,
  leche_prot:       200,
  qso_eatlean:      100,
  mozza_light:      100,
  havarti:           50,
  qso_pizza:         50,
  // Hidratos — cereales / avena
  harina_avena:      80,
  avena_copos:       80,
  avena_crunchy:     60,
  corn_flakes:       60,
  weetabix:          60,
  copos_trigo:       60,
  rice_krispies:     60,
  cereal_mix:        60,
  crema_arroz:       60,
  choco_zero:        50,
  // Hidratos — pasta / arroz / tubérculos
  pasta:             75,
  pasta_integral:    75,
  arroz:             75,
  arroz_int:         75,
  noodles_arroz:     75,
  cuscus:            90,
  noquis:           150,
  arroz_3del:       100,
  arroz_bolsita:    125,
  patata:           180,
  patata_bote:      180,
  boniato:          150,
  boniato_rojo:     150,
  // Hidratos — pan / tortas
  pan_centeno:       80,
  pan_integral_pan:  80,
  pan_tostado:       60,
  pan_fibra:         80,
  pan_wasa:          60,
  pan_molde:         80,
  pan_blanco:        80,
  fajitas:          100,
  tortas_legumbre:   75,
  tortas_arroz:      75,
  tortas_maiz:       75,
  pizza_int:        200,
  // Grasas
  aceite_oliva:       5,
  aceite_coco:        5,
  chocolate85:       10,
  aguacate:          40,
  crema_cacah:       20,
  almendras:         20,
  nuez:              20,
  aceitunas:         30,
  guacamole:         40,
  // Fruta
  platano:          100,
  fresas:           150,
  frambuesas:       150,
  arandanos:        150,
  arandanos_cong:   150,
  frutos_rojos:     150,
  kiwi:             150,
  melocoton:        150,
  manzana:          150,
  pera:             150,
  uva:              150,
  cerezas:          150,
  sandia:           200,
  melon:            200,
};

// Condimentos que SIEMPRE son fijos (independientemente del cliente)
const FIXED_CONDIMENTS = new Set([
  "aceite_oliva", "aceite_coco", "chocolate85",
]);

// ── Matriz de contribuciones cruzadas (calculada empíricamente) ───────────────
// Cada columna = cuánto macro aportan los slots de ese tipo a PORCIÓN ESTÁNDAR (escala=1).
// Filas: proteína total / HC total / grasa total que aportan slots de proteína, HC y grasa.
// Contribuciones FIJAS (huevo, fruta, condimentos): no se escalan, se restan del objetivo.
//
//          slots_prot  slots_HC  slots_grasa
// proteína [  107.2,    34.5,      5.8   ]
// HC       [   15.3,   207.9,      1.9   ]
// grasa    [    7.2,    12.6,     16.2   ]
//
// Fijos: prot=11.2g, HC=70.4g, grasa=16.2g (condimentos + huevo + fruta)
const MC = {
  pP: 107.2, pC:  34.5, pF:  5.8,
  cP:  15.3, cC: 207.9, cF:  1.9,
  fP:   7.2, fC:  12.6, fF: 16.2,
  fixP: 11.2, fixC: 70.4, fixF: 16.2,
};

/**
 * Calcula los factores de escala óptimos para este cliente resolviendo el
 * sistema lineal 3×3: MC × [sP, sC, sF]' = [tP-fixP, tC-fixC, tF-fixF]'
 *
 * Si el objetivo de grasa ya está cubierto por las contribuciones fijas
 * (sF resulta negativo), se resuelve el subsistema 2×2 con sF=0.
 */
function computeClientScales(macros: DailyMacros): { sP: number; sC: number; sF: number } {
  const bP = macros.protein_g - MC.fixP;
  const bC = macros.carbs_g   - MC.fixC;
  const bF = macros.fat_g     - MC.fixF;

  // Eliminación gaussiana con pivote parcial sobre la matriz aumentada 3×4
  const m: number[][] = [
    [MC.pP, MC.pC, MC.pF, bP],
    [MC.cP, MC.cC, MC.cF, bC],
    [MC.fP, MC.fC, MC.fF, bF],
  ];
  for (let col = 0; col < 3; col++) {
    let pivot = col;
    for (let r = col + 1; r < 3; r++) {
      if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
    }
    [m[col], m[pivot]] = [m[pivot], m[col]];
    if (Math.abs(m[col][col]) < 1e-8) continue;
    for (let r = col + 1; r < 3; r++) {
      const f = m[r][col] / m[col][col];
      for (let k = col; k <= 3; k++) m[r][k] -= f * m[col][k];
    }
  }
  // Sustitución regresiva
  const sF3 = Math.abs(m[2][2]) > 1e-8 ? m[2][3] / m[2][2] : 0;
  const sC3 = Math.abs(m[1][1]) > 1e-8 ? (m[1][3] - m[1][2] * sF3) / m[1][1] : 1;
  const sP3 = Math.abs(m[0][0]) > 1e-8 ? (m[0][3] - m[0][1] * sC3 - m[0][2] * sF3) / m[0][0] : 1;

  if (sP3 > 0 && sC3 > 0 && sF3 > 0) {
    return { sP: sP3, sC: sC3, sF: sF3 };
  }

  // El objetivo de grasa es inalcanzable con porciones positivas de ingredientes grasos.
  // Resolver solo el subsistema 2×2 (prot + HC) con sF = 0.
  const det = MC.pP * MC.cC - MC.pC * MC.cP;
  const sP2 = Math.abs(det) > 1e-8 ? (bP * MC.cC - bC * MC.pC) / det : 0.5;
  const sC2 = Math.abs(det) > 1e-8 ? (MC.pP * bC - MC.cP * bP) / det : 1.0;
  return { sP: Math.max(sP2, 0.05), sC: Math.max(sC2, 0.05), sF: 0 };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function round1(n: number) { return Math.round(n * 10) / 10; }

function poolFromIds(ids: string[]): Ingredient[] {
  return ids
    .map(id => ingredients.find(i => i.id === id))
    .filter((i): i is Ingredient => !!i);
}

/**
 * Escala la porción estándar de un ingrediente con los factores por-cliente.
 * Los condimentos fijos (aceite, chocolate) y los slots "fixed" siempre
 * mantienen su porción estándar.
 * Con sF=0 los slots de grasa no fijos se omiten (grams=0).
 * Redondea al múltiplo de 5g más cercano. Mínimo 5g.
 */
function getScaledPortionG(
  ing:    Ingredient,
  macro:  MacroKey | "fixed",
  scales: { sP: number; sC: number; sF: number },
): number {
  const baseG = STANDARD_PORTIONS[ing.id] ?? 100;

  if (macro === "fixed" || FIXED_CONDIMENTS.has(ing.id)) {
    return baseG;
  }

  const s = macro === "protein" ? scales.sP
          : macro === "carbs"   ? scales.sC
                                : scales.sF;

  if (s <= 0) return 0;   // slot de grasa innecesario para este cliente
  const scaledG = baseG * s;
  return Math.max(Math.round(scaledG / 5) * 5, 5);
}

// ── Generación ────────────────────────────────────────────────────────────────

/**
 * Genera el plan para el día dado (ON u OFF).
 * Pasa macrosOn para día ON, macrosOff para día OFF.
 * Las porciones se escalan proporcionalmente a los macros del cliente.
 */
function generatePlan(macros: DailyMacros): GeneratedMeal[] {
  const scales = computeClientScales(macros);

  return MEAL_DEFS.map(meal => {
    const options: GeneratedOption[] = meal.profiles.map(profile => {
      const foods: GeneratedFood[] = [];

      profile.slots.forEach((slot, slotIdx) => {
        const pool = poolFromIds(slot.ingIds);
        if (!pool.length) return;

        // Rotar arranque según slotIdx para variar ingredientes entre perfiles
        const ing = pool[slotIdx % pool.length];

        let grams: number;
        if (slot.macro === "fixed") {
          grams = slot.fixedG ?? 100;
        } else {
          grams = getScaledPortionG(ing, slot.macro, scales);
        }

        if (grams <= 0) return;   // slot de grasa omitido (sF=0)

        foods.push({
          slotId:        slot.id,
          label:         slot.label,
          ing,
          grams,
          macro:         slot.macro,
          targetG:       grams,
          pct:           slot.pct,
          availablePool: pool,
          noteText:      slot.noteText,
        });
      });

      return { profileId: profile.id, profileLabel: profile.label, foods };
    });

    return { mealId: meal.id, name: meal.name, emoji: meal.emoji, options };
  });
}

// ── Cambiar un ingrediente dentro de un option ────────────────────────────────

function selectFood(
  plan:       GeneratedMeal[],
  mealId:     string,
  profileIdx: number,
  slotId:     string,
  newIngId:   string,
  macros:     DailyMacros,
): GeneratedMeal[] {
  const scales = computeClientScales(macros);

  return plan.map(meal => {
    if (meal.mealId !== mealId) return meal;

    return {
      ...meal,
      options: meal.options.map((opt, oIdx) => {
        if (oIdx !== profileIdx) return opt;

        return {
          ...opt,
          foods: opt.foods.map(food => {
            if (food.slotId !== slotId) return food;

            const ing = food.availablePool.find(i => i.id === newIngId);
            if (!ing) return food;

            let grams = food.grams;
            if (food.macro !== "fixed") {
              grams = getScaledPortionG(ing, food.macro, scales);
            }

            return { ...food, ing, grams, targetG: grams };
          }),
        };
      }),
    };
  });
}

// ── Macro helpers ─────────────────────────────────────────────────────────────

function foodMacros(food: GeneratedFood) {
  const f = food.grams / 100;
  return {
    kcal:    round1(food.ing.kcal    * f),
    protein: round1(food.ing.protein * f),
    carbs:   round1(food.ing.carbs   * f),
    fat:     round1(food.ing.fat     * f),
  };
}

function optionMacros(opt: GeneratedOption) {
  return opt.foods.reduce(
    (acc, food) => {
      const m = foodMacros(food);
      return {
        kcal:    round1(acc.kcal    + m.kcal),
        protein: round1(acc.protein + m.protein),
        carbs:   round1(acc.carbs   + m.carbs),
        fat:     round1(acc.fat     + m.fat),
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

function planTotalMacros(plan: GeneratedMeal[], activeOptions: Record<string, number>) {
  return plan.reduce(
    (acc, meal) => {
      const oIdx = activeOptions[meal.mealId] ?? 0;
      const opt  = meal.options[oIdx];
      if (!opt) return acc;
      const m = optionMacros(opt);
      return {
        kcal:    round1(acc.kcal    + m.kcal),
        protein: round1(acc.protein + m.protein),
        carbs:   round1(acc.carbs   + m.carbs),
        fat:     round1(acc.fat     + m.fat),
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

// ── Exportar PDF ─────────────────────────────────────────────────────────────
//
// El PDF se genera DESDE MEAL_DEFS (la plantilla completa) — NO desde el plan
// generado. Así muestra TODAS las alternativas de cada slot como listas
// numeradas, exactamente igual que un PDF de nutrición profesional:
//
//   OPCIÓN A — Lácteos + Cereal
//     ✅ Siempre: Huevo 60g • Fruta 150g (la que quieras)
//     🥩 Proteína (elige 1):
//        1. Yogur proteico ........... 175g | 24P | 8HC | 0G
//        2. Queso batido 0% ......... 175g | 14P | 6HC | 0G
//        ...
//     🌾 Hidratos (elige 1):
//        1. Avena en copos ........... 55g |  6P | 36HC | 3G
//        ...
//     🫒 Grasa (elige 1): 5ml aceite de coco · 10g chocolate 85%
//
// ─────────────────────────────────────────────────────────────────────────────

function exportDietPDF(
  planOn:     GeneratedMeal[],
  planOff:    GeneratedMeal[],
  macrosOn:   DailyMacros,
  macrosOff:  DailyMacros | null,
  clientName: string,
  planName:   string,
) {
  const today      = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  const scalesOn   = computeClientScales(macrosOn);
  const scalesOff  = macrosOff ? computeClientScales(macrosOff) : null;
  const mealColors = ["#8B1A2F", "#6B3080", "#1A5E8F", "#1A6B3A", "#7A5C1A"];
  const isoIng     = ingredients.find(i => i.id === "iso") ?? null;

  type Scales = { sP: number; sC: number; sF: number };

  // ── Busca la definición de slot en MEAL_DEFS (para autoAddIso, noteText, ingIds) ──
  function getSlotDef(mealId: string, profileId: string, slotId: string): ProfileSlotDef | null {
    const meal = MEAL_DEFS.find(m => m.id === mealId);
    const prof = meal?.profiles.find(p => p.id === profileId);
    return prof?.slots.find(s => s.id === slotId) ?? null;
  }

  // ── Calcula gramos e info de macros para un food en un día concreto ──
  interface FoodDisp { gDisplay: string; p: number; c: number; f: number }

  function calcFoodDisp(
    food: GeneratedFood, slotDef: ProfileSlotDef | null,
    sc: Scales, macros: DailyMacros,
  ): FoodDisp {
    if (slotDef?.autoAddIso && isoIng && food.macro === "protein") {
      const dairyG    = STANDARD_PORTIONS[food.ing.id] ?? 200;
      const protTgt   = macros.protein_g * food.pct / 100;
      const dairyProt = food.ing.protein * dairyG / 100;
      const isoRaw    = Math.max(0, (protTgt - dairyProt) / (isoIng.protein / 100));
      const isoG      = Math.round(isoRaw / 5) * 5;
      const gDisplay  = isoG > 0 ? `${dairyG}g + ${isoG}g ISO` : `${dairyG}g`;
      return {
        gDisplay,
        p: round1(dairyProt + isoIng.protein * isoG / 100),
        c: round1(food.ing.carbs * dairyG / 100),
        f: round1(food.ing.fat   * dairyG / 100),
      };
    }
    if (food.macro === "fixed") {
      const g = food.grams;
      return {
        gDisplay: `${g}g`,
        p: round1(food.ing.protein * g / 100),
        c: round1(food.ing.carbs   * g / 100),
        f: round1(food.ing.fat     * g / 100),
      };
    }
    const g = getScaledPortionG(food.ing, food.macro, sc);
    return {
      gDisplay: `${g}g`,
      p: round1(food.ing.protein * g / 100),
      c: round1(food.ing.carbs   * g / 100),
      f: round1(food.ing.fat     * g / 100),
    };
  }

  // ── Renderiza una OPCIÓN completa (A / B / C) como combo visual ──
  function renderOption(
    opt:    GeneratedOption,
    mealId: string,
    optIdx: number,
    col:    string,
  ): string {
    const label = ["A", "B", "C"][optIdx] ?? String(optIdx + 1);

    let totOnP = 0, totOnC = 0, totOnF = 0;
    let totOffP = 0, totOffC = 0, totOffF = 0;
    const hasOff = !!scalesOff && !!macrosOff;

    const rows = opt.foods.map(food => {
      const slotDef = getSlotDef(mealId, opt.profileId, food.slotId);
      const on      = calcFoodDisp(food, slotDef, scalesOn, macrosOn);
      const off     = hasOff ? calcFoodDisp(food, slotDef, scalesOff!, macrosOff!) : null;

      totOnP  += on.p;  totOnC  += on.c;  totOnF  += on.f;
      if (off) { totOffP += off.p; totOffC += off.c; totOffF += off.f; }

      // Icono según macro
      const icon = food.macro === "protein" ? "🥩"
                 : food.macro === "carbs"   ? "🌾"
                 : food.macro === "fat"     ? "🫒"
                 : food.slotId === "fruta"  ? "🍓"
                 : "✅";

      // Para el slot de fruta mostramos todas las opciones disponibles
      const isFruitSlot = food.slotId === "fruta";
      const fruitOpts   = isFruitSlot && slotDef
        ? poolFromIds(slotDef.ingIds).map(i => i.name).join(" · ")
        : null;

      // OFF solo si difiere de ON
      const offTag = off && off.gDisplay !== on.gDisplay
        ? `<span class="off-tag">OFF: ${off.gDisplay}</span>`
        : "";

      const noteHtml = slotDef?.noteText
        ? `<div class="food-note">※ ${slotDef.noteText}</div>` : "";

      return `<div class="food-row">
        <span class="food-icon">${icon}</span>
        <div class="food-info">
          <span class="food-g">${on.gDisplay}</span>
          <span class="food-nm">${isFruitSlot ? "Fruta" : food.ing.name}</span>
          ${offTag}
          ${isFruitSlot && fruitOpts ? `<div class="food-hint">${fruitOpts}</div>` : ""}
          ${noteHtml}
        </div>
      </div>`;
    }).join("");

    const onKcal  = Math.round(totOnP  * 4 + totOnC  * 4 + totOnF  * 9);
    const offKcal = Math.round(totOffP * 4 + totOffC * 4 + totOffF * 9);

    const totOnHtml = `<div class="opt-total on-total">
      <span class="day-pill on-pill">ON</span>
      <span>${onKcal} kcal</span>
      <span class="mac-p">${round1(totOnP)}g P</span>
      <span class="mac-c">${round1(totOnC)}g HC</span>
      <span class="mac-f">${round1(totOnF)}g G</span>
    </div>`;

    const totOffHtml = hasOff ? `<div class="opt-total off-total">
      <span class="day-pill off-pill">OFF</span>
      <span>${offKcal} kcal</span>
      <span class="mac-p">${round1(totOffP)}g P</span>
      <span class="mac-c">${round1(totOffC)}g HC</span>
      <span class="mac-f">${round1(totOffF)}g G</span>
    </div>` : "";

    return `<div class="opt">
      <div class="opt-head" style="border-left:3px solid ${col};background:${col}0D;">
        <span class="opt-badge" style="background:${col};color:#fff;">OPCIÓN ${label}</span>
        <span class="opt-label">${opt.profileLabel}</span>
      </div>
      <div class="opt-foods">${rows}</div>
      ${totOnHtml}${totOffHtml}
    </div>`;
  }

  // ── Renderiza una comida completa ──
  function renderMeal(meal: GeneratedMeal, mIdx: number): string {
    const col  = mealColors[mIdx % mealColors.length];
    const opts = meal.options.map((opt, i) => renderOption(opt, meal.mealId, i, col)).join("");
    return `<div class="meal">
      <div class="meal-head" style="background:${col};">
        <span class="meal-em">${meal.emoji}</span>
        <span>${meal.name.toUpperCase()}</span>
      </div>
      <div class="meal-body">${opts}</div>
    </div>`;
  }

  // ── HTML final ────────────────────────────────────────────────────────────

  const meals = planOn.map((m, i) => renderMeal(m, i)).join("");

  const html = `<!DOCTYPE html><html lang="es"><head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Plan nutricional${clientName ? " · " + clientName : ""}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
        color: #1a1a1a; background: #fff; padding: 24px 20px; font-size: 12px; line-height: 1.5;
      }
      h1 { font-size: 22px; font-weight: 900; letter-spacing: -.3px; }
      .subtitle { font-size: 11px; color: #888; margin-top: 2px; }
      .brand { font-size: 9px; font-weight: 800; letter-spacing: .18em; color: #8B1A2F; margin-bottom: 3px; }

      /* ── Macro summary boxes ── */
      .macro-row { display: flex; gap: 10px; margin: 14px 0; flex-wrap: wrap; }
      .macro-box { flex: 1; min-width: 160px; border-radius: 8px; padding: 10px 14px; border-left: 4px solid; }
      .macro-box .day-label { font-size: 10px; font-weight: 800; letter-spacing: .08em; margin-bottom: 5px; }
      .macro-box .kcal { font-size: 18px; font-weight: 900; }
      .macro-box .macros-line { font-size: 10.5px; margin-top: 3px; }

      /* ── Meals ── */
      .meal { margin-bottom: 20px; page-break-inside: avoid; border-radius: 10px; overflow: hidden; border: 1px solid #e5e5e5; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
      .meal-head { display: flex; align-items: center; gap: 8px; padding: 10px 16px; color: #fff; font-size: 13px; font-weight: 800; letter-spacing: .05em; }
      .meal-em { font-size: 18px; }
      .meal-body { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 8px; }

      /* ── Options (combo cards) ── */
      .opt { border-radius: 8px; border: 1px solid #eee; overflow: hidden; }
      .opt-head { display: flex; align-items: center; gap: 8px; padding: 7px 10px; }
      .opt-badge { font-size: 9.5px; font-weight: 900; letter-spacing: .08em; padding: 3px 8px; border-radius: 4px; }
      .opt-label { font-size: 10px; color: #666; }

      /* ── Foods list ── */
      .opt-foods { padding: 6px 10px 4px; display: flex; flex-direction: column; gap: 5px; }
      .food-row { display: flex; align-items: flex-start; gap: 7px; }
      .food-icon { font-size: 13px; flex-shrink: 0; width: 18px; text-align: center; margin-top: 1px; }
      .food-info { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px; font-size: 11.5px; }
      .food-g { font-weight: 800; color: #111; }
      .food-nm { color: #333; }
      .food-hint { font-size: 9.5px; color: #999; width: 100%; padding-left: 2px; }
      .food-note { font-size: 9.5px; color: #a07050; font-style: italic; width: 100%; padding-left: 2px; }

      /* ── Totals ── */
      .opt-total { display: flex; align-items: center; gap: 8px; font-size: 10px; padding: 5px 10px; flex-wrap: wrap; }
      .on-total  { background: #FEF9F9; border-top: 1px dashed #f0d0d0; }
      .off-total { background: #F5F9FE; border-top: 1px dashed #cce0f0; }
      .day-pill { font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 3px; letter-spacing: .05em; }
      .on-pill  { background: #8B1A2F; color: #fff; }
      .off-pill { background: #2471A3; color: #fff; }
      .mac-p { color: #C0392B; font-weight: 700; }
      .mac-c { color: #D68910; font-weight: 700; }
      .mac-f { color: #2980B9; font-weight: 700; }

      /* ── Tags ── */
      .on-tag  { font-size: 8px; font-weight: 700; color: #8B1A2F; background: #FDF2F2; border-radius: 3px; padding: 1px 5px; }
      .off-tag { font-size: 8px; font-weight: 700; color: #2471A3; background: #EAF2FB; border-radius: 3px; padding: 1px 5px; }

      footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #eee; font-size: 8.5px; color: #bbb; text-align: center; }
      @media print { body { padding: 6mm 8mm; } @page { size: A4 portrait; margin: 6mm; } }
    </style>
  </head><body>

    <!-- Cabecera -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;
                padding-bottom:12px;border-bottom:3px solid #111;margin-bottom:4px;">
      <div>
        <div class="brand">MVP TEAM</div>
        <h1>${planName || "Plan Nutricional"}</h1>
        ${clientName ? `<div class="subtitle">${clientName}</div>` : ""}
      </div>
      <div style="text-align:right;">
        <div style="font-size:10px;color:#666;">${today}</div>
        <div style="font-size:9px;color:#bbb;margin-top:3px;">Elige 1 opción por comida (A · B · C)</div>
      </div>
    </div>

    <!-- Resumen de macros -->
    <div class="macro-row">
      <div class="macro-box" style="border-color:#8B1A2F;background:#FDF2F2;">
        <div class="day-label" style="color:#8B1A2F;">💪 DÍA ON</div>
        <div class="kcal">${macrosOn.kcal} <span style="font-size:12px;font-weight:400;color:#888;">kcal</span></div>
        <div class="macros-line">
          <span style="color:#C0392B;font-weight:700;">${macrosOn.protein_g}g proteína</span> ·
          <span style="color:#D68910;font-weight:700;">${macrosOn.carbs_g}g HC</span> ·
          <span style="color:#2980B9;font-weight:700;">${macrosOn.fat_g}g grasa</span>
        </div>
      </div>
      ${macrosOff ? `
      <div class="macro-box" style="border-color:#2471A3;background:#EAF2FB;">
        <div class="day-label" style="color:#2471A3;">😴 DÍA OFF</div>
        <div class="kcal">${macrosOff.kcal} <span style="font-size:12px;font-weight:400;color:#888;">kcal</span></div>
        <div class="macros-line">
          <span style="color:#C0392B;font-weight:700;">${macrosOff.protein_g}g proteína</span> ·
          <span style="color:#D68910;font-weight:700;">${macrosOff.carbs_g}g HC</span> ·
          <span style="color:#2980B9;font-weight:700;">${macrosOff.fat_g}g grasa</span>
        </div>
      </div>` : ""}
    </div>

    <!-- Comidas -->
    ${meals}

    <footer>Generado por MVP Team · ${today} · Las cantidades están calculadas para tus macros objetivo.</footer>
  </body></html>`;

  // ── Descargar como HTML (sin ventana emergente, sin diálogo de impresión) ──
  try {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    const safeName = clientName
      ? clientName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      : "plan";
    a.href     = url;
    a.download = `plan-nutricional-${safeName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  } catch {
    // Fallback: si el navegador bloquea el download, abrir en nueva pestaña
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    window.open(URL.createObjectURL(blob));
  }
}

// ── Componente ────────────────────────────────────────────────────────────────

interface Props {
  clientId?:   string;   // opcional — si vacío/undefined: modo plantilla (sin cliente)
  clientName?: string;
  onBack:      () => void;
  /** Modo cliente: oculta nombre/notas/guardar. Solo generación y exploración. */
  clientMode?: boolean;
}

export default function DietGenerator({ clientId, clientName, onBack, clientMode = false }: Props) {
  const isTemplateMode = !clientId;

  // ── Macros del cliente ────────────────────────────────────────────
  const [macrosOn,  setMacrosOn]  = useState<DailyMacros | null>(null);
  const [macrosOff, setMacrosOff] = useState<DailyMacros | null>(null);
  const [loadingMacros, setLoadingMacros] = useState(!isTemplateMode);
  const [macroError,    setMacroError]    = useState(false);

  // ── Formulario manual (modo plantilla) — solo usado si hay cliente sin macros ──
  const [tplProtein, setTplProtein] = useState("150");
  const [tplCarbs,   setTplCarbs]   = useState("300");
  const [tplFat,     setTplFat]     = useState("60");

  // ── Calculadora integrada (modo plantilla sin cliente) ────────────
  const [calcSex,      setCalcSex]      = useState<"male" | "female">("male");
  const [calcAge,      setCalcAge]      = useState("");
  const [calcHeight,   setCalcHeight]   = useState("");
  const [calcWeight,   setCalcWeight]   = useState("");
  const [calcActivity, setCalcActivity] = useState(1.5);
  const [calcGoal,     setCalcGoal]     = useState(-0.15);
  const [calcProtMult, setCalcProtMult] = useState(1.8);
  const [calcFatMult,  setCalcFatMult]  = useState(0.5);

  const calcResult = useMemo(() => {
    const a = Number(calcAge); const h = Number(calcHeight); const w = Number(calcWeight);
    if (!a || !h || !w) return null;
    return computeMacros(calcSex, a, h, w, calcActivity, calcProtMult, calcFatMult, calcGoal);
  }, [calcSex, calcAge, calcHeight, calcWeight, calcActivity, calcGoal, calcProtMult, calcFatMult]);

  // ── Planes ON/OFF ─────────────────────────────────────────────────
  const [planOn,  setPlanOn]  = useState<GeneratedMeal[]>([]);
  const [planOff, setPlanOff] = useState<GeneratedMeal[]>([]);

  // ── UI ────────────────────────────────────────────────────────────
  const [activeTab,     setActiveTab]     = useState<"on" | "off">("on");
  const [activeOptions, setActiveOptions] = useState<Record<string, number>>({});
  const [planName,      setPlanName]      = useState("");
  const [planNotes,     setPlanNotes]     = useState("");
  const [offPct,        setOffPct]        = useState(13);
  const [generated,     setGenerated]     = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [toast,         setToast]         = useState<string | null>(null);
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(
    new Set(MEAL_DEFS.map(m => m.id)),
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ── Cargar macros (solo si hay cliente) ──────────────────────────
  useEffect(() => {
    if (isTemplateMode) return;   // modo plantilla: el admin introduce macros a mano
    (async () => {
      setLoadingMacros(true);
      const { data } = await supabase
        .from("client_macros")
        .select("*")
        .eq("client_id", clientId)
        .maybeSingle();

      if (data) {
        const on: DailyMacros = {
          protein_g: data.protein_g,
          carbs_g:   data.carbs_g,
          fat_g:     data.fat_g,
          kcal:      data.tdee,
        };
        const offCarbs = round1(data.carbs_g * (1 - offPct / 100));
        const off: DailyMacros = {
          protein_g: data.protein_g,
          carbs_g:   offCarbs,
          fat_g:     data.fat_g,
          kcal:      Math.round(data.protein_g * 4 + offCarbs * 4 + data.fat_g * 9),
        };
        setMacrosOn(on);
        setMacrosOff(off);
        setPlanName(clientName ? `Dieta ${clientName}` : "Plan nutricional");
        setMacroError(false);
      } else {
        setMacroError(true);
      }
      setLoadingMacros(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // ── Aplicar macros y generar (modo plantilla) ────────────────────
  const applyTemplateAndGenerate = () => {
    // Usar calculadora si hay datos, si no usar los inputs manuales
    const p = calcResult ? calcResult.protein_g : (parseFloat(tplProtein) || 0);
    const c = calcResult ? calcResult.carbs_g   : (parseFloat(tplCarbs)   || 0);
    const f = calcResult ? calcResult.fat_g     : (parseFloat(tplFat)     || 0);
    const on: DailyMacros = { protein_g: p, carbs_g: c, fat_g: f, kcal: calcResult?.tdee ?? Math.round(p*4 + c*4 + f*9) };
    const offCarbs = round1(c * (1 - offPct / 100));
    const off: DailyMacros = {
      protein_g: p, carbs_g: offCarbs, fat_g: f,
      kcal: Math.round(p*4 + offCarbs*4 + f*9),
    };
    setMacrosOn(on);
    setMacrosOff(off);
    if (!planName) setPlanName("Plantilla nutricional");
    const initOn  = generatePlan(on);
    const initOff = generatePlan(off);
    setPlanOn(initOn);
    setPlanOff(initOff);
    const init: Record<string, number> = {};
    initOn.forEach(m => { init[m.mealId] = 0; });
    setActiveOptions(init);
    setGenerated(true);
    setActiveTab("on");
  };

  // Recalcular OFF al cambiar %
  useEffect(() => {
    if (!macrosOn) return;
    const offCarbs = round1(macrosOn.carbs_g * (1 - offPct / 100));
    setMacrosOff({
      protein_g: macrosOn.protein_g,
      carbs_g:   offCarbs,
      fat_g:     macrosOn.fat_g,
      kcal:      Math.round(macrosOn.protein_g * 4 + offCarbs * 4 + macrosOn.fat_g * 9),
    });
  }, [offPct, macrosOn]);

  // ── Generar ───────────────────────────────────────────────────────
  const handleGenerate = () => {
    if (!macrosOn || !macrosOff) return;
    const initOn  = generatePlan(macrosOn);
    const initOff = generatePlan(macrosOff);
    setPlanOn(initOn);
    setPlanOff(initOff);
    // Opción 0 activa por defecto en todas las comidas
    const init: Record<string, number> = {};
    initOn.forEach(m => { init[m.mealId] = 0; });
    setActiveOptions(init);
    setGenerated(true);
    setActiveTab("on");
  };

  // ── Cambio de ingrediente ─────────────────────────────────────────
  const doSelect = (mealId: string, profileIdx: number, slotId: string, newIngId: string) => {
    setPlanOn( p => selectFood(p, mealId, profileIdx, slotId, newIngId, macrosOn!));
    setPlanOff(p => selectFood(p, mealId, profileIdx, slotId, newIngId, macrosOff!));
  };

  // ── Guardar ───────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!macrosOn || !macrosOff || !planOn.length) return;
    if (!planName.trim()) { showToast("⚠️ El plan necesita un nombre"); return; }
    setSaving(true);
    try {
      const { data: planRow, error: planErr } = await supabase
        .from("diet_plans")
        .insert({
          name:        planName.trim(),
          kcal_on:     macrosOn.kcal,    kcal_off:     macrosOff.kcal,
          protein_on:  macrosOn.protein_g, protein_off: macrosOff.protein_g,
          carbs_on:    macrosOn.carbs_g,   carbs_off:   macrosOff.carbs_g,
          fat_on:      macrosOn.fat_g,     fat_off:     macrosOff.fat_g,
          notes:       planNotes,
        })
        .select("id").single();

      if (planErr || !planRow) throw planErr ?? new Error("No plan id");
      const pid = planRow.id;

      // Para cada comida → guardar las 3 opciones como diet_options
      for (let i = 0; i < planOn.length; i++) {
        const meal = planOn[i];
        const { data: mealRow, error: mErr } = await supabase
          .from("diet_meals")
          .insert({
            plan_id:    pid,
            name:       meal.name,
            emoji:      meal.emoji,
            day_type:   "both",
            sort_order: i,
          })
          .select("id").single();

        if (mErr || !mealRow) throw mErr ?? new Error("No meal id");

        for (let j = 0; j < meal.options.length; j++) {
          const opt     = meal.options[j];
          const content = opt.foods.map(food => ({
            label:    food.label,
            slot:
              food.macro === "protein" ? "proteina" :
              food.macro === "carbs"   ? "hidrato"  :
              food.macro === "fat"     ? "grasa"    : "extra",
            isChoice: false,
            note:     food.noteText ?? "",
            items:    [{ ingId: food.ing.id, grams: food.grams }],
          }));

          await supabase.from("diet_options").insert({
            meal_id:    mealRow.id,
            name:       opt.profileLabel,
            content,
            sort_order: j,
          });
        }
      }

      // Asignar al cliente (solo si hay cliente — no en modo plantilla)
      if (clientId) {
        await supabase.from("diet_assignments").upsert(
          { client_id: clientId, plan_id: pid, active: true },
          { onConflict: "client_id" },
        );
        showToast("✅ Plan guardado y asignado al cliente");
      } else {
        showToast("✅ Plantilla guardada correctamente");
      }
      setTimeout(() => onBack(), 1500);
    } catch (e: any) {
      showToast(`❌ Error: ${e?.message ?? "desconocido"}`);
    }
    setSaving(false);
  };

  // ── Guardar dieta propia (modo cliente) ──────────────────────────
  const handleSaveClient = async () => {
    if (!macrosOn || !macrosOff || !planOn.length) return;
    setSaving(true);
    try {
      const today = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });

      // Desactivar plan cliente anterior si existe
      await supabase
        .from("diet_assignments")
        .update({ active: false })
        .eq("client_id", clientId)
        .eq("source", "client");

      const { data: planRow, error: planErr } = await supabase
        .from("diet_plans")
        .insert({
          name:        `Mi dieta — ${today}`,
          kcal_on:     macrosOn.kcal,      kcal_off:     macrosOff.kcal,
          protein_on:  macrosOn.protein_g, protein_off:  macrosOff.protein_g,
          carbs_on:    macrosOn.carbs_g,   carbs_off:    macrosOff.carbs_g,
          fat_on:      macrosOn.fat_g,     fat_off:      macrosOff.fat_g,
          notes:       "__CLIENT_GENERATED__",
        })
        .select("id").single();

      if (planErr || !planRow) throw planErr ?? new Error("No plan id");
      const pid = planRow.id;

      for (let i = 0; i < planOn.length; i++) {
        const meal = planOn[i];
        const { data: mealRow, error: mErr } = await supabase
          .from("diet_meals")
          .insert({ plan_id: pid, name: meal.name, emoji: meal.emoji, day_type: "both", sort_order: i })
          .select("id").single();
        if (mErr || !mealRow) throw mErr ?? new Error("No meal id");
        for (let j = 0; j < meal.options.length; j++) {
          const opt     = meal.options[j];
          const content = opt.foods.map(food => ({
            label:    food.label,
            slot:     food.macro === "protein" ? "proteina" : food.macro === "carbs" ? "hidrato" : food.macro === "fat" ? "grasa" : "extra",
            isChoice: false,
            note:     food.noteText ?? "",
            items:    [{ ingId: food.ing.id, grams: food.grams }],
          }));
          await supabase.from("diet_options").insert({ meal_id: mealRow.id, name: opt.profileLabel, content, sort_order: j });
        }
      }

      await supabase.from("diet_assignments").insert({
        client_id: clientId, plan_id: pid, active: true, source: "client",
      });

      showToast("✅ ¡Dieta guardada! Ya aparece en 'Mi Plan'");
    } catch (e: any) {
      showToast(`❌ Error: ${e?.message ?? "desconocido"}`);
    }
    setSaving(false);
  };

  // ── Datos del tab activo ──────────────────────────────────────────
  const activePlan   = activeTab === "on" ? planOn : planOff;
  const activeMacros = activeTab === "on" ? macrosOn : macrosOff;
  const totalGen     = activePlan.length
    ? planTotalMacros(activePlan, activeOptions)
    : null;

  const toggleMeal = (id: string) =>
    setExpandedMeals(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── Loading / error ───────────────────────────────────────────────
  if (loadingMacros) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
        <p className="text-neutral-500 text-sm">Cargando macros…</p>
      </div>
    );
  }

  // Modo plantilla: formulario estilo MacroCalculator
  if (isTemplateMode && !macrosOn) {
    const canGenerate = !!calcResult || (!!(parseFloat(tplProtein)) && !!(parseFloat(tplCarbs)));
    const previewOn = calcResult
      ? calcResult
      : { protein_g: parseFloat(tplProtein)||0, carbs_g: parseFloat(tplCarbs)||0, fat_g: parseFloat(tplFat)||0, tdee: 0 };
    const previewKcal = calcResult?.tdee ?? Math.round(previewOn.protein_g*4 + previewOn.carbs_g*4 + previewOn.fat_g*9);

    return (
      <div className="min-h-screen pb-28" style={{ background: "linear-gradient(160deg,#0A0A0A 80%,#1A0810 100%)" }}>
        <header className="px-4 py-3 flex items-center gap-3 sticky top-0 z-10 header-safe"
          style={{ background: "#0F0F0F", borderBottom: "1px solid #8B1A2F40" }}>
          <button onClick={onBack}
            className="w-9 h-9 rounded-lg text-neutral-300 flex items-center justify-center shrink-0"
            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>←</button>
          <div>
            <p className="text-white font-bold text-sm">✨ Generar plantilla</p>
            <p className="text-neutral-500 text-xs">Introduce los datos del cliente para calcular sus macros</p>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">

          {/* ── Datos personales ── */}
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "#111", border: "1px solid #1E1E1E" }}>
            <p className="text-white font-semibold text-sm">👤 Datos personales</p>

            {/* Sexo */}
            <div className="grid grid-cols-2 gap-2">
              {(["male","female"] as const).map(s => (
                <button key={s} onClick={() => setCalcSex(s)}
                  className="py-3 rounded-xl text-sm font-bold transition-colors"
                  style={calcSex === s
                    ? { background: "#fff", color: "#000" }
                    : { background: "#1A1A1A", color: "#777", border: "1px solid #2A2A2A" }}>
                  {s === "male" ? "Hombre" : "Mujer"}
                </button>
              ))}
            </div>

            {/* Edad / Altura / Peso */}
            <div className="grid grid-cols-3 gap-3">
              {([
                { label: "Edad", val: calcAge,    set: setCalcAge,    unit: "años", placeholder: "28" },
                { label: "Altura", val: calcHeight, set: setCalcHeight, unit: "cm",   placeholder: "175" },
                { label: "Peso",  val: calcWeight, set: setCalcWeight, unit: "kg",   placeholder: "75" },
              ]).map(({ label, val, set, unit, placeholder }) => (
                <div key={label} className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</label>
                  <div className="flex items-center gap-1">
                    <input type="number" value={val} onChange={e => set(e.target.value)}
                      placeholder={placeholder}
                      className="w-full rounded-lg px-2 py-2.5 text-white text-sm font-bold text-center focus:outline-none"
                      style={{ background: "#1A1A1A", border: "1px solid #333" }} />
                    <span className="text-neutral-600 text-[10px] shrink-0">{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Factor de actividad */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1.5">Factor de actividad</label>
              <select value={calcActivity} onChange={e => setCalcActivity(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none"
                style={{ background: "#1A1A1A", border: "1px solid #333" }}>
                {ACTIVITY_LEVELS.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Objetivo ── */}
          <div className="rounded-2xl p-5 space-y-3" style={{ background: "#111", border: "1px solid #1E1E1E" }}>
            <p className="text-white font-semibold text-sm">🎯 Objetivo</p>
            {GOAL_OPTIONS.map(g => (
              <button key={g.value} onClick={() => {
                setCalcGoal(g.value);
                setCalcProtMult(g.protein);
                setCalcFatMult(g.fat);
              }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors"
                style={calcGoal === g.value
                  ? { background: "#fff", border: "1px solid #fff" }
                  : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
                <div>
                  <p className={"text-sm font-semibold " + (calcGoal === g.value ? "text-black" : "text-white")}>{g.label}</p>
                  <p className={"text-xs " + (calcGoal === g.value ? "text-neutral-600" : "text-neutral-500")}>{g.sublabel}</p>
                </div>
                {calcGoal === g.value && <span className="text-emerald-600 font-bold text-lg">✓</span>}
              </button>
            ))}
          </div>

          {/* ── Preview macros calculados ── */}
          {calcResult && (
            <div className="rounded-2xl p-4 space-y-3" style={{ background: "#0A1A0A", border: "1px solid #1A3A1A" }}>
              <p className="text-[10px] uppercase tracking-wider text-emerald-600">📊 Macros calculados — Día ON</p>
              <div className="flex gap-3">
                {[
                  { label: "Proteína", val: calcResult.protein_g, color: "#F87171" },
                  { label: "Hidratos", val: calcResult.carbs_g,   color: "#FBBF24" },
                  { label: "Grasa",    val: calcResult.fat_g,     color: "#60A5FA" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ background: "#111" }}>
                    <p className="text-[10px] text-neutral-500 uppercase">{label}</p>
                    <p className="text-base font-bold tabular-nums" style={{ color }}>{val.toFixed(0)}<span className="text-xs font-normal text-neutral-500">g</span></p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 py-1.5 rounded-xl" style={{ background: "#111" }}>
                <span className="text-neutral-500 text-xs uppercase tracking-wider">Total ON</span>
                <span className="text-white font-bold text-lg">{calcResult.tdee}</span>
                <span className="text-neutral-500 text-xs">kcal</span>
              </div>
            </div>
          )}

          {/* ── Reducción OFF ── */}
          <div className="rounded-2xl p-4 space-y-2" style={{ background: "#111", border: "1px solid #1E1E1E" }}>
            <label className="text-[10px] uppercase tracking-wider text-neutral-500 block">Reducción HC en días OFF</label>
            <div className="flex gap-2">
              {[10, 13, 15, 20].map(pct => (
                <button key={pct} onClick={() => setOffPct(pct)}
                  className={"flex-1 py-2 rounded-lg text-xs font-medium transition-colors " +
                    (offPct === pct ? "bg-white text-black" : "text-neutral-400")}
                  style={offPct !== pct ? { background: "#1A1A1A", border: "1px solid #2A2A2A" } : {}}>
                  −{pct}%
                </button>
              ))}
            </div>
            {calcResult && (
              <p className="text-[10px] text-neutral-600 text-center pt-0.5">
                Hidratos OFF: {round1(calcResult.carbs_g * (1 - offPct/100)).toFixed(0)}g · {Math.round(calcResult.protein_g*4 + calcResult.carbs_g*(1-offPct/100)*4 + calcResult.fat_g*9)} kcal
              </p>
            )}
          </div>

          {/* Nombre del plan */}
          <div className="rounded-2xl p-4 space-y-2" style={{ background: "#111", border: "1px solid #1E1E1E" }}>
            <label className="text-[10px] uppercase tracking-wider text-neutral-500 block">Nombre de la plantilla</label>
            <input value={planName} onChange={e => setPlanName(e.target.value)}
              placeholder="Ej: Definición verano — Base"
              className="w-full rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none"
              style={{ background: "#1A1A1A", border: "1px solid #333" }} />
          </div>

          <button
            onClick={applyTemplateAndGenerate}
            disabled={!canGenerate}
            className="w-full py-4 rounded-xl text-white font-bold text-sm disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#8B1A2F,#C0392B)" }}>
            ✨ Generar plantilla automáticamente
          </button>

          {/* Separador con acceso a macros manuales */}
          <details className="rounded-2xl overflow-hidden" style={{ background: "#0D0D0D", border: "1px solid #1A1A1A" }}>
            <summary className="px-4 py-3 text-[10px] uppercase tracking-wider text-neutral-600 cursor-pointer select-none">
              ↳ Introducir macros manualmente
            </summary>
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-3 gap-3 pt-2">
                {([
                  { label: "💪 Proteína", val: tplProtein, set: setTplProtein, color: "text-red-400" },
                  { label: "🌾 Hidratos", val: tplCarbs,   set: setTplCarbs,   color: "text-amber-400" },
                  { label: "🥑 Grasa",    val: tplFat,     set: setTplFat,     color: "text-blue-400" },
                ] as const).map(({ label, val, set, color }) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${color}`}>{label}</label>
                    <div className="flex items-center gap-1">
                      <input type="number" step="1" value={val} onChange={e => { set(e.target.value); }}
                        className="w-full rounded-lg px-2 py-2.5 text-white text-sm font-bold text-center focus:outline-none"
                        style={{ background: "#1A1A1A", border: "1px solid #333" }} />
                      <span className="text-neutral-600 text-xs shrink-0">g</span>
                    </div>
                  </div>
                ))}
              </div>
              {previewKcal > 0 && !calcResult && (
                <p className="text-center text-neutral-500 text-xs">{previewKcal} kcal</p>
              )}
            </div>
          </details>
        </div>
      </div>
    );
  }

  // Cliente sin macros configurados
  if (macroError || !macrosOn) {
    return (
      <div className="min-h-screen" style={{ background: "#0A0A0A" }}>
        <header className="px-4 py-3 flex items-center gap-3 sticky top-0 z-10"
          style={{ background: "#0F0F0F", borderBottom: "1px solid #333" }}>
          <button onClick={onBack}
            className="w-9 h-9 rounded-lg text-neutral-300 flex items-center justify-center"
            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>←</button>
          <p className="text-white font-bold text-sm">Generar Dieta</p>
        </header>
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <span className="text-5xl mb-4">⚠️</span>
          <p className="text-white font-semibold mb-2">Sin requerimientos calóricos</p>
          <p className="text-neutral-500 text-sm leading-relaxed">
            Ve a la pestaña <strong className="text-white">Calculadora</strong> del cliente,
            introduce sus datos y guarda los requerimientos antes de generar la dieta.
          </p>
        </div>
      </div>
    );
  }

  // ── Render principal ──────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-28" style={{ background: "linear-gradient(160deg,#0A0A0A 80%,#1A0810 100%)" }}>

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg whitespace-nowrap"
          style={{ background: "#1A1A1A", border: "1px solid #333" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="px-4 py-3 flex items-center gap-3 sticky top-0 z-10"
        style={{ background: "#0F0F0F", borderBottom: "1px solid #8B1A2F40" }}>
        <button onClick={onBack}
          className="w-9 h-9 rounded-lg text-neutral-300 flex items-center justify-center shrink-0"
          style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>←</button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">
            {clientMode
              ? "🎲 Genera tu menú del día"
              : generated ? (planName || "Plan generado") : "Generar Dieta"}
          </p>
          {!clientMode && (clientName
            ? <p className="text-neutral-500 text-xs truncate">para {clientName}</p>
            : isTemplateMode && <p className="text-neutral-500 text-xs truncate">plantilla sin cliente</p>
          )}
        </div>
        {!clientMode && generated && (
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded-lg text-white text-sm font-bold disabled:opacity-40"
            style={{ background: "#8B1A2F" }}>
            {saving ? "Guardando…" : "💾 Guardar"}
          </button>
        )}
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* ── Resumen macros ON/OFF ── */}
        <div className="rounded-xl overflow-hidden" style={{ background: "#111", border: "1px solid #222" }}>
          <div className="px-4 py-3 space-y-3">
            <p className="text-white font-semibold text-sm">📊 Macros del cliente</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { label: "💪 Día ON",  m: macrosOn,  color: "text-emerald-400" },
                { label: "😴 Día OFF", m: macrosOff, color: "text-blue-400" },
              ] as const).map(({ label, m, color }) => (
                <div key={label} className="rounded-lg p-3 text-center"
                  style={{ background: "#0A0A0A", border: "1px solid #1E1E1E" }}>
                  <p className={`text-xs font-semibold mb-1 ${color}`}>{label}</p>
                  <p className="text-white text-lg font-bold">{m!.kcal} <span className="text-neutral-500 text-xs">kcal</span></p>
                  <div className="flex justify-center gap-2 mt-1 text-[10px]">
                    <span className="text-red-400">{m!.protein_g}g P</span>
                    <span className="text-amber-400">{m!.carbs_g}g HC</span>
                    <span className="text-blue-400">{m!.fat_g}g G</span>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1.5">
                Reducción HC en días OFF
              </label>
              <div className="flex gap-2">
                {[10, 13, 15, 20].map(pct => (
                  <button key={pct} onClick={() => setOffPct(pct)}
                    className={"flex-1 py-2 rounded-lg text-xs font-medium transition-colors " +
                      (offPct === pct ? "bg-white text-black" : "text-neutral-400")}
                    style={offPct !== pct ? { background: "#1A1A1A", border: "1px solid #2A2A2A" } : {}}>
                    −{pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Nombre y notas (solo admin) ── */}
        {!clientMode && (
          <div className="rounded-xl overflow-hidden" style={{ background: "#111", border: "1px solid #222" }}>
            <div className="px-4 py-3 space-y-3">
              <p className="text-white font-semibold text-sm">📋 Datos del plan</p>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1">Nombre del plan</label>
                <input value={planName} onChange={e => setPlanName(e.target.value)}
                  placeholder="Ej: Definición verano — Fran"
                  className="w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  style={{ background: "#1A1A1A", border: "1px solid #333" }} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1">Notas</label>
                <textarea value={planNotes} onChange={e => setPlanNotes(e.target.value)}
                  rows={2} placeholder="Indicaciones generales…"
                  className="w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none resize-none"
                  style={{ background: "#1A1A1A", border: "1px solid #333" }} />
              </div>
            </div>
          </div>
        )}

        {/* ── Botón generar ── */}
        {!generated ? (
          <button onClick={handleGenerate}
            className="w-full py-4 rounded-xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg,#8B1A2F,#C0392B)" }}>
            ✨ Generar plan automáticamente
          </button>
        ) : (
          <button onClick={handleGenerate}
            className="w-full py-3 rounded-xl text-sm font-medium text-neutral-400"
            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
            🔄 Regenerar desde cero
          </button>
        )}

        {/* ── Plan generado ── */}
        {generated && (
          <>
            {/* Tabs ON / OFF */}
            <div className="flex gap-1 p-1 rounded-xl"
              style={{ background: "#111", border: "1px solid #222" }}>
              {(["on", "off"] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={"flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors " +
                    (activeTab === t ? "bg-white text-black" : "text-neutral-400")}>
                  {t === "on" ? "💪 Día ON" : "😴 Día OFF"}
                  <span className="block text-xs font-normal mt-0.5 text-neutral-500">
                    {t === "on" ? macrosOn.kcal : macrosOff?.kcal} kcal
                  </span>
                </button>
              ))}
            </div>

            {/* Resumen total */}
            {totalGen && activeMacros && (
              <div className="rounded-xl px-4 py-3"
                style={{ background: "#111", border: "1px solid #222" }}>
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">Total generado vs. objetivo</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Kcal",  gen: totalGen.kcal,    tgt: activeMacros.kcal,      color: "text-white" },
                    { label: "Prot",  gen: totalGen.protein, tgt: activeMacros.protein_g, color: "text-red-400" },
                    { label: "HC",    gen: totalGen.carbs,   tgt: activeMacros.carbs_g,   color: "text-amber-400" },
                    { label: "Grasa", gen: totalGen.fat,     tgt: activeMacros.fat_g,     color: "text-blue-400" },
                  ].map(({ label, gen, tgt, color }) => (
                    <div key={label} className="rounded-lg py-2"
                      style={{ background: "#0A0A0A", border: "1px solid #1E1E1E" }}>
                      <p className={`text-sm font-bold ${color}`}>{gen}</p>
                      <p className="text-[9px] text-neutral-600">/ {tgt}</p>
                      <p className="text-[9px] text-neutral-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exportar PDF */}
            <button
              onClick={() => exportDietPDF(planOn, planOff, macrosOn, macrosOff ?? null, clientName ?? "", planName)}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:opacity-70 transition-opacity"
              style={{ background: "#1A1A1A", border: "1px solid #333", color: "#E5E7EB" }}
            >
              📄 Descargar PDF del plan completo
            </button>

            {/* Comidas */}
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 px-1">
              Comidas — 3 opciones por comida, personaliza con los desplegables
            </p>

            {activePlan.map(meal => {
              const activeOptIdx = activeOptions[meal.mealId] ?? 0;
              const activeOpt    = meal.options[activeOptIdx];
              const mt           = activeOpt ? optionMacros(activeOpt) : null;
              const isOpen       = expandedMeals.has(meal.mealId);

              return (
                <div key={meal.mealId} className="rounded-xl overflow-hidden"
                  style={{ background: "#111", border: "1px solid #222" }}>

                  {/* Cabecera comida */}
                  <button onClick={() => toggleMeal(meal.mealId)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left">
                    <span className="text-xl shrink-0">{meal.emoji}</span>
                    <span className="flex-1 text-white font-semibold text-sm">{meal.name}</span>
                    {mt && <span className="text-neutral-500 text-xs tabular-nums">{mt.kcal} kcal</span>}
                    <span className="text-neutral-500 text-sm">{isOpen ? "▲" : "▼"}</span>
                  </button>

                  {isOpen && (
                    <div className="border-t" style={{ borderColor: "#1A1A1A" }}>

                      {/* Pestañas de opción */}
                      <div className="flex gap-1 p-2">
                        {meal.options.map((opt, oIdx) => (
                          <button key={opt.profileId}
                            onClick={() => setActiveOptions(prev => ({ ...prev, [meal.mealId]: oIdx }))}
                            className={"flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors " +
                              (activeOptIdx === oIdx ? "text-white" : "text-neutral-500")}
                            style={activeOptIdx === oIdx
                              ? { background: "#8B1A2F", border: "1px solid #A01F38" }
                              : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
                            {oIdx + 1}
                          </button>
                        ))}
                      </div>

                      {/* Label de la opción activa */}
                      {activeOpt && (
                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 px-3 pb-2">
                          {activeOpt.profileLabel}
                        </p>
                      )}

                      {/* Slots de la opción activa */}
                      {activeOpt && (
                        <div className="px-3 pb-3 space-y-2">
                          {activeOpt.foods.map(food => {
                            const fm       = foodMacros(food);
                            const isFixed  = food.macro === "fixed";
                            const slotColor =
                              food.macro === "protein" ? "#F87171" :
                              food.macro === "carbs"   ? "#FBBF24" :
                              food.macro === "fat"     ? "#60A5FA" : "#A78BFA";

                            return (
                              <div key={food.slotId} className="rounded-lg p-3 space-y-2"
                                style={{ background: "#0A0A0A", border: "1px solid #1E1E1E" }}>

                                {/* Etiqueta + gramos */}
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold uppercase tracking-wider"
                                    style={{ color: slotColor }}>
                                    {food.label}
                                  </span>
                                  <span className={`text-xs font-mono ${food.grams > 350 ? "text-amber-400" : "text-neutral-400"}`}>
                                    {food.grams} g{food.grams > 350 ? " ⚠" : ""}
                                  </span>
                                </div>
                                {food.grams > 350 && food.macro !== "fixed" && (
                                  <p className="text-[10px] text-amber-600">
                                    Porción grande — normal en alimentos de baja densidad (patata, boniato…)
                                  </p>
                                )}

                                {/* Select */}
                                {food.availablePool.length > 1 ? (
                                  <select
                                    value={food.ing.id}
                                    onChange={e => doSelect(meal.mealId, activeOptIdx, food.slotId, e.target.value)}
                                    className="w-full rounded-lg px-2.5 py-2 text-white text-sm focus:outline-none"
                                    style={{ background: "#1A1A1A", border: `1px solid ${slotColor}35` }}>
                                    {food.availablePool.map(ing => (
                                      <option key={ing.id} value={ing.id}>{ing.name}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <p className="text-white text-sm">{food.ing.name}</p>
                                )}

                                {/* Macros del alimento */}
                                {!isFixed && (
                                  <div className="flex gap-3 text-[10px]">
                                    <span className="text-neutral-500">{fm.kcal} kcal</span>
                                    <span className="text-red-400">{fm.protein}g P</span>
                                    <span className="text-amber-400">{fm.carbs}g HC</span>
                                    <span className="text-blue-400">{fm.fat}g G</span>
                                  </div>
                                )}

                                {/* Nota libre */}
                                {food.noteText && (
                                  <p className="text-neutral-600 text-[10px]">{food.noteText}</p>
                                )}
                              </div>
                            );
                          })}

                          {/* Macros totales opción */}
                          {mt && (
                            <div className="flex gap-3 px-1 pt-1 text-[10px]">
                              <span className="text-neutral-500 font-medium">Total opción:</span>
                              <span className="text-red-400">{mt.protein}g P</span>
                              <span className="text-amber-400">{mt.carbs}g HC</span>
                              <span className="text-blue-400">{mt.fat}g G</span>
                              <span className="text-neutral-500">{mt.kcal} kcal</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Guardar bottom (admin) */}
            {!clientMode && (
              <div className="pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="w-full py-4 rounded-xl text-white font-bold text-sm disabled:opacity-40"
                  style={{ background: "#8B1A2F" }}>
                  {saving ? "Guardando…" : "💾 Guardar y asignar al cliente"}
                </button>
                <p className="text-[10px] text-neutral-600 text-center mt-2">
                  Se guardan las 3 opciones por comida. El cliente ve todas y elige la que prefiera.
                </p>
              </div>
            )}

            {/* Guardar bottom (cliente) */}
            {clientMode && (
              <div className="pt-2 space-y-2">
                <button onClick={handleSaveClient} disabled={saving}
                  className="w-full py-4 rounded-xl text-white font-bold text-sm disabled:opacity-40 active:opacity-70"
                  style={{ background: "linear-gradient(135deg, #8B1A2F, #C0392B)" }}>
                  {saving ? "Guardando…" : "💾 Guardar como mi dieta"}
                </button>
                <p className="text-[10px] text-neutral-600 text-center">
                  Se guarda en "Mi Plan" y puedes consultarla cuando quieras.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
