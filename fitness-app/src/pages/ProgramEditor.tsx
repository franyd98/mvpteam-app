import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type CatalogEx = { id: number; muscle_group: string; name: string; video_ref: string | null };
type EditorSet = { id: number; set_number: number; target_reps: string | null; target_rpe: string | null };
type EditorEx = { id: number; exercise_id: number; name: string; muscle_group: string; order_index: number; sets: EditorSet[] };
type EditorMc = { id: number; number: number; exercises: EditorEx[] };
type EditorDay = { id: number; name: string; order_index: number; optional: boolean; microcycles: EditorMc[] };
type EditorProgram = { id: number; name: string; description: string | null; days: EditorDay[] };

type Props = { programId: number; onBack: () => void };

export default function ProgramEditor({ programId, onBack }: Props) {
  const [program, setProgram] = useState<EditorProgram | null>(null);
  const [catalog, setCatalog] = useState<CatalogEx[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedMcNum, setSelectedMcNum] = useState(1);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [showExPicker, setShowExPicker] = useState(false);
  const [exSearch, setExSearch] = useState("");

  // Edición inline de ejercicio (cambiar grupo + ejercicio sin eliminar)
  type SwapState = { meId: number; selectedGroup: string; selectedExId: number | null };
  const [swapping, setSwapping] = useState<SwapState | null>(null);

  // Edición inline de reps/RIR por serie: setId → { target_reps, target_rpe }
  const [setEdits, setSetEdits] = useState<Record<number, { target_reps: string; target_rpe: string }>>({});

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [progRes, catRes] = await Promise.all([
      supabase.from("programs").select(`
        id, name, description,
        program_days ( id, name, order_index, optional,
          microcycles ( id, number,
            microcycle_exercises ( id, order_index,
              exercises ( id, name, muscle_group ),
              exercise_sets ( id, set_number, target_reps, target_rpe )
            )
          )
        )
      `).eq("id", programId).single(),
      supabase.from("exercises").select("*").order("muscle_group").order("name"),
    ]);
    if (progRes.data) {
      const raw = progRes.data as any;
      const days: EditorDay[] = (raw.program_days ?? [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((d: any) => ({
          id: d.id, name: d.name, order_index: d.order_index, optional: d.optional,
          microcycles: (d.microcycles ?? [])
            .sort((a: any, b: any) => a.number - b.number)
            .map((mc: any) => ({
              id: mc.id, number: mc.number,
              exercises: (mc.microcycle_exercises ?? [])
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((me: any) => ({
                  id: me.id, exercise_id: me.exercises?.id,
                  name: me.exercises?.name ?? "?", muscle_group: me.exercises?.muscle_group ?? "",
                  order_index: me.order_index,
                  sets: (me.exercise_sets ?? [])
                    .sort((a: any, b: any) => a.set_number - b.set_number)
                    .map((s: any) => ({ id: s.id, set_number: s.set_number, target_reps: s.target_reps ?? null, target_rpe: s.target_rpe ?? null })),
                })),
            })),
        }));
      setProgram({ id: raw.id, name: raw.name, description: raw.description, days });
      setNameInput(raw.name);
    }
    setCatalog(catRes.data ?? []);

    // Inicializar edits con los valores actuales de cada serie
    if (progRes.data) {
      const initial: Record<number, { target_reps: string; target_rpe: string }> = {};
      const raw = progRes.data as any;
      for (const day of raw.program_days ?? [])
        for (const mc of day.microcycles ?? [])
          for (const me of mc.microcycle_exercises ?? [])
            for (const s of me.exercise_sets ?? [])
              initial[s.id] = { target_reps: s.target_reps ?? "", target_rpe: s.target_rpe ?? "" };
      setSetEdits(initial);
    }

    setLoading(false);
  };

  const currentDay = program?.days[selectedDayIdx] ?? null;
  const currentMc = currentDay?.microcycles.find(m => m.number === selectedMcNum) ?? currentDay?.microcycles[0] ?? null;

  const saveName = async () => {
    if (!program || !nameInput.trim()) return;
    setSaving(true);
    await supabase.from("programs").update({ name: nameInput.trim() }).eq("id", program.id);
    setProgram(p => p ? { ...p, name: nameInput.trim() } : p);
    setEditingName(false);
    setSaving(false);
  };

  const addMicrocycle = async () => {
    if (!currentDay) return;
    setSaving(true);
    const nextNum = Math.max(...currentDay.microcycles.map(m => m.number), 0) + 1;
    const { data: newMc } = await supabase.from("microcycles").insert({ day_id: currentDay.id, number: nextNum }).select().single();
    if (newMc) {
      const lastMc = currentDay.microcycles[currentDay.microcycles.length - 1];
      for (const ex of lastMc?.exercises ?? []) {
        const { data: newMe } = await supabase.from("microcycle_exercises")
          .insert({ microcycle_id: newMc.id, exercise_id: ex.exercise_id, order_index: ex.order_index, total_sets: ex.sets.length })
          .select().single();
        if (newMe) {
          await supabase.from("exercise_sets").insert(
            ex.sets.map(s => ({ microcycle_exercise_id: newMe.id, set_number: s.set_number, target_reps: null }))
          );
        }
      }
    }
    await loadAll();
    setSelectedMcNum(nextNum);
    setSaving(false);
  };

  const removeMicrocycle = async () => {
    if (!currentDay || !currentMc) return;
    if (currentDay.microcycles.length <= 1) { alert("Debe quedar al menos 1 microciclo."); return; }
    if (!confirm(`¿Eliminar Microciclo ${currentMc.number}? Se perderán todos sus ejercicios.`)) return;
    setSaving(true);
    await supabase.from("microcycles").delete().eq("id", currentMc.id);
    const next = currentDay.microcycles.find(m => m.number !== currentMc.number)?.number ?? 1;
    await loadAll();
    setSelectedMcNum(next);
    setSaving(false);
  };

  const addExercise = async (ex: CatalogEx) => {
    if (!currentMc) return;
    setSaving(true);
    const nextOrder = (currentMc.exercises.length > 0 ? Math.max(...currentMc.exercises.map(e => e.order_index)) : 0) + 1;
    const { data: newMe } = await supabase.from("microcycle_exercises")
      .insert({ microcycle_id: currentMc.id, exercise_id: ex.id, order_index: nextOrder, total_sets: 3 })
      .select().single();
    if (newMe) {
      await supabase.from("exercise_sets").insert([
        { microcycle_exercise_id: newMe.id, set_number: 1, target_reps: null },
        { microcycle_exercise_id: newMe.id, set_number: 2, target_reps: null },
        { microcycle_exercise_id: newMe.id, set_number: 3, target_reps: null },
      ]);
    }
    setShowExPicker(false); setExSearch("");
    await loadAll();
    setSaving(false);
  };

  const removeExercise = async (meId: number, exName: string) => {
    if (!confirm(`¿Quitar "${exName}" de este microciclo?`)) return;
    setSaving(true);
    await supabase.from("microcycle_exercises").delete().eq("id", meId);
    await loadAll();
    setSaving(false);
  };

  const addSet = async (ex: EditorEx) => {
    setSaving(true);
    const nextNum = (ex.sets.length > 0 ? Math.max(...ex.sets.map(s => s.set_number)) : 0) + 1;
    await supabase.from("exercise_sets").insert({ microcycle_exercise_id: ex.id, set_number: nextNum, target_reps: null });
    await loadAll();
    setSaving(false);
  };

  const removeSet = async (ex: EditorEx) => {
    if (ex.sets.length <= 1) return;
    setSaving(true);
    await supabase.from("exercise_sets").delete().eq("id", ex.sets[ex.sets.length - 1].id);
    await loadAll();
    setSaving(false);
  };

  // Grupos musculares únicos del catálogo (normalizados para evitar duplicados por espacios/mayúsculas)
  const allGroups = [...new Map(
    catalog.map(e => [e.muscle_group.trim().toLowerCase(), e.muscle_group.trim()])
  ).values()].sort((a, b) => a.localeCompare(b, "es"));

  // Cambia el exercise_id de un microcycle_exercise sin borrar sus series
  const swapExercise = async () => {
    if (!swapping || !swapping.selectedExId) return;
    setSaving(true);
    await supabase.from("microcycle_exercises")
      .update({ exercise_id: swapping.selectedExId })
      .eq("id", swapping.meId);
    setSwapping(null);
    await loadAll();
    setSaving(false);
  };

  // Guarda reps/RIR de una serie al perder el foco
  const saveSetField = async (setId: number) => {
    const edit = setEdits[setId];
    if (!edit) return;
    await supabase.from("exercise_sets").update({
      target_reps: edit.target_reps.trim() || null,
      target_rpe: edit.target_rpe.trim() || null,
    }).eq("id", setId);
  };

  // ── Sincronizar estructura al resto de microciclos ──────────────
  // Copia los ejercicios y el número de series del microciclo actual
  // a todos los demás microciclos del mismo día.
  // NO sobreescribe target_reps / target_rpe de series ya existentes.
  const syncStructureToAll = async () => {
    if (!currentDay || !currentMc) return;
    const otherMcs = currentDay.microcycles.filter(m => m.id !== currentMc.id);
    if (otherMcs.length === 0) {
      alert("Solo existe un microciclo — no hay nada que sincronizar.");
      return;
    }
    if (!confirm(
      `¿Copiar la estructura del Mc ${currentMc.number} a los ${otherMcs.length} microciclo(s) restantes?\n\n` +
      `• Se añadirán ejercicios que falten (sin reps/RIR).\n` +
      `• Se eliminarán ejercicios que sobren.\n` +
      `• Se ajustará el número de series.\n` +
      `• Los valores de reps/RIR que ya existan no se tocarán.`
    )) return;

    setSaving(true);

    for (const mc of otherMcs) {
      // Mapa exercise_id → EditorEx del microciclo destino
      const destMap = new Map(mc.exercises.map(e => [e.exercise_id, e]));
      // IDs de ejercicios que deben estar (según el mc origen)
      const srcIds = new Set(currentMc.exercises.map(e => e.exercise_id));

      // 1. Eliminar ejercicios del destino que no están en el origen
      for (const dEx of mc.exercises) {
        if (!srcIds.has(dEx.exercise_id)) {
          await supabase.from("microcycle_exercises").delete().eq("id", dEx.id);
        }
      }

      // 2. Para cada ejercicio del origen, añadir o ajustar en el destino
      for (const srcEx of currentMc.exercises) {
        const destEx = destMap.get(srcEx.exercise_id);

        if (!destEx) {
          // 2a. Ejercicio nuevo: crear con series vacías
          const { data: newMe } = await supabase
            .from("microcycle_exercises")
            .insert({
              microcycle_id: mc.id,
              exercise_id: srcEx.exercise_id,
              order_index: srcEx.order_index,
              total_sets: srcEx.sets.length,
            })
            .select()
            .single();
          if (newMe) {
            await supabase.from("exercise_sets").insert(
              srcEx.sets.map(s => ({
                microcycle_exercise_id: newMe.id,
                set_number: s.set_number,
                target_reps: null,
                target_rpe: null,
              }))
            );
          }
        } else {
          // 2b. Ejercicio ya existe: actualizar orden y ajustar series
          await supabase
            .from("microcycle_exercises")
            .update({ order_index: srcEx.order_index, total_sets: srcEx.sets.length })
            .eq("id", destEx.id);

          const destSets = [...destEx.sets].sort((a, b) => a.set_number - b.set_number);
          const targetCount = srcEx.sets.length;

          if (destSets.length < targetCount) {
            // Añadir series que faltan (sin reps/RIR)
            const toAdd = [];
            for (let n = destSets.length + 1; n <= targetCount; n++) {
              toAdd.push({
                microcycle_exercise_id: destEx.id,
                set_number: n,
                target_reps: null,
                target_rpe: null,
              });
            }
            await supabase.from("exercise_sets").insert(toAdd);
          } else if (destSets.length > targetCount) {
            // Eliminar series sobrantes (las últimas)
            const idsToRemove = destSets
              .slice(targetCount)
              .map(s => s.id);
            await supabase.from("exercise_sets").delete().in("id", idsToRemove);
          }
        }
      }
    }

    await loadAll();
    setSaving(false);
    alert(`✅ Estructura del Mc ${currentMc.number} copiada a ${otherMcs.length} microciclo(s).`);
  };

  const filteredCatalog = catalog.filter(e =>
    e.name.toLowerCase().includes(exSearch.toLowerCase()) || e.muscle_group.toLowerCase().includes(exSearch.toLowerCase())
  );
  const groupedCatalog = filteredCatalog.reduce<Record<string, CatalogEx[]>>((acc, ex) => {
    if (!acc[ex.muscle_group]) acc[ex.muscle_group] = [];
    acc[ex.muscle_group].push(ex);
    return acc;
  }, {});

  if (loading) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <p className="text-neutral-500 text-sm">Cargando editor...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 pb-10">
      {/* Cabecera */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 flex items-center justify-center shrink-0 text-lg">←</button>
        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex gap-2 items-center">
              <input value={nameInput} onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                className="flex-1 bg-neutral-800 border border-white rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none" autoFocus />
              <button onClick={saveName} className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold">Guardar</button>
              <button onClick={() => setEditingName(false)} className="text-neutral-500 text-xs hover:text-white">✕</button>
            </div>
          ) : (
            <button onClick={() => setEditingName(true)} className="text-left group flex items-center gap-2 w-full">
              <h1 className="text-white font-bold text-base truncate">{program?.name}</h1>
              <span className="text-neutral-600 text-xs group-hover:text-neutral-300 shrink-0">✏️</span>
            </button>
          )}
        </div>
        {saving && <span className="text-neutral-500 text-xs shrink-0">Guardando...</span>}
      </header>

      {/* Días */}
      <div className="px-4 pt-4 pb-2 max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Día</p>
        <div className="flex flex-wrap gap-2">
          {program?.days.map((d, idx) => (
            <button key={d.id} onClick={() => { setSelectedDayIdx(idx); setSelectedMcNum(1); }}
              className={"px-3 py-2 rounded-lg text-xs font-medium transition-colors " + (selectedDayIdx === idx ? "bg-white text-black" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700")}>
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Microciclos */}
      {currentDay && (
        <div className="px-4 pb-4 max-w-3xl mx-auto space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Microciclo</p>
            <div className="flex flex-wrap gap-2 items-center">
              {currentDay.microcycles.map(mc => (
                <button key={mc.id} onClick={() => setSelectedMcNum(mc.number)}
                  className={"w-10 h-10 rounded-lg text-sm font-medium transition-colors " + (mc.number === selectedMcNum ? "bg-white text-black" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700")}>
                  {mc.number}
                </button>
              ))}
              <button onClick={addMicrocycle} disabled={saving}
                className="w-10 h-10 rounded-lg bg-emerald-900/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/70 text-xl font-bold flex items-center justify-center disabled:opacity-40" title="Añadir microciclo">
                +
              </button>
              {currentDay.microcycles.length > 1 && (
                <button onClick={removeMicrocycle} disabled={saving}
                  className="w-10 h-10 rounded-lg bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-950/70 text-lg font-bold flex items-center justify-center disabled:opacity-40" title="Eliminar microciclo actual">
                  −
                </button>
              )}
            </div>
          </div>

          {/* Botón sincronizar estructura */}
          {currentDay.microcycles.length > 1 && (
            <button
              onClick={syncStructureToAll}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-950/50 text-blue-300 border border-blue-800/40 hover:bg-blue-950/80 text-xs font-medium transition-colors disabled:opacity-40"
              title="Copia los ejercicios y el número de series de este microciclo al resto. No sobreescribe los valores de reps/RIR que ya existan."
            >
              <span>📋</span>
              <span>Copiar estructura del Mc {selectedMcNum} a todos los microciclos</span>
            </button>
          )}
        </div>
      )}

      {/* Ejercicios */}
      <div className="px-4 max-w-3xl mx-auto space-y-2">
        {currentMc?.exercises.length === 0 && (
          <p className="text-neutral-600 text-sm text-center py-6">Este microciclo no tiene ejercicios todavía.</p>
        )}
        {currentMc?.exercises.map((ex) => {
          const isSwapping = swapping?.meId === ex.id;
          const swapGroupExercises = isSwapping
            ? catalog.filter(c => c.muscle_group.trim().toLowerCase() === swapping.selectedGroup.trim().toLowerCase())
            : [];
          return (
            <div key={ex.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              {/* Cabecera: grupo + nombre + botones */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  {isSwapping ? (
                    /* ── Modo swap: dos desplegables encadenados ── */
                    <div className="space-y-2">
                      {/* Desplegable 1: grupo muscular */}
                      <select
                        value={swapping.selectedGroup}
                        onChange={e => setSwapping({ meId: ex.id, selectedGroup: e.target.value, selectedExId: null })}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-white">
                        {allGroups.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      {/* Desplegable 2: ejercicio del grupo */}
                      <select
                        value={swapping.selectedExId ?? ""}
                        onChange={e => setSwapping(prev => prev ? { ...prev, selectedExId: Number(e.target.value) } : prev)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-white">
                        <option value="">— Selecciona ejercicio —</option>
                        {swapGroupExercises.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      {/* Guardar / Cancelar */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={swapExercise}
                          disabled={!swapping.selectedExId || saving}
                          className="flex-1 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-neutral-200 disabled:opacity-40">
                          Guardar
                        </button>
                        <button
                          onClick={() => setSwapping(null)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs hover:bg-neutral-700">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Modo normal: texto ── */
                    <>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500">{ex.muscle_group}</p>
                      <p className="text-white text-sm font-semibold leading-tight">{ex.name}</p>
                    </>
                  )}
                </div>
                {!isSwapping && (
                  <div className="flex gap-1.5 shrink-0">
                    {/* Botón cambiar ejercicio */}
                    <button
                      onClick={() => setSwapping({ meId: ex.id, selectedGroup: ex.muscle_group, selectedExId: ex.exercise_id })}
                      disabled={saving}
                      className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white text-xs flex items-center justify-center disabled:opacity-40"
                      title="Cambiar ejercicio">
                      🔄
                    </button>
                    {/* Botón eliminar */}
                    <button onClick={() => removeExercise(ex.id, ex.name)} disabled={saving}
                      className="w-7 h-7 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-950/70 text-sm flex items-center justify-center disabled:opacity-40"
                      title="Eliminar ejercicio">
                      ✕
                    </button>
                  </div>
                )}
              </div>
              {/* Series editables */}
              <div className="space-y-1.5 mt-1">
                {ex.sets.map(s => {
                  const edit = setEdits[s.id] ?? { target_reps: s.target_reps ?? "", target_rpe: s.target_rpe ?? "" };
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      <span className="text-neutral-600 text-xs w-5 shrink-0 text-center">{s.set_number}</span>
                      <input
                        value={edit.target_reps}
                        onChange={e => setSetEdits(prev => ({ ...prev, [s.id]: { ...edit, target_reps: e.target.value } }))}
                        onBlur={() => saveSetField(s.id)}
                        placeholder="Reps (ej: 8 a 10)"
                        className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
                      />
                      <span className="text-neutral-600 text-xs shrink-0">RIR</span>
                      <input
                        value={edit.target_rpe}
                        onChange={e => setSetEdits(prev => ({ ...prev, [s.id]: { ...edit, target_rpe: e.target.value } }))}
                        onBlur={() => saveSetField(s.id)}
                        placeholder="0"
                        className="w-14 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-neutral-500 text-center"
                      />
                    </div>
                  );
                })}
                <div className="flex gap-1.5 pt-1">
                  <button onClick={() => addSet(ex)} disabled={saving}
                    className="px-3 py-1 rounded-lg bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/60 text-xs font-medium disabled:opacity-40">
                    + Serie
                  </button>
                  {ex.sets.length > 1 && (
                    <button onClick={() => removeSet(ex)} disabled={saving}
                      className="px-3 py-1 rounded-lg bg-neutral-800 text-neutral-400 hover:bg-neutral-700 text-xs font-medium disabled:opacity-40">
                      − Serie
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <button onClick={() => setShowExPicker(true)}
          className="w-full py-3.5 rounded-xl border-2 border-dashed border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 text-sm font-medium transition-colors">
          + Añadir ejercicio del catálogo
        </button>
      </div>

      {/* Modal selector de ejercicio */}
      {showExPicker && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => { setShowExPicker(false); setExSearch(""); }}>
          <div className="bg-neutral-900 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-neutral-800 max-h-[85vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-neutral-800 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-semibold text-sm">Añadir ejercicio</h2>
                <button onClick={() => { setShowExPicker(false); setExSearch(""); }} className="text-neutral-400 hover:text-white">✕</button>
              </div>
              <input type="text" value={exSearch} onChange={e => setExSearch(e.target.value)}
                placeholder="Buscar por nombre o músculo..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white text-sm"
                autoFocus />
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-3">
              {Object.entries(groupedCatalog).map(([group, exs]) => (
                <div key={group}>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5 px-1">{group}</p>
                  <div className="space-y-1">
                    {exs.map(ex => (
                      <button key={ex.id} onClick={() => addExercise(ex)} disabled={saving}
                        className="w-full text-left px-3 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm text-white transition-colors disabled:opacity-40">
                        {ex.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {filteredCatalog.length === 0 && <p className="text-neutral-500 text-sm text-center py-8">Sin resultados para "{exSearch}"</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
