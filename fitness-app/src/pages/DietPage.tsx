// Vista del cliente: plan nutricional con 3 sub-pestañas
//  1. Mi Plan  — dieta asignada por el entrenador
//  2. Mis Macros — objetivos calóricos del cliente (read-only)
//  3. Generar  — DietGenerator en modo cliente (sin guardar)

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  INGREDIENTS, CATEGORY_LABELS, calcMacros, sumMacros,
  bySlot, type MainSlot, type MacroResult, type Ingredient, type IngredientCategory,
} from "../data/ingredients";
import DietGenerator from "../components/DietGenerator";
import MacroCalculator from "../components/MacroCalculator";
import FoodSearchModal from "../components/FoodSearchModal";

// Ingredientes personalizados cargados de Supabase (se fusionan con INGREDIENTS en runtime)
let _customLoaded = false;
const injectCustomIngredients = (rows: Ingredient[]) => {
  rows.forEach(r => {
    if (!INGREDIENTS.find(i => i.id === r.id)) INGREDIENTS.push(r);
  });
};

const ingName = (id: string) =>
  INGREDIENTS.find(i => i.id === id)?.name ??
  id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

type Profile = { id: string; full_name: string; role: string };
type DayType = "on" | "off";
type DietTab = "plan" | "macros" | "generate";

type ClientMacros = {
  protein_g: number; carbs_g: number; fat_g: number; tdee: number;
  carbs_off_g?: number | null; fat_off_g?: number | null; kcal_off?: number | null;
};

// ── Tipos del plan ────────────────────────────────────────────────
type FoodGroup = { label: string; isChoice: boolean; items: string[]; note?: string };
type AdminOption = { id: string; name: string; content: FoodGroup[] };
type DietMeal = { id: string; name: string; emoji: string; day_type: "on"|"off"|"both"; sort_order: number; options: AdminOption[] };
type DietPlan = { name: string; kcal_on: number|null; kcal_off: number|null; protein_on: number|null; carbs_on: number|null; fat_on: number|null; protein_off: number|null; carbs_off: number|null; fat_off: number|null; notes: string|null };

// ── Estado de selección por comida ────────────────────────────────
type SlotEntry = { ingId: string; grams: number };
type ExtraEntry = { _id: string; ingId: string; grams: number };
type MealState = {
  proteina: SlotEntry | null;
  hidrato:  SlotEntry | null;
  grasa:    SlotEntry | null;
  extras:   ExtraEntry[];
  note:     string;
  showNote: boolean;
  optionTab: number;   // índice de la opción del entrenador activa (0, 1, 2)
};

const uid = () => Math.random().toString(36).slice(2, 9);
const emptyMealState = (): MealState => ({
  proteina: null, hidrato: null, grasa: null,
  extras: [], note: "", showNote: false, optionTab: 0,
});

