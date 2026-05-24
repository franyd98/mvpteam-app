// Editor del admin: crea y edita el plan nutricional de un cliente.
// Usa selectores de ingredientes (del PDF) en lugar de textareas libres.

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  INGREDIENTS, CATEGORY_LABELS, bySlot,
  type IngCategory, type MainSlot,
} from "../data/ingredients";

type Profile = { id: string; full_name: string; role: string };

// ── Tipos internos del editor ─────────────────────────────────────
type SlotFilter = "proteina" | "hidrato" | "grasa" | "extra";

type DraftItem = {
  _id: string;
  ingId: string;
  grams: number;
};

type DraftGroup = {
  _id: string;
  label: string;
  slot: SlotFilter;
  isChoice: boolean;
  items: DraftItem[];
  note: string;
};

type DraftOption = {
  _id: string;
  name: string;
  groups: DraftGroup[];
};

type DraftMeal = {
  _id: string;
  name: string;
  emoji: string;
  day_type: "on" | "off" | "both";
  options: DraftOption[];
  expanded: boolean;
};

// ── Helpers ───────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const EMOJIS = ["🍳","☕","🥗","🍽️","🥩","🥙","🥪","🍜","🥦","🍎","🥤","🍱","🧀","🥚","🍞"];

const newItem  = (): DraftItem  => ({ _id: uid(), ingId: "", grams: 100 });
const newGroup = (slot: SlotFilter = "proteina"): DraftGroup =>
  ({ _id: uid(), label: slot === "proteina" ? "Proteína" : slot === "hidrato" ? "Hidratos" : slot === "grasa" ? "Grasa" : "", slot, isChoice: true, items: [newItem()], note: "" });
const newOption = (n = 1): DraftOption =>
  ({ _id: uid(), name: `Opción ${n}`, groups: [newGroup("proteina"), newGroup("hidrato"), newGroup("grasa")] });
const newMeal = (): DraftMeal =>
  ({ _id: uid(), name: "", emoji: "🍽️", day_type: "both", options: [newOption(1)], expanded: true });

const SLOT_LABELS: Record<SlotFilter, string> = {
  proteina: "Proteína",
  hidrato:  "Hidratos",
  grasa:    "Grasa",
  extra:    "Resto",
};

// ── Selector de ingrediente con filtro por slot ───────────────────
function IngSelect({ slot, value, onChange }: {
  slot: SlotFilter; value: string; onChange: (v: string) => void;
}) {
  const ings = bySlot(slot);
  const groups = [...new Set(ings.map(i => i.category))];
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="flex-1 min-w-0 bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-neutral-500">
      <option value="">— Elige alimento —</option>
      {groups.map(cat => {
        const items = ings.filter(i => i.category === cat);
        return (
          <optgroup key={cat} label={CATEGORY_LABELS[cat]}>
            {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </optgroup>
        );
      })}
    </select>
  );
}

