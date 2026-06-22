// DietPage.tsx v5 — vista cliente
// ─────────────────────────────────────────────────────────────────────────────
// 2 pestañas: "📋 Tu dieta" | "✨ Generar nueva"
//  · Tu dieta   → muestra el plan activo (asignado o generado) + historial desplegable
//  · Generar nueva → DietGenerator en modo cliente (incluye calculadora de macros)
// Si no hay plan activo → va directo a "Generar nueva"
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { supabase }            from "../lib/supabase";
import {
  INGREDIENTS, CATEGORY_LABELS,
  type Ingredient, type IngredientCategory,
} from "../data/ingredients";
import DietGenerator   from "../components/DietGenerator";
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
type DietTab  = "plan" | "generate";

type FoodItem    = string | { ingId: string; grams: number };
type FoodGroup   = { label: string; isChoice: boolean; items: FoodItem[]; note?: string };
type AdminOption = { id: string; name: string; content: FoodGroup[] };
type DietMeal    = {
  id: string; name: string; emoji: string;
  day_type: "on" | "off" | "both";
  sort_order: number;
  options: AdminOption[];
};
type DietPlan    = {
  name: string; notes: string | null;
  kcal_on: number|null; kcal_off: number|null;
  protein_on: number|null; carbs_on: number|null; fat_on: number|null;
  protein_off: number|null; carbs_off: number|null; fat_off: number|null;
};
type HistoryEntry = { planId: string; planName: string; date: string };

