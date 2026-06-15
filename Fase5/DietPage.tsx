// DietPage.tsx v4 — vista cliente
// ─────────────────────────────────────────────────────────────────────────────
// 3 pestañas en orden: "📊 Mis Macros" | "🎲 Generada" | "📋 Mi Plan"
// Generada: DietGenerator en modo cliente (plan automático por macros)
// Mi Plan: plan del entrenador con flechas ‹ A › para cambiar opción + ✓ Guardar
// La selección de opción se persiste en localStorage
// Lista de la compra en Supabase

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  INGREDIENTS, CATEGORY_LABELS,
  type Ingredient, type IngredientCategory,
} from "../data/ingredients";
import MacroCalculator from "../components/MacroCalculator";
import DietGenerator from "../components/DietGenerator";
import FoodSearchModal from "../components/FoodSearchModal";

// ── Inyección de ingredientes personalizados ──────────────────────────────────
let _customLoaded = false;
const injectCustomIngredients = (rows: Ingredient[]) => {
  rows.forEach(r => {
    if (!INGREDIENTS.find(i => i.id === r.id)) INGREDIENTS.push(r);
  });
};

const ingName = (id: string) =>
  INGREDIENTS.find(i => i.id === id)?.name ??
  id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Profile  = { id: string; full_name: string; role: string };
type DayType  = "on" | "off";
type DietTab  = "macros" | "generate" | "plan";

type FoodItem  = string | { ingId: string; grams: number };
type FoodGroup = { label: string; isChoice: boolean; items: FoodItem[]; note?: string };
type AdminOption = { id: string; name: string; content: FoodGroup[] };
type DietMeal    = {
  id: string; name: string; emoji: string;
  day_type: "on" | "off" | "both";
  sort_order: number;
  options: AdminOption[];
};
type DietPlan = {
  name: string; notes: string | null;
  kcal_on: number|null; kcal_off: number|null;
  protein_on: number|null; carbs_on: number|null; fat_on: number|null;
  protein_off: number|null; carbs_off: number|null; fat_off: number|null;
};

