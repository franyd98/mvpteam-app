// ─────────────────────────────────────────────────────────────────────────────
// DietGenerator.tsx
// Genera un plan de dieta ON/OFF automáticamente a partir de las macros del
// cliente guardadas en client_macros. El admin puede intercambiar alimentos
// individuales y guardar el resultado en diet_plans + diet_meals + diet_options.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ingredients, type Ingredient, type IngredientCategory } from "../data/ingredients";

// ── Tipos ────────────────────────────────────────────────────────────────────

interface DailyMacros {
  protein_g: number;
  carbs_g:   number;
  fat_g:     number;
  kcal:      number;
}

type MacroKey = "protein" | "carbs" | "fat";

interface SlotDef {
  id:        string;
  label:     string;
  cats:      IngredientCategory[];
  macro:     MacroKey | "fixed";
  pct:       number;   // % del macro diario o gramos fijos si macro="fixed"
  fixedG?:   number;   // gramos fijos cuando macro="fixed"
  noteText?: string;   // nota adicional (ej. "🥦 Verdura variada libre")
}

interface MealDef {
  id:     string;
  name:   string;
  emoji:  string;
  slots:  SlotDef[];
}

interface GeneratedFood {
  slotId:   string;
  label:    string;
  ing:      Ingredient;
  poolIdx:  number;
  grams:    number;
  macro:    MacroKey | "fixed";
  targetG:  number;
  noteText?: string;
}

interface GeneratedMeal {
  mealId: string;
  name:   string;
  emoji:  string;
  foods:  GeneratedFood[];
}

// ── Plantillas de comidas ─────────────────────────────────────────────────────
// Basadas en el plan nutricional real del entrenador (PDF):
// 5 comidas × slots de categorías de ingredientes × % del macro diario

const MEAL_DEFS: MealDef[] = [
  {
    id: "c1", name: "Comida 1 — Desayuno", emoji: "🌅",
    slots: [
      {
        id: "c1_prot", label: "Proteína",
        cats: ["lean_protein"],
        macro: "protein", pct: 20,
      },
      {
        id: "c1_hc", label: "Hidratos",
        cats: ["protein_carb", "clean_carb"],
        macro: "carbs", pct: 25,
      },
      {
        id: "c1_fat", label: "Grasa",
        cats: ["fat"],
        macro: "fat", pct: 10,
      },
      {
        id: "c1_fruit", label: "Fruta",
        cats: ["fruit"],
        macro: "fixed", pct: 0, fixedG: 150,
      },
    ],
  },
  {
    id: "c2", name: "Comida 2 — Almuerzo", emoji: "☕",
    slots: [
      {
        id: "c2_prot", label: "Proteína",
        cats: ["fatty_protein"],
        macro: "protein", pct: 15,
      },
      {
        id: "c2_hc", label: "Hidratos",
        cats: ["protein_carb", "fatty_carb"],
        macro: "carbs", pct: 20,
      },
      {
        id: "c2_fat", label: "Grasa",
        cats: ["fat"],
        macro: "fat", pct: 5,
      },
    ],
  },
  {
    id: "c3", name: "Comida 3 — Comida principal", emoji: "🍽️",
    slots: [
      {
        id: "c3_prot", label: "Proteína",
        cats: ["lean_protein"],
        macro: "protein", pct: 25,
      },
      {
        id: "c3_hc", label: "Hidratos",
        cats: ["clean_carb"],
        macro: "carbs", pct: 30,
      },
      {
        id: "c3_fat", label: "Grasa",
        cats: ["fat"],
        macro: "fat", pct: 35,
        noteText: "🥦 Verdura variada a gusto (libre)",
      },
      {
        id: "c3_fruit", label: "Fruta",
        cats: ["fruit"],
        macro: "fixed", pct: 0, fixedG: 150,
      },
    ],
  },
  {
    id: "c4", name: "Comida 4 — Merienda", emoji: "🫐",
    slots: [
      {
        id: "c4_prot", label: "Proteína",
        cats: ["lean_protein"],
        macro: "protein", pct: 20,
      },
      {
        id: "c4_hc", label: "Hidratos",
        cats: ["clean_carb", "protein_carb"],
        macro: "carbs", pct: 15,
      },
      {
        id: "c4_fruit", label: "Fruta",
        cats: ["fruit"],
        macro: "fixed", pct: 0, fixedG: 100,
      },
    ],
  },
  {
    id: "c5", name: "Comida 5 — Cena", emoji: "🌙",
    slots: [
      {
        id: "c5_prot", label: "Proteína",
        cats: ["lean_protein"],
        macro: "protein", pct: 20,
      },
      {
        id: "c5_hc", label: "Hidratos",
        cats: ["clean_carb"],
        macro: "carbs", pct: 10,
      },
      {
        id: "c5_fat", label: "Grasa",
        cats: ["fat"],
        macro: "fat", pct: 50,
        noteText: "🥦 Verdura variada a gusto (libre)",
      },
      {
        id: "c5_fruit", label: "Fruta",
        cats: ["fruit"],
        macro: "fixed", pct: 0, fixedG: 150,
      },
    ],
  },
];

