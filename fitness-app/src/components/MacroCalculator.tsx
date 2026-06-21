// ──────────────────────────────────────────────────────────────────
// MacroCalculator.tsx
// Calculadora de requerimientos calóricos + generador de plan diario
// Fórmula: Mifflin-St Jeor × Factor de actividad × Objetivo (déficit/superávit)
// Días ON / Días OFF con carb cycling
// ──────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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
// Multiplicadores: proteína ALTA primero (preservar músculo), grasa baja en déficit para
// maximizar hidratos de entreno, sube en volumen para salud hormonal.
// Para 70 kg en déficit −15%: 147g P / 42g G / ~413g HC ON
const GOAL_OPTIONS = [
  { label: "Pérdida de grasa intensa",  sublabel: "−20% · máx. déficit",    value: -0.20, color: "text-red-400",     protein: 2.2, fat: 0.6 },
  { label: "Pérdida de grasa",          sublabel: "−15% · déficit moderado", value: -0.15, color: "text-orange-400",  protein: 2.1, fat: 0.6 },
  { label: "Pérdida de grasa suave",    sublabel: "−10% · déficit leve",     value: -0.10, color: "text-yellow-400",  protein: 2.0, fat: 0.7 },
  { label: "Mantenimiento",             sublabel: "0% · sostener peso",      value:  0.00, color: "text-neutral-300", protein: 1.9, fat: 0.8 },
  { label: "Ganancia muscular",         sublabel: "+5% · ligero superávit",  value:  0.05, color: "text-emerald-400", protein: 2.0, fat: 1.0 },
  { label: "Volumen / masa",            sublabel: "+10% · superávit amplio", value:  0.10, color: "text-blue-400",    protein: 2.1, fat: 1.0 },
];

// Rangos exactos del entrenador (solo visibles en Configuración avanzada)
const PROTEIN_MULTIPLIERS = [1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4];
const FAT_MULTIPLIERS     = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2];

// Reducción calórica en días OFF (principalmente hidratos)
const OFF_REDUCTIONS = [
  { label: "−10%", value: 0.10 },
  { label: "−13%", value: 0.13 },
  { label: "−15%", value: 0.15 },
  { label: "−20%", value: 0.20 },
];

// ── Helpers ───────────────────────────────────────────────────────

function round1(n: number) { return Math.round(n * 10) / 10; }

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
  // Multiplicadores inicializados según el objetivo por defecto (−15%): 2.1g/kg P, 0.6g/kg G
  const [proteinMult,    setProteinMult]    = useState(2.1);
  const [fatMult,        setFatMult]        = useState(0.6);

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
  const [activeDayTab,   setActiveDayTab]   = useState<"on" | "off">("on");
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
                  {active && <i className="ti ti-check ml-2" style={{ fontSize: 16, color: "var(--mvp-red)" }} />}
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
              <p className="text-[10px] rounded-lg px-3 py-2 flex items-start gap-1.5"
                style={{ color: "#666", background: "#141414", border: "1px solid #1e1e1e" }}>
                <i className="ti ti-alert-triangle" style={{ fontSize: 11, marginTop: 1, flexShrink: 0 }} />
                Estos valores se asignan automáticamente según el objetivo. Modifícalos solo si el entrenador te lo indica.
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
          : <p className="text-xs text-center flex items-center justify-center gap-1" style={{ color: "#666" }}><i className="ti ti-check" style={{ fontSize: 11, color: "var(--mvp-red)" }} /> Calculando automáticamente</p>
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
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#111", border: "1px solid #1a1a1a" }}>
            {([
              { tab: "on"  as const, icon: "ti-dumbbell", label: "Día ON",  kcal: result.tdee },
              { tab: "off" as const, icon: "ti-moon",     label: "Día OFF", kcal: resultOff.tdee },
            ]).map(({ tab, icon, label, kcal }) => (
              <button key={tab}
                onClick={() => setActiveDayTab(tab)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={activeDayTab === tab
                  ? { background: "var(--mvp-red)", color: "#fff", boxShadow: "0 2px 12px rgba(192,41,43,0.3)" }
                  : { color: "#555" }}>
                <span className="flex items-center justify-center gap-1.5">
                  <i className={`ti ${icon}`} style={{ fontSize: 13 }} />{label}
                </span>
                <span className="block text-xs font-normal mt-0.5" style={{ color: activeDayTab === tab ? "rgba(255,255,255,0.7)" : "#333" }}>{kcal} kcal</span>
              </button>
            ))}
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
                  { label: "Proteína", g: activeResult.protein_g, kcal: activeResult.protein_kcal },
                  { label: "Hidratos", g: activeResult.carbs_g,   kcal: activeResult.carbs_kcal },
                  { label: "Grasa",    g: activeResult.fat_g,     kcal: activeResult.fat_kcal },
                ].map(m => (
                  <div key={m.label} className="rounded-xl p-3 text-center"
                    style={{ background: "#141414", border: "1px solid #1e1e1e" }}>
                    <p className="text-xl font-black text-white tabular-nums">{m.g}<span className="text-xs font-normal ml-0.5" style={{ color: "#555" }}>g</span></p>
                    <p className="text-[10px] mt-0.5" style={{ color: "#555" }}>{m.label}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: "#333" }}>{m.kcal} kcal</p>
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

        </div>
      )}
    </div>
  );
}
