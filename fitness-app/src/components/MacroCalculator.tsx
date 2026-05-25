// ──────────────────────────────────────────────────────────────────
// MacroCalculator.tsx
// Calculadora de requerimientos calóricos + generador de plan diario
// Fórmula: Mifflin-St Jeor × Factor de actividad × Objetivo (déficit/superávit)
// Días ON / Días OFF con carb cycling
// ──────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ingredients, Ingredient } from "../data/ingredients";

// ── Tipos ─────────────────────────────────────────────────────────

interface MacroResult {
  bmr: number;
  tdeeMaint: number;   // TDEE de mantenimiento (antes de aplicar objetivo)
  tdee: number;        // TDEE objetivo (con déficit/superávit aplicado)
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  protein_kcal: number;
  carbs_kcal: number;
  fat_kcal: number;
}

interface MealFood {
  food: Ingredient;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  name: string;
  emoji: string;
  foods: MealFood[];
  totalKcal: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

// ── Constantes ────────────────────────────────────────────────────

const ACTIVITY_LEVELS = [
  { value: 1.2, label: "1.2 – 3 días gym y menos de 10.000 pasos / poca masa muscular" },
  { value: 1.3, label: "1.3 – 3 días gym y más de 10.000 pasos / poca masa muscular" },
  { value: 1.4, label: "1.4 – 4 días gym y más de 10.000 pasos / poca masa muscular" },
  { value: 1.5, label: "1.5 – 4 días gym y más de 10.000 pasos y experiencia entrenando" },
  { value: 1.6, label: "1.6 – 4 días gym y más de 10.000 pasos y atleta fuera de forma" },
  { value: 1.7, label: "1.7 – 4 días gym y más de 10.000 pasos y atleta en forma" },
  { value: 1.8, label: "1.8 – 5 días gym y más de 10.000 pasos y atleta en forma" },
];

// Objetivo calórico — incluye los multiplicadores recomendados para cada objetivo.
// El cliente solo elige su objetivo; proteína y grasa se asignan automáticamente.
const GOAL_OPTIONS = [
  { label: "Pérdida de grasa intensa",  sublabel: "−20% · máx. déficit",   value: -0.20, color: "text-red-400",     protein: 2.0, fat: 0.5 },
  { label: "Pérdida de grasa",          sublabel: "−15% · déficit moderado", value: -0.15, color: "text-orange-400",  protein: 1.8, fat: 0.5 },
  { label: "Pérdida de grasa suave",    sublabel: "−10% · déficit leve",    value: -0.10, color: "text-yellow-400",  protein: 1.8, fat: 0.6 },
  { label: "Mantenimiento",             sublabel: "0% · sostener peso",     value:  0.00, color: "text-neutral-300", protein: 1.7, fat: 0.7 },
  { label: "Ganancia muscular",         sublabel: "+5% · ligero superávit", value:  0.05, color: "text-emerald-400", protein: 1.8, fat: 0.7 },
  { label: "Volumen / masa",            sublabel: "+10% · superávit amplio",value:  0.10, color: "text-blue-400",    protein: 1.9, fat: 0.8 },
];

// Rangos exactos del entrenador (solo visibles en Configuración avanzada)
const PROTEIN_MULTIPLIERS = [1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2];
const FAT_MULTIPLIERS     = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

// Reducción calórica en días OFF (principalmente hidratos)
const OFF_REDUCTIONS = [
  { label: "−10%", value: 0.10 },
  { label: "−13%", value: 0.13 },
  { label: "−15%", value: 0.15 },
  { label: "−20%", value: 0.20 },
];

// Distribución de macros por comida (% del total diario)
const MEAL_DIST: [string, string, number, number, number][] = [
  ["Comida 1", "🌅",  20, 25, 10],
  ["Comida 2", "☕",  15, 20,  5],
  ["Comida 3", "🍽️", 25, 30, 35],
  ["Comida 4", "🫐",  20, 15, 15],
  ["Comida 5", "🌙",  20, 10, 35],
];

const PROTEIN_CATS = ["lean_protein", "fatty_protein"] as const;
const CARB_CATS    = ["clean_carb", "protein_carb"] as const;
const FAT_CATS     = ["fat"] as const;
const FRUIT_CATS   = ["fruit"] as const;

// ── Helpers ───────────────────────────────────────────────────────

function round1(n: number) { return Math.round(n * 10) / 10; }

function gramsFor(food: Ingredient, key: "protein" | "carbs" | "fat", targetG: number): number {
  const per100 = food[key];
  if (!per100 || per100 <= 0) return 0;
  return Math.round((targetG / per100) * 100);
}

function pick(cats: readonly string[], mealIdx: number): Ingredient | null {
  const pool = ingredients.filter(i => cats.includes(i.category));
  if (!pool.length) return null;
  return pool[mealIdx % pool.length];
}

function mealFood(food: Ingredient, grams: number): MealFood {
  const f = grams / 100;
  return {
    food, grams,
    kcal:    round1(food.kcal    * f),
    protein: round1(food.protein * f),
    carbs:   round1(food.carbs   * f),
    fat:     round1(food.fat     * f),
  };
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Cálculo de macros ─────────────────────────────────────────────
// deficit: fracción del TDEE a reducir/aumentar (ej. -0.15 = -15%)

function calcMacros(
  sex: "male" | "female",
  age: number,
  height: number,
  weight: number,
  activityFactor: number,
  proteinMult: number,
  fatMult: number,
  deficit: number,
): MacroResult {
  const bmr = sex === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const tdeeMaint = Math.round(bmr * activityFactor);
  const tdee      = Math.round(tdeeMaint * (1 + deficit));   // deficit es negativo en déficit

  const protein_g    = round1(weight * proteinMult);
  const fat_g        = round1(weight * fatMult);
  const protein_kcal = Math.round(protein_g * 4);
  const fat_kcal     = Math.round(fat_g * 9);
  const carbs_kcal   = Math.max(0, tdee - protein_kcal - fat_kcal);
  const carbs_g      = round1(carbs_kcal / 4);

  return {
    bmr: Math.round(bmr), tdeeMaint, tdee,
    protein_g, carbs_g, fat_g,
    protein_kcal, carbs_kcal, fat_kcal,
  };
}

// ── Generador de plan ─────────────────────────────────────────────

function generatePlan(macros: MacroResult): Meal[] {
  return MEAL_DIST.map(([name, emoji, pPct, hcPct, fPct], idx) => {
    const targetProtein = round1(macros.protein_g * pPct / 100);
    const targetCarbs   = round1(macros.carbs_g   * hcPct / 100);
    const targetFat     = round1(macros.fat_g     * fPct  / 100);

    const foods: MealFood[] = [];

    const protFood = pick(PROTEIN_CATS, idx + 3);
    if (protFood && targetProtein > 0) {
      const g = gramsFor(protFood, "protein", targetProtein);
      if (g > 0) foods.push(mealFood(protFood, g));
    }

    const carbCats = (idx < 2) ? ["protein_carb", "clean_carb"] : CARB_CATS;
    const carbFood = pick(carbCats as readonly string[], idx + 7);
    if (carbFood && targetCarbs > 0) {
      const g = gramsFor(carbFood, "carbs", targetCarbs);
      if (g > 0) foods.push(mealFood(carbFood, g));
    }

    if (idx >= 2 && targetFat > 0) {
      const fatFood = pick(FAT_CATS, idx);
      if (fatFood) {
        const g = gramsFor(fatFood, "fat", targetFat);
        if (g > 0) foods.push(mealFood(fatFood, g));
      }
    }

    if ([0, 2, 4].includes(idx)) {
      const fruitFood = pick(FRUIT_CATS, idx + 1);
      if (fruitFood) foods.push(mealFood(fruitFood, 125));
    }

    const totalKcal    = round1(foods.reduce((s, f) => s + f.kcal, 0));
    const totalProtein = round1(foods.reduce((s, f) => s + f.protein, 0));
    const totalCarbs   = round1(foods.reduce((s, f) => s + f.carbs, 0));
    const totalFat     = round1(foods.reduce((s, f) => s + f.fat, 0));

    return { name, emoji, foods, totalKcal, totalProtein, totalCarbs, totalFat };
  });
}

// ── Componente ────────────────────────────────────────────────────

interface Props {
  clientName?: string;
  clientId?: string;
}

export default function MacroCalculator({ clientName, clientId }: Props) {
  const [sex,            setSex]            = useState<"male" | "female">("male");
  const [age,            setAge]            = useState("");
  const [height,         setHeight]         = useState("");
  const [weight,         setWeight]         = useState("");
  const [activityFactor, setActivityFactor] = useState(1.4);
  const [goal,           setGoal]           = useState(-0.15);
  // Multiplicadores inicializados según el objetivo por defecto (−15%)
  const [proteinMult,    setProteinMult]    = useState(1.8);
  const [fatMult,        setFatMult]        = useState(0.5);

  // Al cambiar el objetivo, auto-asigna los multiplicadores recomendados
  // (el admin puede sobrescribir manualmente en Configuración avanzada)
  const handleGoalChange = (value: number) => {
    const opt = GOAL_OPTIONS.find(o => o.value === value);
    if (opt) { setProteinMult(opt.protein); setFatMult(opt.fat); }
    setGoal(value);
  };
  const [offReduction,   setOffReduction]   = useState(0.13);
  const [trainDays,      setTrainDays]      = useState(4);

  const [result,         setResult]         = useState<MacroResult | null>(null);
  const [resultOff,      setResultOff]      = useState<MacroResult | null>(null);
  const [plan,           setPlan]           = useState<Meal[] | null>(null);
  const [planOff,        setPlanOff]        = useState<Meal[] | null>(null);
  const [activeDayTab,   setActiveDayTab]   = useState<"on" | "off">("on");
  const [showPlan,       setShowPlan]       = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [savedAt,        setSavedAt]        = useState<string | null>(null);
  const [loadingData,    setLoadingData]    = useState(false);
  const [saveMsg,        setSaveMsg]        = useState<string | null>(null);
  const [showAdvanced,   setShowAdvanced]   = useState(false);

  // ── Cargar datos guardados ────────────────────────────────────
  useEffect(() => {
    if (!clientId) return;
    setLoadingData(true);
    supabase
      .from("client_macros")
      .select("*")
      .eq("client_id", clientId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSex(data.sex as "male" | "female");
          setAge(String(data.age));
          setHeight(String(data.height_cm));
          setWeight(String(data.weight_kg));
          setActivityFactor(Number(data.activity_factor));
          setProteinMult(Number(data.protein_mult));
          setFatMult(Number(data.fat_mult));
          setSavedAt(data.updated_at);
        }
        setLoadingData(false);
      });
  }, [clientId]);