// Índices de inicio distintos para ON y OFF → distintos alimentos por defecto
const POOL_OFFSETS_ON:  Record<string, number> = {};
const POOL_OFFSETS_OFF: Record<string, number> = {};
MEAL_DEFS.forEach((m, mi) => {
  m.slots.forEach((s, si) => {
    POOL_OFFSETS_ON[`${m.id}_${s.id}`]  = (mi * 3 + si) % 20;
    POOL_OFFSETS_OFF[`${m.id}_${s.id}`] = (mi * 3 + si + 2) % 20;
  });
});

// ── Algoritmo de generación ───────────────────────────────────────────────────

function buildPool(cats: IngredientCategory[]): Ingredient[] {
  return ingredients.filter(i => cats.includes(i.category));
}

function calcGrams(ing: Ingredient, macro: MacroKey, targetG: number): number {
  const per100 = ing[macro];
  if (!per100 || per100 <= 0) return 0;
  return Math.round((targetG / per100) * 100);
}

function generatePlan(
  macros: DailyMacros,
  offsets: Record<string, number>,
): GeneratedMeal[] {
  return MEAL_DEFS.map(meal => {
    const foods: GeneratedFood[] = [];

    meal.slots.forEach(slot => {
      const pool = buildPool(slot.cats);
      if (!pool.length) return;

      const key     = `${meal.id}_${slot.id}`;
      const poolIdx = (offsets[key] ?? 0) % pool.length;
      const ing     = pool[poolIdx];

      let grams   = 0;
      let targetG = 0;

      if (slot.macro === "fixed") {
        grams   = slot.fixedG ?? 100;
        targetG = grams;
      } else {
        const dailyTotal =
          slot.macro === "protein" ? macros.protein_g :
          slot.macro === "carbs"   ? macros.carbs_g   :
                                     macros.fat_g;
        targetG = Math.round(dailyTotal * slot.pct / 100 * 10) / 10;
        grams   = calcGrams(ing, slot.macro, targetG);
      }

      // Descartar cantidades absurdas
      if (grams <= 0 || grams > 3000) return;

      foods.push({
        slotId:   slot.id,
        label:    slot.label,
        ing,
        poolIdx,
        grams,
        macro:    slot.macro,
        targetG,
        noteText: slot.noteText,
      });
    });

    return { mealId: meal.id, name: meal.name, emoji: meal.emoji, foods };
  });
}

// ── Swap de alimento ──────────────────────────────────────────────────────────

function swapFood(
  plan: GeneratedMeal[],
  mealId: string,
  slotId: string,
): GeneratedMeal[] {
  return plan.map(meal => {
    if (meal.mealId !== mealId) return meal;

    return {
      ...meal,
      foods: meal.foods.map(food => {
        if (food.slotId !== slotId) return food;

        const mealDef = MEAL_DEFS.find(m => m.id === mealId)!;
        const slotDef = mealDef.slots.find(s => s.id === slotId)!;
        const pool    = buildPool(slotDef.cats);
        if (pool.length < 2) return food;

        const nextIdx = (food.poolIdx + 1) % pool.length;
        const ing     = pool[nextIdx];

        let grams = food.grams;
        if (food.macro !== "fixed") {
          grams = calcGrams(ing, food.macro, food.targetG);
          if (grams <= 0 || grams > 3000) grams = 100;
        }

        return { ...food, ing, poolIdx: nextIdx, grams };
      }),
    };
  });
}