// ── Componente principal ──────────────────────────────────────────
export default function DietEditor({ client, onBack }: { client: Profile; onBack: () => void }) {
  const [planId,     setPlanId]     = useState<string | null>(null);
  const [planName,   setPlanName]   = useState("Plan Nutricional");
  const [kcalOn,     setKcalOn]     = useState("");
  const [kcalOff,    setKcalOff]    = useState("");
  const [proteinOn,  setProteinOn]  = useState("");
  const [carbsOn,    setCarbsOn]    = useState("");
  const [fatOn,      setFatOn]      = useState("");
  const [proteinOff, setProteinOff] = useState("");
  const [carbsOff,   setCarbsOff]   = useState("");
  const [fatOff,     setFatOff]     = useState("");
  const [notes,      setNotes]      = useState("");
  const [meals,      setMeals]      = useState<DraftMeal[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null);

  useEffect(() => { loadPlan(); }, []);

  // ── Carga plan existente ────────────────────────────────────────
  const loadPlan = async () => {
    setLoading(true);
    const { data: plan } = await supabase
      .from("diet_plans").select("*").eq("client_id", client.id).single();

    if (plan) {
      setPlanId(plan.id);
      setPlanName(plan.name ?? "Plan Nutricional");
      setKcalOn(plan.kcal_on?.toString() ?? "");
      setKcalOff(plan.kcal_off?.toString() ?? "");
      setProteinOn(plan.protein_on?.toString() ?? "");
      setCarbsOn(plan.carbs_on?.toString() ?? "");
      setFatOn(plan.fat_on?.toString() ?? "");
      setProteinOff(plan.protein_off?.toString() ?? "");
      setCarbsOff(plan.carbs_off?.toString() ?? "");
      setFatOff(plan.fat_off?.toString() ?? "");
      setNotes(plan.notes ?? "");

      const { data: mealsData } = await supabase
        .from("diet_meals").select("*, diet_options(*)")
        .eq("plan_id", plan.id).order("sort_order");

      if (mealsData?.length) {
        setMeals(mealsData.map((m: any) => ({
          _id: m.id, name: m.name, emoji: m.emoji ?? "🍽️",
          day_type: m.day_type, expanded: false,
          options: (m.diet_options ?? [])
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((o: any) => ({
              _id: o.id, name: o.name,
              groups: (o.content ?? []).map((g: any) => ({
                _id: uid(),
                label: g.label ?? "",
                slot: (g.slot ?? "extra") as SlotFilter,
                isChoice: g.isChoice ?? true,
                items: (g.items ?? []).map((item: any) => ({
                  _id: uid(),
                  ingId: typeof item === "object" ? (item.ingId ?? "") : "",
                  grams: typeof item === "object" ? (item.grams ?? 100) : 100,
                })),
                note: g.note ?? "",
              })),
            })),
        })));
      }
    }
    setLoading(false);
  };

  // ── Guardar ─────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setSaved(false); setErrorMsg(null);

    const planData = {
      client_id:   client.id,
      name:        planName || "Plan Nutricional",
      kcal_on:     kcalOn    ? parseInt(kcalOn)        : null,
      kcal_off:    kcalOff   ? parseInt(kcalOff)       : null,
      protein_on:  proteinOn ? parseFloat(proteinOn)   : null,
      carbs_on:    carbsOn   ? parseFloat(carbsOn)     : null,
      fat_on:      fatOn     ? parseFloat(fatOn)       : null,
      protein_off: proteinOff ? parseFloat(proteinOff) : null,
      carbs_off:   carbsOff  ? parseFloat(carbsOff)    : null,
      fat_off:     fatOff    ? parseFloat(fatOff)      : null,
      notes:       notes || null,
    };

    let pid = planId;
    if (pid) {
      const { error } = await supabase.from("diet_plans").update(planData).eq("id", pid);
      if (error) { setErrorMsg(`Plan: ${error.message}`); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("diet_plans").insert(planData).select().single();
      if (error || !data) { setErrorMsg(`Plan: ${error?.message}`); setSaving(false); return; }
      pid = data.id; setPlanId(data.id);
    }

    await supabase.from("diet_meals").delete().eq("plan_id", pid);

    for (let mi = 0; mi < meals.length; mi++) {
      const m = meals[mi];
      const { data: mRow, error: me } = await supabase
        .from("diet_meals")
        .insert({ plan_id: pid, name: m.name, emoji: m.emoji, day_type: m.day_type, sort_order: mi })
        .select().single();
      if (me || !mRow) continue;

      for (let oi = 0; oi < m.options.length; oi++) {
        const o = m.options[oi];
        const content = o.groups
          .filter(g => g.items.some(i => i.ingId))
          .map(g => ({
            label:    g.label,
            slot:     g.slot,
            isChoice: g.isChoice,
            items:    g.items.filter(i => i.ingId).map(i => ({ ingId: i.ingId, grams: i.grams })),
            ...(g.note ? { note: g.note } : {}),
          }));
        await supabase.from("diet_options").insert({
          meal_id: mRow.id, name: o.name, content, sort_order: oi,
        });
      }
    }

    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Helpers de mutación ───────────────────────────────────────────
  const updMeal = (id: string, p: Partial<DraftMeal>) =>
    setMeals(ms => ms.map(m => m._id === id ? { ...m, ...p } : m));
  const delMeal = (id: string) => setMeals(ms => ms.filter(m => m._id !== id));
  const moveMeal = (id: string, dir: -1 | 1) =>
    setMeals(ms => {
      const a = [...ms], i = a.findIndex(m => m._id === id), ni = i + dir;
      if (ni < 0 || ni >= a.length) return ms;
      [a[i], a[ni]] = [a[ni], a[i]]; return a;
    });

  const updOpt = (mid: string, oid: string, p: Partial<DraftOption>) =>
    setMeals(ms => ms.map(m => m._id === mid
      ? { ...m, options: m.options.map(o => o._id === oid ? { ...o, ...p } : o) } : m));
  const delOpt = (mid: string, oid: string) =>
    setMeals(ms => ms.map(m => m._id === mid
      ? { ...m, options: m.options.filter(o => o._id !== oid) } : m));
  const addOpt = (mid: string) =>
    setMeals(ms => ms.map(m => m._id === mid
      ? { ...m, options: [...m.options, newOption(m.options.length + 1)] } : m));

  const updGroup = (mid: string, oid: string, gid: string, p: Partial<DraftGroup>) =>
    setMeals(ms => ms.map(m => m._id === mid ? {
      ...m, options: m.options.map(o => o._id === oid ? {
        ...o, groups: o.groups.map(g => g._id === gid ? { ...g, ...p } : g)
      } : o)
    } : m));
  const delGroup = (mid: string, oid: string, gid: string) =>
    setMeals(ms => ms.map(m => m._id === mid ? {
      ...m, options: m.options.map(o => o._id === oid ? {
        ...o, groups: o.groups.filter(g => g._id !== gid)
      } : o)
    } : m));
  const addGroup = (mid: string, oid: string, slot: SlotFilter) =>
    setMeals(ms => ms.map(m => m._id === mid ? {
      ...m, options: m.options.map(o => o._id === oid ? {
        ...o, groups: [...o.groups, newGroup(slot)]
      } : o)
    } : m));

  const updItem = (mid: string, oid: string, gid: string, iid: string, p: Partial<DraftItem>) =>
    setMeals(ms => ms.map(m => m._id === mid ? {
      ...m, options: m.options.map(o => o._id === oid ? {
        ...o, groups: o.groups.map(g => g._id === gid ? {
          ...g, items: g.items.map(i => i._id === iid ? { ...i, ...p } : i)
        } : g)
      } : o)
    } : m));
  const delItem = (mid: string, oid: string, gid: string, iid: string) =>
    setMeals(ms => ms.map(m => m._id === mid ? {
      ...m, options: m.options.map(o => o._id === oid ? {
        ...o, groups: o.groups.map(g => g._id === gid ? {
          ...g, items: g.items.filter(i => i._id !== iid)
        } : g)
      } : o)
    } : m));
  const addItem = (mid: string, oid: string, gid: string) =>
    setMeals(ms => ms.map(m => m._id === mid ? {
      ...m, options: m.options.map(o => o._id === oid ? {
        ...o, groups: o.groups.map(g => g._id === gid ? {
          ...g, items: [...g.items, newItem()]
        } : g)
      } : o)
    } : m));

  if (loading) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <p className="text-neutral-500">Cargando plan…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 pb-28">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={onBack}
          className="w-9 h-9 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 flex items-center justify-center text-lg shrink-0">←</button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-bold text-base">Plan Nutricional</h1>
          <p className="text-neutral-500 text-xs truncate">{client.full_name}</p>
        </div>
        {saved && <span className="text-emerald-400 text-xs font-semibold shrink-0">✅ Guardado</span>}
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* ── INFO DEL PLAN ── */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-800">
            <p className="text-white font-semibold text-sm">ℹ️ Información del plan</p>
          </div>
          <div className="px-4 py-4 space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1 block">Nombre del plan</label>
              <input value={planName} onChange={e => setPlanName(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500" />
            </div>

            {/* Macros ON */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-blue-500 font-semibold mb-2">💪 Día ON</p>
              <div className="grid grid-cols-4 gap-2">
                {([["Kcal",kcalOn,setKcalOn],["Proteína g",proteinOn,setProteinOn],
                   ["Hidratos g",carbsOn,setCarbsOn],["Grasa g",fatOn,setFatOn]] as [string,string,(v:string)=>void][])
                  .map(([lbl,val,set]) => (
                  <div key={lbl}>
                    <label className="text-[10px] text-neutral-500 mb-0.5 block">{lbl}</label>
                    <input type="number" value={val} onChange={e => set(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-700" />
                  </div>
                ))}
              </div>
            </div>

            {/* Macros OFF */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold mb-2">😴 Día OFF</p>
              <div className="grid grid-cols-4 gap-2">
                {([["Kcal",kcalOff,setKcalOff],["Proteína g",proteinOff,setProteinOff],
                   ["Hidratos g",carbsOff,setCarbsOff],["Grasa g",fatOff,setFatOff]] as [string,string,(v:string)=>void][])
                  .map(([lbl,val,set]) => (
                  <div key={lbl}>
                    <label className="text-[10px] text-neutral-500 mb-0.5 block">{lbl}</label>
                    <input type="number" value={val} onChange={e => set(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-indigo-700" />
                  </div>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1 block">Notas generales</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="NEAT, cafeína, hidratación, instrucciones especiales…"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-700 resize-none" />
            </div>
          </div>
        </div>

        {/* ── COMIDAS ── */}
        <div className="flex items-center justify-between">
          <p className="text-neutral-400 text-sm font-semibold">Comidas <span className="text-neutral-600">({meals.length})</span></p>
          <button onClick={() => setMeals(ms => [...ms, newMeal()])}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 text-sm">
            + Añadir comida
          </button>
        </div>

        {meals.map((meal, mi) => (
          <div key={meal._id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">

            {/* Cabecera comida */}
            <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-neutral-800">
              <select value={meal.emoji} onChange={e => updMeal(meal._id, { emoji: e.target.value })}
                className="bg-neutral-800 rounded-lg text-xl px-1.5 py-1 focus:outline-none cursor-pointer border-0">
                {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <input value={meal.name} onChange={e => updMeal(meal._id, { name: e.target.value })}
                placeholder="Nombre (ej: Desayuno)"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-700" />
              <select value={meal.day_type}
                onChange={e => updMeal(meal._id, { day_type: e.target.value as DraftMeal["day_type"] })}
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-neutral-300 text-xs focus:outline-none">
                <option value="both">ON + OFF</option>
                <option value="on">Solo ON</option>
                <option value="off">Solo OFF</option>
              </select>
              <button onClick={() => moveMeal(meal._id, -1)} disabled={mi === 0}
                className="w-7 h-7 rounded bg-neutral-800 text-neutral-400 disabled:opacity-25 hover:bg-neutral-700 flex items-center justify-center text-sm">↑</button>
              <button onClick={() => moveMeal(meal._id, 1)} disabled={mi === meals.length - 1}
                className="w-7 h-7 rounded bg-neutral-800 text-neutral-400 disabled:opacity-25 hover:bg-neutral-700 flex items-center justify-center text-sm">↓</button>
              <button onClick={() => updMeal(meal._id, { expanded: !meal.expanded })}
                className="w-7 h-7 rounded bg-neutral-800 text-neutral-400 hover:bg-neutral-700 flex items-center justify-center text-sm">
                {meal.expanded ? "▾" : "▸"}
              </button>
              <button onClick={() => delMeal(meal._id)}
                className="w-7 h-7 rounded bg-red-900/30 text-red-400 hover:bg-red-900/60 flex items-center justify-center text-sm">✕</button>
            </div>

            {meal.expanded && (
              <div className="p-3 space-y-3">
                {meal.options.map((opt, oi) => (
                  <div key={opt._id} className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-3 space-y-3">

                    {/* Cabecera opción */}
                    <div className="flex items-center gap-2">
                      <input value={opt.name} onChange={e => updOpt(meal._id, opt._id, { name: e.target.value })}
                        placeholder="Nombre opción"
                        className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-white text-sm font-semibold focus:outline-none focus:border-neutral-500" />
                      {meal.options.length > 1 && (
                        <button onClick={() => delOpt(meal._id, opt._id)}
                          className="w-7 h-7 rounded bg-red-900/30 text-red-400 hover:bg-red-900/60 flex items-center justify-center text-sm">✕</button>
                      )}
                    </div>

                    {/* Grupos de alimentos */}
                    {opt.groups.map(g => (
                      <div key={g._id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-2">

                        {/* Fila de configuración del grupo */}
                        <div className="flex gap-2 items-center flex-wrap">
                          {/* Slot selector */}
                          <select value={g.slot}
                            onChange={e => updGroup(meal._id, opt._id, g._id, {
                              slot: e.target.value as SlotFilter,
                              label: SLOT_LABELS[e.target.value as SlotFilter] || g.label,
                            })}
                            className="bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-neutral-300 focus:outline-none">
                            <option value="proteina">🔴 Proteína</option>
                            <option value="hidrato">🟡 Hidratos</option>
                            <option value="grasa">🔵 Grasa</option>
                            <option value="extra">⚪ Resto</option>
                          </select>
                          {/* Etiqueta personalizada */}
                          <input value={g.label}
                            onChange={e => updGroup(meal._id, opt._id, g._id, { label: e.target.value })}
                            placeholder="Etiqueta (opcional)"
                            className="flex-1 min-w-0 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-neutral-500 placeholder-neutral-700" />
                          {/* Elige uno / Obligatorio */}
                          <button
                            onClick={() => updGroup(meal._id, opt._id, g._id, { isChoice: !g.isChoice })}
                            className={"px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors " +
                              (g.isChoice
                                ? "bg-blue-700/50 text-blue-300 border border-blue-700"
                                : "bg-emerald-800/50 text-emerald-300 border border-emerald-800")}>
                            {g.isChoice ? "Elige uno" : "Obligatorio"}
                          </button>
                          <button onClick={() => delGroup(meal._id, opt._id, g._id)}
                            className="w-7 h-7 rounded bg-red-900/30 text-red-400 hover:bg-red-900/60 flex items-center justify-center text-xs">✕</button>
                        </div>

                        {/* Items de ingrediente */}
                        <div className="space-y-1.5">
                          {g.items.map(item => {
                            const ing = INGREDIENTS.find(i => i.id === item.ingId);
                            return (
                              <div key={item._id} className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <IngSelect slot={g.slot} value={item.ingId}
                                    onChange={v => updItem(meal._id, opt._id, g._id, item._id, { ingId: v })} />
                                  <input type="number" min="1" max="2000" value={item.grams}
                                    onChange={e => updItem(meal._id, opt._id, g._id, item._id, { grams: parseFloat(e.target.value) || 0 })}
                                    className="w-16 shrink-0 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-white text-xs text-center focus:outline-none focus:border-neutral-500" />
                                  <span className="text-neutral-600 text-xs shrink-0">g</span>
                                  {g.items.length > 1 && (
                                    <button onClick={() => delItem(meal._id, opt._id, g._id, item._id)}
                                      className="w-6 h-6 rounded text-neutral-600 hover:text-red-400 flex items-center justify-center text-xs">✕</button>
                                  )}
                                </div>
                                {/* Macros del ítem seleccionado */}
                                {ing && item.grams > 0 && (
                                  <p className="text-[10px] text-neutral-600 pl-1 tabular-nums">
                                    {((ing.kcal * item.grams) / 100).toFixed(0)} kcal ·{" "}
                                    {((ing.protein * item.grams) / 100).toFixed(1)}g P ·{" "}
                                    {((ing.carbs * item.grams) / 100).toFixed(1)}g H ·{" "}
                                    {((ing.fat * item.grams) / 100).toFixed(1)}g G
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Añadir alimento al grupo */}
                        <button onClick={() => addItem(meal._id, opt._id, g._id)}
                          className="w-full py-1.5 rounded-lg border border-dashed border-neutral-700 text-neutral-600 hover:text-neutral-400 hover:border-neutral-600 text-xs transition-colors">
                          + Añadir alimento
                        </button>

                        {/* Nota del grupo */}
                        <input value={g.note}
                          onChange={e => updGroup(meal._id, opt._id, g._id, { note: e.target.value })}
                          placeholder="Nota opcional (ej: Si comes pan, añade tomate rallado)"
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1 text-neutral-400 text-xs focus:outline-none focus:border-neutral-500 placeholder-neutral-700" />
                      </div>
                    ))}

                    {/* Añadir grupo */}
                    <div className="flex gap-2 flex-wrap">
                      {(["proteina","hidrato","grasa","extra"] as SlotFilter[]).map(s => (
                        <button key={s} onClick={() => addGroup(meal._id, opt._id, s)}
                          className="px-2.5 py-1.5 rounded-lg border border-dashed border-neutral-700 text-neutral-500 hover:text-neutral-300 hover:border-neutral-600 text-xs transition-colors">
                          + {SLOT_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button onClick={() => addOpt(meal._id)}
                  className="w-full py-2 rounded-xl border border-dashed border-neutral-700 text-neutral-500 hover:text-neutral-300 hover:border-neutral-600 text-sm transition-colors">
                  + Añadir opción
                </button>
              </div>
            )}
          </div>
        ))}

        {errorMsg && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-3">
            <p className="text-red-400 text-xs font-mono">{errorMsg}</p>
          </div>
        )}

      </div>

      {/* Botón guardar */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-950 border-t border-neutral-800 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={handleSave} disabled={saving || saved}
            className="w-full py-4 rounded-xl bg-white text-black text-sm font-bold hover:bg-neutral-200 disabled:opacity-40 transition-colors">
            {saving ? "Guardando plan…" : saved ? "✅ Plan guardado" : "💾 Guardar plan nutricional"}
          </button>
        </div>
      </div>
    </div>
  );
}