  const canCalc = !!age && !!height && !!weight
    && Number(age) > 0 && Number(height) > 0 && Number(weight) > 0;

  // Recalcular automáticamente
  useEffect(() => {
    if (!canCalc) {
      setResult(null); setResultOff(null);
      setPlan(null);   setPlanOff(null);
      return;
    }
    const r = calcMacros(
      sex, Number(age), Number(height), Number(weight),
      activityFactor, proteinMult, fatMult, goal,
    );
    // Días OFF: mismo objetivo % pero actividad reducida → bajan principalmente los hidratos
    const rOff = calcMacros(
      sex, Number(age), Number(height), Number(weight),
      activityFactor * (1 - offReduction), proteinMult, fatMult, goal,
    );
    setResult(r);
    setResultOff(rOff);
    setPlan(generatePlan(r));
    setPlanOff(generatePlan(rOff));
    setShowPlan(false);
  }, [sex, age, height, weight, activityFactor, proteinMult, fatMult, goal, offReduction]);

  const handleSave = async () => {
    if (!result || !clientId) return;
    setSaving(true);
    setSaveMsg(null);
    const row = {
      client_id: clientId,
      sex, age: Number(age),
      height_cm:       Number(height),
      weight_kg:       Number(weight),
      activity_factor: activityFactor,
      protein_mult:    proteinMult,
      fat_mult:        fatMult,
      bmr:             result.bmr,
      tdee:            result.tdee,
      protein_g:       result.protein_g,
      carbs_g:         result.carbs_g,
      fat_g:           result.fat_g,
      updated_at:      new Date().toISOString(),
    };
    const { error } = await supabase
      .from("client_macros")
      .upsert(row, { onConflict: "client_id" });
    setSaveMsg(error ? "❌ Error al guardar" : "✅ Guardado");
    if (!error) setSavedAt(row.updated_at);
    setSaving(false);
    setTimeout(() => setSaveMsg(null), 3000);
  };

