// ai-generate-plan v3 — Sin IA para dieta/entreno, solo para análisis de foto
// Dieta: plantillas fijas escaladas por macros (estilo coach franvyother)
// Entreno: algoritmo determinista con ejercicios de la BD
// IA: llamada pequeña solo para análisis de foto corporal
//
// Env vars: ANTHROPIC_API_KEY · SUPABASE_URL · SUPABASE_SERVICE_ROLE_KEY

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Macros (Mifflin-St Jeor) ──────────────────────────────────────────────────
function calcBMR(sex: string, w: number, h: number, age: number) {
  return sex === "female" ? 10*w + 6.25*h - 5*age - 161 : 10*w + 6.25*h - 5*age + 5;
}
const GOAL_ADJ: Record<string,number>    = { lose_fat_aggressive:-.20, lose_fat:-.15, lose_fat_soft:-.10, maintain:0, gain_muscle:.05, bulk:.10 };
const PROT_KG:  Record<string,number>    = { lose_fat_aggressive:2.4, lose_fat:2.2, lose_fat_soft:2.1, maintain:2.0, gain_muscle:1.9, bulk:1.8 };
const FAT_KG:   Record<string,number>    = { lose_fat_aggressive:.65, lose_fat:.70, lose_fat_soft:.80, maintain:.90, gain_muscle:1.0, bulk:1.1 };

function calcMacros(sex:string,weight:number,height:number,age:number,af:number,goal:string) {
  const bmr      = Math.round(calcBMR(sex,weight,height,age));
  const tdee     = Math.round(bmr * af);
  const kcal_on  = Math.round(tdee * (1 + (GOAL_ADJ[goal]??0)));
  const kcal_off = Math.round(kcal_on * 0.87);
  const protein_g   = Math.round(weight * (PROT_KG[goal]??2.0));
  const fat_g       = Math.round(weight * (FAT_KG[goal]??0.8));
  const carbs_on_g  = Math.max(20, Math.round((kcal_on  - protein_g*4 - fat_g*9)/4));
  const carbs_off_g = Math.max(20, Math.round((kcal_off - protein_g*4 - fat_g*9)/4));
  return { bmr, tdee, kcal_on, kcal_off, protein_g, fat_g, carbs_on_g, carbs_off_g };
}

// ── Escalado de hidratos (referencia: 333g ON / 290g OFF del PDF franvyother) ─
function scON(ref: number, carbsOn: number)  { return Math.max(20, Math.round(ref * carbsOn  / 333 / 5) * 5); }
function scOFF(ref: number, carbsOff: number){ return Math.max(15, Math.round(ref * carbsOff / 290 / 5) * 5); }

// ── Filtrado de alimentos según restricciones ─────────────────────────────────
// Devuelve true si el item debe EXCLUIRSE
function shouldExclude(item: string, restrictions: string[], avoidKeywords: string[]): boolean {
  const lower = item.toLowerCase();

  // Palabras clave por restricción
  const RESTRICTION_KW: Record<string, string[]> = {
    sin_lactosa: ["yogur","leche","queso","mousse","lácteo","batido proteico","mousse proteico",
                  "yogur proteico","leche desnatada","bebida vegetal","kefir"],
    sin_gluten:  ["pan","harina","avena","pasta","weetabix","corn flakes","muesli","copos",
                  "crunchy","tortitas","bizcocho","tortas de arroz","tortas de maíz"],
    vegetariano: ["pollo","ternera","pavo","atún","salmón","merluza","dorada","lubina",
                  "jamón","lomo","bacalao","gambas","langostinos","lenguado","gallo",
                  "pechuga","pavo fiambre","lomo embuchado"],
    vegano:      ["pollo","ternera","pavo","atún","salmón","merluza","dorada","lubina",
                  "jamón","lomo","bacalao","gambas","langostinos","lenguado","gallo",
                  "pechuga","pavo fiambre","lomo embuchado",
                  "huevo","claras","yogur","leche","queso","mousse","lácteo","proteína en polvo"],
  };

  for (const r of restrictions) {
    const kws = RESTRICTION_KW[r] ?? [];
    if (kws.some(kw => lower.includes(kw))) return true;
  }

  // Palabras del campo "evitar" (texto libre)
  if (avoidKeywords.some(kw => kw.length > 2 && lower.includes(kw))) return true;

  return false;
}

// Filtra los items de un grupo; si todos se excluyen, devuelve los originales
// (es mejor mostrar algo que dejar el grupo vacío)
function filterItems(items: string[], restrictions: string[], avoidKeywords: string[]): string[] {
  if (!restrictions.length && !avoidKeywords.length) return items;
  const filtered = items.filter(it => !shouldExclude(it, restrictions, avoidKeywords));
  return filtered.length > 0 ? filtered : items; // fallback: devolver todos si no queda nada
}

