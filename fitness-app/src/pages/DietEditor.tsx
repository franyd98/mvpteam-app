// DietEditor — editor standalone de planes de dieta.
// Recibe planId (null = nuevo plan) y onBack.
// No está atado a ningún cliente.

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  INGREDIENTS, CATEGORY_LABELS, bySlot,
  type IngCategory, type MainSlot,
} from "../data/ingredients";

// ── Tipos internos ────────────────────────────────────────────
type SlotFilter = "proteina" | "hidrato" | "grasa" | "verdura" | "extra";

type DraftItem = { _id: string; ingId: string; grams: number };
type DraftGroup = { _id: string; label: string; slot: SlotFilter; isChoice: boolean; items: DraftItem[]; note: string };
type DraftOption = { _id: string; name: string; groups: DraftGroup[] };
type DraftMeal   = { _id: string; name: string; emoji: string; day_type: "on"|"off"|"both"; options: DraftOption[]; expanded: boolean };

type PlanMeta = {
  name: string;
  kcal_on: number; kcal_off: number;
  protein_on: number; protein_off: number;
  carbs_on: number; carbs_off: number;
  fat_on: number; fat_off: number;
  notes: string;
};

// ── Helpers ───────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);

/** Infiere el slot correcto a partir de la categoría del primer ingrediente válido.
 *  Se usa al cargar planes cuyo contenido no almacena el campo `slot`. */
function detectSlotFromItems(rawItems: any[]): SlotFilter {
  for (const it of rawItems) {
    if (typeof it !== "object" || !it.ingId) continue;
    const ing = INGREDIENTS.find(i => i.id === it.ingId);
    if (!ing) continue;
    if (["lean_protein", "fatty_protein", "veggie_protein"].includes(ing.category)) return "proteina";
    if (["clean_carb", "fatty_carb", "protein_carb", "fruit"].includes(ing.category)) return "hidrato";
    if (["fat", "veggie_fat"].includes(ing.category)) return "grasa";
    if (ing.category === "veggie") return "verdura";
  }
  return "extra";
}
const EMOJIS = ["🍳","☕","🥗","🍽️","🥩","🥙","🥪","🍜","🥦","🍎","🥤","🍱","🧀","🥚","🍞"];

const newItem   = (): DraftItem  => ({ _id: uid(), ingId: "", grams: 100 });
const newGroup  = (slot: SlotFilter = "proteina"): DraftGroup => ({
  _id: uid(), slot, isChoice: true, items: [newItem()], note: "",
  label: slot === "proteina" ? "Proteína" : slot === "hidrato" ? "Hidratos" : slot === "grasa" ? "Grasa" : slot === "verdura" ? "Verdura" : "",
});
const newOption = (n = 1): DraftOption =>
  ({ _id: uid(), name: `Opción ${n}`, groups: [newGroup("proteina"), newGroup("hidrato"), newGroup("grasa")] });
const newMeal   = (): DraftMeal =>
  ({ _id: uid(), name: "", emoji: "🍽️", day_type: "both", options: [newOption(1)], expanded: true });

const SLOT_LABELS: Record<SlotFilter, string> = { proteina: "Proteína", hidrato: "Hidratos", grasa: "Grasa", verdura: "Verdura", extra: "" };
const SLOT_COLORS: Record<SlotFilter, string> = { proteina: "#DC2626", hidrato: "#D97706", grasa: "#2563EB", verdura: "#16A34A", extra: "#6B7280" };
const SLOT_ICONS:  Record<SlotFilter, string> = { proteina: "🔴", hidrato: "🟡", grasa: "🔵", verdura: "🥦", extra: "⚪" };

const emptyMeta = (): PlanMeta => ({
  name: "", kcal_on: 2000, kcal_off: 1800,
  protein_on: 160, protein_off: 140,
  carbs_on: 200, carbs_off: 150,
  fat_on: 60, fat_off: 55, notes: "",
});