// ── Exportar PDF del plan asignado ────────────────────────────────────────────
function exportAssignedPlanPDF(
  plan:       DietPlan,
  meals:      DietMeal[],
  clientName: string,
) {
  const today = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  const COLORS  = ["#8B1A2F","#5B2D8B","#1A5E8F","#1A6B3A","#7A5C1A","#2D5B5B","#833A15"];
  const OPT_LBL = ["A","B","C","D","E"];

  // ── Helpers ──
  function esc(s: string) {
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }
  function renderFoodItem(item: FoodItem): string {
    if (typeof item === "string") {
      return `<div class="fi"><span class="bullet">·</span><span class="fi-txt">${esc(item)}</span></div>`;
    }
    const name = INGREDIENTS.find(i => i.id === item.ingId)?.name
               ?? ingName(item.ingId);
    return `<div class="fi"><span class="bullet">·</span><span class="fi-g">${item.grams}g</span><span class="fi-txt">${esc(name)}</span></div>`;
  }
  function renderGroup(g: FoodGroup): string {
    const lbl = g.label
      ? `<div class="grp-lbl">${esc(g.label)}${g.isChoice ? '<span class="choice-pill">elige uno</span>' : ""}</div>`
      : "";
    const items = g.items.map(renderFoodItem).join("");
    const note  = g.note ? `<div class="grp-note">※ ${esc(g.note)}</div>` : "";
    return `<div class="grp">${lbl}${items}${note}</div>`;
  }
  function renderOptions(mealList: DietMeal[], color: string): string {
    if (!mealList.length) return `<div class="empty-col">—</div>`;
    return mealList.flatMap(m =>
      m.options.map((opt, i) => {
        const lbl    = OPT_LBL[i] ?? String(i + 1);
        const groups = opt.content.map(renderGroup).join("");
        const optLbl = opt.name ? `<span class="opt-name">${esc(opt.name)}</span>` : "";
        return `<div class="opt">
          <div class="opt-hd">
            <span class="opt-badge" style="background:${color}">OPC. ${lbl}</span>${optLbl}
          </div>
          <div class="opt-body">${groups}</div>
        </div>`;
      })
    ).join("");
  }

  // ── Agrupar comidas ON / OFF por nombre ──
  type MealGroup = { name: string; emoji: string; on: DietMeal[]; off: DietMeal[]; both: DietMeal[] };
  const groupMap = new Map<string, MealGroup>();
  meals.forEach(m => {
    if (!groupMap.has(m.name)) groupMap.set(m.name, { name: m.name, emoji: m.emoji, on: [], off: [], both: [] });
    const g = groupMap.get(m.name)!;
    if (m.day_type === "on")   g.on.push(m);
    else if (m.day_type === "off") g.off.push(m);
    else g.both.push(m);
  });

  // ── HTML de comidas ──
  const mealsHtml = [...groupMap.values()].map((grp, idx) => {
    const color   = COLORS[idx % COLORS.length];
    const onList  = [...grp.on,   ...grp.both];
    const offList = [...grp.off,  ...grp.both];
    const hasBoth = onList.length > 0 && offList.length > 0 && (grp.on.length > 0 || grp.off.length > 0);

    let bodyHtml: string;
    if (hasBoth) {
      bodyHtml = `<div class="meal-body two-col">
        <div class="dcol">
          <div class="dcol-hd on-hd">💪 DÍA ON · ${plan.kcal_on ?? "—"} kcal</div>
          ${renderOptions(onList, color)}
        </div>
        <div class="dcol">
          <div class="dcol-hd off-hd">😴 DÍA OFF · ${plan.kcal_off ?? "—"} kcal</div>
          ${renderOptions(offList, color)}
        </div>
      </div>`;
    } else {
      const list   = onList.length ? onList : offList;
      const isOn   = onList.length > 0;
      bodyHtml = `<div class="meal-body one-col">
        <div class="dcol">
          <div class="dcol-hd ${isOn ? "on-hd" : "off-hd"}">${isOn ? "💪 DÍA ON" : "😴 DÍA OFF"}</div>
          ${renderOptions(list, color)}
        </div>
      </div>`;
    }
    return `<div class="meal">
      <div class="meal-hd" style="background:${color}">
        <span class="meal-emoji">${grp.emoji}</span>
        <span>${esc(grp.name.toUpperCase())}</span>
      </div>
      ${bodyHtml}
    </div>`;
  }).join("");

  // ── Macro lines ──
  const macOnLine  = `<span class="mp">${plan.protein_on ?? "—"}g P</span> · <span class="mhc">${plan.carbs_on ?? "—"}g HC</span> · <span class="mg">${plan.fat_on ?? "—"}g G</span>`;
  const macOffLine = `<span class="mp">${plan.protein_off ?? "—"}g P</span> · <span class="mhc">${plan.carbs_off ?? "—"}g HC</span> · <span class="mg">${plan.fat_off ?? "—"}g G</span>`;

  const notesHtml = plan.notes && plan.notes !== "__CLIENT_GENERATED__"
    ? `<div class="notes-box">
        <div class="notes-lbl">📌 INDICACIONES DEL ENTRENADOR</div>
        <div class="notes-txt">${esc(plan.notes)}</div>
      </div>` : "";

  const html = `<!DOCTYPE html><html lang="es"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(plan.name)}${clientName ? " — " + esc(clientName) : ""}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;
     background:#f5f5f5;font-size:13px;line-height:1.55}
.close-bar{position:fixed;top:0;left:0;right:0;z-index:999;display:flex;
  align-items:center;justify-content:space-between;padding:10px 16px;
  background:#0d0d0d;color:#fff;gap:12px}
.close-bar span{font-size:12px;font-weight:600;opacity:.7}
.close-btn{background:#C0394F;color:#fff;border:none;padding:8px 18px;
  border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}
.print-btn{background:#333;color:#fff;border:none;padding:8px 18px;
  border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}
body.has-bar{padding-top:50px}

/* ── Cabecera ── */
.hdr{background:linear-gradient(135deg,#0d0d0d 0%,#1e0a10 55%,#090d1e 100%);
     color:#fff;padding:30px 32px 26px;display:flex;
     align-items:flex-start;justify-content:space-between;
     margin-bottom:24px;border-radius:0 0 16px 16px}
.brand{font-size:9px;font-weight:900;letter-spacing:.35em;color:#C0394F;
       text-transform:uppercase;margin-bottom:8px}
.plan-title{font-size:26px;font-weight:800;letter-spacing:-.02em;line-height:1.15;color:#fff}
.plan-sub{font-size:14px;color:#bbb;margin-top:6px;font-weight:500}
.hdr-r{text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.hdr-date{font-size:10px;color:#888;background:rgba(255,255,255,.07);
          padding:4px 10px;border-radius:20px}
.hdr-hint{font-size:9.5px;color:#666;margin-top:2px}

/* ── Macro boxes ── */
.macro-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;
           margin:0 0 22px;padding-bottom:22px;border-bottom:2px solid #e8e8e8}
.mbox{border-radius:12px;padding:16px 20px;border:1px solid #e4e4e4;background:#fff;
      box-shadow:0 2px 8px rgba(0,0,0,.06)}
.mbox-on{border-left:5px solid #C0394F}
.mbox-off{border-left:5px solid #3B4F9F}
.mbox-dlbl{font-size:9px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px}
.mbox-on .mbox-dlbl{color:#C0394F}
.mbox-off .mbox-dlbl{color:#3B4F9F}
.mbox-kcal{font-size:30px;font-weight:800;line-height:1.1;color:#111}
.mbox-kcal-u{font-size:13px;font-weight:400;color:#888;margin-left:4px}
.mbox-mac{font-size:11px;margin-top:8px;display:flex;gap:14px}
.mp{color:#C0394F;font-weight:700}
.mhc{color:#D97706;font-weight:700}
.mg{color:#2563EB;font-weight:700}

/* ── Notas ── */
.notes-box{margin-bottom:22px;padding:16px 20px;background:#FFFBEB;
           border:1px solid #FDE68A;border-radius:12px;border-left:5px solid #F59E0B;
           box-shadow:0 2px 8px rgba(245,158,11,.08)}
.notes-lbl{font-size:9px;font-weight:900;letter-spacing:.12em;color:#D97706;
           text-transform:uppercase;margin-bottom:8px}
.notes-txt{font-size:12px;color:#555;line-height:1.7;white-space:pre-line}

/* ── Comida ── */
.meal{margin-bottom:20px;border-radius:14px;overflow:hidden;
      border:1px solid #e0e0e0;break-inside:avoid;
      background:#fff;box-shadow:0 3px 12px rgba(0,0,0,.07)}
.meal-hd{display:flex;align-items:center;gap:12px;padding:13px 20px;
         color:#fff;font-weight:800;font-size:13.5px;letter-spacing:.04em}
.meal-emoji{font-size:22px;line-height:1}
.meal-body{display:grid}
.two-col{grid-template-columns:1fr 1fr}
.one-col{grid-template-columns:1fr}
.dcol{border-right:1px solid #ebebeb}
.dcol:last-child{border-right:none}
.dcol-hd{font-size:9px;font-weight:900;letter-spacing:.12em;
         text-transform:uppercase;padding:8px 16px;border-bottom:1px solid #eee}
.on-hd{color:#B02030;background:#FEF2F2}
.off-hd{color:#2B3E8A;background:#EEF2FF}

/* ── Opción ── */
.opt{border-bottom:1px solid #f2f2f2}
.opt:last-child{border-bottom:none}
.opt-hd{display:flex;align-items:center;gap:8px;padding:8px 16px;
        background:#fafafa;border-bottom:1px solid #f0f0f0}
.opt-badge{font-size:9px;font-weight:900;color:#fff;padding:3px 9px;
           border-radius:5px;letter-spacing:.06em;flex-shrink:0}
.opt-name{font-size:10.5px;color:#999;font-style:italic}
.opt-body{padding:10px 16px 13px}
.empty-col{padding:16px;color:#ccc;font-size:11px;text-align:center}

/* ── Grupo ── */
.grp{margin-bottom:9px}
.grp:last-child{margin-bottom:0}
.grp-lbl{font-size:9px;font-weight:800;text-transform:uppercase;
         letter-spacing:.08em;color:#aaa;margin-bottom:4px;
         display:flex;align-items:center;gap:5px}
.choice-pill{font-size:7.5px;background:#E0E7FF;color:#4338CA;
             padding:1.5px 5px;border-radius:3px;font-weight:700}
.fi{display:flex;align-items:baseline;gap:6px;padding:3px 0}
.bullet{color:#ccc;flex-shrink:0;font-size:11px}
.fi-g{font-weight:800;color:#111;flex-shrink:0;font-size:12.5px;
      background:#f3f3f3;padding:1px 5px;border-radius:4px}
.fi-txt{font-size:12px;color:#2a2a2a}
.grp-note{font-size:9.5px;color:#a06020;font-style:italic;
          margin-top:4px;padding-left:12px;line-height:1.5;
          border-left:2px solid #FDE68A}

/* ── Footer ── */
footer{margin-top:24px;padding:12px 0;border-top:1px solid #e8e8e8;
       font-size:9px;color:#ccc;text-align:center;letter-spacing:.04em}

@media print{
  @page{size:A4 portrait;margin:12mm 10mm}
  body{background:#fff !important;padding:0 !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .close-bar{display:none !important}
  .meal{box-shadow:none;page-break-inside:avoid;break-inside:avoid}
  .mbox{box-shadow:none;page-break-inside:avoid;break-inside:avoid}
  .opt{page-break-inside:avoid;break-inside:avoid}
  footer{page-break-before:avoid}
}
</style>
</head>
<body class="has-bar">
<div class="close-bar">
  <span>${esc(plan.name)}${clientName ? " — " + esc(clientName) : ""}</span>
  <div style="display:flex;gap:8px">
    <button class="print-btn" onclick="window.print()">Guardar PDF</button>
    <button class="close-btn" onclick="window.close()">Cerrar</button>
  </div>
</div>

<div class="hdr">
  <div>
    <div class="brand">MVP Team · Nutrición</div>
    <div class="plan-title">${esc(plan.name)}</div>
    ${clientName ? `<div class="plan-sub">Plan de ${esc(clientName)}</div>` : ""}
  </div>
  <div class="hdr-r">
    <div class="hdr-date">${today}</div>
    <div class="hdr-hint">Elige 1 opción por comida · A · B · C</div>
  </div>
</div>

<div class="macro-row">
  <div class="mbox mbox-on">
    <div class="mbox-dlbl">💪 Día ON</div>
    <div class="mbox-kcal">${plan.kcal_on ?? "—"}<span class="mbox-kcal-u">kcal</span></div>
    <div class="mbox-mac">${macOnLine}</div>
  </div>
  <div class="mbox mbox-off">
    <div class="mbox-dlbl">😴 Día OFF</div>
    <div class="mbox-kcal">${plan.kcal_off ?? "—"}<span class="mbox-kcal-u">kcal</span></div>
    <div class="mbox-mac">${macOffLine}</div>
  </div>
</div>

${notesHtml}

${mealsHtml}

<footer>Plan nutricional · MVP Team · ${today} · Pesa los alimentos en crudo y en seco salvo indicación contraria</footer>
</body></html>`;

  // Abrir en ventana nueva y disparar impresión → en iOS = "Guardar como PDF"
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  // Pequeño delay para que el navegador pinte el contenido antes de imprimir
  setTimeout(() => { win.focus(); win.print(); }, 400);
}

