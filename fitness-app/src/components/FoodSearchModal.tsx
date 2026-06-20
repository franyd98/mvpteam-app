// FoodSearchModal.tsx
// Buscador global de alimentos via Open Food Facts API.
// Permite ver macros, ajustar gramos, guardar en catálogo y añadir a la lista de la compra.

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { CATEGORY_LABELS, ingredients as LOCAL_INGREDIENTS, type IngredientCategory } from "../data/ingredients";

// ── Tipos ────────────────────────────────────────────────────────────
interface OFFProduct {
  product_name: string;
  brands?: string;
  nutriments: {
    "energy-kcal_100g"?: number;
    "proteins_100g"?: number;
    "carbohydrates_100g"?: number;
    "fat_100g"?: number;
  };
}

interface FoodResult {
  name: string;
  brand: string;
  kcal100: number;
  protein100: number;
  carbs100: number;
  fat100: number;
  source: "local" | "off"; // local = ingredientes de la app, off = Open Food Facts
}

interface Props {
  onClose: () => void;
  onAddToShop?: (name: string, grams: number) => void;
  onSaved?: () => void; // callback cuando se guarda en catálogo
}

// ── Helper: auto-clasificar por macros ───────────────────────────────
function guessCategory(p: number, c: number, f: number): IngredientCategory {
  if (p >= 15 && f < 8)  return "lean_protein";
  if (p >= 15 && f >= 8) return "fatty_protein";
  if (p >= 8 && c >= 15) return "protein_carb";
  if (c >= 30 && f < 10) return "clean_carb";
  if (f >= 15)           return "fat";
  if (c >= 10)           return "fruit";
  return "lean_protein";
}