// ── ShopBtn ───────────────────────────────────────────────────────────────────
function ShopBtn({ onClick }: { onClick: () => void }) {
  const [added, setAdded] = useState(false);
  return (
    <button
      onClick={() => { onClick(); setAdded(true); setTimeout(() => setAdded(false), 1500); }}
      className={`w-7 h-7 rounded-lg text-sm shrink-0 flex items-center justify-center transition-all duration-200
        ${added ? "bg-green-900 text-green-400 scale-110" : "bg-neutral-800 text-neutral-500 active:text-white"}`}
      title="Añadir a la lista de la compra">
      {added ? "✓" : "🛒"}
    </button>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
const OPT_LABELS = ["A", "B", "C", "D"];

export default function DietPage({ profile, onBack }: { profile: Profile; onBack: () => void }) {
  const OPTS_KEY = `mvp_plan_opts_${profile.id}`;

  const [dietTab, setDietTab] = useState<DietTab>("macros");
  const [plan,    setPlan]    = useState<DietPlan | null>(null);
  const [meals,   setMeals]   = useState<DietMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayType, setDayType] = useState<DayType>("on");

  // ── Lista de la compra (Supabase) ─────────────────────────────────────────
  const [shopItems,    setShopItems]    = useState<Record<string, { name: string; grams: number; category: string }>>({});
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showShopList, setShowShopList] = useState(false);
  const [showFoodSearch,    setShowFoodSearch]    = useState(false);
  const [foodSearchFromCart, setFoodSearchFromCart] = useState(false);

  // ── Selección de opción por comida (localStorage) ─────────────────────────
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem(OPTS_KEY) ?? "{}"); } catch { return {}; }
  });
  const [pendingSave, setPendingSave] = useState<Set<string>>(new Set());

  const [toast, setToast]   = useState<string | null>(null);
  const [, setIngTick]      = useState(0);

  useEffect(() => {
    loadDiet();
    loadShopList();
    loadCustomIngredients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // ── Carga de datos ────────────────────────────────────────────────────────
  const loadCustomIngredients = async () => {
    if (_customLoaded) return;
    const { data } = await supabase.from("custom_ingredients").select("*");
    if (data?.length) {
      injectCustomIngredients(data.map((r: any) => ({
        id: r.id, name: r.name,
        category: r.category as IngredientCategory,
        kcal: Number(r.kcal), protein: Number(r.protein),
        carbs: Number(r.carbs), fat: Number(r.fat),
      })));
      _customLoaded = true;
      setIngTick(t => t + 1);
    }
  };

  const loadDiet = async () => {
    setLoading(true);
    const { data: assignments } = await supabase
      .from("diet_assignments")
      .select("plan_id, source")
      .eq("client_id", profile.id)
      .eq("active", true);

    const trainerAsgn = assignments?.find(a => (a.source ?? "trainer") === "trainer");
    if (trainerAsgn) {
      const { data: planData } = await supabase
        .from("diet_plans").select("*").eq("id", trainerAsgn.plan_id).single();
      if (planData) {
        setPlan(planData);
        const { data: mealsData } = await supabase
          .from("diet_meals").select("*, diet_options(*)")
          .eq("plan_id", planData.id).order("sort_order");
        if (mealsData) {
          setMeals(mealsData.map((m: any) => ({
            ...m,
            options: (m.diet_options ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order),
          })));
        }
      }
    }
    setLoading(false);
  };

  const loadShopList = async () => {
    const { data } = await supabase
      .from("shop_list_items")
      .select("item_key, name, category, checked")
      .eq("client_id", profile.id);
    if (data) {
      const map: Record<string, { name: string; grams: number; category: string }> = {};
      const checked = new Set<string>();
      data.forEach((r: any) => {
        map[r.item_key] = { name: r.name, grams: 0, category: r.category };
        if (r.checked) checked.add(r.item_key);
      });
      setShopItems(map);
      setCheckedItems(checked);
    }
  };

  const addShopItem = async (key: string, item: { name: string; grams: number; category: string }) => {
    setShopItems(prev => ({ ...prev, [key]: item }));
    await supabase.from("shop_list_items").upsert({
      client_id: profile.id, item_key: key, name: item.name, category: item.category, checked: false,
    }, { onConflict: "client_id,item_key" });
  };

  const removeShopItem = async (key: string) => {
    setShopItems(prev => { const n = { ...prev }; delete n[key]; return n; });
    setCheckedItems(prev => { const s = new Set(prev); s.delete(key); return s; });
    await supabase.from("shop_list_items").delete()
      .eq("client_id", profile.id).eq("item_key", key);
  };

  const toggleShopChecked = async (key: string, val: boolean) => {
    setCheckedItems(prev => {
      const s = new Set(prev);
      val ? s.add(key) : s.delete(key);
      return s;
    });
    await supabase.from("shop_list_items").update({ checked: val })
      .eq("client_id", profile.id).eq("item_key", key);
  };

  const clearShopList = async () => {
    setShopItems({});
    setCheckedItems(new Set());
    await supabase.from("shop_list_items").delete().eq("client_id", profile.id);
  };

  const addToShop = (ingId: string, grams: number) => {
    const ing = INGREDIENTS.find(i => i.id === ingId);
    if (!ing) return;
    const existing = shopItems[ingId];
    addShopItem(ingId, {
      name: ing.name,
      grams: existing ? existing.grams + grams : grams,
      category: CATEGORY_LABELS[ing.category] ?? "Otros",
    });
  };

  // ── Navegación de opciones ────────────────────────────────────────────────
  const changeOption = (mealId: string, dir: 1 | -1, total: number) => {
    setSelectedOptions(prev => {
      const curr = prev[mealId] ?? 0;
      return { ...prev, [mealId]: (curr + dir + total) % total };
    });
    setPendingSave(prev => new Set(prev).add(mealId));
  };

  const saveOptionForMeal = (mealId: string, current: Record<string, number>) => {
    try { localStorage.setItem(OPTS_KEY, JSON.stringify(current)); } catch {}
    setPendingSave(prev => { const s = new Set(prev); s.delete(mealId); return s; });
    showToast("✅ Opción guardada");
  };

  const filteredMeals = meals.filter(m => m.day_type === "both" || m.day_type === dayType);
  const shopCount = Object.keys(shopItems).length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full" style={{ background: "#0A0A0A" }}>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg pointer-events-none"
          style={{ background: "#1A1A1A", border: "1px solid #333" }}>
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <header className="header-safe shrink-0 px-4 pb-0"
        style={{ background: "#0F0F0F", borderBottom: "1px solid #1E1E1E" }}>
        <div className="flex items-center gap-3 pb-3">
          <button onClick={onBack}
            className="w-10 h-10 rounded-xl text-neutral-300 active:opacity-70 flex items-center justify-center text-lg shrink-0"
            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>←</button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-base">🥗 Dieta</h1>
            <p className="text-neutral-500 text-xs truncate">{profile.full_name}</p>
          </div>
          {/* Cart icon */}
          <button
            onClick={() => setShowShopList(true)}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center text-lg active:opacity-70 shrink-0"
            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
            title="Lista de la compra">
            🛒
            {shopCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] rounded-full text-[9px] font-bold flex items-center justify-center px-1"
                style={{ background: "#8B1A2F", color: "#fff" }}>
                {shopCount}
              </span>
            )}
          </button>
        </div>

        {/* Pestañas — solo visibles si no estamos en la pantalla de generación */}
        {dietTab !== "generate" && (
          <div className="flex gap-1 pb-0">
            {([
              { id: "macros"   as DietTab, label: "📊 Mis Macros" },
              { id: "generate" as DietTab, label: "🎲 Generada" },
              { id: "plan"     as DietTab, label: "📋 Mi Plan" },
            ] as const).map(({ id, label }) => (
              <button key={id} onClick={() => setDietTab(id)}
                className={"flex-1 py-2 text-xs font-semibold rounded-t-lg transition-colors " +
                  (dietTab === id ? "text-white" : "text-neutral-500")}
                style={dietTab === id
                  ? { background: "#1A1A1A", borderTop: "2px solid #C0394F" }
                  : {}}>
                {label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Contenido con scroll ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>

        {/* ─── Mis Macros ─── */}
        {dietTab === "macros" && (
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-8">
            <MacroCalculator clientId={profile.id} />
          </div>
        )}

        {/* ─── Generada (DietGenerator modo cliente) ─── */}
        {dietTab === "generate" && (
          <DietGenerator
            clientId={profile.id}
            clientName={profile.full_name}
            clientMode
            onBack={() => setDietTab("macros")}
          />
        )}

        {/* ─── Mi Plan (plan del entrenador) ─── */}
        {dietTab === "plan" && (
          loading ? (
            <div className="flex items-center justify-center py-24">
              <p className="text-neutral-500 text-sm">Cargando tu plan…</p>
            </div>
          ) : !plan ? (
            <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
              <p className="text-5xl mb-4">🥗</p>
              <p className="text-white font-semibold mb-2">Sin plan asignado</p>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Tu entrenador aún no ha creado tu plan nutricional.
              </p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto px-4 pt-4 pb-28 space-y-3">

              {/* ── Selector ON / OFF ── */}
              <div className="grid grid-cols-2 gap-2">
                {(["on", "off"] as DayType[]).map(d => {
                  const isActive = dayType === d;
                  const kcal  = d === "on" ? plan.kcal_on    : plan.kcal_off;
                  const prot  = d === "on" ? plan.protein_on : plan.protein_off;
                  const carbs = d === "on" ? plan.carbs_on   : plan.carbs_off;
                  const fat   = d === "on" ? plan.fat_on     : plan.fat_off;
                  const accent = d === "on" ? "#8B1A2F" : "#1A3A8B";
                  return (
                    <button key={d} onClick={() => setDayType(d)}
                      className={"rounded-2xl p-3 text-center transition-all active:scale-[0.98] " +
                        (isActive ? "" : "opacity-50")}
                      style={{ background: isActive ? `${accent}22` : "#0F0F0F", border: `1px solid ${isActive ? accent : "#1A1A1A"}` }}>
                      <p className="text-xs font-bold mb-1" style={{ color: d === "on" ? "#E57373" : "#7986CB" }}>
                        {d === "on" ? "💪 DÍA ON" : "😴 DÍA OFF"}
                      </p>
                      <p className="text-white text-lg font-bold">{kcal ?? "—"} <span className="text-neutral-500 text-xs font-normal">kcal</span></p>
                      <div className="flex justify-center gap-2 mt-1 text-[10px]">
                        <span className="text-red-400">{prot ?? "—"}g P</span>
                        <span className="text-amber-400">{carbs ?? "—"}g HC</span>
                        <span className="text-blue-400">{fat ?? "—"}g G</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ── Indicaciones del entrenador ── */}
              {plan.notes && (
                <div className="rounded-xl px-4 py-3" style={{ background: "#111", border: "1px solid #2A1800" }}>
                  <p className="text-[10px] text-amber-600 uppercase tracking-wider mb-1">📌 Indicaciones</p>
                  <p className="text-neutral-300 text-xs leading-relaxed whitespace-pre-line">{plan.notes}</p>
                </div>
              )}

              {/* ── Comidas ── */}
              {filteredMeals.length === 0 ? (
                <p className="text-center text-neutral-500 text-sm py-10">
                  No hay comidas configuradas para el día {dayType.toUpperCase()}.
                </p>
              ) : filteredMeals.map(meal => {
                const totalOpts = meal.options.length;
                const optIdx    = selectedOptions[meal.id] ?? 0;
                const safeIdx   = Math.min(optIdx, totalOpts - 1);
                const activeOpt = meal.options[safeIdx];
                const hasPending = pendingSave.has(meal.id);

                return (
                  <div key={meal.id} className="rounded-2xl overflow-hidden"
                    style={{ background: "#111", border: "1px solid #1E1E1E" }}>

                    {/* Cabecera de comida */}
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      <span className="text-2xl shrink-0">{meal.emoji}</span>
                      <span className="text-white font-semibold text-sm flex-1 min-w-0 truncate">{meal.name}</span>

                      {/* Selector de opción */}
                      {totalOpts > 1 && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => changeOption(meal.id, -1, totalOpts)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 active:opacity-70 text-lg font-bold"
                            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>‹</button>
                          <div className="min-w-[44px] text-center">
                            <span className="text-white text-sm font-bold">
                              {OPT_LABELS[safeIdx] ?? String(safeIdx + 1)}
                            </span>
                            {totalOpts > 1 && (
                              <span className="block text-[9px] text-neutral-600">/{totalOpts}</span>
                            )}
                          </div>
                          <button
                            onClick={() => changeOption(meal.id, 1, totalOpts)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 active:opacity-70 text-lg font-bold"
                            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>›</button>
                        </div>
                      )}
                    </div>

                    {/* Contenido de la opción activa */}
                    {activeOpt && (
                      <div className="border-t" style={{ borderColor: "#1A1A1A" }}>
                        {/* Nombre de la opción */}
                        {activeOpt.name && (
                          <p className="px-4 pt-2.5 pb-1 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                            {activeOpt.name}
                          </p>
                        )}

                        {/* Grupos de alimentos */}
                        <div className="px-4 pb-3 space-y-2.5">
                          {activeOpt.content.map((group, gi) => (
                            <div key={gi}>
                              {group.label && (
                                <div className="flex items-center gap-2 mb-1.5">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                    {group.label}
                                  </p>
                                  {group.isChoice && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded"
                                      style={{ background: "#1A2A4A", color: "#7986CB" }}>
                                      elige uno
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="space-y-1">
                                {group.items.map((item, ii) => {
                                  const isObj   = typeof item === "object" && item !== null && "ingId" in item;
                                  const typedItem = item as { ingId: string; grams: number };
                                  const display = isObj
                                    ? `${typedItem.grams}g · ${ingName(typedItem.ingId)}`
                                    : String(item);
                                  const canShop = isObj && typedItem.ingId;
                                  return (
                                    <div key={ii} className="flex items-center gap-2">
                                      <span className="text-neutral-600 text-xs shrink-0">·</span>
                                      <span className="flex-1 text-sm text-neutral-200 leading-snug">{display}</span>
                                      {canShop && (
                                        <ShopBtn onClick={() => addToShop(typedItem.ingId, typedItem.grams ?? 100)} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              {group.note && (
                                <p className="text-[10px] text-neutral-500 italic mt-1 pl-3">※ {group.note}</p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Botón ✓ Guardar — aparece solo cuando se cambia la opción */}
                        {hasPending && (
                          <div className="px-4 pb-3">
                            <button
                              onClick={() => saveOptionForMeal(meal.id, selectedOptions)}
                              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:opacity-70 transition-all"
                              style={{ background: "#0A2A0A", border: "1px solid #1A4A1A", color: "#4ADE80" }}>
                              ✓ Guardar opción {OPT_LABELS[safeIdx] ?? String(safeIdx + 1)}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* ── Modal: Lista de la compra ── */}
      {showShopList && (() => {
        const shopList   = Object.entries(shopItems).sort((a, b) => a[1].category.localeCompare(b[1].category));
        const allChecked = shopList.length > 0 && shopList.every(([id]) => checkedItems.has(id));
        return (
          <div
            className="fixed inset-x-0 top-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm"
            style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom, 0px))" }}
            onClick={() => setShowShopList(false)}>
            <div
              className="w-full max-w-lg mx-auto rounded-t-2xl overflow-hidden flex flex-col"
              style={{ background: "#0F0F0F", border: "1px solid #1E1E1E", maxHeight: "80dvh" }}
              onClick={e => e.stopPropagation()}>

              {/* Cabecera */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-800 shrink-0">
                <div>
                  <p className="text-white font-bold text-base">🛒 Lista de la compra</p>
                  <p className="text-neutral-500 text-xs mt-0.5">
                    {shopList.length > 0
                      ? `${shopList.length} ingrediente${shopList.length !== 1 ? "s" : ""}`
                      : "Pulsa 🛒 junto a un alimento para añadirlo"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setShowShopList(false); setFoodSearchFromCart(true); setShowFoodSearch(true); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 active:text-white"
                    style={{ background: "#1A1A1A" }}
                    title="Buscar alimento">🔍</button>
                  <button onClick={() => setShowShopList(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 active:text-white"
                    style={{ background: "#1A1A1A" }}>✕</button>
                </div>
              </div>

              {/* Lista */}
              <div className="overflow-y-auto flex-1">
                {shopList.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-4xl mb-3">🛒</p>
                    <p className="text-neutral-400 text-sm">Pulsa el icono 🛒 junto a cualquier</p>
                    <p className="text-neutral-400 text-sm">alimento para añadirlo aquí</p>
                  </div>
                ) : (
                  <div className="px-4 py-3 space-y-1">
                    {(() => {
                      const byCategory: Record<string, typeof shopList> = {};
                      shopList.forEach(entry => {
                        const cat = entry[1].category;
                        if (!byCategory[cat]) byCategory[cat] = [];
                        byCategory[cat].push(entry);
                      });
                      return Object.entries(byCategory).map(([cat, items]) => (
                        <div key={cat} className="mb-3">
                          <p className="text-[10px] uppercase tracking-wider text-neutral-600 font-semibold mb-1.5 px-1">{cat}</p>
                          {items.map(([id, item]) => {
                            const checked = checkedItems.has(id);
                            return (
                              <div key={id} className="flex items-center gap-1 mb-1">
                                <button
                                  onClick={() => toggleShopChecked(id, !checked)}
                                  className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-left active:opacity-70"
                                  style={{
                                    background: checked ? "#0A1A0A" : "#141414",
                                    border: `1px solid ${checked ? "#1A3A1A" : "#1E1E1E"}`,
                                  }}>
                                  <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                                    style={{
                                      background: checked ? "#16A34A" : "#222",
                                      border: `1px solid ${checked ? "#16A34A" : "#333"}`,
                                    }}>
                                    {checked && <span className="text-white text-xs font-bold">✓</span>}
                                  </div>
                                  <span className="flex-1 text-sm"
                                    style={{ color: checked ? "#4A7A4A" : "#ddd", textDecoration: checked ? "line-through" : "none" }}>
                                    {item.name}
                                  </span>
                                </button>
                                <button onClick={() => removeShopItem(id)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-600 active:text-red-400 shrink-0"
                                  style={{ background: "#1A1A1A" }}>✕</button>
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
                <div className="px-4 py-3 border-t border-neutral-800 flex gap-2 shrink-0">
                  <button
                    onClick={() => shopList.forEach(([id]) => toggleShopChecked(id, !allChecked))}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold active:opacity-70"
                    style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#999" }}>
                    {allChecked ? "Desmarcar todo" : "Marcar todo"}
                  </button>
                  <button onClick={clearShopList}
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

      {/* ── Modal: Buscador de alimentos ── */}
      {showFoodSearch && (
        <FoodSearchModal
          onClose={() => {
            setShowFoodSearch(false);
            if (foodSearchFromCart) { setFoodSearchFromCart(false); setShowShopList(true); }
          }}
          onAddToShop={(name, grams) => {
            const key = `_off_${name}`;
            addShopItem(key, {
              name,
              grams: shopItems[key] ? shopItems[key].grams + grams : grams,
              category: "Buscador",
            });
            if (foodSearchFromCart) { setShowFoodSearch(false); setFoodSearchFromCart(false); setShowShopList(true); }
          }}
          onSaved={() => {
            _customLoaded = false;
            loadCustomIngredients();
            if (foodSearchFromCart) { setShowFoodSearch(false); setFoodSearchFromCart(false); setShowShopList(true); }
          }}
        />
      )}
    </div>
  );
}
