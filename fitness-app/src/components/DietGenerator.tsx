// ─────────────────────────────────────────────────────────────────────────────
// DietGenerator.tsx  v2
// Genera plan ON/OFF con 3 opciones por comida. Cada opción agrupa alimentos
// con sentido culinario (lácteos+avena, ISO+cereales, etc.).
// El admin puede cambiar cualquier ingrediente dentro de cada opción via select.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ingredients, type Ingredient } from "../data/ingredients";

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
        id: "c1_a", label: "Lácteos + Avena",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["yogur_griego","yogur_prot","qso_batido","qso_fresco","mousse_prot","leche_prot"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 25,
            ingIds: ["avena_copos","harina_avena","avena_crunchy"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 10,
            ingIds: ["aceite_coco","aceite_oliva","chocolate85"] },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
            ingIds: ["fresas","frambuesas","arandanos","arandanos_cong","frutos_rojos","kiwi","melocoton"] },
        ],
      },
      {
        id: "c1_b", label: "Proteína + Cereales",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["iso","whey"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 25,
            ingIds: ["corn_flakes","weetabix","copos_trigo","rice_krispies","cereal_mix","crema_arroz","choco_zero"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 10,
            ingIds: ["aceite_coco","chocolate85","crema_cacah"] },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
            ingIds: ["platano","manzana","pera","uva","melocoton"] },
        ],
      },
      {
        id: "c1_c", label: "Pan + Cremas",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["yogur_griego","qso_batido","iso","leche_prot","qso_fresco"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 25,
            ingIds: ["pan_centeno","pan_tostado","pan_fibra","pan_wasa","pan_molde","pan_integral_pan"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 10,
            ingIds: ["crema_cacah","almendras","nuez","chocolate85","aceite_coco"] },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
            ingIds: ["platano","manzana","arandanos","fresas","pera"] },
        ],
      },
    ],
  },

  // ── COMIDA 2 — Almuerzo ────────────────────────────────────────────────────
  {
    id: "c2", name: "Comida 2 — Almuerzo", emoji: "☕",
    profiles: [
      {
        id: "c2_a", label: "Embutido + Pan",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 15,
            ingIds: ["lomo_embuchado","lomo_curado_pavo","jamon","fiambre_pavo"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 20,
            ingIds: ["pan_wasa","pan_fibra","pan_tostado","pan_integral_pan"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 5,
            ingIds: ["aceite_oliva","aceitunas","aguacate","guacamole"] },
        ],
      },
      {
        id: "c2_b", label: "Atún + Tortas",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 15,
            ingIds: ["atun_lata","fiambre_pavo","salchi_pavo_3","salchi_pavo_ff","lomo_cerdo"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 20,
            ingIds: ["tortas_legumbre","tortas_arroz","tortas_maiz","pan_wasa"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 5,
            ingIds: ["aceite_oliva","aguacate","guacamole","aceitunas"] },
        ],
      },
      {
        id: "c2_c", label: "Queso + Fajitas",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 15,
            ingIds: ["qso_eatlean","mozza_light","havarti","qso_pizza","qso_fresco"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 20,
            ingIds: ["fajitas","pan_molde","pan_blanco","pan_centeno","pizza_int"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 5,
            ingIds: ["aceite_oliva","aceitunas","aguacate"] },
        ],
      },
    ],
  },

  // ── COMIDA 3 — Comida principal ────────────────────────────────────────────
  {
    id: "c3", name: "Comida 3 — Comida principal", emoji: "🍽️",
    profiles: [
      {
        id: "c3_a", label: "Pollo / Pavo + Pasta / Arroz",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 25,
            ingIds: ["pollo","pavo","picada_pollo","hamburguesa","lomo_cerdo"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 30,
            ingIds: ["pasta","pasta_integral","arroz","arroz_int","cuscus","arroz_3del","arroz_bolsita"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 35,
            ingIds: ["aceite_oliva"],
            noteText: "🥦 Verdura variada a gusto (libre)" },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
            ingIds: ["manzana","pera","melocoton","kiwi","platano","cerezas"] },
        ],
      },
      {
        id: "c3_b", label: "Pescado + Patata / Boniato",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 25,
            ingIds: ["merluza","tilapia","lenguado","lubina","sepia","gambas","calamar"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 30,
            ingIds: ["patata","patata_bote","boniato","boniato_rojo","noquis"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 35,
            ingIds: ["aceite_oliva"],
            noteText: "🥦 Verdura variada a gusto (libre)" },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
            ingIds: ["pera","manzana","melocoton","kiwi","fresas"] },
        ],
      },
      {
        id: "c3_c", label: "Ternera / Salmón + Arroz / Pasta",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 25,
            ingIds: ["ternera","salmon","trucha","lomo_atun"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 30,
            ingIds: ["arroz","pasta","noodles_arroz","cuscus","arroz_int"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 35,
            ingIds: ["aceite_oliva"],
            noteText: "🥦 Verdura variada a gusto (libre)" },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
            ingIds: ["fresas","arandanos","kiwi","frambuesas","pera"] },
        ],
      },
    ],
  },

  // ── COMIDA 4 — Merienda ────────────────────────────────────────────────────
  {
    id: "c4", name: "Comida 4 — Merienda", emoji: "🫐",
    profiles: [
      {
        id: "c4_a", label: "Yogur + Cereales",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["yogur_prot","yogur_griego","mousse_prot","qso_batido","leche_prot"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 15,
            ingIds: ["weetabix","corn_flakes","cereal_mix","avena_crunchy","rice_krispies","copos_trigo"] },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 100,
            ingIds: ["platano","fresas","arandanos","manzana"] },
        ],
      },
      {
        id: "c4_b", label: "Proteína ISO + Avena",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["iso","whey"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 15,
            ingIds: ["avena_copos","harina_avena","crema_arroz","avena_crunchy"] },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 100,
            ingIds: ["platano","manzana","pera","kiwi"] },
        ],
      },
      {
        id: "c4_c", label: "Queso batido + Pan",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["qso_batido","qso_fresco","yogur_prot","leche_prot","yogur_sln"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 15,
            ingIds: ["pan_tostado","pan_fibra","pan_wasa","tortas_legumbre","pan_centeno"] },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 100,
            ingIds: ["platano","manzana","pera","fresas","melocoton"] },
        ],
      },
    ],
  },

  // ── COMIDA 5 — Cena ────────────────────────────────────────────────────────
  {
    id: "c5", name: "Comida 5 — Cena", emoji: "🌙",
    profiles: [
      {
        id: "c5_a", label: "Pescado + Patata / Boniato",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["merluza","tilapia","lenguado","lubina","gambas","sepia","calamar"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 10,
            ingIds: ["patata","patata_bote","boniato","boniato_rojo","noquis"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 50,
            ingIds: ["aceite_oliva"],
            noteText: "🥦 Verdura variada a gusto (libre)" },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
            ingIds: ["fresas","frambuesas","arandanos","melocoton","pera","kiwi"] },
        ],
      },
      {
        id: "c5_b", label: "Pollo / Pavo + Arroz / Pasta",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["pollo","pavo","picada_pollo","salchi_pavo_3"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 10,
            ingIds: ["arroz","arroz_int","pasta","pasta_integral","arroz_bolsita"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 50,
            ingIds: ["aceite_oliva"],
            noteText: "🥦 Verdura variada a gusto (libre)" },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
            ingIds: ["manzana","pera","kiwi","sandia","melon"] },
        ],
      },
      {
        id: "c5_c", label: "Marisco / Atún + Noodles / Cuscús",
        slots: [
          { id: "prot", label: "Proteína", macro: "protein", pct: 20,
            ingIds: ["calamar","sepia","gambas","lomo_atun","atun_lata","merluza"] },
          { id: "hc",   label: "Hidratos", macro: "carbs",   pct: 10,
            ingIds: ["noodles_arroz","cuscus","arroz_3del","noquis","arroz_bolsita"] },
          { id: "fat",  label: "Grasa",    macro: "fat",     pct: 50,
            ingIds: ["aceite_oliva"],
            noteText: "🥦 Verdura variada a gusto (libre)" },
          { id: "fruta",label: "Fruta",    macro: "fixed",   pct: 0, fixedG: 150,
            ingIds: ["sandia","melon","cerezas","uva","melocoton"] },
        ],
      },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function round1(n: number) { return Math.round(n * 10) / 10; }