// ── Componente ───────────────────────────────────────────────────────
export default function FoodSearchModal({ onClose, onAddToShop, onSaved }: Props) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<FoodResult[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [selected, setSelected] = useState<FoodResult | null>(null);
  const [grams, setGrams]       = useState(100);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Búsqueda local inmediata + OFF con debounce ───────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim().toLowerCase();

    if (q.length < 2) { setResults([]); setError(null); return; }

    // Resultados locales (ingredientes de la app) — instantáneos
    const localMatches: FoodResult[] = LOCAL_INGREDIENTS
      .filter(ing => ing.name.toLowerCase().includes(q))
      .map(ing => ({
        name:       ing.name,
        brand:      CATEGORY_LABELS[ing.category],
        kcal100:    ing.kcal,
        protein100: ing.protein,
        carbs100:   ing.carbs,
        fat100:     ing.fat,
        source:     "local" as const,
      }))
      .slice(0, 10);

    // Mostrar locales inmediatamente
    setResults(localMatches);
    setError(null);

    // Luego buscar en Open Food Facts (debounced)
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query.trim())}&search_simple=1&action=process&json=1&page_size=25&fields=product_name,brands,nutriments&lc=es`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error de red");
        const data = await res.json();
        const products: OFFProduct[] = data.products ?? [];
        const offResults: FoodResult[] = products
          .filter(p =>
            p.product_name?.trim() &&
            p.nutriments?.["proteins_100g"] != null &&
            p.nutriments?.["carbohydrates_100g"] != null &&
            p.nutriments?.["fat_100g"] != null
          )
          .map(p => ({
            name:       p.product_name.trim(),
            brand:      p.brands?.trim() ?? "",
            kcal100:    Math.round(p.nutriments["energy-kcal_100g"] ?? (
              p.nutriments["proteins_100g"]! * 4 +
              p.nutriments["carbohydrates_100g"]! * 4 +
              p.nutriments["fat_100g"]! * 9
            )),
            protein100: Math.round((p.nutriments["proteins_100g"] ?? 0) * 10) / 10,
            carbs100:   Math.round((p.nutriments["carbohydrates_100g"] ?? 0) * 10) / 10,
            fat100:     Math.round((p.nutriments["fat_100g"] ?? 0) * 10) / 10,
            source:     "off" as const,
          }))
          // quitar duplicados por nombre (también respecto a locales)
          .filter((v, i, arr) =>
            arr.findIndex(x => x.name.toLowerCase() === v.name.toLowerCase()) === i &&
            !localMatches.some(l => l.name.toLowerCase() === v.name.toLowerCase())
          )
          .slice(0, 15);

        // Locales primero, luego OFF
        const combined = [...localMatches, ...offResults];
        setResults(combined);
        if (combined.length === 0) setError("Sin resultados. Prueba con otro término.");
      } catch {
        // Si falla OFF, mantenemos los resultados locales sin error
        if (localMatches.length === 0) {
          setError("Sin resultados locales. No se pudo conectar con Open Food Facts.");
        }
      } finally {
        setLoading(false);
      }
    }, 500);
  }, [query]);

  // ── Macros ajustados a los gramos elegidos ────────────────────────
  const adj = selected ? {
    kcal:    Math.round(selected.kcal100 * grams / 100),
    protein: Math.round(selected.protein100 * grams / 100 * 10) / 10,
    carbs:   Math.round(selected.carbs100 * grams / 100 * 10) / 10,
    fat:     Math.round(selected.fat100 * grams / 100 * 10) / 10,
  } : null;

  // ── Guardar en catálogo (custom_ingredients) ──────────────────────
  const saveToDb = async () => {
    if (!selected) return;
    setSaving(true);
    const id = `off_${selected.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40)}_${Date.now()}`;
    const cat = guessCategory(selected.protein100, selected.carbs100, selected.fat100);
    const { error: err } = await supabase.from("custom_ingredients").insert({
      id,
      name:     selected.name + (selected.brand ? ` (${selected.brand})` : ""),
      category: cat,
      kcal:     selected.kcal100,
      protein:  selected.protein100,
      carbs:    selected.carbs100,
      fat:      selected.fat100,
    });
    setSaving(false);
    if (err) {
      showToast("❌ Error al guardar: " + err.message);
    } else {
      showToast(`✅ "${selected.name}" guardado en el catálogo`);
      onSaved?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm"
      onClick={onClose}>
      <div className="flex-1 flex flex-col max-w-lg w-full mx-auto mt-12 rounded-t-2xl overflow-hidden footer-safe"
        style={{ background: "#0F0F0F", border: "1px solid #1E1E1E", maxHeight: "calc(100dvh - 48px)" }}
        onClick={e => e.stopPropagation()}>

        {/* Cabecera */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-neutral-800 shrink-0">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500">App · Open Food Facts</p>
            <p className="text-white font-bold text-sm">🔍 Buscar alimento</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-white shrink-0"
            style={{ background: "#1A1A1A" }}>✕</button>
        </div>

        {/* Buscador */}
        <div className="px-4 py-3 border-b border-neutral-800 shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); }}
            placeholder="Buscar pollo, arroz, huevo, mango…"
            className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none"
            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
          />
          {loading && (
            <p className="text-[10px] text-neutral-500 mt-1.5 text-center">Buscando en Open Food Facts…</p>
          )}
          {!loading && results.length > 0 && (
            <p className="text-[10px] text-neutral-600 mt-1.5">
              <span className="text-emerald-600">●</span> App{'  '}
              <span className="text-blue-600">●</span> Open Food Facts
            </p>
          )}
        </div>

        {/* Detalle del seleccionado */}
        {selected && adj && (
          <div className="px-4 py-4 border-b border-neutral-800 space-y-3 shrink-0"
            style={{ background: "#0A1A0A" }}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-white font-bold text-sm leading-snug">{selected.name}</p>
                {selected.brand && <p className="text-neutral-500 text-xs">{selected.brand}</p>}
              </div>
              <button onClick={() => setSelected(null)}
                className="text-neutral-600 text-xs shrink-0 mt-0.5">cambiar</button>
            </div>

            {/* Ajuste de gramos */}
            <div className="flex items-center gap-3">
              <label className="text-[10px] uppercase tracking-wider text-neutral-500 shrink-0">Gramos</label>
              <input type="number" min="1" max="2000" value={grams}
                onChange={e => setGrams(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 rounded-lg px-3 py-2 text-white text-sm font-bold text-center focus:outline-none"
                style={{ background: "#1E1E1E", border: "1px solid #333" }} />
              <div className="flex gap-1">
                {[50, 100, 150, 200].map(g => (
                  <button key={g} onClick={() => setGrams(g)}
                    className="px-2 py-1 rounded-lg text-[10px] font-medium transition-colors"
                    style={grams === g
                      ? { background: "#fff", color: "#000" }
                      : { background: "#1E1E1E", color: "#888", border: "1px solid #2A2A2A" }}>
                    {g}g
                  </button>
                ))}
              </div>
            </div>

            {/* Macros calculados */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Kcal",     val: `${adj.kcal}`,          color: "#E5E5E5" },
                { label: "Proteína", val: `${adj.protein}g`,       color: "#F87171" },
                { label: "Hidratos", val: `${adj.carbs}g`,         color: "#FBBF24" },
                { label: "Grasa",    val: `${adj.fat}g`,           color: "#60A5FA" },
              ].map(({ label, val, color }) => (
                <div key={label} className="rounded-xl px-2 py-2 text-center"
                  style={{ background: "#111", border: "1px solid #1A1A1A" }}>
                  <p className="text-[9px] text-neutral-600 uppercase">{label}</p>
                  <p className="text-sm font-bold tabular-nums mt-0.5" style={{ color }}>{val}</p>
                </div>
              ))}
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              {onAddToShop && (
                <button
                  onClick={() => { onAddToShop(selected.name, grams); showToast("🛒 Añadido a la lista"); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold active:opacity-70"
                  style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#ccc" }}>
                  🛒 Lista compra
                </button>
              )}
              <button
                onClick={saveToDb}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold active:opacity-70 disabled:opacity-40"
                style={{ background: "#1A2A1A", border: "1px solid #2A4A2A", color: "#4ADE80" }}>
                {saving ? "Guardando…" : "💾 Guardar en catálogo"}
              </button>
            </div>
            <p className="text-[10px] text-neutral-600 text-center">
              Al guardar en catálogo aparecerá en los selectores de ingredientes
            </p>
          </div>
        )}

        {/* Lista de resultados */}
        <div className="overflow-y-auto flex-1">
          {!selected && (
            <>
              {error && !loading && (
                <div className="py-10 text-center">
                  <p className="text-neutral-500 text-sm px-6">{error}</p>
                </div>
              )}

              {results.length === 0 && !loading && !error && query.trim().length < 2 && (
                <div className="py-12 text-center space-y-2">
                  <p className="text-4xl">🔍</p>
                  <p className="text-neutral-400 text-sm">Busca en la app y en Open Food Facts</p>
                  <p className="text-neutral-600 text-xs">Los ingredientes de la app aparecen al instante</p>
                </div>
              )}

              {results.map((food, i) => {
                const isLocal = food.source === "local";
                return (
                  <button key={i}
                    onClick={() => { setSelected(food); setGrams(100); }}
                    className="w-full flex items-center gap-3 px-4 py-3 border-b text-left active:bg-neutral-800 transition-colors"
                    style={{ borderColor: "#1A1A1A" }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-[8px] shrink-0 ${isLocal ? "text-emerald-500" : "text-blue-500"}`}>●</span>
                        <p className="text-white text-sm font-medium truncate">{food.name}</p>
                      </div>
                      {food.brand && <p className="text-neutral-600 text-xs truncate ml-3">{food.brand}</p>}
                    </div>
                    <div className="text-right shrink-0 space-y-0.5">
                      <p className="text-xs font-bold text-neutral-300 tabular-nums">{food.kcal100} kcal</p>
                      <div className="flex gap-1.5 text-[10px] tabular-nums justify-end">
                        <span className="text-red-400">{food.protein100}P</span>
                        <span className="text-amber-400">{food.carbs100}H</span>
                        <span className="text-blue-400">{food.fat100}G</span>
                      </div>
                    </div>
                    <span className="text-neutral-600 text-xs">›</span>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none px-4">
            <div className="px-4 py-2.5 rounded-xl text-sm font-semibold shadow-2xl"
              style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#fff" }}>
              {toast}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