// ── IngSelect ─────────────────────────────────────────────────
function IngSelect({
  value, onChange, slot, allIngredients,
}: {
  value: string;
  onChange: (v: string) => void;
  slot: SlotFilter;
  allIngredients: import("../data/ingredients").Ingredient[];
}) {
  const slotCategories: Record<SlotFilter, import("../data/ingredients").IngredientCategory[]> = {
    proteina: ["lean_protein", "fatty_protein", "veggie_protein"],
    hidrato:  ["clean_carb", "fatty_carb", "protein_carb", "fruit"],
    grasa:    ["fat", "veggie_fat"],
    verdura:  ["veggie"],
    extra:    ["lean_protein", "fatty_protein", "veggie_protein", "protein_carb", "clean_carb", "fatty_carb", "fruit", "fat", "veggie_fat", "veggie"],
  };
  const cats = slotCategories[slot];
  let filtered = allIngredients.filter(i => cats.includes(i.category as import("../data/ingredients").IngredientCategory));
  // Si el valor actual existe en INGREDIENTS pero no en la lista filtrada (slot incorrecto),
  // expandimos a "extra" para que el ingrediente aparezca seleccionado.
  if (value && !filtered.find(i => i.id === value) && allIngredients.find(i => i.id === value)) {
    filtered = allIngredients.filter(i =>
      slotCategories["extra"].includes(i.category as import("../data/ingredients").IngredientCategory)
    );
  }
  const grouped  = filtered.reduce<Record<string, typeof filtered>>((acc, ing) => {
    if (!acc[ing.category]) acc[ing.category] = [];
    acc[ing.category].push(ing);
    return acc;
  }, {});
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="flex-1 text-sm rounded-lg px-2 py-1.5 text-white focus:outline-none"
      style={{ background: "#1A1A1A", border: "1px solid #333" }}
    >
      <option value="">— Elige alimento —</option>
      {Object.entries(grouped).map(([cat, ings]) => (
        <optgroup key={cat} label={CATEGORY_LABELS[cat as IngCategory] ?? cat}>
          {ings.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </optgroup>
      ))}
    </select>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function DietEditor({ planId, onBack }: { planId: string | null; onBack: () => void }) {
  const [meta, setMeta]   = useState<PlanMeta>(emptyMeta());
  const [meals, setMeals] = useState<DraftMeal[]>([newMeal()]);
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(!!planId);
  const [toast, setToast]     = useState<string | null>(null);
  const [showMeta, setShowMeta] = useState(true);
  const [allIngredients, setAllIngredients] = useState(INGREDIENTS);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // ── Cargar custom_ingredients y fusionar con la lista base ────
  useEffect(() => {
    supabase.from("custom_ingredients").select("*").then(({ data }) => {
      if (data && data.length > 0) {
        const custom = data.map((r: { id: string; name: string; category: string; kcal: number; protein: number; carbs: number; fat: number }) => ({
          id: `custom_${r.id}`,
          name: r.name,
          category: r.category as import("../data/ingredients").IngredientCategory,
          kcal: r.kcal, protein: r.protein, carbs: r.carbs, fat: r.fat,
        }));
        setAllIngredients([...INGREDIENTS, ...custom]);
      }
    });
  }, []);

  // ── Cargar plan existente ─────────────────────────────────
  useEffect(() => {
    if (!planId) return;
    (async () => {
      const { data: plan } = await supabase.from("diet_plans").select("*").eq("id", planId).single();
      if (plan) setMeta({
        name: plan.name ?? "",
        kcal_on: plan.kcal_on ?? 2000, kcal_off: plan.kcal_off ?? 1800,
        protein_on: plan.protein_on ?? 160, protein_off: plan.protein_off ?? 140,
        carbs_on: plan.carbs_on ?? 200, carbs_off: plan.carbs_off ?? 150,
        fat_on: plan.fat_on ?? 60, fat_off: plan.fat_off ?? 55,
        notes: plan.notes ?? "",
      });

      const { data: mealsData } = await supabase.from("diet_meals").select("*").eq("plan_id", planId).order("sort_order");
      if (!mealsData?.length) { setLoading(false); return; }

      const draftMeals: DraftMeal[] = await Promise.all(mealsData.map(async (m) => {
        const { data: opts } = await supabase.from("diet_options").select("*").eq("meal_id", m.id).order("sort_order");
        return {
          _id: m.id, name: m.name, emoji: m.emoji ?? "🍽️", day_type: m.day_type ?? "both", expanded: false,
          options: (opts ?? []).map((o) => ({
            _id: o.id, name: o.name,
            groups: (o.content ?? []).map((g: any) => {
              const rawItems = g.items ?? [];
              const slot: SlotFilter = (g.slot as SlotFilter) ?? detectSlotFromItems(rawItems);
              return {
                _id: uid(), label: g.label ?? "", slot,
                isChoice: g.isChoice ?? true, note: g.note ?? "",
                items: rawItems.map((it: any) =>
                  typeof it === "string"
                    ? { _id: uid(), ingId: "", grams: 100 }
                    : { _id: uid(), ingId: it.ingId ?? "", grams: it.grams ?? 100 }
                ),
              };
            }),
          })),
        };
      }));
      setMeals(draftMeals);
      setLoading(false);
    })();
  }, [planId]);

  // ── Guardar ───────────────────────────────────────────────
  const handleSave = async () => {
    if (!meta.name.trim()) { showToast("⚠️ El plan necesita un nombre"); return; }
    setSaving(true);
    try {
      let pid = planId;
      if (!pid) {
        const { data, error } = await supabase.from("diet_plans").insert({
          name: meta.name.trim(), kcal_on: meta.kcal_on, kcal_off: meta.kcal_off,
          protein_on: meta.protein_on, protein_off: meta.protein_off,
          carbs_on: meta.carbs_on, carbs_off: meta.carbs_off,
          fat_on: meta.fat_on, fat_off: meta.fat_off, notes: meta.notes,
        }).select("id").single();
        if (error || !data) throw error;
        pid = data.id;
      } else {
        await supabase.from("diet_plans").update({
          name: meta.name.trim(), kcal_on: meta.kcal_on, kcal_off: meta.kcal_off,
          protein_on: meta.protein_on, protein_off: meta.protein_off,
          carbs_on: meta.carbs_on, carbs_off: meta.carbs_off,
          fat_on: meta.fat_on, fat_off: meta.fat_off, notes: meta.notes,
        }).eq("id", pid);
        await supabase.from("diet_meals").delete().eq("plan_id", pid);
      }

      for (let i = 0; i < meals.length; i++) {
        const m = meals[i];
        const { data: mRow, error: mErr } = await supabase.from("diet_meals").insert({
          plan_id: pid, name: m.name || "Comida", emoji: m.emoji, day_type: m.day_type, sort_order: i,
        }).select("id").single();
        if (mErr || !mRow) throw mErr;
        for (let j = 0; j < m.options.length; j++) {
          const o = m.options[j];
          const content = o.groups.map(g => ({
            label: g.label, slot: g.slot, isChoice: g.isChoice, note: g.note,
            items: g.items.filter(it => it.ingId).map(it => ({ ingId: it.ingId, grams: it.grams })),
          }));
          await supabase.from("diet_options").insert({ meal_id: mRow.id, name: o.name, content, sort_order: j });
        }
      }
      showToast("✅ Plan guardado");
      setTimeout(() => onBack(), 1200);
    } catch (e: any) {
      showToast(`❌ Error: ${e?.message ?? "desconocido"}`);
    }
    setSaving(false);
  };

  // ── Helpers de edición ────────────────────────────────────
  const updMeal = (id: string, patch: Partial<DraftMeal>) =>
    setMeals(ms => ms.map(m => m._id === id ? { ...m, ...patch } : m));

  const duplicateMeal = (meal: DraftMeal) => {
    const deepClone = (m: DraftMeal): DraftMeal => ({
      ...m,
      _id: uid(),
      name: m.name ? `${m.name} (copia)` : "",
      expanded: true,
      options: m.options.map(opt => ({
        ...opt,
        _id: uid(),
        groups: opt.groups.map(grp => ({
          ...grp,
          _id: uid(),
          items: grp.items.map(it => ({ ...it, _id: uid() })),
        })),
      })),
    });
    setMeals(ms => {
      const idx = ms.findIndex(m => m._id === meal._id);
      const copy = deepClone(meal);
      const next = [...ms];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };
  const updOpt = (mId: string, oId: string, patch: Partial<DraftOption>) =>
    setMeals(ms => ms.map(m => m._id === mId ? { ...m, options: m.options.map(o => o._id === oId ? { ...o, ...patch } : o) } : m));
  const updGroup = (mId: string, oId: string, gId: string, patch: Partial<DraftGroup>) =>
    updOpt(mId, oId, { groups: meals.find(m => m._id === mId)!.options.find(o => o._id === oId)!.groups.map(g => g._id === gId ? { ...g, ...patch } : g) } as any);
  const updItem = (mId: string, oId: string, gId: string, itId: string, patch: Partial<DraftItem>) => {
    const meal = meals.find(m => m._id === mId)!;
    const opt  = meal.options.find(o => o._id === oId)!;
    const grp  = opt.groups.find(g => g._id === gId)!;
    updGroup(mId, oId, gId, { items: grp.items.map(it => it._id === itId ? { ...it, ...patch } : it) });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
      <p className="text-neutral-500 text-sm">Cargando plan...</p>
    </div>
  );

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(160deg,#0A0A0A 80%,#1A0810 100%)" }}>
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg whitespace-nowrap"
          style={{ background: "#1A1A1A", border: "1px solid #333" }}>{toast}</div>
      )}

      {/* Header */}
      <header className="px-4 py-3 flex items-center gap-3 sticky top-0 z-10"
        style={{ background: "#0F0F0F", borderBottom: "1px solid #8B1A2F40" }}>
        <button onClick={onBack}
          className="w-9 h-9 rounded-lg text-neutral-300 flex items-center justify-center shrink-0"
          style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>←</button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{meta.name || "Nuevo plan de dieta"}</p>
          <p className="text-neutral-500 text-xs">{planId ? "Editando plan" : "Nuevo plan"}</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-2 rounded-lg text-white text-sm font-bold disabled:opacity-40"
          style={{ background: "#8B1A2F" }}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* ── Metadatos del plan ── */}
        <div className="rounded-xl overflow-hidden" style={{ background: "#111", border: "1px solid #222" }}>
          <button onClick={() => setShowMeta(v => !v)}
            className="w-full px-4 py-3 flex items-center justify-between text-left">
            <span className="text-white font-semibold text-sm">📋 Datos del plan</span>
            <span className="text-neutral-500 text-xs">{showMeta ? "▲" : "▼"}</span>
          </button>
          {showMeta && (
            <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: "#222" }}>
              <div className="pt-3">
                <label className="text-xs uppercase tracking-wider text-neutral-500 mb-1.5 block">Nombre del plan *</label>
                <input value={meta.name} onChange={e => setMeta(v => ({ ...v, name: e.target.value }))}
                  placeholder="Ej: Volumen moderado, Definición verano..."
                  className="w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  style={{ background: "#1A1A1A", border: "1px solid #333" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Kcal día ON", "kcal_on"], ["Kcal día OFF", "kcal_off"],
                  ["Proteína ON (g)", "protein_on"], ["Proteína OFF (g)", "protein_off"],
                  ["HC ON (g)", "carbs_on"], ["HC OFF (g)", "carbs_off"],
                  ["Grasa ON (g)", "fat_on"], ["Grasa OFF (g)", "fat_off"],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1 block">{label}</label>
                    <input type="number" value={(meta as any)[key]}
                      onFocus={e => e.target.select()}
                      onChange={e => setMeta(v => ({ ...v, [key]: e.target.value === "" ? 0 : Number(e.target.value) }))}
                      className="w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                      style={{ background: "#1A1A1A", border: "1px solid #333" }} />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-neutral-500 mb-1.5 block">Notas</label>
                <textarea value={meta.notes} onChange={e => setMeta(v => ({ ...v, notes: e.target.value }))}
                  rows={2} placeholder="Indicaciones generales..."
                  className="w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none resize-none"
                  style={{ background: "#1A1A1A", border: "1px solid #333" }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Comidas ── */}
        <p className="text-xs uppercase tracking-wider text-neutral-500 px-1">Comidas del plan</p>

        {meals.map((meal, mIdx) => (
          <div key={meal._id} className="rounded-xl overflow-hidden" style={{ background: "#111", border: "1px solid #222" }}>
            {/* Cabecera comida */}
            <div className="px-4 py-3 flex items-center gap-2">
              <select value={meal.emoji} onChange={e => updMeal(meal._id, { emoji: e.target.value })}
                className="text-lg bg-transparent border-none outline-none cursor-pointer">
                {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <input value={meal.name} onChange={e => updMeal(meal._id, { name: e.target.value })}
                placeholder={`Comida ${mIdx + 1}`}
                className="flex-1 bg-transparent text-white text-sm font-semibold focus:outline-none border-b border-transparent hover:border-neutral-600 focus:border-neutral-400 transition-colors" />
              <select value={meal.day_type} onChange={e => updMeal(meal._id, { day_type: e.target.value as any })}
                className="text-xs rounded-lg px-2 py-1 text-neutral-300"
                style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
                <option value="both">ON + OFF</option>
                <option value="on">Solo ON</option>
                <option value="off">Solo OFF</option>
              </select>
              <button onClick={() => updMeal(meal._id, { expanded: !meal.expanded })}
                className="text-neutral-500 text-xs px-2">{meal.expanded ? "▲" : "▼"}</button>
              <button onClick={() => duplicateMeal(meal)}
                className="text-neutral-500 hover:text-yellow-400 text-sm" title="Duplicar comida">⧉</button>
              <button onClick={() => setMeals(ms => ms.filter(m => m._id !== meal._id))}
                className="text-neutral-600 hover:text-red-400 text-sm">✕</button>
            </div>

            {meal.expanded && (
              <div className="px-4 pb-4 space-y-4 border-t" style={{ borderColor: "#1A1A1A" }}>
                {meal.options.map((opt, oIdx) => (
                  <div key={opt._id} className="rounded-lg p-3 space-y-3"
                    style={{ background: "#0A0A0A", border: "1px solid #1E1E1E" }}>
                    <div className="flex items-center gap-2">
                      <input value={opt.name} onChange={e => updOpt(meal._id, opt._id, { name: e.target.value })}
                        placeholder={`Opción ${oIdx + 1}`}
                        className="flex-1 bg-transparent text-white text-sm font-medium focus:outline-none" />
                      <button onClick={() => updOpt(meal._id, opt._id, { groups: [...opt.groups, newGroup("proteina")] })}
                        className="text-xs px-2 py-1 rounded text-red-400" style={{ background: "#1A0A0A" }}>🔴+</button>
                      <button onClick={() => updOpt(meal._id, opt._id, { groups: [...opt.groups, newGroup("hidrato")] })}
                        className="text-xs px-2 py-1 rounded text-yellow-400" style={{ background: "#1A1500" }}>🟡+</button>
                      <button onClick={() => updOpt(meal._id, opt._id, { groups: [...opt.groups, newGroup("grasa")] })}
                        className="text-xs px-2 py-1 rounded text-blue-400" style={{ background: "#0A0A1A" }}>🔵+</button>
                      <button onClick={() => updOpt(meal._id, opt._id, { groups: [...opt.groups, newGroup("verdura")] })}
                        className="text-xs px-2 py-1 rounded text-green-400" style={{ background: "#0A1A0A" }}>🥦+</button>
                      <button onClick={() => updOpt(meal._id, opt._id, { groups: [...opt.groups, newGroup("extra")] })}
                        className="text-xs px-2 py-1 rounded text-neutral-400" style={{ background: "#1A1A1A" }}>⚪+</button>
                      {meal.options.length > 1 && (
                        <button onClick={() => updMeal(meal._id, { options: meal.options.filter(o => o._id !== opt._id) })}
                          className="text-neutral-600 hover:text-red-400 text-xs">✕</button>
                      )}
                    </div>

                    {opt.groups.map(grp => (
                      <div key={grp._id} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: SLOT_COLORS[grp.slot] }}>
                            {SLOT_ICONS[grp.slot]} {SLOT_LABELS[grp.slot]}
                          </span>
                          <input value={grp.label}
                            onChange={e => updGroup(meal._id, opt._id, grp._id, { label: e.target.value })}
                            placeholder="Etiqueta (opcional)"
                            className="flex-1 bg-transparent text-neutral-400 text-xs focus:outline-none" />
                          <button onClick={() => updOpt(meal._id, opt._id, { groups: opt.groups.filter(g => g._id !== grp._id) })}
                            className="text-neutral-700 hover:text-red-400 text-xs">✕</button>
                        </div>
                        {grp.items.map(item => (
                          <div key={item._id} className="flex items-center gap-2">
                            <IngSelect value={item.ingId} slot={grp.slot} allIngredients={allIngredients}
                              onChange={v => updItem(meal._id, opt._id, grp._id, item._id, { ingId: v })} />
                            <input type="number" value={item.grams}
                              onFocus={e => e.target.select()}
                              onChange={e => updItem(meal._id, opt._id, grp._id, item._id, { grams: e.target.value === "" ? 0 : Number(e.target.value) })}
                              className="w-16 text-xs text-center rounded-lg px-2 py-1.5 text-white focus:outline-none"
                              style={{ background: "#1A1A1A", border: "1px solid #333" }} />
                            <span className="text-neutral-600 text-xs shrink-0">g</span>
                            {grp.items.length > 1 && (
                              <button onClick={() => updGroup(meal._id, opt._id, grp._id, { items: grp.items.filter(i => i._id !== item._id) })}
                                className="text-neutral-700 hover:text-red-400 text-xs">✕</button>
                            )}
                          </div>
                        ))}
                        <button onClick={() => updGroup(meal._id, opt._id, grp._id, { items: [...grp.items, newItem()] })}
                          className="text-xs text-neutral-600 hover:text-neutral-400">+ Añadir alimento</button>
                      </div>
                    ))}
                  </div>
                ))}

                <button onClick={() => updMeal(meal._id, { options: [...meal.options, newOption(meal.options.length + 1)] })}
                  className="w-full py-2 rounded-lg text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                  style={{ border: "1px dashed #2A2A2A" }}>
                  + Añadir opción a esta comida
                </button>
              </div>
            )}
          </div>
        ))}

        <button onClick={() => setMeals(ms => [...ms, newMeal()])}
          className="w-full py-3 rounded-xl text-sm text-neutral-400 hover:text-white transition-colors"
          style={{ border: "1px dashed #2A2A2A" }}>
          + Añadir comida
        </button>
      </div>
    </div>
  );
}
