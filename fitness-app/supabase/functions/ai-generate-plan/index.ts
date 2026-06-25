// ai-generate-plan v4 — 100% algorítmico, sin llamadas a IA externa
// Dieta: plantillas fijas escaladas por macros (estilo coach franvyother)
// Entreno: algoritmo determinista modelado en programas Excel reales
//   · 2 series por ejercicio (pesada + back-off), rangos por tier
//   · Progresión 16 semanas con fases adapt/normal/deload/PR + técnicas R&P / Dropset
// Pliegues: opcionalmente Jackson-Pollock 3 pliegues para BF% real → macros más precisas
//
// Env vars: SUPABASE_URL · SUPABASE_SERVICE_ROLE_KEY

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

// ── Jackson-Pollock 3 pliegues (opcional) ────────────────────────────────────
// Hombre: pecho, abdomen, muslo (mm)   | Mujer: tríceps, suprailíaco, muslo (mm)
// Devuelve % grasa corporal (1 decimal) o null si faltan datos
function calcBodyFatJP(sex: string, age: number, s1: number, s2: number, s3: number): number | null {
  const sum = s1 + s2 + s3;
  if (!sum || sum <= 0) return null;
  let density: number;
  if (sex === "female") {
    density = 1.0994921 - (0.0009929 * sum) + (0.0000023 * sum * sum) - (0.0001392 * age);
  } else {
    density = 1.10938   - (0.0008267 * sum) + (0.0000016 * sum * sum) - (0.0002574 * age);
  }
  const bf = (495 / density) - 450; // Siri equation
  return Math.max(5, Math.min(50, Math.round(bf * 10) / 10));
}