// ── Componente selector de ingrediente ────────────────────────────
function IngSelect({ slot, value, onChange }: {
  slot: MainSlot; value: string; onChange: (v: string) => void;
}) {
  const ings = slot === "extra" ? INGREDIENTS : bySlot(slot);
  const groups = [...new Set(ings.map(i => i.category))];

  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-neutral-500 min-w-0">
      <option value="">— Elige —</option>
      {groups.map(cat => {
        const items = ings.filter(i => i.category === cat);
        return (
          <optgroup key={cat} label={CATEGORY_LABELS[cat]}>
            {items.map(i => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}

// ── Botón de lista de la compra con feedback visual ───────────────
function ShopBtn({ onClick }: { onClick: () => void }) {
  const [added, setAdded] = useState(false);
  return (
    <button
      onClick={() => { onClick(); setAdded(true); setTimeout(() => setAdded(false), 1500); }}
      className={`w-7 h-7 rounded text-sm shrink-0 flex items-center justify-center transition-all duration-200 ${added ? "bg-green-800 text-green-300 scale-110" : "bg-neutral-800 text-neutral-500 hover:text-white"}`}
      title="Añadir a la lista de la compra">
      {added ? "✓" : "🛒"}
    </button>
  );
}

// ── Fila de ingrediente (slot principal) ─────────────────────────
function SlotRow({ label, color, slot, entry, onChange, onClear, onAddToShop, macroTarget, numMeals, siblProt, siblHyd }: {
  label: string; color: string; slot: MainSlot;
  entry: SlotEntry | null;
  onChange: (e: SlotEntry) => void;
  onClear: () => void;
  onAddToShop?: (ingId: string, grams: number) => void;
  macroTarget?: number | null;
  numMeals?: number;
  /** fat already contributed by the proteína slot this meal (for grasa slot) */
  siblProt?: SlotEntry | null;
  /** fat already contributed by the hidrato slot this meal (for grasa slot) */
  siblHyd?: SlotEntry | null;
}) {
  const macros = entry ? calcMacros(entry.ingId, entry.grams) : null;

  const autoGrams = (ingId: string): number => {
    if (!macroTarget || !numMeals || numMeals === 0) return entry?.grams ?? 100;
    const ing = INGREDIENTS.find(i => i.id === ingId);
    if (!ing) return entry?.grams ?? 100;
    let perMeal = macroTarget / numMeals;

    // For the fat slot, subtract fat that already comes from protein and carb foods
    if (slot === "grasa") {
      const fatFromProt = siblProt?.ingId ? calcMacros(siblProt.ingId, siblProt.grams).fat : 0;
      const fatFromHyd  = siblHyd?.ingId  ? calcMacros(siblHyd.ingId,  siblHyd.grams).fat  : 0;
      perMeal = Math.max(0, perMeal - fatFromProt - fatFromHyd);
      if (perMeal <= 0) return 10;
    }

    const per100 = slot === "proteina" ? ing.protein : slot === "hidrato" ? ing.carbs : ing.fat;
    if (per100 <= 0) return entry?.grams ?? 100;
    return Math.max(10, Math.min(Math.round((perMeal / per100) * 100), 600));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider w-16 shrink-0 ${color}`}>{label}</span>
        <IngSelect slot={slot} value={entry?.ingId ?? ""}
          onChange={v => onChange({ ingId: v, grams: v ? autoGrams(v) : (entry?.grams ?? 100) })} />
        <input type="number" min="1" max="2000"
          value={entry?.grams ?? ""}
          onChange={e => entry && onChange({ ...entry, grams: parseFloat(e.target.value) || 0 })}
          placeholder="g"
          className="w-16 shrink-0 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-neutral-500" />
        {entry?.ingId && (
          <>
            {onAddToShop && (
              <ShopBtn onClick={() => onAddToShop(entry.ingId, entry.grams)} />
            )}
            <button onClick={onClear}
              className="w-7 h-7 rounded bg-neutral-800 text-neutral-500 hover:text-red-400 text-sm shrink-0 flex items-center justify-center">✕</button>
          </>
        )}
      </div>
      {macros && entry?.ingId && (
        <div className="flex gap-2 pl-[4.5rem] text-[10px]">
          <span className="text-neutral-500">{macros.kcal} kcal</span>
          <span className="text-red-400">{macros.protein}g P</span>
          <span className="text-amber-400">{macros.carbs}g H</span>
          <span className="text-blue-400">{macros.fat}g G</span>
        </div>
      )}
    </div>
  );
}

// ── Fila de extra ─────────────────────────────────────────────────
function ExtraRow({ entry, onChange, onRemove, onAddToShop }: {
  entry: ExtraEntry;
  onChange: (e: ExtraEntry) => void;
  onRemove: () => void;
  onAddToShop?: (ingId: string, grams: number) => void;
}) {
  const macros = entry.ingId ? calcMacros(entry.ingId, entry.grams) : null;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider w-16 shrink-0 text-neutral-500">Extra</span>
        <IngSelect slot="extra" value={entry.ingId}
          onChange={v => onChange({ ...entry, ingId: v })} />
        <input type="number" min="1" max="2000"
          value={entry.grams || ""}
          onChange={e => onChange({ ...entry, grams: parseFloat(e.target.value) || 0 })}
          placeholder="g"
          className="w-16 shrink-0 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-neutral-500" />
        {entry.ingId && onAddToShop && (
          <ShopBtn onClick={() => onAddToShop(entry.ingId, entry.grams)} />
        )}
        <button onClick={onRemove}
          className="w-7 h-7 rounded bg-neutral-800 text-neutral-500 hover:text-red-400 text-sm shrink-0 flex items-center justify-center">✕</button>
      </div>
      {macros && entry.ingId && (
        <div className="flex gap-2 pl-[4.5rem] text-[10px]">
          <span className="text-neutral-500">{macros.kcal} kcal</span>
          <span className="text-red-400">{macros.protein}g P</span>
          <span className="text-amber-400">{macros.carbs}g H</span>
          <span className="text-blue-400">{macros.fat}g G</span>
        </div>
      )}
    </div>
  );
}

// ── Barra de progreso de macros ───────────────────────────────────
function MacroBar({ label, value, target, color }: {
  label: string; value: number; target: number | null; color: string;
}) {
  const pct = target ? Math.min((value / target) * 100, 100) : 0;
  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className={`font-bold ${color}`}>{label}</span>
        <span className="text-neutral-400">{value.toFixed(0)}{target ? `/${target}` : ""}g</span>
      </div>
      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color.replace("text-", "bg-")}`}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────
const todayDate = () => new Date().toISOString().slice(0, 10);

export default function DietPage({ profile, onBack }: { profile: Profile; onBack: () => void }) {
  const [dietTab, setDietTab]   = useState<DietTab>("plan");

  // ── Plan del entrenador ──────────────────────────────────────────
  const [plan, setPlan]         = useState<DietPlan | null>(null);
  const [meals, setMeals]       = useState<DietMeal[]>([]);
  const [loading, setLoading]   = useState(true);
  const [dayType, setDayType]   = useState<DayType>("on");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [mealStates, setMealStates] = useState<Record<string, MealState>>({});

  // ── Plan propio del cliente ──────────────────────────────────────
  const [myPlan, setMyPlan]   = useState<DietPlan | null>(null);
  const [myMeals, setMyMeals] = useState<DietMeal[]>([]);
  const [planSource, setPlanSource] = useState<"trainer" | "client">("trainer");

  const [clientMacros, setClientMacros] = useState<ClientMacros | null>(null);
  const [savingDay, setSavingDay]       = useState(false);
  const [savedDay, setSavedDay]         = useState(false);
  const [showShopList, setShowShopList] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showFoodSearch, setShowFoodSearch] = useState(false);

  // ── Lista de la compra (curada por el usuario) ─────────────────────
  const [shopItems, setShopItems] = useState<Record<string, { name: string; grams: number; category: string }>>({});
  // ── Estado de guardado por comida ─────────────────────────────────
  const [savingMeals, setSavingMeals] = useState<Set<string>>(new Set());
  const [savedMeals,  setSavedMeals]  = useState<Set<string>>(new Set());
  // ── Tick para forzar re-render cuando se inyectan custom_ingredients ──
  const [, setIngTick] = useState(0);

  useEffect(() => {
    loadDiet();
    loadMacros();
    loadCustomIngredients();
  }, []);

  // Reset scroll del contenedor al cambiar de sub-tab
  useLayoutEffect(() => {
    const el = document.getElementById("tab-scroll");
    if (el) el.scrollTop = 0;
  }, [dietTab]);

  const loadCustomIngredients = async () => {
    if (_customLoaded) return;
    const { data } = await supabase.from("custom_ingredients").select("*");
    if (data && data.length > 0) {
      injectCustomIngredients(data.map((r: { id: string; name: string; category: string; kcal: number; protein: number; carbs: number; fat: number }) => ({
        id: r.id, name: r.name,
        category: r.category as IngredientCategory,
        kcal: Number(r.kcal), protein: Number(r.protein),
        carbs: Number(r.carbs), fat: Number(r.fat),
      })));
      _customLoaded = true;
      setIngTick(t => t + 1); // fuerza re-render para que IngSelect vea los nuevos ingredientes
    }
  };

  const loadMacros = async () => {
    const { data } = await supabase
      .from("client_macros")
      .select("*")
      .eq("client_id", profile.id)
      .maybeSingle();
    if (data) setClientMacros(data);
  };

  const loadDiet = async () => {
    setLoading(true);

    // 1. Cargar TODAS las asignaciones activas (trainer + client)
    const { data: assignments } = await supabase
      .from("diet_assignments")
      .select("plan_id, source")
      .eq("client_id", profile.id)
      .eq("active", true);

    const trainerAssignment = assignments?.find(a => (a.source ?? "trainer") === "trainer");
    const clientAssignment  = assignments?.find(a => a.source === "client");

    // 2. Cargar plan del entrenador
    let trainerMeals: DietMeal[] = [];
    if (trainerAssignment) {
      const { data: planData } = await supabase
        .from("diet_plans").select("*").eq("id", trainerAssignment.plan_id).single();
      if (planData) {
        setPlan(planData);
        const { data: mealsData } = await supabase
          .from("diet_meals").select("*, diet_options(*)")
          .eq("plan_id", planData.id).order("sort_order");
        if (mealsData) {
          trainerMeals = mealsData.map((m: any) => ({
            ...m, options: (m.diet_options ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order),
          }));
          setMeals(trainerMeals);
          if (trainerMeals.length > 0) setExpanded(new Set([trainerMeals[0].id]));
          const initStates: Record<string, MealState> = {};
          trainerMeals.forEach(m => { initStates[m.id] = emptyMealState(); });
          setMealStates(initStates);
        }
      }
    }

    // 3. Cargar plan propio del cliente (si existe)
    if (clientAssignment) {
      const { data: myPlanData } = await supabase
        .from("diet_plans").select("*").eq("id", clientAssignment.plan_id).single();
      if (myPlanData) {
        setMyPlan(myPlanData);
        const { data: myMealsData } = await supabase
          .from("diet_meals").select("*, diet_options(*)")
          .eq("plan_id", myPlanData.id).order("sort_order");
        if (myMealsData) {
          setMyMeals(myMealsData.map((m: any) => ({
            ...m, options: (m.diet_options ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order),
          })));
        }
      }
    }

    setLoading(false);

    // Cargar los registros de hoy si existen
    const { data: todayLogs } = await supabase
      .from("daily_food_logs")
      .select("*")
      .eq("client_id", profile.id)
      .eq("date", todayDate());

    if (todayLogs && todayLogs.length > 0 && trainerMeals.length > 0) {
      const restoredStates: Record<string, MealState> = {};
      trainerMeals.forEach(m => { restoredStates[m.id] = emptyMealState(); });
      todayLogs.forEach((row: any) => {
        restoredStates[row.meal_id] = {
          proteina:  row.proteina_id ? { ingId: row.proteina_id, grams: row.proteina_g ?? 100 } : null,
          hidrato:   row.hidrato_id  ? { ingId: row.hidrato_id,  grams: row.hidrato_g  ?? 100 } : null,
          grasa:     row.grasa_id    ? { ingId: row.grasa_id,    grams: row.grasa_g    ?? 10  } : null,
          extras:    row.extras ?? [],
          note:      row.note ?? "",
          showNote:  !!(row.note),
          optionTab: 0,
        };
      });
      setMealStates(restoredStates);
      setSavedDay(true);
    }
  };

  // ── Guardar comidas del día ────────────────────────────────────────
  const saveDayLogs = async () => {
    setSavingDay(true);
    const date = todayDate();
    for (const [mealId, ms] of Object.entries(mealStates)) {
      const meal = meals.find(m => m.id === mealId);
      const hasContent = ms.proteina?.ingId || ms.hidrato?.ingId || ms.grasa?.ingId || ms.extras.some(e => e.ingId);
      if (!hasContent) continue;
      await supabase.from("daily_food_logs").upsert({
        client_id:   profile.id,
        date,
        meal_id:     mealId,
        meal_name:   meal?.name ?? mealId,
        proteina_id: ms.proteina?.ingId ?? null,
        proteina_g:  ms.proteina?.grams ?? null,
        hidrato_id:  ms.hidrato?.ingId  ?? null,
        hidrato_g:   ms.hidrato?.grams  ?? null,
        grasa_id:    ms.grasa?.ingId    ?? null,
        grasa_g:     ms.grasa?.grams    ?? null,
        extras:      ms.extras.filter(e => e.ingId),
        note:        ms.note || null,
      }, { onConflict: "client_id,date,meal_id" });
    }
    setSavingDay(false);
    setSavedDay(true);
    setTimeout(() => setSavedDay(false), 3000);
  };

  const updMealState = (mealId: string, patch: Partial<MealState>) =>
    setMealStates(s => ({ ...s, [mealId]: { ...s[mealId], ...patch } }));

  const toggleExpand = (id: string) =>
    setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const filteredMeals = meals.filter(m => m.day_type === "both" || m.day_type === dayType);

  // Macros del día según plan
  const target = {
    kcal:    dayType === "on" ? plan?.kcal_on    : plan?.kcal_off,
    protein: dayType === "on" ? plan?.protein_on : plan?.protein_off,
    carbs:   dayType === "on" ? plan?.carbs_on   : plan?.carbs_off,
    fat:     dayType === "on" ? plan?.fat_on     : plan?.fat_off,
  };

  // Total del día según lo seleccionado
  const dailyTotal: MacroResult = (() => {
    const allItems: MacroResult[] = [];
    Object.values(mealStates).forEach(ms => {
      if (ms.proteina?.ingId) allItems.push(calcMacros(ms.proteina.ingId, ms.proteina.grams));
      if (ms.hidrato?.ingId)  allItems.push(calcMacros(ms.hidrato.ingId,  ms.hidrato.grams));
      if (ms.grasa?.ingId)    allItems.push(calcMacros(ms.grasa.ingId,    ms.grasa.grams));
      ms.extras.forEach(e => { if (e.ingId) allItems.push(calcMacros(e.ingId, e.grams)); });
    });
    return sumMacros(allItems);
  })();

  // ── Lista de la compra: lee del plan del entrenador (diet_options.content) ──
  const buildShopList = () => {
    const totals: Record<string, { name: string; grams: number; category: string }> = {};

    const addIng = (ingId: string, grams: number) => {
      const ing = INGREDIENTS.find(i => i.id === ingId);
      if (!ing) return;
      if (totals[ingId]) totals[ingId].grams += grams;
      else totals[ingId] = { name: ing.name, grams, category: CATEGORY_LABELS[ing.category] };
    };

    // 1. Plan del entrenador — opción activa de cada comida
    meals.forEach(meal => {
      const ms = mealStates[meal.id];
      const optIdx = ms?.optionTab ?? 0;
      const opt = meal.options[optIdx] ?? meal.options[0];
      if (!opt?.content) return;
      (opt.content as any[]).forEach(fg => {
        (fg.items ?? []).forEach((item: any) => {
          if (typeof item === "object" && item.ingId) addIng(item.ingId, item.grams ?? 100);
          else if (typeof item === "string" && item)  addIng(item, 100);
        });
      });
    });

    // 2. Selecciones manuales del usuario en los slots (si ha elegido algo)
    Object.values(mealStates).forEach(ms => {
      [ms.proteina, ms.hidrato, ms.grasa, ...ms.extras].forEach(s => {
        if (s?.ingId) addIng(s.ingId, s.grams);
      });
    });

    return Object.entries(totals).sort((a, b) => a[1].category.localeCompare(b[1].category));
  };

  // ── Añadir ingrediente a la lista de la compra ────────────────────
  const addToShop = (ingId: string, grams: number) => {
    const ing = INGREDIENTS.find(i => i.id === ingId);
    if (!ing) return;
    setShopItems(prev => ({
      ...prev,
      [ingId]: prev[ingId]
        ? { ...prev[ingId], grams: prev[ingId].grams + grams }
        : { name: ing.name, grams, category: CATEGORY_LABELS[ing.category] },
    }));
  };

  // ── Guardar una comida individual ─────────────────────────────────
  const saveMealLog = async (mealId: string) => {
    const ms = mealStates[mealId];
    if (!ms) return;
    setSavingMeals(prev => new Set(prev).add(mealId));
    const meal = meals.find(m => m.id === mealId);
    const hasContent = ms.proteina?.ingId || ms.hidrato?.ingId || ms.grasa?.ingId || ms.extras.some(e => e.ingId);
    if (hasContent) {
      await supabase.from("daily_food_logs").upsert({
        client_id:   profile.id,
        date:        todayDate(),
        meal_id:     mealId,
        meal_name:   meal?.name ?? mealId,
        proteina_id: ms.proteina?.ingId ?? null,
        proteina_g:  ms.proteina?.grams ?? null,
        hidrato_id:  ms.hidrato?.ingId  ?? null,
        hidrato_g:   ms.hidrato?.grams  ?? null,
        grasa_id:    ms.grasa?.ingId    ?? null,
        grasa_g:     ms.grasa?.grams    ?? null,
        extras:      ms.extras.filter(e => e.ingId),
        note:        ms.note || null,
      }, { onConflict: "client_id,date,meal_id" });
    }
    setSavingMeals(prev => { const s = new Set(prev); s.delete(mealId); return s; });
    setSavedMeals(prev => new Set(prev).add(mealId));
    setTimeout(() => setSavedMeals(prev => { const s = new Set(prev); s.delete(mealId); return s; }), 3000);
  };

  // Total de una comida
  const mealTotal = (ms: MealState): MacroResult => {
    const items: MacroResult[] = [];
    if (ms.proteina?.ingId) items.push(calcMacros(ms.proteina.ingId, ms.proteina.grams));
    if (ms.hidrato?.ingId)  items.push(calcMacros(ms.hidrato.ingId,  ms.hidrato.grams));
    if (ms.grasa?.ingId)    items.push(calcMacros(ms.grasa.ingId,    ms.grasa.grams));
    ms.extras.forEach(e => { if (e.ingId) items.push(calcMacros(e.ingId, e.grams)); });
    return sumMacros(items);
  };

  // ── Sub-tab: Generar ─────────────────────────────────────────────
  if (dietTab === "generate") {
    return (
      <DietGenerator
        clientId={profile.id}
        clientName={profile.full_name}
        clientMode
        onBack={() => setDietTab("plan")}
      />
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#0A0A0A" }}>

      {/* ── Header (fuera del scroll) ── */}
      <header className="header-safe shrink-0 px-4 pb-0"
        style={{ background: "#0F0F0F", borderBottom: "1px solid #1E1E1E" }}>
        <div className="flex items-center gap-3 pb-3">
          <button onClick={onBack}
            className="w-10 h-10 rounded-xl text-neutral-300 active:opacity-70 flex items-center justify-center text-lg shrink-0"
            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>←</button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-base">🥗 Dieta</h1>
            <p className="text-neutral-500 text-xs">{profile.full_name}</p>
          </div>
        </div>
        {/* Sub-pestañas */}
        <div className="flex gap-1 pb-0">
          {([
            { id: "plan"     as DietTab, label: "📋 Mi Plan" },
            { id: "macros"   as DietTab, label: "📊 Mis Macros" },
            { id: "generate" as DietTab, label: "🎲 Generar" },
          ]).map(({ id, label }) => (
            <button key={id} onClick={() => setDietTab(id)}
              className={"flex-1 py-2 text-xs font-semibold rounded-t-lg transition-colors " +
                (dietTab === id ? "text-white" : "text-neutral-500")}
              style={dietTab === id
                ? { background: "#1A1A1A", borderTop: "2px solid #C0394F" }
                : { background: "transparent" }}>
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Scroll container (todo el contenido) ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>

      {/* ── Sub-tab: Mis Macros ── */}
      {dietTab === "macros" && (
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-8">
          <MacroCalculator clientId={profile.id} />
        </div>
      )}

      {/* ── Sub-tab: Mi Plan ── */}
      {dietTab === "plan" && loading ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-neutral-500 text-sm">Cargando tu plan…</p>
        </div>
      ) : dietTab === "plan" && !plan && !myPlan ? (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <p className="text-4xl mb-4">🥗</p>
          <p className="text-white font-semibold mb-1">Sin plan asignado</p>
          <p className="text-neutral-500 text-sm">Tu entrenador aún no ha creado tu plan. Puedes generar el tuyo en la pestaña 🎲 Generar.</p>
        </div>
      ) : dietTab === "plan" ? (
        <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

          {/* Toggle Entrenador / Mi dieta — solo si existen los dos */}
          {plan && myPlan && (
            <div className="flex gap-2 rounded-xl p-1" style={{ background: "#111", border: "1px solid #1E1E1E" }}>
              {([["trainer","📋 Plan entrenador"],["client","🎲 Mi dieta"]] as const).map(([src, label]) => (
                <button key={src} onClick={() => setPlanSource(src)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition-colors"
                  style={planSource === src
                    ? { background: "#8B1A2F", color: "#fff" }
                    : { background: "transparent", color: "#666" }}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* ── Vista plan del cliente propio (lectura) ── */}
          {planSource === "client" && myPlan && (
            <div className="space-y-3 pb-8">
              <div className="rounded-2xl p-4" style={{ background: "#111", border: "1px solid #1E1E1E" }}>
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">🎲 Dieta generada por ti</p>
                <p className="text-white font-bold text-sm">{myPlan.name.replace("__CLIENT_GENERATED__", "").trim()}</p>
                {myPlan.kcal_on && (
                  <p className="text-neutral-400 text-xs mt-1">💪 {myPlan.kcal_on} kcal ON · 😴 {myPlan.kcal_off} kcal OFF</p>
                )}
              </div>
              {myMeals.map(meal => (
                <div key={meal.id} className="rounded-2xl p-4 space-y-2" style={{ background: "#0F0F0F", border: "1px solid #1A1A1A" }}>
                  <p className="text-white font-semibold text-sm">{meal.emoji} {meal.name}</p>
                  {meal.options.slice(0, 1).map(opt => (
                    <div key={opt.id} className="space-y-1">
                      {Array.isArray(opt.content) && opt.content.map((fg: any, fi: number) => (
                        <p key={fi} className="text-neutral-400 text-xs">
                          · {Array.isArray(fg.items) && fg.items.length > 0
                              ? `${fg.items[0]?.grams ?? ""}g — ${fg.label}`
                              : fg.label}
                        </p>
                      ))}
                    </div>
                  ))}
                  {meal.options.length > 1 && (
                    <p className="text-[10px] text-neutral-600">+{meal.options.length - 1} opciones guardadas</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Vista plan del entrenador (o si solo existe uno) ── */}
          {(planSource === "trainer" || !myPlan) && plan && <>

          {/* Toggle ON / OFF */}
          <div className="grid grid-cols-2 gap-2">
            {(["on","off"] as DayType[]).map(d => (
              <button key={d} onClick={() => setDayType(d)}
                className={"py-3 rounded-xl text-sm font-bold transition-colors " +
                  (dayType === d
                    ? d === "on"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                      : "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700")}>
                {d === "on" ? "💪 Día ON" : "😴 Día OFF"}
              </button>
            ))}
          </div>

          {/* Progreso diario — sticky dentro del scroll container */}
          {(target.kcal || target.protein) && (
            <div className="sticky top-0 z-10">
              <div className="rounded-2xl px-4 py-3 space-y-3"
                style={{ background: "#0F0F0F", border: "1px solid #1E1E1E", boxShadow: "0 4px 24px rgba(0,0,0,0.7)" }}>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider">
                    Progreso · Día {dayType.toUpperCase()}
                  </p>
                  <p className="text-xs font-bold text-white">
                    {dailyTotal.kcal.toFixed(0)}
                    {target.kcal ? ` / ${target.kcal} kcal` : " kcal"}
                  </p>
                </div>
                {/* Barra de kcal */}
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all"
                    style={{ width: target.kcal ? `${Math.min((dailyTotal.kcal / target.kcal) * 100, 100)}%` : "0%" }} />
                </div>
                {/* Barras de macros */}
                <div className="flex gap-3">
                  <MacroBar label="P" value={dailyTotal.protein} target={target.protein ?? null} color="text-red-400" />
                  <MacroBar label="H" value={dailyTotal.carbs}   target={target.carbs ?? null}   color="text-amber-400" />
                  <MacroBar label="G" value={dailyTotal.fat}     target={target.fat ?? null}     color="text-blue-400" />
                </div>
              </div>
            </div>
          )}

          {/* Notas generales */}
          {plan?.notes && (
            <div className="bg-neutral-900 border border-amber-800/30 rounded-2xl px-4 py-3">
              <p className="text-[10px] text-amber-600 uppercase tracking-wider mb-1">📌 Nota del entrenador</p>
              <p className="text-neutral-300 text-xs leading-relaxed whitespace-pre-line">{plan.notes}</p>
            </div>
          )}

          {/* ── Botones: buscar alimento + lista de la compra ── */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFoodSearch(true)}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold active:opacity-70"
              style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#ccc" }}
              title="Buscar alimento">
              🔍 Buscar alimento
            </button>
            <button
              onClick={() => { setCheckedItems(new Set()); setShowShopList(true); }}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold active:opacity-70"
              style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#ccc" }}
              title="Lista de la compra">
              🛒
              {Object.keys(shopItems).length > 0 && (
                <span className="text-xs font-bold rounded-full px-1.5 py-0.5"
                  style={{ background: "#8B1A2F", color: "#fff" }}>
                  {Object.keys(shopItems).length}
                </span>
              )}
            </button>
          </div>

          {/* ── Modal: lista de la compra ── */}
          {showShopList && (() => {
            const shopList = Object.entries(shopItems).sort((a, b) => a[1].category.localeCompare(b[1].category));
            const allChecked = shopList.length > 0 && shopList.every(([id]) => checkedItems.has(id));
            return (
              <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
                onClick={() => setShowShopList(false)}>
                <div className="w-full max-w-lg rounded-t-2xl overflow-hidden footer-safe"
                  style={{ background: "#0F0F0F", border: "1px solid #1E1E1E", maxHeight: "80dvh" }}
                  onClick={e => e.stopPropagation()}>

                  {/* Cabecera */}
                  <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-800">
                    <div>
                      <p className="text-white font-bold text-base">🛒 Lista de la compra</p>
                      <p className="text-neutral-500 text-xs mt-0.5">
                        {shopList.length > 0 ? `${shopList.length} ingrediente${shopList.length !== 1 ? "s" : ""}` : "Pulsa 🛒 junto a un ingrediente para añadirlo"}
                      </p>
                    </div>
                    <button onClick={() => setShowShopList(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-white"
                      style={{ background: "#1A1A1A" }}>✕</button>
                  </div>

                  {/* Lista */}
                  <div className="overflow-y-auto" style={{ maxHeight: "calc(80dvh - 130px)" }}>
                    {shopList.length === 0 ? (
                      <div className="py-12 text-center">
                        <p className="text-4xl mb-3">🛒</p>
                        <p className="text-neutral-400 text-sm">Pulsa el icono 🛒 junto a cualquier</p>
                        <p className="text-neutral-400 text-sm">ingrediente para añadirlo aquí</p>
                      </div>
                    ) : (
                      <div className="px-4 py-3 space-y-1">
                        {/* Agrupar por categoría */}
                        {(() => {
                          const byCategory: Record<string, typeof shopList> = {};
                          shopList.forEach(entry => {
                            const cat = entry[1].category;
                            if (!byCategory[cat]) byCategory[cat] = [];
                            byCategory[cat].push(entry);
                          });
                          return Object.entries(byCategory).map(([cat, items]) => (
                            <div key={cat} className="mb-3">
                              <p className="text-[10px] uppercase tracking-wider text-neutral-600 font-semibold mb-1.5 px-1">
                                {cat}
                              </p>
                              {items.map(([id, item]) => {
                                const checked = checkedItems.has(id);
                                return (
                                  <div key={id} className="flex items-center gap-1 mb-1">
                                    <button
                                      onClick={() => setCheckedItems(prev => {
                                        const s = new Set(prev);
                                        checked ? s.delete(id) : s.add(id);
                                        return s;
                                      })}
                                      className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-left active:opacity-70"
                                      style={{ background: checked ? "#0A1A0A" : "#141414", border: `1px solid ${checked ? "#1A3A1A" : "#1E1E1E"}` }}>
                                      <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                                        style={{ background: checked ? "#16A34A" : "#222", border: `1px solid ${checked ? "#16A34A" : "#333"}` }}>
                                        {checked && <span className="text-white text-xs font-bold">✓</span>}
                                      </div>
                                      <span className="flex-1 text-sm" style={{ color: checked ? "#4A7A4A" : "#ddd", textDecoration: checked ? "line-through" : "none" }}>
                                        {item.name}
                                      </span>
                                      <span className="text-xs tabular-nums" style={{ color: checked ? "#3A5A3A" : "#666" }}>
                                        {Math.round(item.grams)}g
                                      </span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setShopItems(prev => { const n = { ...prev }; delete n[id]; return n; });
                                        setCheckedItems(prev => { const s = new Set(prev); s.delete(id); return s; });
                                      }}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-600 hover:text-red-400 active:scale-95 shrink-0"
                                      style={{ background: "#1A1A1A" }}
                                      title="Quitar de la lista">✕</button>
                                  </div>
                                );
                              })}
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {shopList.length > 0 && (
                    <div className="px-4 py-3 border-t border-neutral-800 flex gap-2">
                      <button
                        onClick={() => setCheckedItems(allChecked ? new Set() : new Set(shopList.map(([id]) => id)))}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold active:opacity-70"
                        style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#999" }}>
                        {allChecked ? "Desmarcar todo" : "Marcar todo"}
                      </button>
                      <button
                        onClick={() => { setShopItems({}); setCheckedItems(new Set()); }}
                        className="py-2.5 px-4 rounded-xl text-sm font-semibold active:opacity-70"
                        style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#666" }}>
                        Vaciar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── COMIDAS ── */}
          {filteredMeals.map(meal => {
            const ms = mealStates[meal.id] ?? emptyMealState();
            const isOpen = expanded.has(meal.id);
            const mt = mealTotal(ms);
            const hasSomething = ms.proteina?.ingId || ms.hidrato?.ingId || ms.grasa?.ingId || ms.extras.some(e => e.ingId);

            return (
              <div key={meal.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                {/* Cabecera */}
                <button onClick={() => toggleExpand(meal.id)}
                  className="w-full flex items-center gap-3 px-4 py-4 text-left">
                  <span className="text-2xl">{meal.emoji}</span>
                  <span className="flex-1 text-white font-semibold text-sm">{meal.name}</span>
                  {hasSomething && (
                    <span className="text-[10px] text-neutral-500 tabular-nums">
                      {mt.kcal.toFixed(0)} kcal
                    </span>
                  )}
                  <span className="text-neutral-500 text-base ml-1">{isOpen ? "▾" : "▸"}</span>
                </button>

                {isOpen && (
                  <div className="border-t border-neutral-800 px-4 pb-4 pt-3 space-y-3">

                    {/* ── SELECTORES COMBINADOS P + H + G ── */}
                    <SlotRow
                      label="Proteína" color="text-red-400" slot="proteina"
                      entry={ms.proteina}
                      onChange={e => updMealState(meal.id, { proteina: e })}
                      onClear={() => updMealState(meal.id, { proteina: null })}
                      onAddToShop={addToShop}
                      macroTarget={clientMacros?.protein_g}
                      numMeals={filteredMeals.length || 1}
                    />
                    <SlotRow
                      label="Hidratos" color="text-amber-400" slot="hidrato"
                      entry={ms.hidrato}
                      onChange={e => updMealState(meal.id, { hidrato: e })}
                      onClear={() => updMealState(meal.id, { hidrato: null })}
                      onAddToShop={addToShop}
                      macroTarget={dayType === "on"
                        ? clientMacros?.carbs_g
                        : (clientMacros?.carbs_off_g ?? clientMacros?.carbs_g)}
                      numMeals={filteredMeals.length || 1}
                    />
                    <SlotRow
                      label="Grasa" color="text-blue-400" slot="grasa"
                      entry={ms.grasa}
                      onChange={e => updMealState(meal.id, { grasa: e })}
                      onClear={() => updMealState(meal.id, { grasa: null })}
                      onAddToShop={addToShop}
                      macroTarget={dayType === "on"
                        ? clientMacros?.fat_g
                        : (clientMacros?.fat_off_g ?? clientMacros?.fat_g)}
                      numMeals={filteredMeals.length || 1}
                      siblProt={ms.proteina}
                      siblHyd={ms.hidrato}
                    />

                    {/* Extras */}
                    {ms.extras.map(ex => (
                      <ExtraRow key={ex._id} entry={ex}
                        onChange={e => updMealState(meal.id, {
                          extras: ms.extras.map(x => x._id === ex._id ? e : x)
                        })}
                        onRemove={() => updMealState(meal.id, {
                          extras: ms.extras.filter(x => x._id !== ex._id)
                        })}
                        onAddToShop={addToShop}
                      />
                    ))}

                    {/* Opciones del entrenador (tabs numeradas) */}
                    {meal.options.length > 0 && (
                      <div className="border-t border-neutral-800 pt-3 space-y-2">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold pb-0.5">
                          📋 Opciones del entrenador
                        </p>
                        {/* Tab pills */}
                        <div className="flex gap-1.5">
                          {meal.options.map((opt, idx) => {
                            const active = ms.optionTab === idx;
                            return (
                              <button key={opt.id}
                                onClick={() => updMealState(meal.id, { optionTab: idx })}
                                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                style={active
                                  ? { background: "#8B1A2F", color: "#fff", border: "1px solid #8B1A2F" }
                                  : { background: "#1E1E1E", color: "#777", border: "1px solid #2A2A2A" }}>
                                {idx + 1}
                              </button>
                            );
                          })}
                        </div>
                        {/* Contenido de la opción activa */}
                        {(() => {
                          const opt = meal.options[ms.optionTab];
                          if (!opt) return null;
                          return (
                            <div className="rounded-xl px-3 py-2.5 space-y-2"
                              style={{ background: "#131313", border: "1px solid #222" }}>
                              <p className="text-white text-xs font-semibold">{opt.name}</p>
                              {opt.content.map((g, gi) => (
                                <div key={gi}>
                                  {g.label && (
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">{g.label}</p>
                                      {g.isChoice && <span className="text-[9px] bg-blue-900/40 text-blue-400 rounded px-1">elige uno</span>}
                                    </div>
                                  )}
                                  {g.items.map((item: any, ii: number) => {
                                    const display = typeof item === "object" && item.ingId
                                      ? `${item.grams} gr. ${ingName(item.ingId)}`
                                      : typeof item === "string" ? item : "";
                                    const canShop = typeof item === "object" && item.ingId;
                                    return (
                                      <div key={ii} className="flex items-center gap-1 pl-2">
                                        <p className="flex-1 text-neutral-300 text-xs">• {display}</p>
                                        {canShop && (
                                          <ShopBtn onClick={() => addToShop(item.ingId, item.grams ?? 100)} />
                                        )}
                                      </div>
                                    );
                                  })}
                                  {g.note && <p className="text-neutral-500 text-[10px] italic pl-2">※ {g.note}</p>}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Botones acción */}
                    <div className="flex gap-2 flex-wrap pt-1">
                      <button
                        onClick={() => updMealState(meal.id, { extras: [...ms.extras, { _id: uid(), ingId: "", grams: 100 }] })}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:bg-neutral-700 text-xs">
                        + Extra
                      </button>
                      <button
                        onClick={() => updMealState(meal.id, { showNote: !ms.showNote })}
                        className={"px-3 py-1.5 rounded-lg text-xs transition-colors " +
                          (ms.showNote ? "bg-amber-800/40 text-amber-300" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700")}>
                        📝 {ms.showNote ? "Ocultar nota" : "Añadir nota"}
                      </button>
                    </div>

                    {/* Guardar comida — aparece cuando hay alguna selección */}
                    {hasSomething && (
                      <button
                        onClick={() => saveMealLog(meal.id)}
                        disabled={savingMeals.has(meal.id)}
                        className="w-full py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-40 active:opacity-70"
                        style={savedMeals.has(meal.id)
                          ? { background: "#0A2A1A", border: "1px solid #1A4A2A", color: "#4ADE80" }
                          : { background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#ccc" }}>
                        {savingMeals.has(meal.id) ? "Guardando…" : savedMeals.has(meal.id) ? "✅ Guardado" : "💾 Guardar comida"}
                      </button>
                    )}

                    {/* Nota opcional */}
                    {ms.showNote && (
                      <textarea value={ms.note}
                        onChange={e => updMealState(meal.id, { note: e.target.value })}
                        placeholder="Escribe aquí lo que quieras recordar sobre esta comida…"
                        rows={2}
                        className="w-full bg-neutral-800 border border-amber-800/40 rounded-lg px-3 py-2 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-700 resize-none" />
                    )}

                    {/* Total de la comida */}
                    {hasSomething && (
                      <div className="bg-neutral-800/60 rounded-xl px-3 py-2 flex gap-3 text-xs tabular-nums">
                        <span className="text-white font-bold">{mt.kcal.toFixed(0)} kcal</span>
                        <span className="text-red-400">{mt.protein.toFixed(1)}g P</span>
                        <span className="text-amber-400">{mt.carbs.toFixed(1)}g H</span>
                        <span className="text-blue-400">{mt.fat.toFixed(1)}g G</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredMeals.length === 0 && (
            <div className="text-center py-10">
              <p className="text-neutral-500 text-sm">No hay comidas para el día {dayType.toUpperCase()}.</p>
            </div>
          )}
          </> /* fin vista entrenador */}

          {/* ── Modal: Buscar alimento (Open Food Facts) ── */}
          {showFoodSearch && (
            <FoodSearchModal
              onClose={() => setShowFoodSearch(false)}
              onAddToShop={(name, grams) => {
                setShopItems(prev => ({
                  ...prev,
                  [`_off_${name}`]: {
                    name,
                    grams: prev[`_off_${name}`] ? prev[`_off_${name}`].grams + grams : grams,
                    category: "Buscador",
                  },
                }));
              }}
              onSaved={() => {
                _customLoaded = false;
                loadCustomIngredients();
              }}
            />
          )}
        </div>
      ) : null}
      </div>{/* fin scroll container */}
    </div>
  );
}
