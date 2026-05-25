import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  ingredients as staticIngredients,
  CATEGORY_LABELS,
  type Ingredient,
  type IngredientCategory,
} from "../data/ingredients";

// ──────────────────────────────────────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────────────────────────────────────

type CustomIngredient = Ingredient & { _custom?: boolean };

const EMPTY_FORM: Omit<Ingredient, "id"> & { id: string } = {
  id: "",
  name: "",
  category: "lean_protein",
  kcal: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as IngredientCategory[];

// ──────────────────────────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────────────────────────

export default function IngredientsAdmin() {
  const [customRows, setCustomRows] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<IngredientCategory | "all">("all");

  // Panel de edición / creación
  const [editing, setEditing] = useState<(Omit<Ingredient, "id"> & { id: string }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);

  // ────────────────────────────────────────────────────────────────
  // Carga custom_ingredients de Supabase
  // ────────────────────────────────────────────────────────────────
  const loadCustom = async () => {
    setLoading(true);
    const { data } = await supabase.from("custom_ingredients").select("*");
    setCustomRows(
      (data ?? []).map((r: any) => ({
        id: r.id,
        name: r.name,
        category: r.category as IngredientCategory,
        kcal: Number(r.kcal),
        protein: Number(r.protein),
        carbs: Number(r.carbs),
        fat: Number(r.fat),
      }))
    );
    setLoading(false);
  };

  useEffect(() => { loadCustom(); }, []);

  // ────────────────────────────────────────────────────────────────
  // Merge: custom sobreescribe estático por id
  // ────────────────────────────────────────────────────────────────
  const mergedIngredients: CustomIngredient[] = (() => {
    const customById: Record<string, Ingredient> = {};
    customRows.forEach(c => { customById[c.id] = c; });
    const result: CustomIngredient[] = staticIngredients.map(s =>
      customById[s.id] ? { ...customById[s.id], _custom: true } : { ...s, _custom: false }
    );
    // Ingredientes puramente nuevos (no sobrescriben a ninguno estático)
    customRows.forEach(c => {
      if (!staticIngredients.find(s => s.id === c.id)) {
        result.push({ ...c, _custom: true });
      }
    });
    return result;
  })();

  // ────────────────────────────────────────────────────────────────
  // Filtrado
  // ────────────────────────────────────────────────────────────────
  const filtered = mergedIngredients.filter(ing => {
    const matchSearch =
      ing.name.toLowerCase().includes(search.toLowerCase()) ||
      ing.id.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || ing.category === filterCat;
    return matchSearch && matchCat;
  });

  // Agrupar por categoría para el listado
  const grouped = filtered.reduce<Record<string, CustomIngredient[]>>((acc, ing) => {
    if (!acc[ing.category]) acc[ing.category] = [];
    acc[ing.category].push(ing);
    return acc;
  }, {});

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ────────────────────────────────────────────────────────────────
  // Acciones CRUD
  // ────────────────────────────────────────────────────────────────
  const openNew = () => {
    setEditing({ ...EMPTY_FORM });
    setIsNew(true);
  };

  const openEdit = (ing: CustomIngredient) => {
    setEditing({
      id:       ing.id,
      name:     ing.name,
      category: ing.category,
      kcal:     ing.kcal,
      protein:  ing.protein,
      carbs:    ing.carbs,
      fat:      ing.fat,
    });
    setIsNew(false);
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.id.trim() || !editing.name.trim()) {
      showToast("⚠ ID y nombre son obligatorios");
      return;
    }
    setSaving(true);
    const row = {
      id:       editing.id.trim().toLowerCase().replace(/\s+/g, "_"),
      name:     editing.name.trim(),
      category: editing.category,
      kcal:     editing.kcal,
      protein:  editing.protein,
      carbs:    editing.carbs,
      fat:      editing.fat,
    };
    const { error } = await supabase.from("custom_ingredients").upsert(row, { onConflict: "id" });
    if (error) {
      showToast("❌ Error al guardar: " + error.message);
    } else {
      showToast(isNew ? `✅ "${row.name}" añadido` : `✅ "${row.name}" actualizado`);
      setEditing(null);
      await loadCustom();
    }
    setSaving(false);
  };

  const handleDelete = async (ing: CustomIngredient) => {
    const isOverride = !isNew && staticIngredients.find(s => s.id === ing.id);
    const msg = isOverride
      ? `¿Restaurar "${ing.name}" a los valores originales? Se eliminará la modificación personalizada.`
      : `¿Eliminar "${ing.name}" de la base de datos? Esta acción no se puede deshacer.`;
    if (!confirm(msg)) return;
    const { error } = await supabase.from("custom_ingredients").delete().eq("id", ing.id);
    if (error) {
      showToast("❌ Error al eliminar: " + error.message);
    } else {
      showToast(isOverride ? `♻️ "${ing.name}" restaurado al valor original` : `✅ "${ing.name}" eliminado`);
      await loadCustom();
    }
  };

  // ────────────────────────────────────────────────────────────────
  // UI: formulario de edición/creación
  // ────────────────────────────────────────────────────────────────
  if (editing !== null) {
    return (
      <div className="space-y-4">
        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditing(null)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-300 shrink-0"
            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
            ←
          </button>
          <div>
            <h2 className="text-white font-semibold text-base">
              {isNew ? "Nuevo alimento" : "Editar alimento"}
            </h2>
            <p className="text-neutral-500 text-xs">
              {isNew ? "Se añadirá a la base de datos" : `Modificando: ${editing.id}`}
            </p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
          {/* ID */}
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">ID único</label>
            <input
              value={editing.id}
              onChange={e => setEditing(prev => prev ? { ...prev, id: e.target.value } : prev)}
              disabled={!isNew}
              placeholder="ej: yogur_griego (sin espacios)"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {isNew && <p className="text-neutral-600 text-xs mt-1">Solo letras, números y guiones bajos. No se puede cambiar luego.</p>}
          </div>

          {/* Nombre */}
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Nombre</label>
            <input
              value={editing.name}
              onChange={e => setEditing(prev => prev ? { ...prev, name: e.target.value } : prev)}
              placeholder="Nombre del alimento"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white text-sm"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Categoría</label>
            <select
              value={editing.category}
              onChange={e => setEditing(prev => prev ? { ...prev, category: e.target.value as IngredientCategory } : prev)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-white text-sm">
              {ALL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
          </div>

          {/* Macros */}
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">
              Macros <span className="normal-case text-neutral-600">(por 100 g de producto)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["kcal", "protein", "carbs", "fat"] as const).map(field => {
                const labels: Record<string, string> = { kcal: "Kcal", protein: "Proteína (g)", carbs: "Hidratos (g)", fat: "Grasa (g)" };
                return (
                  <div key={field}>
                    <label className="text-[11px] text-neutral-600 block mb-1">{labels[field]}</label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={editing[field]}
                      onChange={e => setEditing(prev => prev ? { ...prev, [field]: parseFloat(e.target.value) || 0 } : prev)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-white text-sm tabular-nums"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Previsualización */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3">
            <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-2">Vista previa (100 g)</p>
            <div className="flex gap-3 flex-wrap">
              <span className="text-white font-semibold text-sm">{editing.kcal} kcal</span>
              <span className="text-blue-400 text-sm">{editing.protein}g P</span>
              <span className="text-amber-400 text-sm">{editing.carbs}g HC</span>
              <span className="text-orange-400 text-sm">{editing.fat}g G</span>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "#8B1A2F", border: "1px solid #A01F38" }}>
            {saving ? "Guardando..." : isNew ? "Añadir alimento" : "Guardar cambios"}
          </button>
          <button
            onClick={() => setEditing(null)}
            className="px-5 py-3 rounded-xl text-sm text-neutral-300"
            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // UI: listado principal
  // ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 z-50 bg-neutral-800 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg border border-neutral-700 whitespace-nowrap"
          style={{ top: "max(env(safe-area-inset-top), 16px)" }}>
          {toast}
        </div>
      )}

      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-semibold text-base">Base de datos de alimentos</h2>
          <p className="text-neutral-500 text-xs">
            {mergedIngredients.length} alimentos · {customRows.length} personalizados
          </p>
        </div>
        <button
          onClick={openNew}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
          style={{ background: "#8B1A2F", border: "1px solid #A01F38" }}>
          + Nuevo
        </button>
      </div>

      {/* Búsqueda */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar alimento..."
        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-white text-sm"
      />

      {/* Filtro categoría */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
        <button
          onClick={() => setFilterCat("all")}
          className={"px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors " +
            (filterCat === "all" ? "text-white" : "text-neutral-400")}
          style={filterCat === "all"
            ? { background: "#8B1A2F", border: "1px solid #A01F38" }
            : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
          Todas
        </button>
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={"px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors " +
              (filterCat === cat ? "text-white" : "text-neutral-400")}
            style={filterCat === cat
              ? { background: "#8B1A2F", border: "1px solid #A01F38" }
              : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Listado */}
      {loading ? (
        <p className="text-neutral-500 text-sm text-center py-8">Cargando...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-neutral-400 text-sm">Sin resultados para "{search}"</p>
        </div>
      ) : (
        <div className="space-y-5">
          {ALL_CATEGORIES.filter(cat => grouped[cat]?.length).map(cat => (
            <div key={cat}>
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                {CATEGORY_LABELS[cat]}
                <span className="text-neutral-700 ml-1">({grouped[cat].length})</span>
              </p>
              <div className="space-y-1">
                {grouped[cat].map(ing => (
                  <div
                    key={ing.id}
                    className="rounded-xl overflow-hidden"
                    style={{
                      background: ing._custom ? "#120A0F" : "#111111",
                      border: ing._custom ? "1px solid #4A1028" : "1px solid #1E1E1E",
                    }}>
                    <div className="px-3 py-2.5 flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-white text-sm font-medium leading-tight">{ing.name}</span>
                          {ing._custom && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{ background: "#3A0A20", color: "#E0607A", border: "1px solid #6B1030" }}>
                              personalizado
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-0.5 flex-wrap">
                          <span className="text-neutral-500 text-xs tabular-nums">{ing.kcal} kcal</span>
                          <span className="text-blue-400/70 text-xs tabular-nums">{ing.protein}g P</span>
                          <span className="text-amber-400/70 text-xs tabular-nums">{ing.carbs}g HC</span>
                          <span className="text-orange-400/70 text-xs tabular-nums">{ing.fat}g G</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(ing)}
                          className="w-8 h-8 rounded-lg text-neutral-400 hover:text-white transition-colors text-xs flex items-center justify-center"
                          style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
                          title="Editar macros">
                          ✏️
                        </button>
                        {ing._custom && (
                          <button
                            onClick={() => handleDelete(ing)}
                            className="w-8 h-8 rounded-lg text-red-500 hover:text-red-300 transition-colors text-xs flex items-center justify-center"
                            style={{ background: "#1A0808", border: "1px solid #3A1010" }}
                            title={staticIngredients.find(s => s.id === ing.id) ? "Restaurar original" : "Eliminar"}>
                            {staticIngredients.find(s => s.id === ing.id) ? "↩" : "🗑️"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