// ── ShopBtn ───────────────────────────────────────────────────────────────────
function ShopBtn({ onClick }: { onClick: () => void }) {
  const [added, setAdded] = useState(false);
  return (
    <button
      onClick={() => { onClick(); setAdded(true); setTimeout(() => setAdded(false), 1500); }}
      className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center transition-all duration-200 active:scale-90"
      style={added
        ? { background: "var(--done-bg)", border: "1px solid var(--done-border)", color: "#888" }
        : { background: "#1a1a1a", border: "1px solid #222", color: "#555" }}
      title="Añadir a la lista de la compra">
      <i className={`ti ${added ? "ti-check" : "ti-shopping-cart"}`} style={{ fontSize: 12 }} />
    </button>
  );
}

// ── MealCards ─────────────────────────────────────────────────────────────────
const OPT_LABELS  = ["A", "B", "C", "D"];
// Acento único — solo rojo MVP, misma paleta que el resto de la app
const MEAL_ACCENT_COLORS = [
  "var(--mvp-red)", "var(--mvp-red)", "var(--mvp-red)",
  "var(--mvp-red)", "var(--mvp-red)", "var(--mvp-red)",
];
// Tabler icons por índice de comida (desayuno, media mañana, comida…)
const MEAL_ICONS = ["ti-sun", "ti-coffee", "ti-bowl", "ti-apple", "ti-moon-2", "ti-salad"];

