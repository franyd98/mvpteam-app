// ──────────────────────────────────────────────────────────────────
// MacroCalculator.tsx
// Calculadora de requerimientos calóricos + generador de plan diario
// Fórmula: Mifflin-St Jeor × Factor de actividad
// Fuente: Excel "Dieta para Fran" (entrenador)
// Los resultados se guardan en la tabla client_macros (Supabase)
// ──────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ingredients, Ingredient } from "../data/ingredients";

// ── Tipos ─────────────────────────────────────────────────────────

interface MacroResult {
  bmr: number;
  tdee: number;
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

const PROTEIN_MULTIPLIERS = [1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2];
const FAT_MULTIPLIERS     = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

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

function calcMacros(
  sex: "male" | "female",
  age: number,
  height: number,
  weight: number,
  activityFactor: number,
  proteinMult: number,
  fatMult: number,
): MacroResult {
  const bmr = sex === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const tdee = Math.round(bmr * activityFactor);
  const protein_g    = round1(weight * proteinMult);
  const fat_g        = round1(weight * fatMult);
  const protein_kcal = Math.round(protein_g * 4);
  const fat_kcal     = Math.round(fat_g * 9);
  const carbs_kcal   = Math.max(0, tdee - protein_kcal - fat_kcal);
  const carbs_g      = round1(carbs_kcal / 4);

  return {
    bmr: Math.round(bmr), tdee,
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
  /** ID del cliente — necesario para guardar/cargar en Supabase */
  clientId?: string;
}

export default function MacroCalculator({ clientName, clientId }: Props) {
  const [sex,            setSex]            = useState<"male" | "female">("male");
  const [age,            setAge]            = useState("");
  const [height,         setHeight]         = useState("");
  const [weight,         setWeight]         = useState("");
  const [activityFactor, setActivityFactor] = useState(1.5);
  const [proteinMult,    setProteinMult]    = useState(2.0);
  const [fatMult,        setFatMult]        = useState(0.8);
  const [result,         setResult]         = useState<MacroResult | null>(null);
  const [plan,           setPlan]           = useState<Meal[] | null>(null);
  const [showPlan,       setShowPlan]       = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [savedAt,        setSavedAt]        = useState<string | null>(null);
  const [loadingData,    setLoadingData]    = useState(false);
  const [saveMsg,        setSaveMsg]        = useState<string | null>(null);

  // ── Cargar datos guardados al montar ──────────────────────────
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
          // Recalcular con los datos guardados
          const r = calcMacros(
            data.sex as "male" | "female",
            Number(data.age), Number(data.height_cm), Number(data.weight_kg),
            Number(data.activity_factor), Number(data.protein_mult), Number(data.fat_mult),
          );
          setResult(r);
          setPlan(generatePlan(r));
        }
        setLoadingData(false);
      });
  }, [clientId]);

  const canCalc = !!age && !!height && !!weight
    && Number(age) > 0 && Number(height) > 0 && Number(weight) > 0;

  const handleCalc = () => {
    if (!canCalc) return;
    const r = calcMacros(sex, Number(age), Number(height), Number(weight),
      activityFactor, proteinMult, fatMult);
    setResult(r);
    setPlan(generatePlan(r));
    setShowPlan(false);
  };

  const handleSave = async () => {
    if (!result || !clientId) return;
    setSaving(true);
    setSaveMsg(null);

    const row = {
      client_id:       clientId,
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

    if (error) {
      setSaveMsg("❌ Error al guardar");
    } else {
      setSavedAt(row.updated_at);
      setSaveMsg("✅ Guardado");
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const pctBar = result ? {
    p: Math.round(result.protein_kcal / result.tdee * 100),
    h: Math.round(result.carbs_kcal   / result.tdee * 100),
    f: Math.round(result.fat_kcal     / result.tdee * 100),
  } : null;

  if (loadingData) {
    return <p className="text-neutral-500 text-sm text-center py-12">Cargando datos guardados...</p>;
  }

  return (
    <div className="space-y-4">

      {/* Cabecera */}
      <div className="flex items-center justify-between">
        {clientName && (
          <p className="text-neutral-500 text-xs">Calculadora para <span className="text-white">{clientName}</span></p>
        )}
        {savedAt && (
          <p className="text-neutral-600 text-[10px]">💾 Guardado el {fmtDate(savedAt)}</p>
        )}
      </div>

      {/* ── Formulario ── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4">
        <p className="text-white text-sm font-semibold">Datos personales</p>

        {/* Sexo */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1.5">Sexo</label>
          <div className="flex gap-2">
            {([["male","Hombre"],["female","Mujer"]] as const).map(([v, l]) => (
              <button key={v} type="button"
                onClick={() => setSex(v)}
                className={"flex-1 py-2 rounded-lg text-sm font-medium transition-colors " +
                  (sex === v ? "bg-white text-black" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700")}>
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
            ["Peso",   "kg",   weight, setWeight, "0.1", "40",  "200"],
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

        {/* Multiplicadores */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1.5">
              Proteína <span className="text-neutral-600">(g/kg · 1.6–2.2)</span>
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
              Grasa <span className="text-neutral-600">(g/kg · 0.5–1.0)</span>
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

        <button
          onClick={handleCalc}
          disabled={!canCalc}
          className="w-full py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-neutral-200 disabled:opacity-40 transition-colors">
          Calcular requerimientos
        </button>
      </div>

      {/* ── Resultado ── */}
      {result && (
        <div className="space-y-3">

          {/* Kcal totales */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Metabolismo Basal</p>
                <p className="text-neutral-400 text-sm">{result.bmr} kcal</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Requerimiento Total (TDEE)</p>
                <p className="text-white text-3xl font-bold">{result.tdee} <span className="text-neutral-500 text-base font-normal">kcal</span></p>
              </div>
            </div>

            {/* Barra de macros */}
            {pctBar && (
              <div className="flex rounded-lg overflow-hidden h-3 mb-3">
                <div style={{ width: `${pctBar.p}%` }} className="bg-blue-500" />
                <div style={{ width: `${pctBar.h}%` }} className="bg-amber-400" />
                <div style={{ width: `${pctBar.f}%` }} className="bg-rose-500" />
              </div>
            )}
            <div className="flex gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/>Proteína</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>Hidratos</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"/>Grasa</span>
            </div>
          </div>

          {/* Tarjetas de macros */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Proteína", g: result.protein_g, kcal: result.protein_kcal, color: "text-blue-400",  bg: "bg-blue-900/20 border-blue-800/40" },
              { label: "Hidratos", g: result.carbs_g,   kcal: result.carbs_kcal,   color: "text-amber-400", bg: "bg-amber-900/20 border-amber-800/40" },
              { label: "Grasa",    g: result.fat_g,     kcal: result.fat_kcal,     color: "text-rose-400",  bg: "bg-rose-900/20 border-rose-800/40" },
            ].map(m => (
              <div key={m.label} className={`rounded-xl border p-3 text-center ${m.bg}`}>
                <p className={`text-xl font-bold ${m.color}`}>{m.g}<span className="text-xs font-normal ml-0.5">g</span></p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{m.label}</p>
                <p className="text-[9px] text-neutral-600 mt-0.5">{m.kcal} kcal</p>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-neutral-600 px-1">
            Fórmula Mifflin-St Jeor × {activityFactor} · Proteína: {proteinMult} g/kg · Grasa: {fatMult} g/kg
          </p>

          {/* Botón guardar */}
          {clientId && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-40"
                style={{ background: "#8B1A2F", border: "1px solid #A01F38", color: "white" }}>
                {saving ? "Guardando..." : "💾 Guardar requerimientos"}
              </button>
              {saveMsg && (
                <span className="text-sm shrink-0">{saveMsg}</span>
              )}
            </div>
          )}

          {/* Botón plan */}
          <button
            onClick={() => setShowPlan(p => !p)}
            className="w-full py-3 rounded-xl bg-neutral-800 text-white text-sm font-medium hover:bg-neutral-700 transition-colors">
            {showPlan ? "▲ Ocultar plan de ejemplo" : "✨ Ver plan diario de ejemplo"}
          </button>

          {/* ── Plan de 5 comidas ── */}
          {showPlan && plan && (
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 px-1">
                Plan de ejemplo — 5 comidas · ajustar según gustos
              </p>

              {plan.map((meal, i) => (
                <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{meal.emoji}</span>
                      <p className="text-white text-sm font-semibold">{meal.name}</p>
                    </div>
                    <p className="text-neutral-400 text-xs font-medium">{meal.totalKcal} kcal</p>
                  </div>

                  <div className="space-y-2 mb-3">
                    {meal.foods.map((mf, j) => (
                      <div key={j} className="flex items-center justify-between">
                        <div>
                          <p className="text-neutral-200 text-xs">{mf.food.name}</p>
                          <p className="text-neutral-600 text-[10px]">{mf.grams} g</p>
                        </div>
                        <div className="flex gap-2 text-[10px] text-right">
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

              {/* Totales del día */}
              <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">Total del plan generado</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Kcal",     val: plan.reduce((s, m) => s + m.totalKcal,    0).toFixed(0), color: "text-white" },
                    { label: "Proteína", val: plan.reduce((s, m) => s + m.totalProtein, 0).toFixed(1) + "g", color: "text-blue-400" },
                    { label: "Hidratos", val: plan.reduce((s, m) => s + m.totalCarbs,   0).toFixed(1) + "g", color: "text-amber-400" },
                    { label: "Grasa",    val: plan.reduce((s, m) => s + m.totalFat,     0).toFixed(1) + "g", color: "text-rose-400" },
                  ].map(t => (
                    <div key={t.label}>
                      <p className={`text-base font-bold ${t.color}`}>{t.val}</p>
                      <p className="text-[9px] text-neutral-500">{t.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-neutral-700 mt-2 text-center">
                  Objetivo: {result.tdee} kcal · {result.protein_g}g P · {result.carbs_g}g HC · {result.fat_g}g G
                </p>
              </div>

              <p className="text-[10px] text-neutral-600 px-1 text-center">
                Este plan es orientativo. El entrenador puede ajustar alimentos y cantidades al crear el plan oficial.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