// ── Helpers de macros calculados ──────────────────────────────────────────────

function round1(n: number) { return Math.round(n * 10) / 10; }

function foodMacros(food: GeneratedFood) {
  const f = food.grams / 100;
  return {
    kcal:    round1(food.ing.kcal    * f),
    protein: round1(food.ing.protein * f),
    carbs:   round1(food.ing.carbs   * f),
    fat:     round1(food.ing.fat     * f),
  };
}

function mealMacros(meal: GeneratedMeal) {
  return meal.foods.reduce(
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

function planMacros(plan: GeneratedMeal[]) {
  return plan.reduce(
    (acc, meal) => {
      const m = mealMacros(meal);
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
  // ── Macros ────────────────────────────────────────────────────────
  const [macrosOn,  setMacrosOn]  = useState<DailyMacros | null>(null);
  const [macrosOff, setMacrosOff] = useState<DailyMacros | null>(null);
  const [loadingMacros, setLoadingMacros] = useState(true);
  const [macroError,    setMacroError]    = useState(false);

  // ── Planes generados ──────────────────────────────────────────────
  const [planOn,  setPlanOn]  = useState<GeneratedMeal[]>([]);
  const [planOff, setPlanOff] = useState<GeneratedMeal[]>([]);

  // ── Estado UI ─────────────────────────────────────────────────────
  const [activeTab,  setActiveTab]  = useState<"on" | "off">("on");
  const [planName,   setPlanName]   = useState("");
  const [planNotes,  setPlanNotes]  = useState("");
  const [offPct,     setOffPct]     = useState(13);   // % reducción OFF
  const [generated,  setGenerated]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set(MEAL_DEFS.map(m => m.id)));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ── Cargar macros del cliente ─────────────────────────────────────
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
        // OFF: misma proteína y grasa; hidratos reducidos
        const offFactor = 1 - offPct / 100;
        const offCarbs  = round1(data.carbs_g * offFactor);
        const offKcal   = Math.round(data.protein_g * 4 + offCarbs * 4 + data.fat_g * 9);
        const off: DailyMacros = {
          protein_g: data.protein_g,
          carbs_g:   offCarbs,
          fat_g:     data.fat_g,
          kcal:      offKcal,
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

  // Recalcular macros OFF cuando cambia offPct
  useEffect(() => {
    if (!macrosOn) return;
    const offFactor = 1 - offPct / 100;
    const offCarbs  = round1(macrosOn.carbs_g * offFactor);
    const offKcal   = Math.round(macrosOn.protein_g * 4 + offCarbs * 4 + macrosOn.fat_g * 9);
    setMacrosOff({
      protein_g: macrosOn.protein_g,
      carbs_g:   offCarbs,
      fat_g:     macrosOn.fat_g,
      kcal:      offKcal,
    });
  }, [offPct, macrosOn]);

  // ── Generar plan ──────────────────────────────────────────────────
  const handleGenerate = () => {
    if (!macrosOn || !macrosOff) return;
    setPlanOn(generatePlan(macrosOn, POOL_OFFSETS_ON));
    setPlanOff(generatePlan(macrosOff, POOL_OFFSETS_OFF));
    setGenerated(true);
    setActiveTab("on");
  };

  // ── Swap ──────────────────────────────────────────────────────────
  const doSwap = (mealId: string, slotId: string) => {
    setPlanOn( p => swapFood(p, mealId, slotId));
    setPlanOff(p => swapFood(p, mealId, slotId));
  };

  // ── Guardar en Supabase ───────────────────────────────────────────
  const handleSave = async () => {
    if (!macrosOn || !macrosOff || !planOn.length) return;
    if (!planName.trim()) { showToast("⚠️ El plan necesita un nombre"); return; }

    setSaving(true);
    try {
      // 1. Crear diet_plan
      const { data: planRow, error: planErr } = await supabase
        .from("diet_plans")
        .insert({
          name:       planName.trim(),
          kcal_on:    macrosOn.kcal,
          kcal_off:   macrosOff.kcal,
          protein_on: macrosOn.protein_g,
          protein_off:macrosOff.protein_g,
          carbs_on:   macrosOn.carbs_g,
          carbs_off:  macrosOff.carbs_g,
          fat_on:     macrosOn.fat_g,
          fat_off:    macrosOff.fat_g,
          notes:      planNotes,
        })
        .select("id")
        .single();

      if (planErr || !planRow) throw planErr ?? new Error("No plan id");

      const pid = planRow.id;

      // 2. Crear diet_meals + diet_options para el plan ON
      //    Cada comida = 1 opción con los alimentos generados
      for (let i = 0; i < planOn.length; i++) {
        const meal = planOn[i];

        const { data: mealRow, error: mealErr } = await supabase
          .from("diet_meals")
          .insert({
            plan_id:    pid,
            name:       meal.name,
            emoji:      meal.emoji,
            day_type:   "both",
            sort_order: i,
          })
          .select("id")
          .single();

        if (mealErr || !mealRow) throw mealErr ?? new Error("No meal id");

        // Grupos por slot (proteína, hidratos, grasa, fruta…)
        const content = meal.foods.map(food => ({
          label:    food.label,
          slot:     food.macro === "protein" ? "proteina"
                  : food.macro === "carbs"   ? "hidrato"
                  : food.macro === "fat"     ? "grasa"
                  :                            "extra",
          isChoice: false,
          note:     food.noteText ?? "",
          items:    [{ ingId: food.ing.id, grams: food.grams }],
        }));

        await supabase.from("diet_options").insert({
          meal_id:    mealRow.id,
          name:       "Plan generado",
          content,
          sort_order: 0,
        });
      }

      // 3. Asignar automáticamente al cliente
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

  // ── Render helpers ────────────────────────────────────────────────
  const activePlan = activeTab === "on" ? planOn : planOff;
  const activeMacros = activeTab === "on" ? macrosOn : macrosOff;
  const totalGen = activePlan.length ? planMacros(activePlan) : null;

  const toggleMeal = (id: string) =>
    setExpandedMeals(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── Loading ───────────────────────────────────────────────────────
  if (loadingMacros) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
        <p className="text-neutral-500 text-sm">Cargando macros del cliente…</p>
      </div>
    );
  }

  // ── Sin macros → aviso ────────────────────────────────────────────
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
            Este cliente aún no tiene macros calculadas.<br />
            Ve a la pestaña <strong className="text-white">Calculadora</strong> del cliente,
            introduce sus datos y guarda los requerimientos.
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-28" style={{ background: "linear-gradient(160deg,#0A0A0A 80%,#1A0810 100%)" }}>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg whitespace-nowrap"
          style={{ background: "#1A1A1A", border: "1px solid #333" }}>
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <header className="px-4 py-3 flex items-center gap-3 sticky top-0 z-10"
        style={{ background: "#0F0F0F", borderBottom: "1px solid #8B1A2F40" }}>
        <button onClick={onBack}
          className="w-9 h-9 rounded-lg text-neutral-300 flex items-center justify-center shrink-0"
          style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>←</button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">
            {generated ? (planName || "Plan generado") : "Generar Dieta"}
          </p>
          {clientName && (
            <p className="text-neutral-500 text-xs truncate">para {clientName}</p>
          )}
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

        {/* ── MACROS DEL CLIENTE ── */}
        <div className="rounded-xl overflow-hidden" style={{ background: "#111", border: "1px solid #222" }}>
          <div className="px-4 py-3">
            <p className="text-white font-semibold text-sm mb-3">📊 Macros del cliente</p>

            {/* ON / OFF summary */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {([
                { label: "💪 Día ON", macros: macrosOn,  color: "text-emerald-400" },
                { label: "😴 Día OFF", macros: macrosOff, color: "text-blue-400" },
              ] as const).map(({ label, macros, color }) => (
                <div key={label} className="rounded-lg p-3 text-center"
                  style={{ background: "#0A0A0A", border: "1px solid #1E1E1E" }}>
                  <p className={`text-xs font-semibold mb-1 ${color}`}>{label}</p>
                  <p className="text-white text-lg font-bold">{macros!.kcal} <span className="text-neutral-500 text-xs">kcal</span></p>
                  <div className="flex justify-center gap-2 mt-1 text-[10px]">
                    <span className="text-red-400">{macros!.protein_g}g P</span>
                    <span className="text-amber-400">{macros!.carbs_g}g HC</span>
                    <span className="text-blue-400">{macros!.fat_g}g G</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Reducción OFF */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1.5">
                Reducción Hidratos OFF
              </label>
              <div className="flex gap-2">
                {[10, 13, 15, 20].map(pct => (
                  <button key={pct} onClick={() => setOffPct(pct)}
                    className={"flex-1 py-2 rounded-lg text-xs font-medium transition-colors " +
                      (offPct === pct
                        ? "bg-white text-black"
                        : "text-neutral-400")}
                    style={offPct !== pct ? { background: "#1A1A1A", border: "1px solid #2A2A2A" } : {}}>
                    −{pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── CONFIGURACIÓN NOMBRE / NOTAS (siempre visible) ── */}
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
              <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1">Notas para el cliente</label>
              <textarea value={planNotes} onChange={e => setPlanNotes(e.target.value)}
                rows={2} placeholder="Indicaciones generales, ajustes…"
                className="w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none resize-none"
                style={{ background: "#1A1A1A", border: "1px solid #333" }} />
            </div>
          </div>
        </div>

        {/* ── BOTÓN GENERAR ── */}
        {!generated ? (
          <button onClick={handleGenerate}
            className="w-full py-4 rounded-xl text-white font-bold text-sm active:opacity-80 transition-opacity"
            style={{ background: "linear-gradient(135deg, #8B1A2F, #C0392B)" }}>
            ✨ Generar plan automáticamente
          </button>
        ) : (
          <button onClick={handleGenerate}
            className="w-full py-3 rounded-xl text-sm font-medium text-neutral-400 active:opacity-80"
            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
            🔄 Regenerar plan desde cero
          </button>
        )}

        {/* ── PLAN GENERADO ── */}
        {generated && (
          <>
            {/* Tabs ON / OFF */}
            <div className="flex gap-1 p-1 rounded-xl"
              style={{ background: "#111", border: "1px solid #222" }}>
              {(["on", "off"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={"flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors " +
                    (activeTab === tab ? "bg-white text-black" : "text-neutral-400")}>
                  {tab === "on" ? "💪 Día ON" : "😴 Día OFF"}
                  <span className="block text-xs font-normal mt-0.5 text-neutral-500">
                    {tab === "on" ? macrosOn.kcal : macrosOff?.kcal} kcal
                  </span>
                </button>
              ))}
            </div>

            {/* Resumen total generado */}
            {totalGen && activeMacros && (
              <div className="rounded-xl px-4 py-3"
                style={{ background: "#111", border: "1px solid #222" }}>
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">
                  Total generado vs. objetivo
                </p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Kcal",    gen: totalGen.kcal,    target: activeMacros.kcal,      color: "text-white" },
                    { label: "Prot",    gen: totalGen.protein, target: activeMacros.protein_g, color: "text-red-400" },
                    { label: "HC",      gen: totalGen.carbs,   target: activeMacros.carbs_g,   color: "text-amber-400" },
                    { label: "Grasa",   gen: totalGen.fat,     target: activeMacros.fat_g,     color: "text-blue-400" },
                  ].map(({ label, gen, target, color }) => (
                    <div key={label} className="rounded-lg py-2"
                      style={{ background: "#0A0A0A", border: "1px solid #1E1E1E" }}>
                      <p className={`text-sm font-bold ${color}`}>{gen}</p>
                      <p className="text-[9px] text-neutral-600">/ {target}</p>
                      <p className="text-[9px] text-neutral-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-600 mt-2 text-center">
                  La fruta y verdura libre no cuentan en el objetivo. Ajusta cambiando alimentos.
                </p>
              </div>
            )}

            {/* Comidas */}
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 px-1">
              Comidas — toca 🔄 para cambiar un alimento
            </p>

            {activePlan.map(meal => {
              const mt      = mealMacros(meal);
              const isOpen  = expandedMeals.has(meal.mealId);

              return (
                <div key={meal.mealId} className="rounded-xl overflow-hidden"
                  style={{ background: "#111", border: "1px solid #222" }}>

                  {/* Cabecera comida */}
                  <button onClick={() => toggleMeal(meal.mealId)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left">
                    <span className="text-xl shrink-0">{meal.emoji}</span>
                    <span className="flex-1 text-white font-semibold text-sm">{meal.name}</span>
                    <span className="text-neutral-500 text-xs tabular-nums">{mt.kcal} kcal</span>
                    <span className="text-neutral-500 text-sm">{isOpen ? "▲" : "▼"}</span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: "#1A1A1A" }}>

                      {/* Macro totales de la comida */}
                      <div className="flex gap-3 pt-2 text-[10px]">
                        <span className="text-red-400">{mt.protein}g P</span>
                        <span className="text-amber-400">{mt.carbs}g HC</span>
                        <span className="text-blue-400">{mt.fat}g G</span>
                      </div>

                      {meal.foods.map(food => {
                        const fm     = foodMacros(food);
                        const isFixed = food.macro === "fixed";
                        const pool   = buildPool(
                          MEAL_DEFS.find(m => m.id === meal.mealId)!
                            .slots.find(s => s.id === food.slotId)!.cats
                        );

                        return (
                          <div key={food.slotId} className="rounded-lg p-3"
                            style={{ background: "#0A0A0A", border: "1px solid #1E1E1E" }}>

                            <div className="flex items-center gap-2">
                              {/* Etiqueta slot */}
                              <span className="text-[10px] font-bold uppercase tracking-wider shrink-0 w-14"
                                style={{
                                  color: food.macro === "protein" ? "#F87171"
                                       : food.macro === "carbs"   ? "#FBBF24"
                                       : food.macro === "fat"     ? "#60A5FA"
                                       :                            "#A78BFA",
                                }}>
                                {food.label}
                              </span>

                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{food.ing.name}</p>
                                <p className="text-neutral-500 text-xs">{food.grams} g</p>
                              </div>

                              {/* Botón swap */}
                              {pool.length > 1 && (
                                <button
                                  onClick={() => doSwap(meal.mealId, food.slotId)}
                                  title="Cambiar alimento"
                                  className="w-8 h-8 rounded-lg text-neutral-400 text-base flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                                  style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
                                  🔄
                                </button>
                              )}
                            </div>

                            {/* Macros del alimento */}
                            {!isFixed && (
                              <div className="flex gap-3 mt-2 pl-[4.25rem] text-[10px]">
                                <span className="text-neutral-500">{fm.kcal} kcal</span>
                                <span className="text-red-400">{fm.protein}g P</span>
                                <span className="text-amber-400">{fm.carbs}g HC</span>
                                <span className="text-blue-400">{fm.fat}g G</span>
                              </div>
                            )}

                            {/* Nota de slot (verdura libre…) */}
                            {food.noteText && (
                              <p className="text-neutral-600 text-[10px] mt-1 pl-[4.25rem]">
                                {food.noteText}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Guardar (bottom) */}
            <div className="pt-2">
              <button onClick={handleSave} disabled={saving}
                className="w-full py-4 rounded-xl text-white font-bold text-sm disabled:opacity-40"
                style={{ background: "#8B1A2F" }}>
                {saving ? "Guardando…" : "💾 Guardar y asignar al cliente"}
              </button>
              <p className="text-[10px] text-neutral-600 text-center mt-2">
                El plan se guardará y se asignará automáticamente a {clientName ?? "este cliente"}.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