  // Media semanal ponderada
  const weeklyAvg = result && resultOff
    ? Math.round((trainDays * result.tdee + (7 - trainDays) * resultOff.tdee) / 7)
    : null;

  const activeResult = activeDayTab === "on" ? result : resultOff;
  const activePlan   = activeDayTab === "on" ? plan   : planOff;

  const pctBar = activeResult ? {
    p: Math.round(activeResult.protein_kcal / activeResult.tdee * 100),
    h: Math.round(activeResult.carbs_kcal   / activeResult.tdee * 100),
    f: Math.round(activeResult.fat_kcal     / activeResult.tdee * 100),
  } : null;

  const goalOption = GOAL_OPTIONS.find(g => g.value === goal) ?? GOAL_OPTIONS[1];

  if (loadingData) {
    return <p className="text-neutral-500 text-sm text-center py-12">Cargando datos guardados...</p>;
  }

  return (
    <div className="space-y-4">

      {/* Cabecera */}
      {(clientName || savedAt) && (
        <div className="flex items-center justify-between">
          {clientName && (
            <p className="text-neutral-500 text-xs">Calculadora para <span className="text-white">{clientName}</span></p>
          )}
          {savedAt && (
            <p className="text-neutral-600 text-[10px]">💾 Guardado el {fmtDate(savedAt)}</p>
          )}
        </div>
      )}

      {/* ── Formulario ── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4">
        <p className="text-white text-sm font-semibold">Datos personales</p>

        {/* Sexo */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1.5">Sexo</label>
          <div className="flex gap-2">
            {([["male","Hombre"],["female","Mujer"]] as const).map(([v, l]) => (
              <button key={v} type="button" onClick={() => setSex(v)}
                className={"flex-1 py-2 rounded-lg text-sm font-medium transition-colors " +
                  (sex === v ? "bg-white text-black" : "bg-neutral-800 text-neutral-400 active:bg-neutral-700")}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Edad, Altura, Peso */}
        <div className="grid grid-cols-3 gap-3">
          {([
            ["Edad",   "años", age,    setAge,    "1",   "15",  "99"],
            ["Altura", "cm",   height, setHeight, "1",   "140", "220"],
            ["Peso",   "kg",   weight, setWeight, "0.1", "40",  "250"],
          ] as const).map(([label, unit, val, setter, step, min, max]) => (
            <div key={label} className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</label>
              <div className="flex items-center gap-1">
                <input
                  type="number" step={step} min={min} max={max}
                  value={val}
                  onChange={e => (setter as (v: string) => void)(e.target.value)}
                  placeholder="—"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-700"
                />
                <span className="text-neutral-600 text-[10px] shrink-0">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Factor de actividad */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1.5">Factor de actividad</label>
          <select
            value={activityFactor}
            onChange={e => setActivityFactor(Number(e.target.value))}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500">
            {ACTIVITY_LEVELS.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Objetivo — el cliente solo elige esto; proteína y grasa se asignan solos */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1.5">¿Cuál es tu objetivo?</label>
          <div className="grid grid-cols-1 gap-2">
            {GOAL_OPTIONS.map(o => {
              const active = goal === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => handleGoalChange(o.value)}
                  className={"py-3 rounded-xl text-sm transition-colors text-left px-4 flex items-center justify-between " +
                    (active
                      ? "bg-white text-black"
                      : "bg-neutral-800 text-neutral-300 active:bg-neutral-700")}>
                  <div>
                    <p className="font-semibold">{o.label}</p>
                    <p className={"text-[10px] mt-0.5 " + (active ? "text-neutral-500" : "text-neutral-500")}>
                      {o.sublabel}
                    </p>
                  </div>
                  {active && <span className="text-emerald-500 text-lg ml-2">✓</span>}
                </button>
              );
            })}
          </div>
          {/* Los multiplicadores se asignan automáticamente */}
          {(() => {
            const opt = GOAL_OPTIONS.find(o => o.value === goal);
            return opt ? (
              <p className="text-[10px] text-neutral-600 mt-2 px-1">
                Se aplica automáticamente: proteína {opt.protein} g/kg · grasa {opt.fat} g/kg · hidratos = residuo calórico.
                El entrenador puede ajustar en Configuración avanzada.
              </p>
            ) : null;
          })()}
        </div>

        {/* Configuración avanzada */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(v => !v)}
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-neutral-500 active:text-neutral-300 transition-colors">
            <span>{showAdvanced ? "▾" : "▸"}</span>
            <span>⚙ Configuración avanzada</span>
          </button>

          {showAdvanced && (
            <div className="space-y-3 mt-3">
              <p className="text-[10px] text-amber-600 bg-amber-950/30 border border-amber-900/30 rounded-lg px-3 py-2">
                ⚠ Estos valores se asignan automáticamente según el objetivo. Modifícalos solo si el entrenador te lo indica.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1.5">
                    Proteína <span className="text-neutral-600">(g/kg)</span>
                  </label>
                  <select
                    value={proteinMult}
                    onChange={e => setProteinMult(Number(e.target.value))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500">
                    {PROTEIN_MULTIPLIERS.map(m => (
                      <option key={m} value={m}>{m} g/kg</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1.5">
                    Grasa <span className="text-neutral-600">(g/kg)</span>
                  </label>
                  <select
                    value={fatMult}
                    onChange={e => setFatMult(Number(e.target.value))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500">
                    {FAT_MULTIPLIERS.map(m => (
                      <option key={m} value={m}>{m} g/kg</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reducción días OFF */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1.5">
                  Reducción días OFF <span className="text-neutral-600">(↓ hidratos)</span>
                </label>
                <div className="flex gap-2">
                  {OFF_REDUCTIONS.map(o => (
                    <button key={o.value} type="button" onClick={() => setOffReduction(o.value)}
                      className={"flex-1 py-2 rounded-lg text-xs font-medium transition-colors " +
                        (offReduction === o.value
                          ? "bg-white text-black"
                          : "bg-neutral-800 text-neutral-400 active:bg-neutral-700")}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Días de entrenamiento */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1.5">
                  Días de entrenamiento / semana
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5].map(d => (
                    <button key={d} type="button" onClick={() => setTrainDays(d)}
                      className={"flex-1 py-2 rounded-lg text-sm font-medium transition-colors " +
                        (trainDays === d
                          ? "bg-white text-black"
                          : "bg-neutral-800 text-neutral-400 active:bg-neutral-700")}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {!canCalc
          ? <p className="text-neutral-600 text-xs text-center">Rellena todos los datos para ver los resultados</p>
          : <p className="text-emerald-600 text-xs text-center flex items-center justify-center gap-1"><span>✓</span> Calculando automáticamente</p>
        }
      </div>

      {/* ── Resultado ── */}
      {result && resultOff && (
        <div className="space-y-3">

          {/* TDEE mantenimiento vs objetivo — para que el usuario entienda el ajuste */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-600 mb-0.5">Mantenimiento (fórmula)</p>
                <p className="text-neutral-500 text-sm font-medium line-through">{result.tdeeMaint} kcal</p>
              </div>
              <div className="text-neutral-600 text-lg px-2">→</div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">
                  Objetivo <span className={goalOption.color}>({goal >= 0 ? "+" : ""}{Math.round(goal * 100)}%)</span>
                </p>
                <p className="text-white text-xl font-bold">{result.tdee} kcal</p>
              </div>
            </div>
          </div>

          {/* Tabs ON / OFF */}
          <div className="flex gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
            <button
              onClick={() => { setActiveDayTab("on"); setShowPlan(false); }}
              className={"flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors " +
                (activeDayTab === "on" ? "bg-white text-black" : "text-neutral-400 active:bg-neutral-800")}>
              💪 Día ON
              <span className="block text-xs font-normal mt-0.5 text-neutral-500">{result.tdee} kcal</span>
            </button>
            <button
              onClick={() => { setActiveDayTab("off"); setShowPlan(false); }}
              className={"flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors " +
                (activeDayTab === "off" ? "bg-white text-black" : "text-neutral-400 active:bg-neutral-800")}>
              😴 Día OFF
              <span className="block text-xs font-normal mt-0.5 text-neutral-500">{resultOff.tdee} kcal</span>
            </button>
          </div>

          {/* Media semanal */}
          {weeklyAvg && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-500">Media semanal</p>
                <p className="text-white text-base font-bold">{weeklyAvg} <span className="text-neutral-500 text-xs font-normal">kcal/día</span></p>
              </div>
              <p className="text-neutral-500 text-xs">{trainDays} ON · {7 - trainDays} OFF</p>
            </div>
          )}

          {/* Macro bar + tarjetas */}
          {activeResult && (
            <>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">BMR</p>
                    <p className="text-neutral-400 text-sm">{activeResult.bmr} kcal</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">
                      Objetivo {activeDayTab === "on" ? "Día ON" : "Día OFF"}
                    </p>
                    <p className="text-white text-3xl font-bold">
                      {activeResult.tdee} <span className="text-neutral-500 text-base font-normal">kcal</span>
                    </p>
                  </div>
                </div>
                {pctBar && (
                  <div className="flex rounded-lg overflow-hidden h-3 mb-3">
                    <div style={{ width: `${pctBar.p}%` }} className="bg-blue-500" />
                    <div style={{ width: `${pctBar.h}%` }} className="bg-amber-400" />
                    <div style={{ width: `${pctBar.f}%` }} className="bg-rose-500" />
                  </div>
                )}
                <div className="flex gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/>Proteína {pctBar?.p}%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>Hidratos {pctBar?.h}%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"/>Grasa {pctBar?.f}%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Proteína", g: activeResult.protein_g, kcal: activeResult.protein_kcal, color: "text-blue-400",  bg: "bg-blue-900/20 border-blue-800/40" },
                  { label: "Hidratos", g: activeResult.carbs_g,   kcal: activeResult.carbs_kcal,   color: "text-amber-400", bg: "bg-amber-900/20 border-amber-800/40" },
                  { label: "Grasa",    g: activeResult.fat_g,     kcal: activeResult.fat_kcal,     color: "text-rose-400",  bg: "bg-rose-900/20 border-rose-800/40" },
                ].map(m => (
                  <div key={m.label} className={`rounded-xl border p-3 text-center ${m.bg}`}>
                    <p className={`text-xl font-bold ${m.color}`}>{m.g}<span className="text-xs font-normal ml-0.5">g</span></p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{m.label}</p>
                    <p className="text-[9px] text-neutral-600 mt-0.5">{m.kcal} kcal</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Cómo se calculan los tres macros */}
          {activeResult && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 space-y-2.5">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500">Cómo se calculan tus macros</p>

              {/* Proteína */}
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="text-xs text-neutral-400 leading-relaxed">
                  <span className="text-blue-400 font-semibold">Proteína: </span>
                  {weight} kg × {proteinMult} g/kg
                  {" = "}<span className="text-white font-bold">{activeResult.protein_g} g</span>
                  <span className="text-neutral-600"> ({activeResult.protein_kcal} kcal)</span>
                </div>
              </div>

              {/* Grasa */}
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <div className="text-xs text-neutral-400 leading-relaxed">
                  <span className="text-rose-400 font-semibold">Grasa: </span>
                  {weight} kg × {fatMult} g/kg
                  {" = "}<span className="text-white font-bold">{activeResult.fat_g} g</span>
                  <span className="text-neutral-600"> ({activeResult.fat_kcal} kcal)</span>
                </div>
              </div>

              {/* Hidratos — residuo */}
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div className="text-xs text-neutral-400 leading-relaxed">
                  <span className="text-amber-400 font-semibold">Hidratos: </span>
                  ({activeResult.tdee} − {activeResult.protein_kcal} − {activeResult.fat_kcal}) ÷ 4
                  {" = "}<span className="text-white font-bold">{activeResult.carbs_g} g</span>
                  <span className="text-neutral-600"> ({activeResult.carbs_kcal} kcal · residuo calórico)</span>
                </div>
              </div>
            </div>
          )}

          {/* Comparativa hidratos ON → OFF */}
          {result && resultOff && (
            <div className="bg-amber-900/10 border border-amber-800/30 rounded-xl px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-amber-600 mb-2">Hidratos ON → OFF</p>
              <div className="flex items-center gap-3 text-center">
                <div className="flex-1">
                  <p className="text-amber-400 text-lg font-bold">{result.carbs_g}g</p>
                  <p className="text-neutral-500 text-[10px]">Día ON</p>
                </div>
                <span className="text-neutral-600">→</span>
                <div className="flex-1">
                  <p className="text-amber-400 text-lg font-bold">{resultOff.carbs_g}g</p>
                  <p className="text-neutral-500 text-[10px]">Día OFF</p>
                </div>
                <span className="text-neutral-600">→</span>
                <div className="flex-1">
                  <p className="text-rose-400 text-lg font-bold">−{round1(result.carbs_g - resultOff.carbs_g)}g</p>
                  <p className="text-neutral-500 text-[10px]">Diferencia</p>
                </div>
              </div>
            </div>
          )}

          <p className="text-[10px] text-neutral-600 px-1">
            Mifflin-St Jeor × {activeDayTab === "on" ? activityFactor : round1(activityFactor * (1 - offReduction))}
            {" "}({goal >= 0 ? "+" : ""}{Math.round(goal * 100)}% objetivo)
            {" "}· Prot {proteinMult} g/kg · Grasa {fatMult} g/kg · HC = residuo
          </p>

          {/* Guardar */}
          {clientId && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl text-sm font-bold disabled:opacity-40"
                style={{ background: "#8B1A2F", border: "1px solid #A01F38", color: "white" }}>
                {saving ? "Guardando..." : "💾 Guardar requerimientos"}
              </button>
              {saveMsg && <span className="text-sm shrink-0">{saveMsg}</span>}
            </div>
          )}

          {/* Plan de ejemplo */}
          <button
            onClick={() => setShowPlan(p => !p)}
            className="w-full py-3 rounded-xl bg-neutral-800 text-white text-sm font-medium active:bg-neutral-700">
            {showPlan
              ? `▲ Ocultar plan ${activeDayTab === "on" ? "ON" : "OFF"}`
              : `✨ Ver plan diario de ejemplo (${activeDayTab === "on" ? "💪 Día ON" : "😴 Día OFF"})`}
          </button>

          {showPlan && activePlan && (
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 px-1">
                Plan de ejemplo · {activeDayTab === "on" ? "💪 Día ON" : "😴 Día OFF"} · ajustar según gustos
              </p>

              {activePlan.map((meal, i) => (
                <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{meal.emoji}</span>
                      <p className="text-white text-sm font-semibold">{meal.name}</p>
                    </div>
                    <p className="text-neutral-400 text-xs">{meal.totalKcal} kcal</p>
                  </div>
                  <div className="space-y-2 mb-3">
                    {meal.foods.map((mf, j) => (
                      <div key={j} className="flex items-center justify-between">
                        <div>
                          <p className="text-neutral-200 text-xs">{mf.food.name}</p>
                          <p className="text-neutral-600 text-[10px]">{mf.grams} g</p>
                        </div>
                        <div className="flex gap-2 text-[10px]">
                          <span className="text-blue-400">{mf.protein}g P</span>
                          <span className="text-amber-400">{mf.carbs}g HC</span>
                          <span className="text-rose-400">{mf.fat}g G</span>
                        </div>
                      </div>
                    ))}
                    {[2, 4].includes(i) && (
                      <div className="flex items-center justify-between opacity-60">
                        <p className="text-neutral-400 text-xs">🥦 Verdura variada (libre)</p>
                        <p className="text-neutral-600 text-[10px]">100–400 g</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2 border-t border-neutral-800 text-[10px]">
                    <span className="text-blue-400">{meal.totalProtein}g P</span>
                    <span className="text-amber-400">{meal.totalCarbs}g HC</span>
                    <span className="text-rose-400">{meal.totalFat}g G</span>
                  </div>
                </div>
              ))}

              {/* Objetivo diario — mostramos el TARGET de la dieta, no la suma de los alimentos ilustrativos */}
              {activeResult && (
                <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-4">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Objetivo diario</p>
                  <p className="text-[9px] text-neutral-600 mb-3">
                    Los alimentos del plan son orientativos — ajusta cantidades hasta alcanzar estos valores.
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: "Kcal",     val: String(activeResult.tdee),                     color: "text-white" },
                      { label: "Proteína", val: activeResult.protein_g + "g",                  color: "text-blue-400" },
                      { label: "Hidratos", val: activeResult.carbs_g   + "g",                  color: "text-amber-400" },
                      { label: "Grasa",    val: activeResult.fat_g     + "g",                  color: "text-rose-400" },
                    ].map(t => (
                      <div key={t.label}>
                        <p className={`text-base font-bold ${t.color}`}>{t.val}</p>
                        <p className="text-[9px] text-neutral-500">{t.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-neutral-600 px-1 text-center">
                Este plan es orientativo. El entrenador ajusta alimentos y cantidades en el plan oficial.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