function poolFromIds(ids: string[]): Ingredient[] {
  return ids
    .map(id => ingredients.find(i => i.id === id))
    .filter((i): i is Ingredient => !!i);
}

function calcGrams(ing: Ingredient, macro: MacroKey, targetG: number): number {
  const per100 = ing[macro];
  if (!per100 || per100 <= 0) return 0;
  return Math.round((targetG / per100) * 100);
}

// ── Generación ────────────────────────────────────────────────────────────────

function generatePlan(macros: DailyMacros): GeneratedMeal[] {
  return MEAL_DEFS.map(meal => {
    const options: GeneratedOption[] = meal.profiles.map(profile => {
      const foods: GeneratedFood[] = [];

      profile.slots.forEach((slot, slotIdx) => {
        const pool = poolFromIds(slot.ingIds);
        if (!pool.length) return;

        // Rotar arranque según slot para variar ingredientes entre opciones
        const ing = pool[slotIdx % pool.length];

        let grams   = 0;
        let targetG = 0;

        if (slot.macro === "fixed") {
          grams   = slot.fixedG ?? 100;
          targetG = grams;
        } else {
          const daily =
            slot.macro === "protein" ? macros.protein_g :
            slot.macro === "carbs"   ? macros.carbs_g   :
                                       macros.fat_g;
          targetG = Math.round(daily * slot.pct / 100 * 10) / 10;
          grams   = calcGrams(ing, slot.macro, targetG);
        }

        if (grams <= 0 || grams > 3000) return;

        foods.push({
          slotId:        slot.id,
          label:         slot.label,
          ing,
          grams,
          macro:         slot.macro,
          targetG,
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
  plan: GeneratedMeal[],
  mealId: string,
  profileIdx: number,
  slotId: string,
  newIngId: string,
): GeneratedMeal[] {
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
              grams = calcGrams(ing, food.macro, food.targetG);
              if (grams <= 0 || grams > 3000) grams = 100;
            }

            return { ...food, ing, grams };
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

// ── Componente ────────────────────────────────────────────────────────────────

interface Props {
  clientId:    string;
  clientName?: string;
  onBack:      () => void;
}

export default function DietGenerator({ clientId, clientName, onBack }: Props) {
  // ── Macros del cliente ────────────────────────────────────────────
  const [macrosOn,  setMacrosOn]  = useState<DailyMacros | null>(null);
  const [macrosOff, setMacrosOff] = useState<DailyMacros | null>(null);
  const [loadingMacros, setLoadingMacros] = useState(true);
  const [macroError,    setMacroError]    = useState(false);

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

  // ── Cargar macros ─────────────────────────────────────────────────
  useEffect(() => {
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
    setPlanOn( p => selectFood(p, mealId, profileIdx, slotId, newIngId));
    setPlanOff(p => selectFood(p, mealId, profileIdx, slotId, newIngId));
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

      // Asignar al cliente
      await supabase.from("diet_assignments").upsert(
        { client_id: clientId, plan_id: pid, active: true },
        { onConflict: "client_id" },
      );

      showToast("✅ Plan guardado y asignado al cliente");
      setTimeout(() => onBack(), 1500);
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
            {generated ? (planName || "Plan generado") : "Generar Dieta"}
          </p>
          {clientName && <p className="text-neutral-500 text-xs truncate">para {clientName}</p>}
        </div>
        {generated && (
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

        {/* ── Nombre y notas ── */}
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

            {/* Guardar bottom */}
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
          </>
        )}
      </div>
    </div>
  );
}
