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
  id:        string;
  label:     string;
  ingIds:    string[];          // pool de ingredientes coherentes para este slot
  macro:     MacroKey | "fixed";
  pct:       number;            // % del macro diario, o gramos si macro="fixed"
  fixedG?:   number;
  noteText?: string;
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
  {
    id: "c1", name: "Comida 1 — Desayuno", emoji: "🌅",
    profiles: [
      {
        // Huevo (fijo) + Lácteos (yogur/queso/mousse) + CUALQUIER cereal o avena
        id: "c1_a", label: "Lácteos + Cereal",
        slots: [
          { id: "huevo", label: "Huevo base", macro: "fixed", pct: 0, fixedG: 60,
            ingIds: ["huevo"] },
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["yogur_prot","yogur_griego","mousse_prot","qso_batido","qso_fresco","leche_prot","yogur_sln"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 25,
            // Todos los cereales/avenas funcionan igual de bien con lácteos
            ingIds: ["avena_copos","harina_avena","avena_crunchy",
                     "corn_flakes","weetabix","copos_trigo","rice_krispies","cereal_mix","crema_arroz","choco_zero"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 10,
            ingIds: ["aceite_coco","chocolate85","crema_cacah","almendras","nuez"] },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
            ingIds: ["fresas","frambuesas","arandanos","arandanos_cong","frutos_rojos","kiwi","melocoton","manzana","platano","pera"] },
        ],
      },
      {
        // Huevo (fijo) + ISO/Whey en batido + CUALQUIER cereal o avena
        id: "c1_b", label: "ISO / Whey + Cereal",
        slots: [
          { id: "huevo", label: "Huevo base", macro: "fixed", pct: 0, fixedG: 60,
            ingIds: ["huevo"] },
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["iso","whey"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 25,
            ingIds: ["avena_copos","harina_avena","avena_crunchy",
                     "corn_flakes","weetabix","copos_trigo","rice_krispies","cereal_mix","crema_arroz","choco_zero"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 10,
            ingIds: ["aceite_coco","chocolate85","crema_cacah","almendras","nuez"] },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
            ingIds: ["platano","manzana","pera","fresas","arandanos","melocoton","kiwi"] },
        ],
      },
      {
        // Huevo (fijo) + Pan / tostadas con proteína láctea o ISO + grasa saludable
        id: "c1_c", label: "Pan + Proteína + Grasa",
        slots: [
          { id: "huevo", label: "Huevo base", macro: "fixed", pct: 0, fixedG: 60,
            ingIds: ["huevo"] },
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["yogur_griego","qso_batido","qso_fresco","leche_prot","iso","yogur_prot","mousse_prot"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 25,
            ingIds: ["pan_centeno","pan_tostado","pan_fibra","pan_wasa","pan_molde","pan_integral_pan"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 10,
            ingIds: ["crema_cacah","almendras","nuez","chocolate85","aceite_coco","aguacate"] },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
            ingIds: ["platano","manzana","fresas","arandanos","pera","kiwi","melocoton"] },
        ],
      },
    ],
  },

  // ── COMIDA 2 — Almuerzo ────────────────────────────────────────────────────
  {
    id: "c2", name: "Comida 2 — Almuerzo", emoji: "☕",
    profiles: [
      {
        // Embutido curado (jamón/lomo) sobre pan o tortas
        id: "c2_a", label: "Embutido + Pan",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 15,
            ingIds: ["lomo_embuchado","jamon","fiambre_pavo","lomo_curado_pavo"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 20,
            ingIds: ["pan_wasa","pan_fibra","pan_tostado","pan_integral_pan","pan_centeno",
                     "tortas_arroz","tortas_maiz","tortas_legumbre"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 5,
            ingIds: ["aceite_oliva","aceitunas","aguacate","guacamole"] },
        ],
      },
      {
        // Proteína baja en grasa (atún/fiambre/salchicha) + tortas o pan ligero
        id: "c2_b", label: "Atún / Fiambre + Tortas",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 15,
            ingIds: ["atun_lata","fiambre_pavo","salchi_pavo_3","salchi_pavo_ff","lomo_curado_pavo","lomo_cerdo"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 20,
            ingIds: ["tortas_arroz","tortas_maiz","tortas_legumbre",
                     "pan_wasa","pan_fibra","pan_tostado","pan_integral_pan"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 5,
            ingIds: ["aceite_oliva","aguacate","guacamole","aceitunas"] },
        ],
      },
      {
        // Queso light en pan tipo sandwich o fajitas
        id: "c2_c", label: "Queso + Pan / Fajitas",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 15,
            ingIds: ["qso_eatlean","mozza_light","havarti","qso_fresco","qso_pizza"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 20,
            ingIds: ["fajitas","pan_molde","pan_blanco","pan_centeno","pan_integral_pan",
                     "pizza_int","pan_wasa","pan_fibra"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 5,
            ingIds: ["aceite_oliva","aceitunas","aguacate","guacamole"] },
        ],
      },
    ],
  },

  // ── COMIDA 3 — Comida principal ────────────────────────────────────────────
  {
    id: "c3", name: "Comida 3 — Comida principal", emoji: "🍽️",
    profiles: [
      {
        // Aves o cerdo + carbohidrato de gramíneas (pasta/arroz/cuscús)
        id: "c3_a", label: "Ave / Cerdo + Pasta / Arroz",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 25,
            ingIds: ["pollo","pavo","picada_pollo","hamburguesa","lomo_cerdo","ternera"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 30,
            ingIds: ["pasta","pasta_integral","arroz","arroz_int","cuscus","noodles_arroz",
                     "arroz_3del","arroz_bolsita","noquis"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 35,
            ingIds: ["aceite_oliva"],
            noteText: "🥦 Verdura variada a gusto (libre)" },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
            ingIds: ["manzana","pera","melocoton","kiwi","platano","cerezas","fresas"] },
        ],
      },
      {
        // Pescado blanco o marisco + tubérculo (patata/boniato/ñoquis)
        id: "c3_b", label: "Pescado + Patata / Boniato",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 25,
            ingIds: ["merluza","tilapia","lenguado","lubina","sepia","gambas","calamar","salmon","trucha"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 30,
            ingIds: ["patata","patata_bote","boniato","boniato_rojo","noquis",
                     "arroz","arroz_int","cuscus"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 35,
            ingIds: ["aceite_oliva"],
            noteText: "🥦 Verdura variada a gusto (libre)" },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
            ingIds: ["pera","manzana","melocoton","kiwi","fresas","cerezas"] },
        ],
      },
      {
        // Ternera/salmón/pescado azul + cualquier HC (más flexible)
        id: "c3_c", label: "Ternera / Salmón + HC libre",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 25,
            ingIds: ["ternera","salmon","trucha","lomo_atun","pollo","pavo","lomo_cerdo"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 30,
            ingIds: ["arroz","pasta","patata","boniato","noodles_arroz","cuscus",
                     "arroz_int","pasta_integral","noquis"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 35,
            ingIds: ["aceite_oliva"],
            noteText: "🥦 Verdura variada a gusto (libre)" },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
            ingIds: ["fresas","arandanos","kiwi","frambuesas","pera","manzana"] },
        ],
      },
    ],
  },

  // ── COMIDA 4 — Merienda ────────────────────────────────────────────────────
  {
    id: "c4", name: "Comida 4 — Merienda", emoji: "🫐",
    profiles: [
      {
        // Lácteos + CUALQUIER cereal (mismo principio que C1_a pero sin grasa)
        id: "c4_a", label: "Yogur / Queso + Cereal",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["yogur_prot","yogur_griego","mousse_prot","qso_batido","leche_prot","yogur_sln","qso_fresco"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 15,
            // Todos los cereales son válidos con lácteos
            ingIds: ["weetabix","corn_flakes","cereal_mix","avena_crunchy","rice_krispies",
                     "copos_trigo","harina_avena","avena_copos","crema_arroz","choco_zero"] },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 100,
            ingIds: ["platano","fresas","arandanos","manzana","frambuesas","melocoton","pera"] },
        ],
      },
      {
        // ISO/Whey + CUALQUIER cereal o avena (batido/porridge)
        id: "c4_b", label: "ISO / Whey + Cereal / Avena",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["iso","whey"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 15,
            ingIds: ["avena_copos","harina_avena","crema_arroz","avena_crunchy",
                     "corn_flakes","weetabix","cereal_mix","rice_krispies","copos_trigo"] },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 100,
            ingIds: ["platano","manzana","pera","kiwi","fresas","arandanos"] },
        ],
      },
      {
        // Lácteos ligeros + pan/tortas (merienda más sólida/masticable)
        id: "c4_c", label: "Lácteos + Pan / Tortas",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["qso_batido","qso_fresco","yogur_prot","leche_prot","yogur_sln","mousse_prot","yogur_griego"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 15,
            ingIds: ["pan_tostado","pan_fibra","pan_wasa","tortas_arroz","tortas_maiz",
                     "pan_centeno","pan_integral_pan","tortas_legumbre"] },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 100,
            ingIds: ["platano","manzana","pera","fresas","melocoton","arandanos","kiwi"] },
        ],
      },
    ],
  },

  // ── COMIDA 5 — Cena ────────────────────────────────────────────────────────
  {
    id: "c5", name: "Comida 5 — Cena", emoji: "🌙",
    profiles: [
      {
        // Pescado blanco/marisco + tubérculo (más digestivo para noche)
        id: "c5_a", label: "Pescado blanco + Patata / Boniato",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["merluza","tilapia","lenguado","lubina","gambas","sepia","calamar"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 10,
            ingIds: ["patata","patata_bote","boniato","boniato_rojo","noquis",
                     "arroz","arroz_int","cuscus"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 50,
            ingIds: ["aceite_oliva"],
            noteText: "🥦 Verdura variada a gusto (libre)" },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
            ingIds: ["fresas","frambuesas","arandanos","melocoton","pera","kiwi"] },
        ],
      },
      {
        // Aves + gramíneas (arroz/pasta/cuscús)
        id: "c5_b", label: "Ave + Arroz / Pasta",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["pollo","pavo","picada_pollo","salchi_pavo_3","lomo_cerdo","hamburguesa"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 10,
            ingIds: ["arroz","arroz_int","pasta","pasta_integral","cuscus",
                     "noodles_arroz","arroz_bolsita","noquis"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 50,
            ingIds: ["aceite_oliva"],
            noteText: "🥦 Verdura variada a gusto (libre)" },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
            ingIds: ["manzana","pera","kiwi","sandia","melon","cerezas"] },
        ],
      },
      {
        // Salmón / ternera / atún + cualquier HC (más variedad)
        id: "c5_c", label: "Salmón / Ternera + HC libre",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["salmon","ternera","trucha","lomo_atun","atun_lata","calamar","sepia","gambas"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 10,
            ingIds: ["arroz","patata","boniato","noodles_arroz","cuscus","noquis",
                     "arroz_int","pasta","pasta_integral"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 50,
            ingIds: ["aceite_oliva"],
            noteText: "🥦 Verdura variada a gusto (libre)" },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
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

/**
 * Agrupa los alimentos de las 3 opciones de una comida por categoría (macro),
 * eliminando duplicados. Resultado: lista única de opciones de proteína, hidrato,
 * grasa y fijos para que el usuario los mezcle libremente.
 */
function getMealCategories(meal: GeneratedMeal) {
  const seen = new Set<string>();
  const protein: GeneratedFood[] = [];
  const carbs:   GeneratedFood[] = [];
  const fat:     GeneratedFood[] = [];
  const fixed:   GeneratedFood[] = [];

  meal.options.forEach(opt => {
    opt.foods.forEach(food => {
      if (seen.has(food.ing.id)) return;
      seen.add(food.ing.id);
      if (food.macro === "fixed" || FIXED_CONDIMENTS.has(food.ing.id)) fixed.push(food);
      else if (food.macro === "protein") protein.push(food);
      else if (food.macro === "carbs")   carbs.push(food);
      else                               fat.push(food);
    });
  });

  return { protein, carbs, fat, fixed };
}

function exportDietPDF(
  planOn:    GeneratedMeal[],
  planOff:   GeneratedMeal[],
  macrosOn:  DailyMacros,
  macrosOff: DailyMacros | null,
  clientName: string,
  planName:   string,
) {
  const today = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  const mealColors = ["#8B1A2F", "#6B3080", "#1A5E8F", "#1A6B3A", "#7A5C1A"];

  // Una fila de ingrediente: nombre | gramos | P | HC | G
  function foodRow(f: GeneratedFood, altBg = false): string {
    const fm = foodMacros(f);
    const bg = altBg ? "background:#fafafa;" : "";
    return `<tr style="${bg}">
      <td style="padding:4px 8px;font-size:11.5px;border-bottom:1px solid #f0f0f0;">${f.ing.name}</td>
      <td style="padding:4px 6px;font-size:11.5px;font-weight:700;text-align:right;border-bottom:1px solid #f0f0f0;white-space:nowrap;">${f.grams}g</td>
      <td style="padding:4px 5px;font-size:10.5px;text-align:right;border-bottom:1px solid #f0f0f0;color:#C0392B;">${fm.protein}</td>
      <td style="padding:4px 5px;font-size:10.5px;text-align:right;border-bottom:1px solid #f0f0f0;color:#D68910;">${fm.carbs}</td>
      <td style="padding:4px 5px;font-size:10.5px;text-align:right;border-bottom:1px solid #f0f0f0;color:#2980B9;">${fm.fat}</td>
    </tr>`;
  }

  // Columna de una categoría (proteína / hidrato / grasa / fijo)
  function categoryCol(
    label: string, subLabel: string, foods: GeneratedFood[], accentColor: string,
  ): string {
    if (!foods.length) return "";
    const rows = foods.map((f, i) => foodRow(f, i % 2 === 1)).join("");
    return `
      <td style="vertical-align:top;padding:0 6px 0 0;min-width:120px;">
        <div style="background:${accentColor};color:white;padding:4px 8px;border-radius:4px 4px 0 0;margin-bottom:0;">
          <div style="font-size:10px;font-weight:800;letter-spacing:.06em;">${label}</div>
          <div style="font-size:9px;opacity:.8;">${subLabel}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-top:none;border-radius:0 0 4px 4px;">
          <thead>
            <tr style="background:#f8f8f8;">
              <th style="padding:3px 8px;font-size:9px;text-align:left;color:#999;font-weight:600;border-bottom:1px solid #eee;">Alimento</th>
              <th style="padding:3px 6px;font-size:9px;text-align:right;color:#999;font-weight:600;border-bottom:1px solid #eee;">g</th>
              <th style="padding:3px 5px;font-size:9px;text-align:right;color:#C0392B;font-weight:600;border-bottom:1px solid #eee;">P</th>
              <th style="padding:3px 5px;font-size:9px;text-align:right;color:#D68910;font-weight:600;border-bottom:1px solid #eee;">HC</th>
              <th style="padding:3px 5px;font-size:9px;text-align:right;color:#2980B9;font-weight:600;border-bottom:1px solid #eee;">G</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </td>`;
  }

  function mealSection(meal: GeneratedMeal, mIdx: number): string {
    const col = mealColors[mIdx % mealColors.length];
    const { protein, carbs, fat, fixed } = getMealCategories(meal);

    const cols = [
      categoryCol("PROTEÍNA", "elige 1", protein, "#8B1A2F"),
      categoryCol("HIDRATOS", "elige 1", carbs,   "#A0720A"),
      categoryCol("GRASAS",   "elige 1", fat,     "#1A5E8F"),
      categoryCol("FIJOS",    "siempre", fixed,   "#4A4A4A"),
    ].filter(Boolean).join("");

    return `
      <div style="margin-bottom:16px;page-break-inside:avoid;">
        <div style="background:${col};color:white;padding:6px 12px;border-radius:5px 5px 0 0;display:flex;align-items:center;gap:7px;">
          <span style="font-size:14px;">${meal.emoji}</span>
          <span style="font-size:12px;font-weight:800;letter-spacing:.05em;">${meal.name.toUpperCase()}</span>
        </div>
        <div style="border:1px solid #e0e0e0;border-top:none;border-radius:0 0 5px 5px;padding:8px;">
          <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
            <tr>${cols}</tr>
          </table>
        </div>
      </div>`;
  }

  function macroBar(macros: DailyMacros): string {
    return `<div style="display:flex;gap:16px;align-items:center;font-size:12px;">
      <span style="color:#666;">${macros.kcal} kcal</span>
      <span style="color:#C0392B;font-weight:600;">${macros.protein_g}g prot</span>
      <span style="color:#D68910;font-weight:600;">${macros.carbs_g}g HC</span>
      <span style="color:#2980B9;font-weight:600;">${macros.fat_g}g grasa</span>
    </div>`;
  }

  function daySection(plan: GeneratedMeal[], macros: DailyMacros, label: string): string {
    const meals = plan.map((m, i) => mealSection(m, i)).join("");
    return `
      <div>
        <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px;padding-bottom:7px;border-bottom:2px solid #222;">
          <h2 style="font-size:15px;font-weight:900;margin:0;letter-spacing:.05em;">${label}</h2>
          ${macroBar(macros)}
        </div>
        ${meals}
      </div>`;
  }

  const html = `<!DOCTYPE html><html lang="es"><head>
    <meta charset="utf-8">
    <title>Plan nutricional${clientName ? " · " + clientName : ""}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
             color: #111; margin: 0; padding: 24px 28px; font-size: 12px; }
      @media print {
        body { padding: 0; }
        @page { size: A4 landscape; margin: 10mm 8mm; }
      }
    </style>
  </head><body>
    <!-- Cabecera -->
    <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:16px;padding-bottom:10px;border-bottom:3px solid #111;">
      <div>
        <div style="font-size:10px;font-weight:800;letter-spacing:.18em;color:#8B1A2F;margin-bottom:2px;">MVP TEAM</div>
        <h1 style="font-size:20px;font-weight:900;margin:0 0 2px;">${planName || "Plan Nutricional"}</h1>
        ${clientName ? `<div style="font-size:12px;color:#555;font-weight:500;">${clientName}</div>` : ""}
      </div>
      <div style="text-align:right;">
        <div style="font-size:10px;color:#999;">${today}</div>
        <div style="font-size:9px;color:#bbb;margin-top:2px;">Combina libremente una opción de cada columna</div>
      </div>
    </div>

    ${daySection(planOn, macrosOn, "💪 DÍA ON")}
    ${macrosOff ? `<div style="page-break-before:always;padding-top:4px;"></div>${daySection(planOff, macrosOff, "😴 DÍA OFF")}` : ""}

    <div style="margin-top:20px;padding-top:8px;border-top:1px solid #ddd;font-size:9px;color:#bbb;text-align:center;">
      Generado por MVP Team · ${today} · Las cantidades están calculadas para los macros objetivo del cliente.
    </div>
  </body></html>`;

  const w = window.open("", "_blank", "width=1200,height=850");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
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
