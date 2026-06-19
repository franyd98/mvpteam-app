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
  maxG?:        number;   // cap máximo de porción (evita escalados absurdos hacia arriba)
  minG?:        number;   // mínimo de porción (evita porciones ridículas hacia abajo)
  noteText?:    string;
  autoAddIso?:  boolean;   // en slots proteína-láctea: calcula gramos ISO complementarios para cuadrar macros
}

interface MealProfileDef {
  id:    string;
  label: string;                // etiqueta corta, ej. "Lácteos + Avena"
  slots: ProfileSlotDef[];
}

interface MealDef {
  id:        string;
  name:      string;
  emoji:     string;
  profiles:  MealProfileDef[];  // siempre 3 opciones
  carbScale?: number;  // factor multiplicador de los hidratos en esta comida (default 1.0)
                       // Permite redistribuir HC entre tomas sin romper el total del cliente
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
    carbScale: 0.70,  // Menos HC en desayuno — las calorías van más a proteína y grasa aquí
    profiles: [
      {
        id: "c1_a", label: "Elaborada — Tortitas / Bizcocho",
        slots: [
          // Huevo/claras es la proteína base de esta opción
          { id: "huevo", label: "Base", macro: "fixed", pct: 0, fixedG: 60,
            ingIds: ["huevo"],
            noteText: "Puedes usar 125ml claras + 1 huevo entero. Bate junto con la proteína, la leche y el hidrato para hacer tortitas o bizcocho de micro." },
          // ISO / Whey — siempre mezclado con leche en la masa, nunca solo
          { id: "prot", label: "Proteína en polvo", macro: "protein", pct: 20, minG: 20, maxG: 40,
            ingIds: ["iso","whey"],
            noteText: "Disuelve en la leche antes de batir con el huevo y el hidrato para hacer la masa de las tortitas." },
          // Leche para la masa (base líquida para disolver el ISO y dar textura a las tortitas)
          { id: "leche", label: "Leche para la masa", macro: "fixed", pct: 0, fixedG: 150,
            ingIds: ["leche_vegetal_gen","leche_almendra","leche_avena","leche_prot"],
            noteText: "Elige la que prefieras. Disuelve aquí la proteína en polvo antes de añadir el huevo y el hidrato." },
          // Solo avena o pan para batir — NO cereales de cuchara
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 25, maxG: 130,
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
            autoAddIso: true },  // ISO calculado dinámicamente — se disuelve en el propio yogur/lácteo
          { id: "hc", label: "Cereales", macro: "carbs", pct: 25, maxG: 130,
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
          { id: "hc", label: "Pan / Tortas", macro: "carbs", pct: 25, maxG: 130,
            ingIds: ["pan_centeno","pan_tostado","pan_integral_pan","pan_fibra","pan_wasa","tortas_arroz","tortas_maiz"] },
          // Solo proteínas frías que van encima del pan: fiambre, queso, jamón, atún
          { id: "prot", label: "Proteína", macro: "protein", pct: 20, minG: 50, maxG: 120,
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
    carbScale: 0.65,  // Toma menor — sólo pan/tortas, poca cantidad
    profiles: [
      {
        id: "c2_a", label: "Pan + Embutido / Jamón",
        slots: [
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 25, maxG: 130,
            ingIds: ["pan_fibra","pan_centeno","pan_tostado","pan_integral_pan",
                     "pan_wasa","tortas_arroz","tortas_maiz"] },
          { id: "prot", label: "Proteína", macro: "protein", pct: 15, minG: 50, maxG: 100,
            ingIds: ["lomo_embuchado","lomo_curado_pavo","jamon","fiambre_pavo","salchi_pavo_3"] },
          { id: "fat", label: "Grasa", macro: "fat", pct: 5,
            ingIds: ["aceite_oliva","aguacate","guacamole"],
            noteText: "Si comes pan añade tomate rallado para que no quede seco." },
        ],
      },
      {
        id: "c2_b", label: "Pan + Queso fresco / Atún",
        slots: [
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 25, maxG: 130,
            ingIds: ["pan_fibra","pan_centeno","pan_tostado","pan_integral_pan",
                     "pan_wasa","tortas_arroz","tortas_maiz"] },
          { id: "prot", label: "Proteína", macro: "protein", pct: 15, minG: 50, maxG: 150,
            ingIds: ["qso_fresco","atun_lata","fiambre_pavo","lomo_curado_pavo","jamon"] },
          { id: "fat", label: "Grasa", macro: "fat", pct: 5,
            ingIds: ["aceite_oliva","aguacate","guacamole","aceitunas"],
            noteText: "Si comes pan añade tomate rallado para que no quede seco." },
        ],
      },
      {
        id: "c2_c", label: "Bocadillo / Wrap (pan de molde o fajita)",
        slots: [
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 25, maxG: 130,
            ingIds: ["pan_molde","fajitas","pan_blanco","pan_centeno","pan_integral_pan"] },
          { id: "prot", label: "Proteína", macro: "protein", pct: 15, minG: 50, maxG: 150,
            ingIds: ["qso_eatlean","fiambre_pavo","jamon","lomo_curado_pavo","qso_fresco","atun_lata"] },
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
    carbScale: 1.45,  // Comida principal — más HC para saciedad (arroz, pasta, patata)
    profiles: [
      {
        // Opción 1: Carne / Pescado + HC (pasta, arroz, patata…)
        id: "c3_a", label: "Carne / Pescado + Pasta / Arroz",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 25, minG: 100, maxG: 200,
            // Exactamente los mismos que en el PDF
            ingIds: ["pollo","pavo","lomo_cerdo","ternera","picada_pollo","hamburguesa",
                     "merluza","lenguado","lubina","tilapia","atun_lata","gambas","sepia"] },
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 25, maxG: 220,
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
          { id: "prot", label: "Proteína", macro: "protein", pct: 25, minG: 120, maxG: 220,
            ingIds: ["merluza","tilapia","lenguado","lubina","sepia","gambas","calamar","salmon","trucha"] },
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 25, maxG: 250,
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
          { id: "prot", label: "Proteína", macro: "protein", pct: 25, minG: 100, maxG: 180,
            ingIds: ["salmon","ternera","trucha","lomo_atun","pollo","pavo","lomo_cerdo"] },
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 25, maxG: 220,
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
    carbScale: 0.85,  // Merienda — moderada en HC
    profiles: [
      {
        // ⚠️ Solo lácteos con cereales — NO queso fresco tipo burgos aquí
        id: "c4_a", label: "Opción 1 — Yogur / Mousse + Cereal",
        slots: [
          { id: "prot", label: "Proteína láctea", macro: "protein", pct: 20,
            ingIds: ["yogur_prot","yogur_griego","mousse_prot","qso_batido","leche_prot","yogur_sln"],
            autoAddIso: true },  // ISO calculado dinámicamente para completar el objetivo proteico
          { id: "hc", label: "Cereales", macro: "carbs", pct: 15, maxG: 110,
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
          { id: "prot", label: "Proteína ISO", macro: "protein", pct: 20, minG: 25, maxG: 40,
            ingIds: ["iso","whey"] },
          { id: "leche", label: "Leche vegetal", macro: "fixed", pct: 0, fixedG: 250,
            ingIds: ["leche_vegetal_gen"],
            noteText: "Sin azúcares añadidos (almendra, avena, soja, arroz...)" },
          { id: "hc", label: "Cereales", macro: "carbs", pct: 15, maxG: 110,
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
          { id: "hc", label: "Pan / Tortas", macro: "carbs", pct: 15, maxG: 110,
            ingIds: ["pan_tostado","pan_fibra","pan_wasa","tortas_arroz","tortas_maiz","pan_centeno","pan_integral_pan"] },
          { id: "prot", label: "Proteína", macro: "protein", pct: 20, minG: 50, maxG: 120,
            ingIds: ["fiambre_pavo","lomo_curado_pavo","jamon","lomo_embuchado","atun_lata","qso_fresco"] },
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
    carbScale: 1.35,  // Cena — HC notables para saciedad nocturna y recuperación
    profiles: [
      {
        id: "c5_a", label: "Pescado blanco + Patata / Boniato",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20, minG: 120, maxG: 200,
            ingIds: ["merluza","tilapia","lenguado","lubina","gambas","sepia","calamar"] },
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 10, maxG: 200,
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
          { id: "prot", label: "Proteína", macro: "protein", pct: 20, minG: 100, maxG: 200,
            ingIds: ["pollo","pavo","picada_pollo","lomo_cerdo","ternera","hamburguesa","salchi_pavo_3"] },
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 10, maxG: 175,
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
          { id: "prot", label: "Proteína", macro: "protein", pct: 20, minG: 100, maxG: 180,
            ingIds: ["salmon","ternera","trucha","lomo_atun","atun_lata","calamar","sepia","gambas"] },
          { id: "hc", label: "Hidratos", macro: "carbs", pct: 10, maxG: 175,
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
  leche_vegetal_gen: 250,
  qso_eatlean:      100,
  mozza_light:      100,
  havarti:           50,
  qso_pizza:         50,
  // Hidratos — cereales / avena
  harina_avena:      65,   // tortitas / bizcocho: 65g base (escala según macros)
  avena_copos:       65,
  avena_crunchy:     60,
  corn_flakes:       55,
  weetabix:          55,
  copos_trigo:       55,
  rice_krispies:     55,
  cereal_mix:        55,
  crema_arroz:       55,
  choco_zero:        45,
  // Hidratos — pasta / arroz / tubérculos
  // NOTA: estas son porciones BASE (escala=1). El plan se escala
  // proporcionalmente a los macros de cada cliente.
  pasta:             70,
  pasta_integral:    70,
  arroz:             70,
  arroz_int:         70,
  noodles_arroz:     70,
  cuscus:            75,
  noquis:           140,
  arroz_3del:       100,
  arroz_bolsita:    125,
  patata:           175,
  patata_bote:      175,
  boniato:          150,
  boniato_rojo:     150,
  // Hidratos — pan / tortas
  pan_centeno:       65,
  pan_integral_pan:  65,
  pan_tostado:       55,
  pan_fibra:         65,
  pan_wasa:          55,
  pan_molde:         70,
  pan_blanco:        70,
  fajitas:           85,
  tortas_legumbre:   65,
  tortas_arroz:      65,
  tortas_maiz:       65,
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

// ── Matriz de contribuciones cruzadas (calculada dinámicamente desde MEAL_DEFS) ──
// Se calcula al cargarse el módulo para que refleje siempre los STANDARD_PORTIONS
// y los ingIds reales, sin necesidad de calibración manual.
const MC = (() => {
  let pP=0, pC=0, pF=0;
  let cP=0, cC=0, cF=0;
  let fP=0, fC=0, fF=0;
  let fixP=0, fixC=0, fixF=0;

  for (const meal of MEAL_DEFS) {
    const nProf = meal.profiles.length;
    const mealCarbScale = meal.carbScale ?? 1;  // redistribución de HC por toma
    for (const profile of meal.profiles) {
      const w = 1 / nProf;
      for (const slot of profile.slots) {
        const pool = slot.ingIds
          .map(id => ingredients.find(i => i.id === id))
          .filter((i): i is Ingredient => !!i);
        if (!pool.length) continue;

        const n = pool.length;
        const avgProt  = pool.reduce((s, i) => s + i.protein, 0) / n;
        const avgCarbs = pool.reduce((s, i) => s + i.carbs,   0) / n;
        const avgFat   = pool.reduce((s, i) => s + i.fat,     0) / n;
        const avgPortG = pool.reduce((s, i) => s + (STANDARD_PORTIONS[i.id] ?? 100), 0) / n;

        // Slots fijos o condimentos: contribuyen siempre, no se escalan
        if (slot.macro === "fixed" || pool.every(i => FIXED_CONDIMENTS.has(i.id))) {
          const g = slot.fixedG ?? avgPortG;
          fixP += w * avgProt  * g / 100;
          fixC += w * avgCarbs * g / 100;
          fixF += w * avgFat   * g / 100;
          continue;
        }

        // Slots autoAddIso: la proteína extra del ISO va a los fijos
        if (slot.autoAddIso) {
          // Estimamos contribución de los lácteos a porción estándar
          fixP += w * avgProt  * avgPortG / 100;
          fixC += w * avgCarbs * avgPortG / 100;
          fixF += w * avgFat   * avgPortG / 100;
          continue;
        }

        // Slots escalables — los HC usan mealCarbScale para redistribuir entre tomas
        const g = avgPortG;
        if (slot.macro === "protein") {
          pP += w * avgProt  * g / 100;
          pC += w * avgCarbs * g / 100;
          pF += w * avgFat   * g / 100;
        } else if (slot.macro === "carbs") {
          // Multiplicar por mealCarbScale: tomas con más scale aportan más a la matriz,
          // lo que provoca que sC se ajuste para que el total de HC del cliente cuadre
          // distribuyéndolos según el peso relativo de cada toma.
          cP += w * avgProt  * g * mealCarbScale / 100;
          cC += w * avgCarbs * g * mealCarbScale / 100;
          cF += w * avgFat   * g * mealCarbScale / 100;
        } else if (slot.macro === "fat") {
          fP += w * avgProt  * g / 100;
          fC += w * avgCarbs * g / 100;
          fF += w * avgFat   * g / 100;
        }
      }
    }
  }

  return {
    pP: Math.max(pP, 1), pC, pF,
    cP, cC: Math.max(cC, 1), cF,
    fP, fC, fF: Math.max(fF, 1),
    fixP, fixC, fixF,
  };
})();

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
  maxG?:  number,
  minG?:  number,
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
  let g = Math.max(Math.round(scaledG / 5) * 5, 5);
  if (maxG !== undefined) g = Math.min(g, maxG);
  if (minG !== undefined) g = Math.max(g, minG);
  return g;
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
    const mealCarbScale = meal.carbScale ?? 1;
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
        } else if (slot.macro === "carbs") {
          // Aplicar mealCarbScale al factor de escala de HC para redistribuir entre tomas
          const scaledForMeal = { ...scales, sC: scales.sC * mealCarbScale };
          grams = getScaledPortionG(ing, slot.macro, scaledForMeal, slot.maxG, slot.minG);
        } else {
          grams = getScaledPortionG(ing, slot.macro, scales, slot.maxG, slot.minG);
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

        // ── AutoAddIso: añadir ISO como food independiente ──
        if (slot.autoAddIso) {
          const isoIng = ingredients.find(i => i.id === "iso");
          if (isoIng) {
            const protTgt   = macros.protein_g * slot.pct / 100;
            const dairyProt = ing.protein * grams / 100;
            const isoRaw    = Math.max(0, (protTgt - dairyProt) / (isoIng.protein / 100));
            const isoG      = Math.round(isoRaw / 5) * 5;
            if (isoG > 0) {
              foods.push({
                slotId:        `${slot.id}_iso`,
                label:         "Proteína ISO (complemento)",
                ing:           isoIng,
                grams:         isoG,
                macro:         "protein",
                targetG:       isoG,
                pct:           0,
                availablePool: [isoIng],
                noteText:      "Disuelve directamente en el yogur / lácteo anterior. Completa el objetivo proteico.",
              });
            }
          }
        }
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

    const mealDef = MEAL_DEFS.find(m => m.id === meal.mealId);
    const mealCarbScale = mealDef?.carbScale ?? 1;

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
              const slotDef2 = MEAL_DEFS.flatMap(m => m.profiles).flatMap(p => p.slots).find(s => s.id === slotId);
              if (food.macro === "carbs") {
                const scaledForMeal = { ...scales, sC: scales.sC * mealCarbScale };
                grams = getScaledPortionG(ing, food.macro, scaledForMeal, slotDef2?.maxG, slotDef2?.minG);
              } else {
                grams = getScaledPortionG(ing, food.macro, scales, slotDef2?.maxG, slotDef2?.minG);
              }
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
// Formato: 2 columnas (Día ON | Día OFF), listas numeradas de alternativas
// por slot, estilo limpio tipo documento del nutricionista.
// ─────────────────────────────────────────────────────────────────────────────

function exportDietPDF(
  planOn:     GeneratedMeal[],
  planOff:    GeneratedMeal[],
  macrosOn:   DailyMacros,
  macrosOff:  DailyMacros | null,
  clientName: string,
  planName:   string,
) {
  const today     = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  const scalesOn  = computeClientScales(macrosOn);
  const scalesOff = macrosOff ? computeClientScales(macrosOff) : null;
  const isoIng    = ingredients.find(i => i.id === "iso") ?? null;
  const COLORS    = ["#8B1A2F", "#6B3080", "#1A5E8F", "#1A6B3A", "#7A5C1A"];

  type Scales = { sP: number; sC: number; sF: number };

  function getSlotDef(mealId: string, profileId: string, slotId: string): ProfileSlotDef | null {
    const meal = MEAL_DEFS.find(m => m.id === mealId);
    const prof = meal?.profiles.find(p => p.id === profileId);
    return prof?.slots.find(s => s.id === slotId) ?? null;
  }

  // ── Renderiza un slot para un día concreto (ON o OFF) ─────────────────────
  function renderSlot(
    food:    GeneratedFood,
    slotDef: ProfileSlotDef | null,
    scales:  Scales,
    macros:  DailyMacros,
  ): string {
    const allCondiments = food.availablePool.every(i => FIXED_CONDIMENTS.has(i.id));
    const note = slotDef?.noteText ? `<div class="snote">${slotDef.noteText}</div>` : "";

    // ── Fijo: huevo, fruta ──
    if (food.macro === "fixed") {
      if (food.slotId === "fruta") {
        const variants = food.availablePool.map(i => i.name).join(", ");
        return `<div class="sf">🍓 <strong>${food.grams}g</strong> Fruta variada<span class="fnote"> — ${variants}</span></div>`;
      }
      return `<div class="sf">✅ <strong>${food.grams}g</strong> ${food.ing.name}${note}</div>`;
    }

    // ── Condimentos (aceite, chocolate — grams fijas) ──
    if (allCondiments) {
      const opts = food.availablePool
        .map(i => `${STANDARD_PORTIONS[i.id] ?? 10}g ${i.name}`)
        .join("  o  ");
      return `<div class="sf">🫒 <em>Elige:</em> ${opts}</div>`;
    }

    // ── AutoAddIso: lácteo + complemento ISO ──
    if (slotDef?.autoAddIso && isoIng) {
      const alts = food.availablePool.map(ing => {
        const dairyG    = STANDARD_PORTIONS[ing.id] ?? 200;
        const protTgt   = macros.protein_g * food.pct / 100;
        const dairyProt = ing.protein * dairyG / 100;
        const isoRaw    = Math.max(0, (protTgt - dairyProt) / (isoIng.protein / 100));
        const isoG      = Math.round(isoRaw / 5) * 5;
        const isoStr    = isoG > 0 ? ` + <strong>${isoG}g ISO</strong>` : "";
        return `<li><strong>${dairyG}g</strong> ${ing.name}${isoStr}</li>`;
      }).join("");
      return `<div class="sv"><div class="slbl">🥩 Proteína a elegir entre:</div><ol>${alts}</ol>${note}</div>`;
    }

    // ── Slot escalable: lista numerada de todas las alternativas ──
    const icon = food.macro === "protein" ? "🥩"
               : food.macro === "carbs"   ? "🌾"
                                          : "🫒";
    const lbl  = food.macro === "protein" ? "Proteína a elegir entre:"
               : food.macro === "carbs"   ? "Hidratos a elegir entre:"
                                          : "Grasa a elegir entre:";

    const items = food.availablePool.map(ing => {
      let g = getScaledPortionG(ing, food.macro, scales, slotDef?.maxG, slotDef?.minG);
      if (g <= 0) g = STANDARD_PORTIONS[ing.id] ?? 100; // fallback cuando sF=0
      return `<li><strong>${g}g</strong> ${ing.name}</li>`;
    }).join("");

    return `<div class="sv"><div class="slbl">${icon} ${lbl}</div><ol>${items}</ol>${note}</div>`;
  }

  // ── Renderiza las opciones de UNA comida para UN día ──────────────────────
  function renderDayMeal(
    meal:   GeneratedMeal,
    scales: Scales,
    macros: DailyMacros,
    col:    string,
  ): string {
    return meal.options.map((opt, i) => {
      const label   = ["A", "B", "C"][i] ?? String(i + 1);
      const slots   = opt.foods.map(food => {
        const def = getSlotDef(meal.mealId, opt.profileId, food.slotId);
        return renderSlot(food, def, scales, macros);
      }).join("");
      return `<div class="opt">
        <div class="ohd">
          <span class="obadge" style="background:${col}">OPCIÓN ${label}</span>
          <span class="olbl">${opt.profileLabel}</span>
        </div>
        <div class="obody">${slots}</div>
      </div>`;
    }).join("");
  }

  // ── Renderiza una comida completa (2 columnas ON | OFF) ───────────────────
  function renderMeal(mIdx: number): string {
    const mOn  = planOn[mIdx];
    const mOff = planOff[mIdx] ?? null;
    const col  = COLORS[mIdx % COLORS.length];
    const hasOff = !!mOff && !!scalesOff && !!macrosOff;

    const onHtml  = renderDayMeal(mOn, scalesOn, macrosOn, col);
    const offHtml = hasOff ? renderDayMeal(mOff!, scalesOff!, macrosOff!, col) : "";

    const layout = hasOff
      ? `<div class="mcols">
           <div class="dcol"><div class="dlbl on-lbl">💪 DÍA ON · ${macrosOn.kcal} kcal</div>${onHtml}</div>
           <div class="dcol"><div class="dlbl off-lbl">😴 DÍA OFF · ${macrosOff!.kcal} kcal</div>${offHtml}</div>
         </div>`
      : `<div class="mcol-single">${onHtml}</div>`;

    return `<div class="meal">
      <div class="mhd" style="background:${col}"><span style="font-size:22px;line-height:1">${mOn.emoji}</span><span>${mOn.name.toUpperCase()}</span></div>
      ${layout}
    </div>`;
  }

  // ── HTML final ────────────────────────────────────────────────────────────
  const mealsHtml = planOn.map((_, i) => renderMeal(i)).join("");

  const onKcalLine  = `<span style="color:#C0392B;font-weight:700">${macrosOn.protein_g}g P</span> · <span style="color:#D68910;font-weight:700">${macrosOn.carbs_g}g HC</span> · <span style="color:#2980B9;font-weight:700">${macrosOn.fat_g}g G</span>`;
  const offKcalLine = macrosOff
    ? `<span style="color:#C0392B;font-weight:700">${macrosOff.protein_g}g P</span> · <span style="color:#D68910;font-weight:700">${macrosOff.carbs_g}g HC</span> · <span style="color:#2980B9;font-weight:700">${macrosOff.fat_g}g G</span>`
    : "";

  const html = `<!DOCTYPE html><html lang="es"><head>
  <meta charset="utf-8">
  <title>${planName || "Plan Nutricional"}${clientName ? " — " + clientName : ""}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;
         background:#f5f5f5;font-size:13px;line-height:1.55}

    /* ── Cabecera ── */
    .hdr{background:linear-gradient(135deg,#0d0d0d 0%,#1e0a10 55%,#090d1e 100%);
         color:#fff;padding:30px 32px 26px;display:flex;
         align-items:flex-start;justify-content:space-between;
         margin-bottom:24px;border-radius:0 0 16px 16px}
    .brand{font-size:9px;font-weight:900;letter-spacing:.35em;color:#C0394F;
           text-transform:uppercase;margin-bottom:8px}
    .plan-title{font-size:26px;font-weight:800;letter-spacing:-.02em;line-height:1.15;color:#fff}
    .plan-sub{font-size:14px;color:#bbb;margin-top:6px;font-weight:500}
    .hdr-r{text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:6px}
    .hdr-date{font-size:10px;color:#888;background:rgba(255,255,255,.07);
              padding:4px 10px;border-radius:20px}
    .hdr-hint{font-size:9.5px;color:#666;margin-top:2px}

    /* ── Macro boxes ── */
    .mboxes{display:grid;grid-template-columns:1fr 1fr;gap:14px;
            margin:0 0 22px;padding-bottom:22px;border-bottom:2px solid #e8e8e8}
    .mbox{border-radius:12px;padding:16px 20px;border:1px solid #e4e4e4;background:#fff;
          box-shadow:0 2px 8px rgba(0,0,0,.06)}
    .mbox-on{border-left:5px solid #C0394F}
    .mbox-off{border-left:5px solid #3B4F9F}
    .dlbl2{font-size:9px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px}
    .mbox-on .dlbl2{color:#C0394F}
    .mbox-off .dlbl2{color:#3B4F9F}
    .kc{font-size:30px;font-weight:800;line-height:1.1;color:#111}
    .kc-u{font-size:13px;font-weight:400;color:#888;margin-left:4px}
    .ml{font-size:11px;margin-top:8px;display:flex;gap:14px}

    /* ── Comida ── */
    .meal{margin-bottom:20px;border-radius:14px;overflow:hidden;
          border:1px solid #e0e0e0;break-inside:avoid;
          background:#fff;box-shadow:0 3px 12px rgba(0,0,0,.07)}
    .mhd{display:flex;align-items:center;gap:12px;padding:13px 20px;
         color:#fff;font-weight:800;font-size:14px;letter-spacing:.04em}

    /* ── 2 columnas ON/OFF ── */
    .mcols{display:grid;grid-template-columns:1fr 1fr}
    .dcol{border-right:1px solid #ebebeb}
    .dcol:last-child{border-right:none}
    .dlbl{font-size:9px;font-weight:900;letter-spacing:.12em;
          text-transform:uppercase;padding:8px 16px;border-bottom:1px solid #eee}
    .on-lbl{color:#B02030;background:#FEF2F2}
    .off-lbl{color:#2B3E8A;background:#EEF2FF}

    /* ── Opción ── */
    .opt{border-bottom:1px solid #f2f2f2}
    .opt:last-child{border-bottom:none}
    .ohd{display:flex;align-items:center;gap:8px;padding:8px 16px;
         background:#fafafa;border-bottom:1px solid #f0f0f0}
    .obadge{font-size:9px;font-weight:900;color:#fff;padding:3px 9px;
            border-radius:5px;letter-spacing:.06em;flex-shrink:0}
    .olbl{font-size:10.5px;color:#999;font-style:italic}
    .obody{padding:10px 16px 13px}

    /* ── Slot fijo ── */
    .sf{display:flex;align-items:baseline;gap:6px;padding:3.5px 0;font-size:12px;color:#2a2a2a}
    .sf strong{font-weight:800;font-size:12.5px;background:#f3f3f3;
               padding:1px 5px;border-radius:4px;color:#111}
    .fnote{font-size:9px;color:#bbb;font-style:italic;margin-left:2px}

    /* ── Slot variable (lista de alternativas) ── */
    .sv{margin:8px 0 5px}
    .slbl{font-size:10px;font-weight:800;color:#888;text-transform:uppercase;
          letter-spacing:.07em;margin-bottom:5px}
    .sv ol{padding-left:0;margin:0;list-style:none}
    .sv li{font-size:12px;color:#222;padding:3px 0;display:flex;
           align-items:baseline;gap:6px;border-bottom:1px solid #f5f5f5}
    .sv li:last-child{border-bottom:none}
    .sv li strong{font-weight:800;font-size:12.5px;background:#f3f3f3;
                  padding:1px 5px;border-radius:4px;color:#111;flex-shrink:0}
    .sv li::before{content:"·";color:#ddd;font-size:14px;flex-shrink:0}

    /* ── Nota de slot ── */
    .snote{font-size:9.5px;color:#a06020;font-style:italic;margin-top:5px;
           padding-left:10px;line-height:1.5;border-left:2px solid #FDE68A}

    footer{margin-top:24px;padding:12px 0;border-top:1px solid #e8e8e8;
           font-size:9px;color:#ccc;text-align:center;letter-spacing:.04em}

    @media print{
      body{background:#fff;padding:0}
      .meal{box-shadow:none}
      .mbox{box-shadow:none}
      @page{size:A4 portrait;margin:10mm 10mm}
    }
  </style>
  </head><body>

  <div class="hdr">
    <div>
      <div class="brand">MVP Team · Nutrición</div>
      <div class="plan-title">${planName || "Plan Nutricional"}</div>
      ${clientName ? `<div class="plan-sub">Plan de ${clientName}</div>` : ""}
    </div>
    <div class="hdr-r">
      <div class="hdr-date">${today}</div>
      <div class="hdr-hint">Elige 1 opción por comida · A · B · C</div>
    </div>
  </div>

  <div class="mboxes">
    <div class="mbox mbox-on">
      <div class="dlbl2">💪 Día ON</div>
      <div class="kc">${macrosOn.kcal}<span class="kc-u">kcal</span></div>
      <div class="ml">${onKcalLine}</div>
    </div>
    ${macrosOff ? `<div class="mbox mbox-off">
      <div class="dlbl2">😴 Día OFF</div>
      <div class="kc">${macrosOff.kcal}<span class="kc-u">kcal</span></div>
      <div class="ml">${offKcalLine}</div>
    </div>` : ""}
  </div>

  ${mealsHtml}

  <footer>Plan generado por MVP Team · ${today} · Cantidades personalizadas según macros objetivo · Pesa los alimentos en crudo y en seco</footer>
  </body></html>`;

  // ── Descargar como HTML ───────────────────────────────────────────────────
  try {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    const safe = clientName
      ? clientName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      : "plan";
    a.href     = url;
    a.download = `plan-nutricional-${safe}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  } catch {
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
  // Modo cliente con macros ya cargados — toggle para recalcular
  const [showClientRecalc, setShowClientRecalc] = useState(false);

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

  // ── Actualizar macros del cliente (clientMode con macros ya cargados) ──
  const handleClientRecalcAndApply = async () => {
    if (!clientId || !calcResult) return;
    const p    = calcResult.protein_g;
    const c    = calcResult.carbs_g;
    const f    = calcResult.fat_g;
    const tdee = calcResult.tdee;
    await supabase.from("client_macros").upsert(
      { client_id: clientId, protein_g: Math.round(p*10)/10, carbs_g: Math.round(c*10)/10, fat_g: Math.round(f*10)/10, tdee: Math.round(tdee) },
      { onConflict: "client_id" },
    );
    const on: DailyMacros = { protein_g: p, carbs_g: c, fat_g: f, kcal: tdee };
    const offCarbs = round1(c * (1 - offPct / 100));
    const off: DailyMacros = { protein_g: p, carbs_g: offCarbs, fat_g: f, kcal: Math.round(p*4 + offCarbs*4 + f*9) };
    setMacrosOn(on);
    setMacrosOff(off);
    setShowClientRecalc(false);
    setGenerated(false);  // reset plan para que regeneren con nuevos macros
    showToast("✅ Macros actualizados");
  };

  // ── Guardar macros del cliente y generar (clientMode sin macros previos) ──
  const handleClientCalcAndGenerate = async () => {
    if (!clientId) return;
    const p    = calcResult ? calcResult.protein_g : (parseFloat(tplProtein) || 0);
    const c    = calcResult ? calcResult.carbs_g   : (parseFloat(tplCarbs)   || 0);
    const f    = calcResult ? calcResult.fat_g     : (parseFloat(tplFat)     || 0);
    const tdee = calcResult?.tdee ?? Math.round(p * 4 + c * 4 + f * 9);
    // Persistir en client_macros para que próximas visitas los carguen
    await supabase.from("client_macros").upsert(
      { client_id: clientId, protein_g: Math.round(p*10)/10, carbs_g: Math.round(c*10)/10, fat_g: Math.round(f*10)/10, tdee: Math.round(tdee) },
      { onConflict: "client_id" },
    );
    setMacroError(false);
    applyTemplateAndGenerate();
  };

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

      // Desactivar TODAS las asignaciones anteriores del cliente (pasan al historial)
      await supabase
        .from("diet_assignments")
        .update({ active: false })
        .eq("client_id", clientId);

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

  // Modo calculadora: formulario para introducir datos y calcular macros.
  // Se muestra en plantilla sin cliente (isTemplateMode) O cuando el cliente
  // no tiene macros guardadas todavía (clientMode && !macrosOn).
  const showCalcForm = (isTemplateMode && !macrosOn) || (clientMode && !loadingMacros && !macrosOn);
  if (showCalcForm) {
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
            <p className="text-white font-bold text-sm">
              {clientMode ? "📊 Calcular mis macros" : "✨ Generar plantilla"}
            </p>
            <p className="text-neutral-500 text-xs">
              {clientMode
                ? "Introduce tus datos para personalizar tu dieta"
                : "Introduce los datos del cliente para calcular sus macros"}
            </p>
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

          {/* Nombre del plan — solo en modo plantilla (admin) */}
          {isTemplateMode && (
            <div className="rounded-2xl p-4 space-y-2" style={{ background: "#111", border: "1px solid #1E1E1E" }}>
              <label className="text-[10px] uppercase tracking-wider text-neutral-500 block">Nombre de la plantilla</label>
              <input value={planName} onChange={e => setPlanName(e.target.value)}
                placeholder="Ej: Definición verano — Base"
                className="w-full rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none"
                style={{ background: "#1A1A1A", border: "1px solid #333" }} />
            </div>
          )}

          <button
            onClick={clientMode ? handleClientCalcAndGenerate : applyTemplateAndGenerate}
            disabled={!canGenerate}
            className="w-full py-4 rounded-xl text-white font-bold text-sm disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#8B1A2F,#C0392B)" }}>
            {clientMode ? "✨ Calcular y generar mi dieta" : "✨ Generar plantilla automáticamente"}
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

  // (caso imposible: loadingMacros=false, macrosOn=null, !clientMode, !isTemplateMode)
  if (!macrosOn) return null;

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

        {/* ── Recalcular macros (solo clientMode con macros ya cargados) ── */}
        {clientMode && (
          <div className="rounded-xl overflow-hidden" style={{ background: "#111", border: "1px solid #222" }}>
            <button
              onClick={() => setShowClientRecalc(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-left">
              <span className="text-sm font-semibold text-white">⚙️ Actualizar mis datos</span>
              <span className="text-neutral-500 text-xs">{showClientRecalc ? "▲ Cerrar" : "▼ Cambiar peso / entreno / objetivo"}</span>
            </button>

            {showClientRecalc && (
              <div className="border-t px-4 pb-4 space-y-4" style={{ borderColor: "#1E1E1E" }}>

                {/* Sexo */}
                <div className="grid grid-cols-2 gap-2 pt-3">
                  {(["male","female"] as const).map(s => (
                    <button key={s} onClick={() => setCalcSex(s)}
                      className="py-2.5 rounded-xl text-sm font-bold transition-colors"
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
                    { label: "Edad",   val: calcAge,    set: setCalcAge,    unit: "años", placeholder: "28" },
                    { label: "Altura", val: calcHeight, set: setCalcHeight, unit: "cm",   placeholder: "175" },
                    { label: "Peso",   val: calcWeight, set: setCalcWeight, unit: "kg",   placeholder: "75" },
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

                {/* Actividad */}
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

                {/* Objetivo */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-500 block">Objetivo</label>
                  {GOAL_OPTIONS.map(g => (
                    <button key={g.value} onClick={() => { setCalcGoal(g.value); setCalcProtMult(g.protein); setCalcFatMult(g.fat); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors"
                      style={calcGoal === g.value
                        ? { background: "#fff", border: "1px solid #fff" }
                        : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
                      <div>
                        <p className={"text-sm font-semibold " + (calcGoal === g.value ? "text-black" : "text-white")}>{g.label}</p>
                        <p className={"text-xs " + (calcGoal === g.value ? "text-neutral-600" : "text-neutral-500")}>{g.sublabel}</p>
                      </div>
                      {calcGoal === g.value && <span className="text-emerald-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>

                {/* Preview macros */}
                {calcResult && (
                  <div className="rounded-xl p-3 space-y-2" style={{ background: "#0A1A0A", border: "1px solid #1A3A1A" }}>
                    <p className="text-[10px] uppercase tracking-wider text-emerald-600">Nuevos macros calculados</p>
                    <div className="flex gap-2">
                      {[
                        { label: "Proteína", val: calcResult.protein_g, color: "#F87171" },
                        { label: "Hidratos", val: calcResult.carbs_g,   color: "#FBBF24" },
                        { label: "Grasa",    val: calcResult.fat_g,     color: "#60A5FA" },
                      ].map(({ label, val, color }) => (
                        <div key={label} className="flex-1 rounded-lg px-2 py-2 text-center" style={{ background: "#111" }}>
                          <p className="text-[9px] text-neutral-500 uppercase">{label}</p>
                          <p className="text-sm font-bold" style={{ color }}>{val.toFixed(0)}<span className="text-[10px] font-normal text-neutral-500">g</span></p>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-white font-bold text-base">{calcResult.tdee} <span className="text-neutral-500 text-xs">kcal ON</span></p>
                  </div>
                )}

                <button
                  onClick={handleClientRecalcAndApply}
                  disabled={!calcResult}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#8B1A2F,#C0392B)" }}>
                  ✅ Actualizar macros y regenerar
                </button>
              </div>
            )}
          </div>
        )}

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