function MealCards({
  meals, dayType, selectedOptions, pendingSave,
  onChangeOption, onSaveOption, onAddToShop,
}: {
  meals:           DietMeal[];
  dayType:         DayType;
  selectedOptions: Record<string, number>;
  pendingSave:     Set<string>;
  onChangeOption:  (id: string, dir: 1 | -1, total: number) => void;
  onSaveOption:    (id: string, opts: Record<string, number>) => void;
  onAddToShop:     (ingId: string, grams: number) => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggleCollapse = (id: string) =>
    setCollapsed(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const filtered = meals.filter(m => m.day_type === "both" || m.day_type === dayType);
  if (filtered.length === 0)
    return <p className="text-center text-neutral-500 text-sm py-10">No hay comidas configuradas.</p>;

  return (
    <div className="space-y-3">
      {filtered.map((meal, mealIndex) => {
        const totalOpts   = meal.options.length;
        const safeIdx     = Math.min(selectedOptions[meal.id] ?? 0, totalOpts - 1);
        const activeOpt   = meal.options[safeIdx];
        const hasPending  = pendingSave.has(meal.id);
        const isCollapsed = collapsed.has(meal.id);
        const accent      = MEAL_ACCENT_COLORS[mealIndex % MEAL_ACCENT_COLORS.length];

        return (
          <div key={meal.id} className="rounded-2xl overflow-hidden"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <div className="flex">
              {/* Borde izquierdo de color por comida */}
              <div className="w-[3px] shrink-0" style={{ background: accent }} />
              <div className="flex-1 min-w-0">

            {/* Cabecera */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <button
                onClick={() => toggleCollapse(meal.id)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left active:opacity-70">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "var(--mvp-red-soft)", border: "1px solid var(--mvp-red-border)" }}>
                  <i className={`ti ${MEAL_ICONS[mealIndex % MEAL_ICONS.length]}`}
                    style={{ fontSize: 16, color: "var(--mvp-red)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: "#333" }}>
                    {`Comida ${mealIndex + 1}`}
                  </p>
                  <span className="text-white font-semibold text-sm block truncate">{meal.name}</span>
                </div>
                <i className={`ti ${isCollapsed ? "ti-chevron-down" : "ti-chevron-up"}`}
                  style={{ fontSize: 14, color: "#333" }} />
              </button>

              {totalOpts > 1 && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { onChangeOption(meal.id, -1, totalOpts); if (isCollapsed) toggleCollapse(meal.id); }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 active:opacity-70 text-base font-bold"
                    style={{ background: "#161616", border: "1px solid #222" }}>‹</button>
                  <div className="min-w-[40px] text-center">
                    <span className="text-white text-sm font-bold">{OPT_LABELS[safeIdx] ?? String(safeIdx + 1)}</span>
                    <span className="block text-[9px] text-neutral-700">/{totalOpts}</span>
                  </div>
                  <button onClick={() => { onChangeOption(meal.id, 1, totalOpts); if (isCollapsed) toggleCollapse(meal.id); }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 active:opacity-70 text-base font-bold"
                    style={{ background: "#161616", border: "1px solid #222" }}>›</button>
                </div>
              )}
            </div>

            {/* Contenido */}
            {!isCollapsed && activeOpt && (
              <div style={{ borderTop: "1px solid #181818" }}>
                {activeOpt.name && (
                  <p className="px-4 pt-3 pb-1 text-[9px] uppercase tracking-widest font-bold" style={{ color: accent }}>
                    {activeOpt.name}
                  </p>
                )}
                <div className="px-4 pb-3 space-y-3 pt-2">
                  {activeOpt.content.map((group, gi) => (
                    <div key={gi}>
                      {group.label && (
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{group.label}</p>
                          {group.isChoice && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold"
                              style={{ background: "var(--mvp-red-soft)", color: "var(--mvp-red)", border: "1px solid var(--mvp-red-border)" }}>elige uno</span>
                          )}
                        </div>
                      )}
                      <div className="space-y-1.5">
                        {group.items.map((item, ii) => {
                          const isObj = typeof item === "object" && item !== null && "ingId" in item;
                          const t     = item as { ingId: string; grams: number };
                          const display = isObj ? `${t.grams}g · ${ingName(t.ingId)}` : String(item);
                          return (
                            <div key={ii} className="flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full shrink-0 mt-0.5" style={{ background: accent }} />
                              <span className="flex-1 text-sm text-neutral-300 leading-snug">{display}</span>
                              {isObj && t.ingId && (
                                <ShopBtn onClick={() => onAddToShop(t.ingId, t.grams ?? 100)} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {group.note && (
                        <p className="text-[10px] text-neutral-600 italic mt-1.5 pl-3">※ {group.note}</p>
                      )}
                    </div>
                  ))}
                </div>
                {hasPending && (
                  <div className="px-4 pb-3">
                    <button onClick={() => onSaveOption(meal.id, selectedOptions)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:opacity-70 transition-all"
                      style={{ background: "var(--mvp-green-soft)", border: "1px solid var(--mvp-green-border)", color: "var(--mvp-green)" }}>
                      <i className="ti ti-check" style={{ fontSize: 14 }} />
                      Guardar opción {OPT_LABELS[safeIdx] ?? String(safeIdx + 1)}
                    </button>
                  </div>
                )}
              </div>
            )}

              </div>{/* flex-1 */}
            </div>{/* flex */}
          </div>
        );
      })}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function DietPage({ profile, onBack }: { profile: Profile; onBack: () => void }) {
  const OPTS_KEY = `mvp_plan_opts_${profile.id}`;

  // Tabs
  const [dietTab, setDietTab] = useState<DietTab>("plan");

  // Plan activo
  const [plan,    setPlan]    = useState<DietPlan  | null>(null);
  const [meals,   setMeals]   = useState<DietMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayType, setDayType] = useState<DayType>("on");

  // Historial
  const [history,     setHistory]     = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Todas las dietas asignadas (para el picker)
  const [allDiets, setAllDiets] = useState<{ asgnId: string; planId: string; name: string; source: string; active: boolean }[]>([]);
  const [showDietPicker, setShowDietPicker] = useState(false);

  // Visor de dieta del historial
  const [histPlan,       setHistPlan]       = useState<DietPlan | null>(null);
  const [histMeals,      setHistMeals]      = useState<DietMeal[]>([]);
  const [viewingHistEntry, setViewingHistEntry] = useState<HistoryEntry | null>(null);

  // Lista de la compra
  const [shopItems,    setShopItems]    = useState<Record<string, { name: string; grams: number; category: string }>>({});
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showShopList, setShowShopList] = useState(false);

  // Buscador de alimentos
  const [showFoodSearch,     setShowFoodSearch]     = useState(false);
  const [foodSearchFromCart, setFoodSearchFromCart] = useState(false);

  // Selección de opción por comida (current + history viewer)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem(OPTS_KEY) ?? "{}"); } catch { return {}; }
  });
  const [pendingSave, setPendingSave] = useState<Set<string>>(new Set());

  const [toast, setToast] = useState<string | null>(null);
  const [, setIngTick]    = useState(0);

  useEffect(() => {
    loadDiet();
    loadShopList();
    loadCustomIngredients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-redirigir a "Generar nueva" si no hay plan activo
  useEffect(() => {
    if (!loading && !plan && meals.length === 0) {
      setDietTab("generate");
    }
  }, [loading, plan, meals]);

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
    setPlan(null); setMeals([]); setHistory([]);
    setViewingHistEntry(null); setHistPlan(null); setHistMeals([]);

    // Todas las asignaciones del cliente, más recientes primero
    const { data: allAsgn } = await supabase
      .from("diet_assignments")
      .select("id, plan_id, source, active, assigned_at, diet_plans(name)")
      .eq("client_id", profile.id)
      .order("assigned_at", { ascending: false });

    if (!allAsgn?.length) { setLoading(false); return; }

    // Poblar picker de dietas
    setAllDiets(allAsgn.map((a: any) => ({
      asgnId: a.id,
      planId: a.plan_id,
      name:   a.diet_plans?.name ?? "Dieta",
      source: a.source ?? "manual",
      active: a.active,
    })));

    const activeAsgn   = allAsgn.find(a => a.active);
    const inactiveAsgn = allAsgn.filter(a => !a.active);

    // Cargar plan activo
    if (activeAsgn) {
      const { data: planData } = await supabase
        .from("diet_plans").select("*").eq("id", activeAsgn.plan_id).single();
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

    // Cargar historial (planes inactivos)
    if (inactiveAsgn.length > 0) {
      const inactiveIds = inactiveAsgn.map(a => a.plan_id).filter(Boolean);
      const { data: histData } = await supabase
        .from("diet_plans").select("id, name, created_at")
        .in("id", inactiveIds)
        .order("created_at", { ascending: false });
      if (histData) {
        setHistory(histData.map((h: any) => ({
          planId:   h.id,
          planName: h.name,
          date:     new Date(h.created_at).toLocaleDateString("es-ES", {
            day: "2-digit", month: "short", year: "numeric",
          }),
        })));
      }
    }

    setLoading(false);
  };

  const loadHistoryPlan = async (entry: HistoryEntry) => {
    const { data: planData } = await supabase
      .from("diet_plans").select("*").eq("id", entry.planId).single();
    if (!planData) return;
    const { data: mealsData } = await supabase
      .from("diet_meals").select("*, diet_options(*)")
      .eq("plan_id", entry.planId).order("sort_order");
    if (mealsData) {
      setHistPlan(planData);
      setHistMeals(mealsData.map((m: any) => ({
        ...m,
        options: (m.diet_options ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order),
      })));
      setViewingHistEntry(entry);
      setShowHistory(false);
    }
  };

  // ── Switcher de dietas ────────────────────────────────────────────────────
  const switchDiet = async (asgnId: string) => {
    setShowDietPicker(false);
    setLoading(true);
    await supabase.from("diet_assignments").update({ active: false }).eq("client_id", profile.id);
    await supabase.from("diet_assignments").update({ active: true }).eq("id", asgnId);
    await loadDiet();
  };

  const deleteAIDiet = async (asgnId: string, planId: string) => {
    setShowDietPicker(false);
    setLoading(true);
    await supabase.from("diet_assignments").delete().eq("id", asgnId);
    await supabase.from("diet_plans").delete().eq("id", planId);
    const remaining = allDiets.filter(d => d.asgnId !== asgnId);
    if (remaining.length > 0) {
      await supabase.from("diet_assignments").update({ active: true }).eq("id", remaining[0].asgnId);
    }
    await loadDiet();
  };

  // ── Lista de la compra ────────────────────────────────────────────────────
  const loadShopList = async () => {
    const { data } = await supabase
      .from("shop_list_items").select("item_key, name, category, checked")
      .eq("client_id", profile.id);
    if (data) {
      const map: Record<string, { name: string; grams: number; category: string }> = {};
      const checked = new Set<string>();
      data.forEach((r: any) => {
        map[r.item_key] = { name: r.name, grams: 0, category: r.category };
        if (r.checked) checked.add(r.item_key);
      });
      setShopItems(map); setCheckedItems(checked);
    }
  };

  const addShopItem = async (key: string, item: { name: string; grams: number; category: string }) => {
    setShopItems(prev => ({ ...prev, [key]: item }));
    await supabase.from("shop_list_items").upsert(
      { client_id: profile.id, item_key: key, name: item.name, category: item.category, checked: false },
      { onConflict: "client_id,item_key" },
    );
  };

  const removeShopItem = async (key: string) => {
    setShopItems(prev => { const n = { ...prev }; delete n[key]; return n; });
    setCheckedItems(prev => { const s = new Set(prev); s.delete(key); return s; });
    await supabase.from("shop_list_items").delete()
      .eq("client_id", profile.id).eq("item_key", key);
  };

  const toggleShopChecked = async (key: string, val: boolean) => {
    setCheckedItems(prev => { const s = new Set(prev); val ? s.add(key) : s.delete(key); return s; });
    await supabase.from("shop_list_items").update({ checked: val })
      .eq("client_id", profile.id).eq("item_key", key);
  };

  const clearShopList = async () => {
    setShopItems({}); setCheckedItems(new Set());
    await supabase.from("shop_list_items").delete().eq("client_id", profile.id);
  };

  const addToShop = (ingId: string, grams: number) => {
    const ing = INGREDIENTS.find(i => i.id === ingId);
    if (!ing) return;
    const existing = shopItems[ingId];
    addShopItem(ingId, {
      name:     ing.name,
      grams:    existing ? existing.grams + grams : grams,
      category: CATEGORY_LABELS[ing.category] ?? "Otros",
    });
  };

  // ── Selección de opciones ─────────────────────────────────────────────────
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
    showToast("Opción guardada");
  };

  // ── Datos del plan que se muestra ─────────────────────────────────────────
  const displayPlan  = viewingHistEntry ? histPlan  : plan;
  const displayMeals = viewingHistEntry ? histMeals : meals;
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
      <header className="header-safe shrink-0 px-4 pb-3 relative"
        style={{ background: "#0a0a0a", borderBottom: "1px solid #1a1a1a" }}>
        <div className="flex items-center gap-3 pb-0">
          <button onClick={onBack}
            className="w-10 h-10 rounded-xl flex items-center justify-center active:opacity-70 shrink-0"
            style={{ background: "#141414", border: "1px solid #1e1e1e", color: "#666" }}>
            <i className="ti ti-arrow-left" style={{ fontSize: 18 }} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-base">Dieta</h1>
            <div className="flex items-center gap-1.5">
              <p className="text-neutral-600 text-xs truncate">{profile.full_name}</p>
              {allDiets.length > 1 && (
                <button
                  onClick={() => setShowDietPicker(p => !p)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 active:opacity-60"
                  style={{ background: "var(--mvp-red-soft)", border: "1px solid var(--mvp-red-border)", color: "var(--mvp-red)" }}>
                  <i className="ti ti-switch-horizontal" style={{ fontSize: 10 }} />
                  {allDiets.find(d => d.active)?.source === "ai" ? "IA" : "Coach"}
                </button>
              )}
            </div>
          </div>
          {/* Botón descargar PDF */}
          {dietTab === "plan" && plan && !viewingHistEntry && (
            <button
              onClick={() => exportAssignedPlanPDF(plan, meals, profile.full_name)}
              className="w-10 h-10 rounded-xl flex items-center justify-center active:opacity-70 shrink-0"
              style={{ background: "#141414", border: "1px solid #1e1e1e", color: "#666" }}
              title="Descargar plan en PDF">
              <i className="ti ti-download" style={{ fontSize: 18 }} />
            </button>
          )}
          <button onClick={() => setShowShopList(true)}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center active:opacity-70 shrink-0"
            style={{ background: "#141414", border: "1px solid #1e1e1e", color: "#666" }}
            title="Lista de la compra">
            <i className="ti ti-shopping-cart" style={{ fontSize: 18 }} />
            {shopCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[9px] font-bold flex items-center justify-center px-1"
                style={{ background: "var(--mvp-red)", color: "#fff" }}>
                {shopCount}
              </span>
            )}
          </button>
        </div>

        {/* Picker de dietas */}
        {showDietPicker && allDiets.length > 1 && (
          <div className="absolute left-4 right-4 top-full mt-1 rounded-2xl overflow-hidden z-50 shadow-2xl"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 px-4 pt-3 pb-2">
              Cambiar dieta
            </p>
            {allDiets.map(d => (
              <div key={d.asgnId} className="flex items-center border-t" style={{ borderColor: "#222" }}>
                <button
                  onClick={() => switchDiet(d.asgnId)}
                  className="flex-1 flex items-center gap-3 px-4 py-3 active:opacity-60">
                  <i className={`ti ${d.source === "ai" ? "ti-sparkles" : "ti-salad"}`}
                    style={{ fontSize: 16, color: d.source === "ai" ? "var(--mvp-red)" : "#555" }} />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{d.name}</p>
                    <p className="text-[10px] text-neutral-500">{d.source === "ai" ? "Generada por IA" : "Asignada por coach"}</p>
                  </div>
                  {d.active && <i className="ti ti-check shrink-0" style={{ fontSize: 14, color: "var(--mvp-red)" }} />}
                </button>
                {d.source === "ai" && (
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Borrar "${d.name}"? Esta acción no se puede deshacer.`)) {
                        deleteAIDiet(d.asgnId, d.planId);
                      }
                    }}
                    className="px-4 py-3 active:opacity-60 shrink-0"
                    style={{ color: "#555", borderLeft: "1px solid #222" }}>
                    <i className="ti ti-trash" style={{ fontSize: 16 }} />
                  </button>
                )}
              </div>
            ))}
            <div className="h-2" />
          </div>
        )}

        {/* Tabs — ocultas en modo Generar nueva */}
        {dietTab !== "generate" && (
          <div className="flex gap-2 mt-3">
            {([
              { id: "plan"     as DietTab, label: "Tu dieta",     icon: "ti-clipboard-list" },
              { id: "generate" as DietTab, label: "Generar nueva", icon: "ti-sparkles" },
            ] as const).map(({ id, label, icon }) => (
              <button key={id} onClick={() => { setDietTab(id); setViewingHistEntry(null); }}
                className={"flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all " +
                  (dietTab === id ? "text-white" : "text-neutral-600")}
                style={dietTab === id
                  ? { background: "var(--mvp-red)", border: "1px solid rgba(220,38,38,0.5)" }
                  : { background: "#111", border: "1px solid #1c1c1c" }}>
                <i className={`ti ${icon}`} style={{ fontSize: 13 }} />
                {label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Contenido ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>

        {/* ─── Generar nueva — DietGenerator pantalla completa ─── */}
        {dietTab === "generate" && (
          <DietGenerator
            clientId={profile.id}
            clientName={profile.full_name}
            clientMode
            onBack={() => { setDietTab("plan"); loadDiet(); }}
          />
        )}

        {/* ─── Tu dieta ─── */}
        {dietTab === "plan" && (
          loading ? (
            <div className="flex items-center justify-center py-24">
              <p className="text-neutral-500 text-sm">Cargando tu plan…</p>
            </div>
          ) : !displayPlan ? (
            <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
              <i className="ti ti-salad mb-4 block" style={{ fontSize: 40, color: "#333" }} />
              <p className="text-white font-semibold mb-2">Sin plan activo</p>
              <p className="text-neutral-500 text-sm leading-relaxed mb-6">
                Genera tu primera dieta personalizada con tus macros.
              </p>
              <button onClick={() => setDietTab("generate")}
                className="px-6 py-3 rounded-xl text-sm font-bold active:opacity-70 active:scale-[0.98] transition-all flex items-center gap-2"
                style={{ background: "var(--mvp-red)", color: "#fff" }}>
                <i className="ti ti-sparkles" style={{ fontSize: 16 }} />
                Generar mi dieta
              </button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto px-4 pt-4 pb-28 space-y-3">

              {/* Banner "viendo historial" */}
              {viewingHistEntry && (
                <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                  style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                  <i className="ti ti-clock" style={{ fontSize: 14, color: "#555" }} />
                  <span className="text-neutral-400 text-sm flex-1">{viewingHistEntry.planName}</span>
                  <button onClick={() => setViewingHistEntry(null)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg active:opacity-70"
                    style={{ background: "#1a1a1a", border: "1px solid #222", color: "#999" }}>
                    Volver
                  </button>
                </div>
              )}

              {/* Selector ON / OFF */}
              <div className="grid grid-cols-2 gap-2">
                {(["on", "off"] as DayType[]).map(d => {
                  const isActive = dayType === d;
                  const kcal  = d === "on" ? displayPlan.kcal_on    : displayPlan.kcal_off;
                  const prot  = d === "on" ? displayPlan.protein_on : displayPlan.protein_off;
                  const carbs = d === "on" ? displayPlan.carbs_on   : displayPlan.carbs_off;
                  const fat   = d === "on" ? displayPlan.fat_on     : displayPlan.fat_off;
                  const isOn  = d === "on";
                  return (
                    <button key={d} onClick={() => setDayType(d)}
                      className={"rounded-2xl p-4 text-left transition-all active:scale-[0.98] " + (isActive ? "" : "opacity-40")}
                      style={isActive
                        ? { background: "var(--mvp-red-soft)", border: "1px solid var(--mvp-red-border)" }
                        : { background: "#0f0f0f", border: "1px solid #1a1a1a" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ background: isActive ? "var(--mvp-red-soft)" : "rgba(255,255,255,0.03)", border: isActive ? "1px solid var(--mvp-red-border)" : "1px solid #1e1e1e" }}>
                          <i className={`ti ${isOn ? "ti-dumbbell" : "ti-moon"}`}
                            style={{ fontSize: 11, color: isActive ? "var(--mvp-red)" : "#444" }} />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest"
                          style={{ color: isActive ? "var(--mvp-red)" : "#444" }}>
                          {isOn ? "Día entreno" : "Día descanso"}
                        </p>
                      </div>
                      <p className="tabular-nums font-black leading-none mb-3" style={{ fontSize: 36, letterSpacing: "-0.03em", color: isActive ? "#fff" : "#333" }}>
                        {kcal ?? "—"}
                        <span className="font-normal ml-1.5" style={{ fontSize: 13, color: isActive ? "#555" : "#2a2a2a" }}>kcal</span>
                      </p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { label: "P",  val: prot  },
                          { label: "HC", val: carbs },
                          { label: "G",  val: fat   },
                        ].map(({ label, val }) => (
                          <div key={label} className="rounded-xl py-2 text-center"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <p className="text-[8px] font-black tracking-[0.08em] mb-0.5" style={{ color: isActive ? "#555" : "#2a2a2a" }}>{label}</p>
                            <p className="text-sm font-black tabular-nums" style={{ color: isActive ? "#ccc" : "#444", letterSpacing: "-0.02em" }}>{val ?? "—"}<span className="text-[9px] font-normal ml-0.5" style={{ color: isActive ? "#444" : "#222" }}>g</span></p>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Botón descargar PDF */}
              {!viewingHistEntry && (
                <button
                  onClick={() => exportAssignedPlanPDF(plan!, meals, profile.full_name)}
                  className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 active:opacity-70 active:scale-[0.98] transition-all"
                  style={{ background: "#111", border: "1px solid #1c1c1c", color: "#555" }}>
                  <i className="ti ti-download" style={{ fontSize: 16 }} />
                  Descargar plan completo
                </button>
              )}

              {/* Indicaciones */}
              {displayPlan.notes && displayPlan.notes !== "__CLIENT_GENERATED__" && (
                <div className="rounded-xl px-4 py-3" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                  <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">
                    <i className="ti ti-info-circle mr-1" style={{ fontSize: 10 }} />Indicaciones
                  </p>
                  <p className="text-neutral-300 text-xs leading-relaxed whitespace-pre-line">{displayPlan.notes}</p>
                </div>
              )}

              {/* Comidas */}
              <MealCards
                meals={displayMeals}
                dayType={dayType}
                selectedOptions={selectedOptions}
                pendingSave={pendingSave}
                onChangeOption={changeOption}
                onSaveOption={saveOptionForMeal}
                onAddToShop={addToShop}
              />

              {/* ── Historial de dietas anteriores ── */}
              {history.length > 0 && !viewingHistEntry && (
                <div className="rounded-2xl overflow-hidden mt-2"
                  style={{ background: "#0F0F0F", border: "1px solid #1E1E1E" }}>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3.5 active:opacity-70"
                    onClick={() => setShowHistory(s => !s)}>
                    <span className="text-neutral-500 text-sm flex-1 text-left">
                      🕐 Dietas anteriores ({history.length})
                    </span>
                    <span className="text-neutral-600 text-xs">{showHistory ? "▲" : "▼"}</span>
                  </button>

                  {showHistory && (
                    <div className="border-t" style={{ borderColor: "#1A1A1A" }}>
                      {history.map((entry, i) => (
                        <div key={entry.planId}
                          className={"flex items-center gap-3 px-4 py-3" + (i > 0 ? " border-t" : "")}
                          style={i > 0 ? { borderColor: "#151515" } : {}}>
                          <div className="flex-1 min-w-0">
                            <p className="text-neutral-300 text-sm truncate">{entry.planName}</p>
                            <p className="text-neutral-600 text-xs mt-0.5">{entry.date}</p>
                          </div>
                          <button
                            onClick={() => loadHistoryPlan(entry)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg active:opacity-70 shrink-0"
                            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#999" }}>
                            Ver
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
              <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-800 shrink-0">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">Lista de la compra</p>
                  <p className="text-white font-bold text-sm mt-0.5">
                    {shopList.length > 0
                      ? `${shopList.length} ingrediente${shopList.length !== 1 ? "s" : ""}`
                      : "Sin artículos todavía"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setShowShopList(false); setFoodSearchFromCart(true); setShowFoodSearch(true); }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "#1a1a1a", border: "1px solid #222", color: "#666" }} title="Buscar alimento">
                    <i className="ti ti-search" style={{ fontSize: 14 }} />
                  </button>
                  <button onClick={() => setShowShopList(false)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "#1a1a1a", border: "1px solid #222", color: "#666" }}>
                    <i className="ti ti-x" style={{ fontSize: 14 }} />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {shopList.length === 0 ? (
                  <div className="py-12 text-center">
                    <i className="ti ti-shopping-cart mb-3 block" style={{ fontSize: 36, color: "#333" }} />
                    <p className="text-neutral-500 text-sm">Toca el carrito junto a cualquier alimento</p>
                    <p className="text-neutral-600 text-sm">para añadirlo aquí</p>
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
                                  style={{ background: checked ? "var(--done-bg)" : "#141414", border: `1px solid ${checked ? "var(--done-border)" : "#1E1E1E"}` }}>
                                  <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                                    style={{ background: checked ? "rgba(255,255,255,0.1)" : "#222", border: `1px solid ${checked ? "rgba(255,255,255,0.15)" : "#333"}` }}>
                                    {checked && <i className="ti ti-check" style={{ fontSize: 11, color: "#aaa" }} />}
                                  </div>
                                  <span className="flex-1 text-sm"
                                    style={{ color: checked ? "#555" : "#ddd", textDecoration: checked ? "line-through" : "none" }}>
                                    {item.name}
                                  </span>
                                </button>
                                <button onClick={() => removeShopItem(id)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ background: "#1a1a1a", color: "#555" }}>
                                  <i className="ti ti-x" style={{ fontSize: 12 }} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
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
            _customLoaded = false; loadCustomIngredients();
            if (foodSearchFromCart) { setShowFoodSearch(false); setFoodSearchFromCart(false); setShowShopList(true); }
          }}
        />
      )}
    </div>
  );
}