// Recalcula proteína y grasa basadas en masa magra real (más preciso con pliegues)
function refineMacrosByLeanMass(
  base: ReturnType<typeof calcMacros>,
  bodyFatPct: number,
  weight: number,
) {
  const leanMass  = weight * (1 - bodyFatPct / 100);
  const protein_g   = Math.round(leanMass * 2.5);       // 2.5g/kg masa magra
  const fat_g       = Math.round(leanMass * 1.2);       // 1.2g/kg masa magra
  const carbs_on_g  = Math.max(20, Math.round((base.kcal_on  - protein_g*4 - fat_g*9) / 4));
  const carbs_off_g = Math.max(20, Math.round((base.kcal_off - protein_g*4 - fat_g*9) / 4));
  return { ...base, protein_g, fat_g, carbs_on_g, carbs_off_g };
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
// Modelado en programas Excel reales (Bloque 4 PPL, Bloque 3 Arnolt, etc.)
// Estructura: 2 series por ejercicio (pesada + back-off con diferente rango)
// Tier 1 = primer compuesto del grupo | Tier 2 = segundo | Tier 3+ = aislamiento

type SplitGroup = { name: string; count: number };
type SplitDay   = { name: string; groups: SplitGroup[] };

// SPLITS basados en los Excel de referencia
// Tirón:  ESPALDA×6 (ESPALDA ALTA + DORSAL fusionados), TRAPECIOS×1, BÍCEPS×3, ABDOMINALES×1 = 11
// Empuje: PECHO×3, HOMBROS×3, TRÍCEPS×3, ABDOMINALES×1 = 10
// Pierna: GEMELOS×1, CUÁDRICEPS×3, FEMORALES×2, GLÚTEOS×1 = 7
const SPLITS: Record<number, SplitDay[]> = {
  1: [{ name: "Full Body", groups: [
    { name: "ESPALDA",     count: 2 },
    { name: "CUÁDRICEPS",  count: 2 },
    { name: "PECHO",       count: 2 },
    { name: "HOMBROS",     count: 1 },
    { name: "FEMORALES",   count: 1 },
    { name: "ABDOMINALES", count: 1 },
  ]}],
  2: [
    { name: "Superior", groups: [
      { name: "ESPALDA",     count: 3 },
      { name: "PECHO",       count: 3 },
      { name: "HOMBROS",     count: 2 },
      { name: "BÍCEPS",      count: 1 },
      { name: "TRÍCEPS",     count: 1 },
    ]},
    { name: "Inferior", groups: [
      { name: "CUÁDRICEPS",  count: 3 },
      { name: "FEMORALES",   count: 2 },
      { name: "GLÚTEOS",     count: 1 },
      { name: "GEMELOS",     count: 1 },
      { name: "ABDOMINALES", count: 1 },
    ]},
  ],
  3: [
    { name: "Empuje", groups: [
      { name: "PECHO",       count: 3 },
      { name: "HOMBROS",     count: 3 },
      { name: "TRÍCEPS",     count: 3 },
      { name: "ABDOMINALES", count: 1 },
    ]},
    { name: "Tirón", groups: [
      { name: "ESPALDA",     count: 6 },
      { name: "TRAPECIOS",   count: 1 },
      { name: "BÍCEPS",      count: 3 },
      { name: "ABDOMINALES", count: 1 },
    ]},
    { name: "Pierna", groups: [
      { name: "GEMELOS",     count: 1 },
      { name: "CUÁDRICEPS",  count: 3 },
      { name: "FEMORALES",   count: 2 },
      { name: "GLÚTEOS",     count: 1 },
    ]},
  ],
  4: [
    { name: "Empuje", groups: [
      { name: "PECHO",       count: 3 },
      { name: "HOMBROS",     count: 3 },
      { name: "TRÍCEPS",     count: 3 },
      { name: "ABDOMINALES", count: 1 },
    ]},
    { name: "Tirón", groups: [
      { name: "ESPALDA",     count: 6 },
      { name: "TRAPECIOS",   count: 1 },
      { name: "BÍCEPS",      count: 3 },
      { name: "ABDOMINALES", count: 1 },
    ]},
    { name: "Cuádriceps", groups: [
      { name: "GEMELOS",     count: 1 },
      { name: "CUÁDRICEPS",  count: 4 },
      { name: "FEMORALES",   count: 1 },
      { name: "GLÚTEOS",     count: 1 },
    ]},
    { name: "Femorales", groups: [
      { name: "FEMORALES",   count: 3 },
      { name: "GLÚTEOS",     count: 2 },
      { name: "GEMELOS",     count: 1 },
      { name: "ABDOMINALES", count: 1 },
    ]},
  ],
  5: [
    { name: "Tirón", groups: [
      { name: "ESPALDA",     count: 6 },
      { name: "TRAPECIOS",   count: 1 },
      { name: "BÍCEPS",      count: 3 },
      { name: "ABDOMINALES", count: 1 },
    ]},
    { name: "Cuádriceps", groups: [
      { name: "GEMELOS",     count: 1 },
      { name: "CUÁDRICEPS",  count: 4 },
      { name: "FEMORALES",   count: 1 },
      { name: "GLÚTEOS",     count: 1 },
    ]},
    { name: "Empuje", groups: [
      { name: "PECHO",       count: 3 },
      { name: "HOMBROS",     count: 3 },
      { name: "TRÍCEPS",     count: 3 },
      { name: "ABDOMINALES", count: 1 },
    ]},
    { name: "Femorales", groups: [
      { name: "FEMORALES",   count: 3 },
      { name: "GLÚTEOS",     count: 2 },
      { name: "GEMELOS",     count: 1 },
      { name: "ABDOMINALES", count: 1 },
    ]},
    { name: "Hombro-Brazos", groups: [
      { name: "HOMBROS",     count: 3 },
      { name: "BÍCEPS",      count: 2 },
      { name: "TRÍCEPS",     count: 2 },
      { name: "ABDOMINALES", count: 1 },
    ]},
  ],
  6: [
    { name: "Tirón A", groups: [
      { name: "ESPALDA",     count: 4 },
      { name: "TRAPECIOS",   count: 2 },
      { name: "BÍCEPS",      count: 2 },
    ]},
    { name: "Cuádriceps", groups: [
      { name: "GEMELOS",     count: 1 },
      { name: "CUÁDRICEPS",  count: 4 },
      { name: "FEMORALES",   count: 1 },
      { name: "ABDOMINALES", count: 1 },
    ]},
    { name: "Empuje A", groups: [
      { name: "PECHO",       count: 3 },
      { name: "HOMBROS",     count: 3 },
      { name: "TRÍCEPS",     count: 2 },
    ]},
    { name: "Tirón B", groups: [
      { name: "ESPALDA",     count: 3 },
      { name: "BÍCEPS",      count: 2 },
      { name: "ABDOMINALES", count: 1 },
    ]},
    { name: "Femorales", groups: [
      { name: "FEMORALES",   count: 3 },
      { name: "GLÚTEOS",     count: 2 },
      { name: "GEMELOS",     count: 1 },
    ]},
    { name: "Empuje B", groups: [
      { name: "HOMBROS",     count: 3 },
      { name: "PECHO",       count: 2 },
      { name: "TRÍCEPS",     count: 2 },
      { name: "ABDOMINALES", count: 1 },
    ]},
  ],
};

// Grupos con rangos de alta repetición (abdomen, gemelos)
const HIGH_REP_GROUPS = new Set(["ABDOMINALES", "CORE", "GEMELOS"]);

// Palabras clave de ejercicios compuestos (se ordenan primero en cada grupo)
const COMPOUND_KW = ["press", "sentadilla", "peso muerto", "remo", "dominada", "jalón",
                     "fondos", "hip thrust", "zancada", "estocada", "pullover", "face pull"];

function isCompound(name: string): boolean {
  return COMPOUND_KW.some(k => name.toLowerCase().includes(k));
}

// ── Rangos de reps por tier y experiencia ────────────────────────────────────
// 2 series por ejercicio: s1 = pesada, s2 = back-off (más reps, menos RIR o a fallo)
// Modelado en los programas Excel:
//   Tier 1: 5-8 (RIR 1) / 8-10 (RIR 0)
//   Tier 2: 6-9 (RIR 0) / 9-12 (RIR 0)
//   Tier 3: 9-12 (RIR 0) / 10-12 (fallo)
type RepRangePair = { s1: string; s2: string };

function getBaseRepRanges(tier: 1|2|3, experience: string, group: string): RepRangePair {
  if (HIGH_REP_GROUPS.has(group)) {
    return experience === "beginner"
      ? { s1: "15-20 (RIR 1)", s2: "15-20 (RIR 0)" }
      : { s1: "12-15 (RIR 1)", s2: "12-15 (RIR 0)" };
  }
  if (experience === "beginner") {
    const m: Record<number, RepRangePair> = {
      1: { s1: "8-10 (RIR 2)",  s2: "10-12 (RIR 1)"  },
      2: { s1: "10-12 (RIR 1)", s2: "12-15 (RIR 0)"  },
      3: { s1: "12-15 (RIR 0)", s2: "12-15 (fallo)"  },
    };
    return m[tier] ?? m[3];
  }
  if (experience === "advanced") {
    const m: Record<number, RepRangePair> = {
      1: { s1: "4-6 (RIR 1)",  s2: "6-8 (RIR 0)"    },
      2: { s1: "5-8 (RIR 0)",  s2: "8-10 (fallo)"   },
      3: { s1: "8-10 (RIR 0)", s2: "10-12 (fallo)"  },
    };
    return m[tier] ?? m[3];
  }
  // intermediate (default)
  const m: Record<number, RepRangePair> = {
    1: { s1: "5-8 (RIR 1)",   s2: "8-10 (RIR 0)"   },
    2: { s1: "6-9 (RIR 0)",   s2: "9-12 (RIR 0)"   },
    3: { s1: "9-12 (RIR 0)",  s2: "10-12 (fallo)"  },
  };
  return m[tier] ?? m[3];
}

// Ajusta los rangos según la fase de la semana (deload → más RIR; adapt → s1 más suave)
function applyPhase(rr: RepRangePair, phase: string): RepRangePair {
  if (phase === "deload") {
    const ease = (s: string) => s
      .replace("RIR 0", "RIR 2").replace("RIR 1", "RIR 3").replace("RIR 2", "RIR 3")
      .replace("fallo", "RIR 2");
    return { s1: ease(rr.s1), s2: ease(rr.s2) };
  }
  if (phase === "adapt") {
    const ease1 = (s: string) => s
      .replace("(RIR 0)", "(RIR 1)").replace("(RIR 1)", "(RIR 2)")
      .replace("(fallo)", "(RIR 1)");
    return { s1: ease1(rr.s1), s2: rr.s2 };
  }
  return rr;
}

// ── Letras para los días ─────────────────────────────────────────────────────
const DAY_LETTERS = ["A", "B", "C", "D", "E", "F"];

type ExWithTier = { id: number; name: string; tier: 1|2|3; group: string };
type WorkoutDay = { name: string; exercises: ExWithTier[] };

function buildWorkoutDays(
  days: number,
  experience: string,
  byMuscle: Record<string, { id: number; name: string }[]>,
  priorityGroups: string[] = [],
): WorkoutDay[] {
  const split = SPLITS[days] ?? SPLITS[4];
  const prioritySet = new Set(priorityGroups.map(g => g.toUpperCase().trim()));

  return split.map((day, di) => {
    const exercises: ExWithTier[] = [];
    const sessionUsed = new Set<number>();

    for (const { name: grp, count } of day.groups) {
      const pool = [...(byMuscle[grp] ?? [])];
      if (!pool.length) continue;
      // Compuestos primero dentro del grupo
      pool.sort((a, b) => (isCompound(b.name) ? 1 : 0) - (isCompound(a.name) ? 1 : 0));
      // +1 ejercicio en grupos prioritarios
      const take = count + (prioritySet.has(grp) ? 1 : 0);
      let tierInGroup = 0;
      for (const ex of pool) {
        if (sessionUsed.has(ex.id)) continue;
        if (tierInGroup >= take) break;
        const tier = (tierInGroup === 0 ? 1 : tierInGroup === 1 ? 2 : 3) as 1|2|3;
        exercises.push({ id: ex.id, name: ex.name, tier, group: grp });
        sessionUsed.add(ex.id);
        tierInGroup++;
      }
    }
    return { name: `${day.name} ${DAY_LETTERS[di]}`, exercises };
  });
}

// ── Matriz de progresión 16 semanas ──────────────────────────────────────────
// Phases: adapt (semana 1 de cada bloque), normal, deload, pr (semana pico)
// technique: null | "rp" (R&P último set aislamientos) | "rp_drop" (R&P + Dropset)
const PROG_MATRIX: readonly {
  label: string;
  phase: "adapt" | "normal" | "deload" | "pr";
  technique: null | "rp" | "rp_drop";
}[] = [
  // ── Bloque 1 ──────────────────────────────────────────────────────────────
  { label: "S1  · Adaptación",        phase: "adapt",  technique: null      },
  { label: "S2  · Progresión",         phase: "normal", technique: null      },
  { label: "S3  · Sobrecarga",         phase: "normal", technique: null      },
  { label: "S4  · Descarga",           phase: "deload", technique: null      },
  { label: "S5  · Bloque fuerza",      phase: "normal", technique: "rp"      },
  { label: "S6  · Sobrecarga II",      phase: "normal", technique: "rp_drop" },
  { label: "S7  · Semana de PR",       phase: "pr",     technique: "rp_drop" },
  { label: "S8  · Descarga final",     phase: "deload", technique: null      },
  // ── Bloque 2 ──────────────────────────────────────────────────────────────
  { label: "S9  · Adaptación II",      phase: "adapt",  technique: null      },
  { label: "S10 · Progresión II",       phase: "normal", technique: null      },
  { label: "S11 · Sobrecarga III",      phase: "normal", technique: "rp"      },
  { label: "S12 · Descarga II",         phase: "deload", technique: null      },
  { label: "S13 · Intensidad II",       phase: "normal", technique: "rp"      },
  { label: "S14 · Sobrecarga IV",       phase: "normal", technique: "rp_drop" },
  { label: "S15 · Semana de PR II",     phase: "pr",     technique: "rp_drop" },
  { label: "S16 · Descarga final II",   phase: "deload", technique: null      },
];

const N_WEEKS = PROG_MATRIX.length; // 16

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const {
      client_id, personal_data, training_prefs, diet_prefs,
      skinfolds, priority_groups: manualPriorityGroups,
    } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { sex, age, height, weight, activity_factor, goal } = personal_data;
    const { days_per_week, equipment, experience, injuries } = training_prefs;

    // ── 1. Macros (con refinamiento opcional por pliegues) ─────────────────
    let macros = calcMacros(sex, weight, height, age, activity_factor, goal);
    let bodyFatPct: number | null = null;
    if (skinfolds?.s1 && skinfolds?.s2 && skinfolds?.s3) {
      bodyFatPct = calcBodyFatJP(sex, Number(age), Number(skinfolds.s1), Number(skinfolds.s2), Number(skinfolds.s3));
      if (bodyFatPct !== null) {
        macros = refineMacrosByLeanMass(macros, bodyFatPct, Number(weight));
      }
    }

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

    // ── 4. Grupos prioritarios (selección manual del wizard) ──────────────
    const VALID_GROUPS = ["PECHO","ESPALDA","HOMBROS","BÍCEPS","TRÍCEPS","TRAPECIOS",
                          "CUÁDRICEPS","FEMORALES","GLÚTEOS","GEMELOS","CORE","ABDOMINALES"];
    const priorityGroups: string[] = Array.isArray(manualPriorityGroups)
      ? manualPriorityGroups.map((g: string) => String(g).toUpperCase().trim())
                            .filter((g: string) => VALID_GROUPS.includes(g)).slice(0, 4)
      : [];

    const analysis = bodyFatPct !== null
      ? `Plan personalizado · ${bodyFatPct}% grasa corporal (Jackson-Pollock) · ${macros.protein_g}g proteína · ${macros.kcal_on}kcal días on.`
      : `Plan personalizado · ${macros.protein_g}g proteína · ${macros.kcal_on}kcal días on.`;

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
        description:     `Algoritmo · ${new Date().toLocaleDateString("es-ES")} · ${macros.kcal_on}kcal · 16 semanas · ${days_per_week} días/semana`,
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
        const prog    = PROG_MATRIX[mc];
        const mcId    = mcRows[mc].id;
        const totalEx = day.exercises.length;

        type MeRow = {
          microcycle_id: string; exercise_id: number; order_index: number;
          total_sets: number; note: string | null;
          _tier: 1|2|3; _group: string; _exIndex: number; _totalEx: number;
        };
        const meInputs: MeRow[] = [];

        day.exercises.forEach((ex, ei) => {
          meInputs.push({
            microcycle_id: mcId, exercise_id: ex.id,
            order_index:   ei + 1, total_sets: 2, // siempre 2 series: pesada + back-off
            note:          prog.label,
            _tier: ex.tier, _group: ex.group, _exIndex: ei, _totalEx: totalEx,
          });
        });
        if (!meInputs.length) continue;

        const { data: meRows } = await supabase
          .from("microcycle_exercises")
          .insert(meInputs.map(({ _tier:_a, _group:_b, _exIndex:_c, _totalEx:_d, ...r }) => r))
          .select("id");
        if (!meRows?.length) continue;

        const setInserts = meRows.flatMap((me: { id: string }, ei: number) => {
          const inp   = meInputs[ei];
          const baseR = getBaseRepRanges(inp._tier, experience, inp._group);
          const rr    = applyPhase(baseR, prog.phase);

          // Técnica en la última serie (s2) de aislamientos (tier 2+) en semanas de intensidad
          const isTier1 = inp._tier === 1;
          let tech2 = "";
          if (!isTier1 && prog.technique) {
            if (prog.technique === "rp") {
              tech2 = " · R&P";
            } else if (prog.technique === "rp_drop") {
              // Último ejercicio de la sesión: Dropset; resto de aislamientos: R&P
              tech2 = inp._exIndex === inp._totalEx - 1 ? " · Dropset -20%" : " · R&P";
            }
          }

          return [
            { microcycle_exercise_id: me.id, set_number: 1, target_reps: rr.s1,
              target_weight: null, target_rpe: null },
            { microcycle_exercise_id: me.id, set_number: 2, target_reps: rr.s2 + tech2,
              target_weight: null, target_rpe: null },
          ];
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
      analysis, photo_used: false, priority_groups: priorityGroups,
    });

    return new Response(
      JSON.stringify({ success:true, analysis, priority_groups:priorityGroups, body_fat_pct:bodyFatPct, macros, program_id:programId, diet_plan_id:dietPlanId }),
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