// ── Plantillas de dieta ───────────────────────────────────────────────────────
function buildDietMeals(
  carbsOn: number, carbsOff: number, goal: string,
  restrictions: string[] = [], avoidText: string = "",
) {
  const noCarbs = goal === "lose_fat_aggressive";
  // Convertir texto libre a lista de keywords (minúsculas, split por coma/punto)
  const avoidKeywords = avoidText
    .toLowerCase()
    .split(/[,;.\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 2);

  // Helper de filtrado local
  const fi = (items: string[]) => filterItems(items, restrictions, avoidKeywords);

  const GRASAS = ["5g Aceite de Oliva Virgen Extra","5g Aceite de Coco","10g Chocolate Negro 85%","30g Aguacate"];
  const GRASAS_COMIDA = ["10g Aceite de Oliva Virgen Extra","30g Aguacate","30g Guacamole 95%"];
  const VERDURA = [
    "Ensalada libre (lechuga, tomate, pepino, zanahoria)",
    "200g Brócoli o coliflor al vapor",
    "200g Judías verdes salteadas",
    "200g Espinacas con ajo",
  ];

  // Helper para texto de gramos
  const gON  = (r:number) => `${scON(r,carbsOn)}g`;
  const gOFF = (r:number) => `${scOFF(r,carbsOff)}g`;

  return [
    // ─── DESAYUNO ────────────────────────────────────────────────────────────
    {
      name:"Desayuno", emoji:"☀️", day_type:"both",
      options:[
        {
          name:"Opción A · Elaborada — Tortitas / Bizcocho",
          groups:[
            { label:"BASE", isChoice:false,
              items:["125ml Claras de huevo","60g Huevo entero"],
              note:"Bate todo. Tortitas en sartén antiadherente o bizcocho al micro 6-10 min con levadura." },
            { label:"HIDRATO — elige uno", isChoice:true,
              items:[
                `${gON(100)} Harina de Avena`,
                `${gON(100)} Copos de Avena`,
                `${gON(100)} Pan de Centeno o Espelta`,
                `${gON(75)}  Pan Tostado 100% Integral`,
                `${gON(100)} Pan de Fibra y Sésamo`,
              ], note:null },
            { label:"GRASA — elige una", isChoice:true, items:GRASAS, note:null },
            { label:"FRUTA", isChoice:false,
              items:["150g Fruta (fresas, kiwi, arándanos, manzana, pera, melocotón)"], note:null },
          ],
        },
        {
          name:"Opción B · Lácteo + Cereal",
          groups:[
            { label:"BASE", isChoice:false,
              items:["60g Huevo entero"],
              note:"Cocido, revuelto o en tortilla." },
            { label:"LÁCTEO — elige uno", isChoice:true,
              items:[
                "200g Yogur Proteico Hacendado",
                "200g Mousse Proteico Hacendado",
                "200g Yogur Griego Ligero Natural",
                "200g Queso Fresco Batido Desnatado + 5g ISO",
                "200ml Leche +Proteínas Hacendado + 10g ISO",
              ], note:null },
            { label:"CEREAL — elige uno", isChoice:true,
              items:[
                `${gON(100)} Copos de Avena`,
                `${gON(75)}  Avena Crunchy Hacendado`,
                `${gON(75)}  Corn Flakes sin azúcar`,
                `${gON(75)}  Muesli sin azúcar`,
                `${gON(75)}  Weetabix 95% integral`,
              ], note:"Puedes combinar la mitad de dos cereales." },
            { label:"GRASA — elige una", isChoice:true, items:GRASAS, note:null },
            { label:"FRUTA", isChoice:false, items:["150g Fruta de temporada"], note:null },
          ],
        },
        {
          name:"Opción C · Pan + Proteína fría",
          groups:[
            { label:"PAN — elige uno", isChoice:true,
              items:[
                `${gON(100)} Pan de Centeno o Espelta`,
                `${gON(75)}  Pan Tostado 100% Integral`,
                "50g Tortas de Arroz / Maíz",
              ], note:null },
            { label:"PROTEÍNA — elige una", isChoice:true,
              items:[
                "60g Huevo entero + 35g Lomo embuchado",
                "150g Queso Fresco Burgos + 30g Pavo fiambre",
                "1 lata Atún natural + 60g Huevo entero",
                "60g Jamón serrano sin grasa + 60g Huevo entero",
              ], note:null },
            { label:"GRASA — elige una", isChoice:true, items:GRASAS, note:null },
            { label:"FRUTA", isChoice:false, items:["150g Fruta de temporada"], note:null },
          ],
        },
      ],
    },

    // ─── MEDIA MAÑANA ────────────────────────────────────────────────────────
    {
      name:"Media mañana", emoji:"🍎", day_type:"both",
      options:[
        { name:"Opción A · Fruta + Lácteo",
          groups:[{ label:"SNACK", isChoice:false,
            items:["200g Yogur Proteico o Mousse Proteico","150g Fruta de temporada"], note:null }] },
        { name:"Opción B · Frutos secos",
          groups:[{ label:"SNACK", isChoice:false,
            items:["30g Nueces o almendras crudas","150g Fruta de temporada"], note:null }] },
        { name:"Opción C · Proteína fría",
          groups:[{ label:"SNACK", isChoice:false,
            items:["80g Queso Fresco Burgos","2 lonchas Pavo fiambre sin sal","1 pieza de fruta (120g)"], note:null }] },
      ],
    },

    // ─── COMIDA ON ───────────────────────────────────────────────────────────
    {
      name:"Comida", emoji:"🍽️", day_type:"on",
      options:[
        {
          name:"Opción A · Pollo con arroz y verdura",
          groups:[
            { label:"PROTEÍNA", isChoice:false,
              items:["175g Pechuga de pollo a la plancha"],
              note:"Sazona con sal, ajo en polvo y orégano." },
            { label:"HIDRATO — elige uno", isChoice:true,
              items:[
                `${gON(75)} Arroz blanco (crudo)`,
                `${gON(75)} Arroz integral (crudo)`,
                `${gON(70)} Pasta integral (cruda)`,
                `${gON(250)} Patata cocida`,
                `${gON(220)} Boniato al horno`,
              ], note:null },
            { label:"VERDURA — elige una", isChoice:true, items:VERDURA, note:null },
            { label:"GRASA — elige una", isChoice:true, items:GRASAS_COMIDA, note:null },
          ],
        },
        {
          name:"Opción B · Ternera con patata y verdura",
          groups:[
            { label:"PROTEÍNA", isChoice:false,
              items:["150g Ternera magra (filete o picada)"],
              note:"A la plancha o salteada con cebolla y pimiento." },
            { label:"HIDRATO — elige uno", isChoice:true,
              items:[
                `${gON(250)} Patata cocida o asada`,
                `${gON(220)} Boniato al horno`,
                `${gON(75)}  Arroz blanco (crudo)`,
                `${gON(70)}  Pasta (cruda)`,
                `${gON(75)}  Arroz integral (crudo)`,
              ], note:null },
            { label:"VERDURA — elige una", isChoice:true, items:VERDURA, note:null },
            { label:"GRASA — elige una", isChoice:true, items:GRASAS_COMIDA, note:null },
          ],
        },
        {
          name:"Opción C · Salmón / Merluza con arroz y verdura",
          groups:[
            { label:"PROTEÍNA — elige una", isChoice:true,
              items:[
                "170g Salmón a la plancha o al horno",
                "180g Merluza al vapor o a la plancha",
                "170g Atún fresco a la plancha",
                "180g Dorada o lubina al horno",
              ], note:"Sazona con limón y hierbas al gusto." },
            { label:"HIDRATO — elige uno", isChoice:true,
              items:[
                `${gON(75)} Arroz blanco (crudo)`,
                `${gON(75)} Arroz integral (crudo)`,
                `${gON(70)} Pasta integral (cruda)`,
                `${gON(250)} Patata cocida`,
                `${gON(220)} Boniato al horno`,
              ], note:null },
            { label:"VERDURA — elige una", isChoice:true, items:VERDURA, note:null },
            { label:"GRASA — elige una", isChoice:true, items:GRASAS_COMIDA, note:null },
          ],
        },
      ],
    },

    // ─── COMIDA OFF ──────────────────────────────────────────────────────────
    {
      name:"Comida", emoji:"🍽️", day_type:"off",
      options:[
        {
          name:"Opción A · Pollo con arroz y verdura",
          groups:[
            { label:"PROTEÍNA", isChoice:false,
              items:["175g Pechuga de pollo a la plancha"],
              note:"Sazona con sal, ajo en polvo y orégano." },
            { label:"HIDRATO — elige uno", isChoice:true,
              items:[
                `${gOFF(60)} Arroz blanco (crudo)`,
                `${gOFF(60)} Arroz integral (crudo)`,
                `${gOFF(55)} Pasta integral (cruda)`,
                `${gOFF(185)} Patata cocida`,
                `${gOFF(165)} Boniato al horno`,
              ], note:null },
            { label:"VERDURA — elige una", isChoice:true, items:VERDURA, note:null },
            { label:"GRASA — elige una", isChoice:true, items:GRASAS_COMIDA, note:null },
          ],
        },
        {
          name:"Opción B · Ternera con patata y verdura",
          groups:[
            { label:"PROTEÍNA", isChoice:false,
              items:["150g Ternera magra (filete o picada)"],
              note:"A la plancha o salteada con cebolla y pimiento." },
            { label:"HIDRATO — elige uno", isChoice:true,
              items:[
                `${gOFF(185)} Patata cocida o asada`,
                `${gOFF(165)} Boniato al horno`,
                `${gOFF(60)}  Arroz blanco (crudo)`,
                `${gOFF(55)}  Pasta (cruda)`,
                `${gOFF(60)}  Arroz integral (crudo)`,
              ], note:null },
            { label:"VERDURA — elige una", isChoice:true, items:VERDURA, note:null },
            { label:"GRASA — elige una", isChoice:true, items:GRASAS_COMIDA, note:null },
          ],
        },
        {
          name:"Opción C · Salmón / Merluza con arroz y verdura",
          groups:[
            { label:"PROTEÍNA — elige una", isChoice:true,
              items:[
                "170g Salmón a la plancha o al horno",
                "180g Merluza al vapor o a la plancha",
                "170g Atún fresco a la plancha",
                "180g Dorada o lubina al horno",
              ], note:"Sazona con limón y hierbas al gusto." },
            { label:"HIDRATO — elige uno", isChoice:true,
              items:[
                `${gOFF(60)} Arroz blanco (crudo)`,
                `${gOFF(60)} Arroz integral (crudo)`,
                `${gOFF(55)} Pasta integral (cruda)`,
                `${gOFF(185)} Patata cocida`,
                `${gOFF(165)} Boniato al horno`,
              ], note:null },
            { label:"VERDURA — elige una", isChoice:true, items:VERDURA, note:null },
            { label:"GRASA — elige una", isChoice:true, items:GRASAS_COMIDA, note:null },
          ],
        },
      ],
    },

    // ─── MERIENDA ────────────────────────────────────────────────────────────
    {
      name:"Merienda", emoji:"🥤", day_type:"both",
      options:[
        { name:"Opción A · Batido proteico",
          groups:[{ label:"MERIENDA", isChoice:false,
            items:["25g Proteína en polvo","200ml Leche desnatada o bebida vegetal sin azúcar","1 pieza fruta (120g)"],
            note:"Bate o disuelve y toma frío." }] },
        { name:"Opción B · Lácteo proteico",
          groups:[{ label:"MERIENDA", isChoice:false,
            items:["200g Mousse Proteico o Yogur Proteico","30g Frutos rojos o 1 pieza fruta"], note:null }] },
        { name:"Opción C · Snack sólido",
          groups:[{ label:"MERIENDA", isChoice:false,
            items:["2-3 Tortas de arroz sin sal","30g Jamón serrano sin grasa","80g Queso Fresco Burgos"], note:null }] },
      ],
    },

    // ─── CENA ON ─────────────────────────────────────────────────────────────
    {
      name:"Cena", emoji:"🌙", day_type:"on",
      options:[
        {
          name:"Opción A · Huevos con verdura",
          groups:[
            { label:"PROTEÍNA", isChoice:false,
              items:["3 Huevos enteros (180g)"],
              note:"Tortilla francesa, revuelto con verduras o huevos al plato." },
            { label:"HIDRATO — elige uno", isChoice:true,
              items:[
                `${gON(60)} Arroz blanco (crudo)`,
                `${gON(55)} Pasta integral (cruda)`,
                `${gON(200)} Patata cocida`,
                `${gON(70)} Pan de Centeno o Espelta`,
              ], note:null },
            { label:"VERDURA — elige una", isChoice:true, items:VERDURA, note:null },
            { label:"GRASA — elige una", isChoice:true, items:GRASAS_COMIDA, note:null },
          ],
        },
        {
          name:"Opción B · Pescado blanco con verdura",
          groups:[
            { label:"PROTEÍNA — elige una", isChoice:true,
              items:[
                "180g Merluza al vapor o a la plancha",
                "180g Bacalao al horno",
                "160g Gambas o langostinos a la plancha",
                "180g Lenguado o gallo al horno",
              ], note:null },
            { label:"HIDRATO — elige uno", isChoice:true,
              items:[
                `${gON(60)} Arroz blanco (crudo)`,
                `${gON(200)} Patata cocida`,
                `${gON(55)} Pasta integral (cruda)`,
                `${gON(70)} Pan de Centeno o Espelta`,
              ], note:null },
            { label:"VERDURA — elige una", isChoice:true, items:VERDURA, note:null },
            { label:"GRASA — elige una", isChoice:true, items:GRASAS_COMIDA, note:null },
          ],
        },
        {
          name:"Opción C · Pavo / Cerdo magro con verdura",
          groups:[
            { label:"PROTEÍNA — elige una", isChoice:true,
              items:[
                "180g Pechuga de pavo a la plancha",
                "160g Lomo de cerdo a la plancha",
                "160g Pechuga de pollo (si no la tomaste al mediodía)",
              ], note:null },
            { label:"HIDRATO — elige uno", isChoice:true,
              items:[
                `${gON(60)} Arroz blanco (crudo)`,
                `${gON(200)} Patata cocida`,
                `${gON(55)} Pasta integral (cruda)`,
                `${gON(70)} Pan de Centeno o Espelta`,
              ], note:null },
            { label:"VERDURA — elige una", isChoice:true, items:VERDURA, note:null },
            { label:"GRASA — elige una", isChoice:true, items:GRASAS_COMIDA, note:null },
          ],
        },
      ],
    },

    // ─── CENA OFF ────────────────────────────────────────────────────────────
    {
      name:"Cena", emoji:"🌙", day_type:"off",
      options:[
        {
          name:"Opción A · Huevos con verdura",
          groups:[
            { label:"PROTEÍNA", isChoice:false,
              items:["3 Huevos enteros (180g)"],
              note:"Tortilla francesa, revuelto con verduras o huevos al plato." },
            { label:"HIDRATO — elige uno", isChoice:true,
              items: noCarbs
                ? ["Sin hidrato — solo verdura y grasa"]
                : [
                    `${gOFF(45)} Arroz blanco (crudo)`,
                    `${gOFF(40)} Pasta integral (cruda)`,
                    `${gOFF(150)} Patata cocida`,
                    `${gOFF(55)} Pan de Centeno o Espelta`,
                  ], note:null },
            { label:"VERDURA — elige una", isChoice:true, items:VERDURA, note:null },
            { label:"GRASA — elige una", isChoice:true, items:GRASAS_COMIDA, note:null },
          ],
        },
        {
          name:"Opción B · Pescado blanco con verdura",
          groups:[
            { label:"PROTEÍNA — elige una", isChoice:true,
              items:[
                "180g Merluza al vapor o a la plancha",
                "180g Bacalao al horno",
                "160g Gambas o langostinos a la plancha",
                "180g Lenguado o gallo al horno",
              ], note:null },
            { label:"HIDRATO — elige uno", isChoice:true,
              items: noCarbs
                ? ["Sin hidrato — solo verdura y grasa"]
                : [
                    `${gOFF(45)} Arroz blanco (crudo)`,
                    `${gOFF(150)} Patata cocida`,
                    `${gOFF(40)} Pasta integral (cruda)`,
                    `${gOFF(55)} Pan de Centeno o Espelta`,
                  ], note:null },
            { label:"VERDURA — elige una", isChoice:true, items:VERDURA, note:null },
            { label:"GRASA — elige una", isChoice:true, items:GRASAS_COMIDA, note:null },
          ],
        },
        {
          name:"Opción C · Pavo / Cerdo magro con verdura",
          groups:[
            { label:"PROTEÍNA — elige una", isChoice:true,
              items:[
                "180g Pechuga de pavo a la plancha",
                "160g Lomo de cerdo a la plancha",
                "160g Pechuga de pollo (si no la tomaste al mediodía)",
              ], note:null },
            { label:"HIDRATO — elige uno", isChoice:true,
              items: noCarbs
                ? ["Sin hidrato — solo verdura y grasa"]
                : [
                    `${gOFF(45)} Arroz blanco (crudo)`,
                    `${gOFF(150)} Patata cocida`,
                    `${gOFF(40)} Pasta integral (cruda)`,
                    `${gOFF(55)} Pan de Centeno o Espelta`,
                  ], note:null },
            { label:"VERDURA — elige una", isChoice:true, items:VERDURA, note:null },
            { label:"GRASA — elige una", isChoice:true, items:GRASAS_COMIDA, note:null },
          ],
        },
      ],
    },
  ];

  // ── Postprocesado: aplicar filtros a todos los items de todas las opciones ──
  // Hacemos esto de forma genérica para no tocar cada línea de las plantillas
  if (restrictions.length || avoidKeywords.length) {
    for (const meal of meals as any[]) {
      for (const opt of meal.options) {
        for (const grp of opt.groups) {
          grp.items = fi(grp.items as string[]);
        }
        // Eliminar opciones donde TODOS los grupos quedan vacíos (no debería pasar con el fallback)
      }
    }
  }

  return meals;
}

// ── Generador de entreno algorítmico ─────────────────────────────────────────
// Splits por días/semana — cada sesión se duplica (A / A1) para 2 impactos/semana
const SPLITS: Record<number, { name: string; groups: string[] }[]> = {
  1: [{ name:"Full Body",          groups:["PECHO","ESPALDA","CUÁDRICEPS","FEMORALES","HOMBROS","CORE"] }],
  2: [
    { name:"Superior",             groups:["PECHO","ESPALDA","HOMBROS","BÍCEPS","TRÍCEPS"] },
    { name:"Inferior",             groups:["CUÁDRICEPS","FEMORALES","GLÚTEOS","GEMELOS","CORE"] },
  ],
  3: [
    { name:"Empuje",               groups:["PECHO","HOMBROS","TRÍCEPS"] },
    { name:"Tirón",                groups:["ESPALDA","BÍCEPS","TRAPECIOS"] },
    { name:"Piernas",              groups:["CUÁDRICEPS","FEMORALES","GLÚTEOS","GEMELOS"] },
  ],
  4: [
    { name:"Pecho/Bíceps",         groups:["PECHO","BÍCEPS"] },
    { name:"Espalda/Tríceps",      groups:["ESPALDA","TRÍCEPS"] },
    { name:"Cuádriceps/Core",      groups:["CUÁDRICEPS","GEMELOS","CORE"] },
    { name:"Hombros/Glúteos",      groups:["HOMBROS","TRAPECIOS","FEMORALES","GLÚTEOS"] },
  ],
  5: [
    { name:"Tirón",                groups:["ESPALDA","BÍCEPS","TRAPECIOS"] },
    { name:"Cuádriceps",           groups:["CUÁDRICEPS","GEMELOS","CORE"] },
    { name:"Empuje",               groups:["PECHO","HOMBROS","TRÍCEPS"] },
    { name:"Femorales",            groups:["FEMORALES","GLÚTEOS","GEMELOS"] },
    { name:"Repaso Torso",         groups:["PECHO","ESPALDA","HOMBROS","ABDOMINALES"] },
  ],
  6: [
    { name:"Empuje",               groups:["PECHO","HOMBROS","TRÍCEPS"] },
    { name:"Tirón",                groups:["ESPALDA","BÍCEPS","TRAPECIOS"] },
    { name:"Cuádriceps/Core",      groups:["CUÁDRICEPS","GEMELOS","CORE"] },
    { name:"Empuje Acces.",        groups:["PECHO","HOMBROS","TRÍCEPS","ABDOMINALES"] },
    { name:"Tirón/Brazos",         groups:["ESPALDA","BÍCEPS","TRAPECIOS"] },
    { name:"Femorales/Glúteos",    groups:["FEMORALES","GLÚTEOS","GEMELOS"] },
  ],
};

// Cuántos ejercicios por grupo muscular
const EX_PER_GROUP: Record<string, number> = {
  PECHO:3, ESPALDA:3, CUÁDRICEPS:3, FEMORALES:2, GLÚTEOS:2,
  HOMBROS:3, BÍCEPS:2, TRÍCEPS:2, TRAPECIOS:1,
  GEMELOS:1, CORE:1, ABDOMINALES:1,
};

// Palabras clave de ejercicios compuestos (prioridad alta)
const COMPOUND_KW = ["press","sentadilla","peso muerto","remo","dominada","jalón","fondos","hip thrust","zancada","estocada","curl","extensión","elevación","aperturas","pullover"];

function isCompound(name: string) {
  const l = name.toLowerCase();
  return COMPOUND_KW.some(k => l.includes(k));
}

// Letras para nombrar días: A, B, C, D, E, F
const DAY_LETTERS = ["A","B","C","D","E","F"];

type WorkoutDay = { name: string; exercises: { id: number; name: string; sets: number; reps: string; rir: number }[] };

function buildWorkoutDays(
  days: number,
  experience: string,
  byMuscle: Record<string, { id: number; name: string }[]>,
  priorityGroups: string[] = [],   // grupos a reforzar con +1 ejercicio
): WorkoutDay[] {
  const split = SPLITS[days] ?? SPLITS[3];
  const prioritySet = new Set(priorityGroups.map(g => g.toUpperCase()));

  // Pase 0: compuestos primero, rango fuerza-hipertrofia
  const srA = experience === "beginner"
    ? { sets:3, reps:"12-15" }
    : experience === "intermediate"
    ? { sets:4, reps:"10-12" }
    : { sets:4, reps:"8-10"  };

  // Pase 1 (variación): accesorios/aislamientos, rango hipertrofia alta
  const srB = experience === "beginner"
    ? { sets:3, reps:"15-20" }
    : experience === "intermediate"
    ? { sets:4, reps:"12-15" }
    : { sets:4, reps:"10-12" };

  // Registrar qué ejercicios se usaron en el pase 0 por grupo
  const usedInA: Record<string, Set<number>> = {};

  const passA: WorkoutDay[] = split.map((day, di) => {
    const exercises: WorkoutDay["exercises"] = [];
    const sessionUsed = new Set<number>();

    for (const grp of day.groups) {
      if (!usedInA[grp]) usedInA[grp] = new Set();
      const pool = [...(byMuscle[grp] ?? [])];
      if (!pool.length) continue;
      // compuestos primero en pase A
      pool.sort((a, b) => (isCompound(b.name)?1:0) - (isCompound(a.name)?1:0));
      // grupos prioritarios reciben +1 ejercicio
      const count = (EX_PER_GROUP[grp] ?? 2) + (prioritySet.has(grp) ? 1 : 0);
      pool.filter(e => !sessionUsed.has(e.id)).slice(0, count).forEach(e => {
        exercises.push({ id: e.id, name: e.name, ...srA });
        sessionUsed.add(e.id);
        usedInA[grp].add(e.id);
      });
    }
    return { name: `${day.name} ${DAY_LETTERS[di]}`, exercises };
  });

  const passB: WorkoutDay[] = split.map((day, di) => {
    const exercises: WorkoutDay["exercises"] = [];
    const sessionUsed = new Set<number>();

    for (const grp of day.groups) {
      const pool = [...(byMuscle[grp] ?? [])];
      if (!pool.length) continue;

      // Preferir ejercicios NO usados en pase A (variación)
      const fresh    = pool.filter(e => !(usedInA[grp]?.has(e.id)));
      const reuse    = pool.filter(e =>  (usedInA[grp]?.has(e.id)));

      // En pase B: aislamientos/accesorios primero (inverso al pase A)
      fresh.sort((a, b) => (isCompound(a.name)?1:0) - (isCompound(b.name)?1:0));
      reuse.sort((a, b) => (isCompound(a.name)?1:0) - (isCompound(b.name)?1:0));

      const ordered = [...fresh, ...reuse].filter(e => !sessionUsed.has(e.id));
      // grupos prioritarios reciben +1 ejercicio también en pase B
      const count   = (EX_PER_GROUP[grp] ?? 2) + (prioritySet.has(grp) ? 1 : 0);
      ordered.slice(0, count).forEach(e => {
        exercises.push({ id: e.id, name: e.name, ...srB });
        sessionUsed.add(e.id);
      });
    }
    return { name: `${day.name} ${DAY_LETTERS[di]}1`, exercises };
  });

  // Orden: A, B, C... A1, B1, C1...
  return [...passA, ...passB];
}

// ── Matriz de progresión 16 semanas (2 bloques ondulados) ────────────────────
const PROG_MATRIX = [
  // ── Bloque 1: Semanas 1-8 — Construcción base ─────────────────────────────
  { rpe:7,  repMod: 0,  setsMod: 0,  label:"S1  · Adaptación"      },
  { rpe:8,  repMod: 0,  setsMod: 0,  label:"S2  · Progresión"       },
  { rpe:9,  repMod: 0,  setsMod: 0,  label:"S3  · Sobrecarga"       },
  { rpe:6,  repMod: 2,  setsMod:-1,  label:"S4  · Descarga"         },
  { rpe:8,  repMod:-2,  setsMod: 0,  label:"S5  · Bloque fuerza"    },
  { rpe:9,  repMod:-2,  setsMod: 0,  label:"S6  · Sobrecarga II"    },
  { rpe:10, repMod:-3,  setsMod: 0,  label:"S7  · Semana de PR"     },
  { rpe:6,  repMod: 2,  setsMod:-1,  label:"S8  · Descarga final"   },
  // ── Bloque 2: Semanas 9-16 — Nivel superior (+volumen/fuerza) ─────────────
  { rpe:7,  repMod: 1,  setsMod: 0,  label:"S9  · Adaptación II"    },
  { rpe:8,  repMod: 1,  setsMod: 1,  label:"S10 · Volumen II"        },
  { rpe:9,  repMod: 1,  setsMod: 1,  label:"S11 · Sobrecarga III"   },
  { rpe:6,  repMod: 3,  setsMod:-1,  label:"S12 · Descarga II"      },
  { rpe:8,  repMod:-1,  setsMod: 1,  label:"S13 · Fuerza-Volumen"   },
  { rpe:9,  repMod:-1,  setsMod: 1,  label:"S14 · Sobrecarga IV"    },
  { rpe:10, repMod:-2,  setsMod: 1,  label:"S15 · Semana de PR II"  },
  { rpe:6,  repMod: 3,  setsMod:-1,  label:"S16 · Descarga final II"},
] as const;

const N_WEEKS = PROG_MATRIX.length; // 16

function parseRepRange(s: string): [number, number] {
  const m = s.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (m) return [parseInt(m[1]), parseInt(m[2])];
  const n = parseInt(s);
  return isNaN(n) ? [8,10] : [n,n];
}

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const {
      client_id, personal_data, training_prefs, diet_prefs,
      photos, photo_base64, photo_mime,
    } = await req.json();

    const photoFront = photos?.front ?? (photo_base64 ? { base64:photo_base64, mime:photo_mime??"image/jpeg" } : null);
    const photoSide  = photos?.side  ?? null;
    const photoBack  = photos?.back  ?? null;
    const anyPhoto   = photoFront ?? photoSide ?? photoBack;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { sex, age, height, weight, activity_factor, goal } = personal_data;
    const { days_per_week, equipment, experience, injuries } = training_prefs;

    // ── 1. Macros ──────────────────────────────────────────────────────────
    const macros = calcMacros(sex, weight, height, age, activity_factor, goal);

    // ── 2. Fetch datos cliente ─────────────────────────────────────────────
    const [{ data: profile }, { data: exercises }] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", client_id).single(),
      supabase.from("exercises").select("id, name, muscle_group").order("muscle_group"),
    ]);

    // ── 3. Agrupar ejercicios por músculo ──────────────────────────────────
    const byMuscle: Record<string, { id: number; name: string }[]> = {};
    for (const ex of exercises ?? []) {
      const mg = (ex.muscle_group ?? "OTROS").toUpperCase().trim();
      if (!byMuscle[mg]) byMuscle[mg] = [];
      byMuscle[mg].push({ id: ex.id, name: ex.name });
    }

    // ── 4. Análisis de foto con IA ─────────────────────────────────────────
    // Devuelve: párrafo de análisis + grupos musculares a priorizar en el entreno
    // Grupos válidos (deben coincidir exactamente con muscle_group en BD):
    const VALID_GROUPS = ["PECHO","ESPALDA","HOMBROS","BÍCEPS","TRÍCEPS","TRAPECIOS",
                          "CUÁDRICEPS","FEMORALES","GLÚTEOS","GEMELOS","CORE","ABDOMINALES"];

    let analysis      = "Plan personalizado basado en tus datos y objetivos.";
    let priorityGroups: string[] = [];   // grupos a reforzar según la foto

    if (anyPhoto) {
      try {
        type Block = { type:"text"; text:string } | { type:"image"; source:{ type:"base64"; media_type:string; data:string } };
        const content: Block[] = [];
        if (photoFront) { content.push({type:"text",text:"[FOTO FRENTE]"}); content.push({type:"image",source:{type:"base64",media_type:photoFront.mime,data:photoFront.base64}}); }
        if (photoSide)  { content.push({type:"text",text:"[FOTO LATERAL]"}); content.push({type:"image",source:{type:"base64",media_type:photoSide.mime,data:photoSide.base64}}); }
        if (photoBack)  { content.push({type:"text",text:"[FOTO ESPALDA]"}); content.push({type:"image",source:{type:"base64",media_type:photoBack.mime,data:photoBack.base64}}); }
        content.push({type:"text", text:
          `Cliente: ${profile?.full_name ?? "Cliente"} · ${sex==="female"?"Mujer":"Hombre"} · ${age}a · ${weight}kg · ${height}cm\n` +
          `Objetivo: ${goal} · Experiencia: ${experience}\n\n` +
          `Analiza las fotos corporales y responde ÚNICAMENTE con este JSON (sin texto extra, sin markdown):\n` +
          `{\n` +
          `  "analysis": "<párrafo 3-4 frases: % grasa visual, distribución grasa, desarrollo muscular por zona, puntos a mejorar>",\n` +
          `  "priority_groups": ["<GRUPO1>","<GRUPO2>","<GRUPO3>"]\n` +
          `}\n\n` +
          `priority_groups: elige 2-4 grupos musculares que más necesita desarrollar este cliente según las fotos.\n` +
          `Grupos disponibles (usa exactamente estos nombres en mayúsculas):\n` +
          `${VALID_GROUPS.join(", ")}`
        });
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method:"POST",
          headers:{ "x-api-key":Deno.env.get("ANTHROPIC_API_KEY")!, "anthropic-version":"2023-06-01", "content-type":"application/json" },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 500,
            system: "Eres un entrenador personal experto en análisis de composición corporal. Responde SOLO con el JSON solicitado, sin texto extra ni markdown.",
            messages: [{ role:"user", content }],
          }),
        });
        if (r.ok) {
          const d = await r.json();
          const raw = (d.content?.[0]?.text ?? "").trim();
          // Parsear JSON — puede venir con o sin backticks
          const jsonStr = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.analysis)        analysis       = String(parsed.analysis).trim();
            if (Array.isArray(parsed.priority_groups)) {
              // Filtrar solo grupos válidos para evitar alucinaciones
              priorityGroups = parsed.priority_groups
                .map((g: string) => String(g).toUpperCase().trim())
                .filter((g: string) => VALID_GROUPS.includes(g))
                .slice(0, 4);
            }
          } catch {
            // Si el JSON falla, usar el texto completo como análisis
            if (raw.length > 20) analysis = raw;
          }
        }
      } catch { /* Si falla la llamada IA, seguimos sin análisis ni prioridades */ }
    }

    // ── 5. Guardar programa (algorítmico) ──────────────────────────────────
    const workoutDays = buildWorkoutDays(days_per_week, experience, byMuscle, priorityGroups);
    const GOAL_ES: Record<string,string> = {
      lose_fat_aggressive:"Definición agresiva", lose_fat:"Definición", lose_fat_soft:"Definición suave",
      maintain:"Mantenimiento", gain_muscle:"Volumen", bulk:"Bulk",
    };
    const { data: programRow, error: progErr } = await supabase
      .from("programs")
      .insert({
        name:            `Plan ${GOAL_ES[goal]??goal} - ${days_per_week} días`,
        description:     `Algoritmo · ${new Date().toLocaleDateString("es-ES")} · ${macros.kcal_on}kcal · 16 semanas · ${days_per_week*2} sesiones/ciclo`,
        owner_client_id: client_id,
        source:          "ai",
      })
      .select("id").single();
    if (progErr) throw new Error(`programs: ${progErr.message}`);
    const programId = programRow.id;

    for (let di = 0; di < workoutDays.length; di++) {
      const day = workoutDays[di];
      const { data: dayRow } = await supabase
        .from("program_days")
        .insert({ program_id:programId, name:day.name, order_index:di+1, optional:false })
        .select("id").single();
      if (!dayRow) continue;

      const { data: mcRows } = await supabase
        .from("microcycles")
        .insert(PROG_MATRIX.map((_,i) => ({ day_id:dayRow.id, number:i+1 })))
        .select("id");
      if (!mcRows?.length) continue;

      for (let mc = 0; mc < N_WEEKS; mc++) {
        const prog = PROG_MATRIX[mc];
        const mcId = mcRows[mc].id;

        type MeRow = { microcycle_id:string; exercise_id:number; order_index:number; total_sets:number; note:string|null; _minR:number; _maxR:number; _rpe:number };
        const meInputs: MeRow[] = [];

        day.exercises.forEach((ex, ei) => {
          const [minR, maxR] = parseRepRange(ex.reps);
          const adjMin = Math.max(1, minR + prog.repMod);
          const adjMax = Math.max(1, maxR + prog.repMod);
          const sets   = Math.max(2, ex.sets + prog.setsMod);
          meInputs.push({
            microcycle_id: mcId, exercise_id: ex.id,
            order_index: ei+1, total_sets: sets,
            note: prog.label, _minR: adjMin, _maxR: adjMax, _rpe: prog.rpe,
          });
        });
        if (!meInputs.length) continue;

        const { data: meRows } = await supabase
          .from("microcycle_exercises")
          .insert(meInputs.map(({ _minR:_a, _maxR:_b, _rpe:_c, ...r }) => r))
          .select("id");
        if (!meRows?.length) continue;

        const setInserts = meRows.flatMap((me, ei) => {
          const inp = meInputs[ei];
          const rir = Math.max(0, 10 - inp._rpe);
          const base = inp._minR === inp._maxR ? String(inp._minR) : `${inp._minR}-${inp._maxR}`;
          return Array.from({length: inp.total_sets}, (_, sn) => ({
            microcycle_exercise_id: me.id, set_number: sn+1,
            target_reps: `${base} (${rir})`, target_weight: null, target_rpe: null,
          }));
        });
        if (setInserts.length) await supabase.from("exercise_sets").insert(setInserts);
      }
    }

    await supabase.from("program_assignments").update({ active:false }).eq("client_id", client_id);
    await supabase.from("program_assignments").insert({ client_id, program_id:programId, active:true });

    // ── 6. Guardar dieta (plantillas) ─────────────────────────────────────
    const dietRestrictions: string[] = Array.isArray(diet_prefs?.restrictions) ? diet_prefs.restrictions : [];
    const dietAvoid: string          = typeof diet_prefs?.avoid === "string" ? diet_prefs.avoid : "";
    const dietMeals = buildDietMeals(macros.carbs_on_g, macros.carbs_off_g, goal, dietRestrictions, dietAvoid);
    const { data: dietRow, error: dietErr } = await supabase
      .from("diet_plans")
      .insert({
        name:        `Dieta ${GOAL_ES[goal]??goal} - ${macros.kcal_on}kcal`,
        kcal_on:     macros.kcal_on,   kcal_off:    macros.kcal_off,
        protein_on:  macros.protein_g, protein_off: macros.protein_g,
        carbs_on:    macros.carbs_on_g,carbs_off:   macros.carbs_off_g,
        fat_on:      macros.fat_g,     fat_off:     macros.fat_g,
        notes:       `Pesa los alimentos en crudo/seco. Agua mínima ${(weight*0.035).toFixed(1)}L/día. ` +
                     `Grasas intercambiables: 5g AOVE ≈ 5g Aceite Coco ≈ 30g Aguacate ≈ 10g Chocolate Negro 85%.`,
        source:      "ai",
      })
      .select("id").single();
    if (dietErr) throw new Error(`diet_plans: ${dietErr.message}`);
    const dietPlanId = dietRow.id;

    for (let mi = 0; mi < dietMeals.length; mi++) {
      const meal = dietMeals[mi] as any;
      const { data: mealRow } = await supabase
        .from("diet_meals")
        .insert({ plan_id:dietPlanId, name:meal.name, emoji:meal.emoji, day_type:meal.day_type, sort_order:mi })
        .select("id").single();
      if (!mealRow) continue;
      for (let oi = 0; oi < meal.options.length; oi++) {
        const opt = meal.options[oi];
        await supabase.from("diet_options").insert({
          meal_id: mealRow.id, name: opt.name, sort_order: oi,
          content: opt.groups.map((g: any) => ({
            label: g.label, isChoice: g.isChoice, items: g.items, note: g.note ?? null,
          })),
        });
      }
    }

    await supabase.from("diet_assignments").update({ active:false }).eq("client_id", client_id);
    await supabase.from("diet_assignments").insert({
      client_id, plan_id:dietPlanId, active:true, source:"ai",
      assigned_at: new Date().toISOString(),
    });

    // ── 7. Actualizar client_macros ────────────────────────────────────────
    await supabase.from("client_macros").upsert({
      client_id, sex, age:Number(age), height_cm:Number(height),
      weight_kg:Number(weight), activity_factor:Number(activity_factor),
      protein_mult: parseFloat((macros.protein_g/weight).toFixed(2)),
      fat_mult:     parseFloat((macros.fat_g/weight).toFixed(2)),
      bmr: macros.bmr, tdee: macros.tdee,
      protein_g: macros.protein_g, carbs_g: macros.carbs_on_g, fat_g: macros.fat_g,
      goal, days_on: days_per_week, updated_at: new Date().toISOString(),
    }, { onConflict:"client_id" });

    // ── 8. Tracking ────────────────────────────────────────────────────────
    await supabase.from("ai_plan_generations").insert({
      client_id, program_id:programId, diet_plan_id:dietPlanId,
      analysis, photo_used:!!anyPhoto, priority_groups: priorityGroups,
    });

    return new Response(
      JSON.stringify({ success:true, analysis, priority_groups:priorityGroups, macros, program_id:programId, diet_plan_id:dietPlanId }),
      { headers:{ ...corsHeaders, "Content-Type":"application/json" } },
    );

  } catch (err) {
    console.error("ai-generate-plan error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status:200, headers:{ ...corsHeaders, "Content-Type":"application/json" } },
    );
  }
});
