import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type CatalogEx = { id: number; muscle_group: string; name: string; video_ref: string | null };
type EditorSet = { id: number; set_number: number; target_reps: string | null; target_rpe: string | null };
type EditorEx = { id: number; exercise_id: number; name: string; muscle_group: string; order_index: number; note: string | null; sets: EditorSet[] };
type EditorMc = { id: number; number: number; exercises: EditorEx[] };
type EditorDay = { id: number; name: string; order_index: number; optional: boolean; microcycles: EditorMc[] };
type EditorProgram = { id: number; name: string; description: string | null; days: EditorDay[] };

type Props = { programId: number; onBack: () => void };

// Opciones predefinidas de series: "X a Y (RIR)"
const REPS_OPTIONS: string[] = [
  "2 a 4 (3)", "2 a 4 (2)",
  "3 a 5 (3)", "3 a 5 (2)",
  "4 a 6 (2)",
  "4 a 7 (2)",
  "5 a 7 (2)", "5 a 7 (1)",
  "5 a 8 (2)", "5 a 8 (1)",
  "6 a 8 (3)", "6 a 8 (2)", "6 a 8 (1)", "6 a 8 (0)",
  "6 a 9 (1)", "6 a 9 (0)",
  "7 a 9 (3)", "7 a 9 (2)", "7 a 9 (1)", "7 a 9 (0)", "7 a 9 (fallo)",
  "8 a 10 (3)", "8 a 10 (2)", "8 a 10 (1)", "8 a 10 (0)", "8 a 10 (fallo)",
  "9 a 12 (3)", "9 a 12 (2)", "9 a 12 (1)", "9 a 12 (0)", "9 a 12 (fallo)",
  "10 a 12 (3)", "10 a 12 (2)", "10 a 12 (1)", "10 a 12 (0)", "10 a 12 (fallo)",
  "11 a 14 (3)", "11 a 14 (2)", "11 a 14 (1)", "11 a 14 (0)", "11 a 14 (fallo)",
  "12 a 15 (3)", "12 a 15 (2)", "12 a 15 (1)", "12 a 15 (0)", "12 a 15 (fallo)",
  "15 a 20 (3)", "15 a 20 (2)", "15 a 20 (1)", "15 a 20 (0)", "15 a 20 (fallo)",
];

export default function ProgramEditor({ programId, onBack }: Props) {
  const [program, setProgram] = useState<EditorProgram | null>(null);
  const [catalog, setCatalog] = useState<CatalogEx[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedMcNum, setSelectedMcNum] = useState(1);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  // Renombrar días
  const [editingDayId, setEditingDayId] = useState<number | null>(null);
  const [dayNameInput, setDayNameInput] = useState("");
  // Drag & drop de días
  const [dragFromIdx, setDragFromIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [showExPicker, setShowExPicker] = useState(false);
  const [exSearch, setExSearch] = useState("");

  // Edición inline de ejercicio (cambiar grupo + ejercicio sin eliminar)
  type SwapState = { meId: number; selectedGroup: string; selectedExId: number | null };
  const [swapping, setSwapping] = useState<SwapState | null>(null);

  // Edición inline de reps/RIR por serie: setId → { target_reps, target_rpe }
  const [setEdits, setSetEdits] = useState<Record<number, { target_reps: string; target_rpe: string }>>({});

  // Cuando está activo, guardar un campo lo replica en el mismo ejercicio+serie de todos los Mcs
  const [autoSync, setAutoSync] = useState(true);
  // Feedback visual breve tras sincronizar
  const [syncFlash, setSyncFlash] = useState(false);

  useEffect(() => { setLoading(true); loadAll().finally(() => setLoading(false)); }, []);

  // loadAll NO toca el estado de loading — la carga inicial lo gestiona el useEffect.
  // Esto permite llamar a loadAll() desde mutaciones sin mostrar pantalla de carga.
  const loadAll = async () => {
    const [progRes, catRes] = await Promise.all([
      supabase.from("programs").select(`
        id, name, description,
        program_days ( id, name, order_index, optional,
          microcycles ( id, number,
            microcycle_exercises ( id, order_index, note,
              exercises ( id, name, muscle_group ),
              exercise_sets ( id, set_number, target_reps, target_rpe )
            )
          )
        )
      `).eq("id", programId).single(),
      supabase.from("exercises").select("*").order("muscle_group").order("name"),
    ]);
    if (progRes.error) console.error("[loadAll] ❌ Error query:", progRes.error);
    if (progRes.data) {
      const raw = progRes.data as any;
      const totalMcs = (raw.program_days ?? []).flatMap((d: any) => d.microcycles ?? []).length;
      const totalExs = (raw.program_days ?? []).flatMap((d: any) => (d.microcycles ?? []).flatMap((m: any) => m.microcycle_exercises ?? [])).length;
      console.log(`[loadAll] ✅ Datos recibidos: ${(raw.program_days ?? []).length} días, ${totalMcs} microciclos, ${totalExs} ejercicios`);
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
                  order_index: me.order_index, note: me.note ?? null,
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

  const saveDayName = async (dayId: number) => {
    if (!dayNameInput.trim()) { setEditingDayId(null); return; }
    setSaving(true);
    await supabase.from("program_days").update({ name: dayNameInput.trim() }).eq("id", dayId);
    setProgram(p => p ? { ...p, days: p.days.map(d => d.id === dayId ? { ...d, name: dayNameInput.trim() } : d) } : p);
    setEditingDayId(null);
    setSaving(false);
  };

  const moveDay = async (fromIdx: number, toIdx: number) => {
    if (!program || fromIdx === toIdx) return;
    setSaving(true);
    const days = [...program.days];
    const fromDay = days[fromIdx];
    const toDay   = days[toIdx];
    // Intercambia order_index en Supabase
    await Promise.all([
      supabase.from("program_days").update({ order_index: toDay.order_index }).eq("id", fromDay.id),
      supabase.from("program_days").update({ order_index: fromDay.order_index }).eq("id", toDay.id),
    ]);
    // Actualiza estado local
    const newDays = days.map(d => {
      if (d.id === fromDay.id) return { ...d, order_index: toDay.order_index };
      if (d.id === toDay.id)   return { ...d, order_index: fromDay.order_index };
      return d;
    }).sort((a, b) => a.order_index - b.order_index);
    setProgram(p => p ? { ...p, days: newDays } : p);
    setSelectedDayIdx(toIdx);
    setSaving(false);
  };

  const addDay = async () => {
    if (!program) return;
    setSaving(true);
    const nextOrder = program.days.length > 0
      ? Math.max(...program.days.map(d => d.order_index)) + 1
      : 0;
    const newName = `Día ${program.days.length + 1}`;
    const { data: newDay } = await supabase.from("program_days")
      .insert({ program_id: program.id, name: newName, order_index: nextOrder, optional: false })
      .select().single();
    if (newDay) {
      const { data: newMc } = await supabase.from("microcycles")
        .insert({ day_id: newDay.id, number: 1 }).select().single();
      const newEditorDay: EditorDay = {
        id: newDay.id, name: newDay.name, order_index: newDay.order_index, optional: false,
        microcycles: newMc ? [{ id: newMc.id, number: 1, exercises: [] }] : [],
      };
      const newDays = [...program.days, newEditorDay];
      setProgram(p => p ? { ...p, days: newDays } : p);
      setSelectedDayIdx(newDays.length - 1);
      setSelectedMcNum(1);
      // Abre el renombre inmediatamente
      setEditingDayId(newDay.id);
      setDayNameInput(newDay.name);
    }
    setSaving(false);
  };

  const deleteDay = async (dayId: number, dayIdx: number) => {
    if (!program) return;
    if (program.days.length <= 1) { alert("El programa debe tener al menos un día."); return; }
    if (!confirm(`¿Eliminar este día y todos sus microciclos y ejercicios?`)) return;
    setSaving(true);
    await supabase.from("program_days").delete().eq("id", dayId);
    const newDays = program.days.filter(d => d.id !== dayId);
    setProgram(p => p ? { ...p, days: newDays } : p);
    setSelectedDayIdx(Math.max(0, dayIdx - 1));
    setSaving(false);
  };

  const addMicrocycle = async () => {
    if (!currentDay) return;
    setSaving(true);

    const nextNum = Math.max(...currentDay.microcycles.map(m => m.number), 0) + 1;
    console.log(`[DUP] Iniciando duplicado → Mc${nextNum}, día="${currentDay.name}" (id=${currentDay.id})`);
    const lastMcForLog = currentDay.microcycles[currentDay.microcycles.length - 1];
    console.log(`[DUP] Ejercicios a copiar: ${lastMcForLog?.exercises.length ?? 0}`);

    const { data: newMc, error: mcError } = await supabase
      .from("microcycles")
      .insert({ day_id: currentDay.id, number: nextNum })
      .select().single();

    if (!newMc || mcError) {
      console.error("[DUP] ❌ Error creando microciclo:", mcError);
      setSaving(false);
      return;
    }
    console.log(`[DUP] ✅ Microciclo creado id=${newMc.id}`);

    const lastMc = currentDay.microcycles[currentDay.microcycles.length - 1];

    for (const ex of lastMc?.exercises ?? []) {
      console.log(`[DUP] Insertando ejercicio "${ex.name}"...`);
      const { data: newMe, error: meError } = await supabase
        .from("microcycle_exercises")
        .insert({
          microcycle_id: newMc.id,
          exercise_id: ex.exercise_id,
          order_index: ex.order_index,
          total_sets: ex.sets.length,
        })
        .select().single();

      if (!newMe || meError) {
        console.error(`[DUP] ❌ Error ejercicio "${ex.name}":`, meError);
        continue;
      }
      console.log(`[DUP] ✅ Ejercicio "${ex.name}" creado id=${newMe.id}, insertando ${ex.sets.length} series...`);

      const { error: setsError } = await supabase
        .from("exercise_sets")
        .insert(
          ex.sets.map(s => ({
            microcycle_exercise_id: newMe.id,
            set_number: s.set_number,
            target_reps: s.target_reps,
            target_rpe: s.target_rpe,
          }))
        );

      if (setsError) {
        console.error(`[DUP] ❌ Error series "${ex.name}":`, setsError);
      } else {
        console.log(`[DUP] ✅ Series de "${ex.name}" creadas`);
      }
    }

    console.log("[DUP] Todos los inserts terminados, llamando loadAll()...");
    await loadAll();
    console.log("[DUP] loadAll() completado, seleccionando Mc" + nextNum);
    setSelectedMcNum(nextNum);
    setSaving(false);
    console.log("[DUP] ✅ Duplicado completo");
  };

  const removeMicrocycle = async () => {
    if (!currentDay || !currentMc) return;
    if (currentDay.microcycles.length <= 1) { alert("Debe quedar al menos 1 microciclo."); return; }
    if (!confirm(`¿Eliminar Microciclo ${currentMc.number}? Se perderán todos sus ejercicios.`)) return;
    setSaving(true);
    await supabase.from("microcycles").delete().eq("id", currentMc.id);
    const next = currentDay.microcycles.find(m => m.number !== currentMc.number)?.number ?? 1;
    // Actualizar estado local al instante
    setProgram(p => {
      if (!p) return p;
      return {
        ...p,
        days: p.days.map((d, i) =>
          i !== selectedDayIdx ? d
            : { ...d, microcycles: d.microcycles.filter(m => m.id !== currentMc!.id) }
        ),
      };
    });
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
      const { data: setsData } = await supabase.from("exercise_sets").insert([
        { microcycle_exercise_id: (newMe as any).id, set_number: 1, target_reps: null, target_rpe: null },
        { microcycle_exercise_id: (newMe as any).id, set_number: 2, target_reps: null, target_rpe: null },
        { microcycle_exercise_id: (newMe as any).id, set_number: 3, target_reps: null, target_rpe: null },
      ]).select();
      const newSets: EditorSet[] = ((setsData ?? []) as any[]).map(s => ({ id: s.id, set_number: s.set_number, target_reps: null, target_rpe: null }));
      const newEdits: Record<number, { target_reps: string; target_rpe: string }> = {};
      newSets.forEach(s => { newEdits[s.id] = { target_reps: "", target_rpe: "" }; });
      const newEditorEx: EditorEx = { id: (newMe as any).id, exercise_id: ex.id, name: ex.name, muscle_group: ex.muscle_group, order_index: nextOrder, note: null, sets: newSets };
      setProgram(p => {
        if (!p) return p;
        return {
          ...p,
          days: p.days.map(d => ({
            ...d,
            microcycles: d.microcycles.map(mc => mc.id !== currentMc!.id ? mc : { ...mc, exercises: [...mc.exercises, newEditorEx] }),
          })),
        };
      });
      setSetEdits(prev => ({ ...prev, ...newEdits }));
    }
    setShowExPicker(false); setExSearch("");
    setSaving(false);
  };

  const removeExercise = async (meId: number, exName: string) => {
    if (!confirm(`¿Quitar "${exName}" de este microciclo?`)) return;
    setSaving(true);
    await supabase.from("microcycle_exercises").delete().eq("id", meId);
    setProgram(p => {
      if (!p) return p;
      return {
        ...p,
        days: p.days.map(d => ({
          ...d,
          microcycles: d.microcycles.map(mc => ({ ...mc, exercises: mc.exercises.filter(e => e.id !== meId) })),
        })),
      };
    });
    setSaving(false);
  };

  const addSet = async (ex: EditorEx) => {
    setSaving(true);
    const nextNum = (ex.sets.length > 0 ? Math.max(...ex.sets.map(s => s.set_number)) : 0) + 1;
    const { data: newSet } = await supabase
      .from("exercise_sets")
      .insert({ microcycle_exercise_id: ex.id, set_number: nextNum, target_reps: null, target_rpe: null })
      .select().single();
    if (newSet) {
      const ns: EditorSet = { id: (newSet as any).id, set_number: nextNum, target_reps: null, target_rpe: null };
      setSetEdits(prev => ({ ...prev, [(newSet as any).id]: { target_reps: "", target_rpe: "" } }));
      setProgram(p => {
        if (!p) return p;
        return {
          ...p,
          days: p.days.map(d => ({
            ...d,
            microcycles: d.microcycles.map(mc => ({
              ...mc,
              exercises: mc.exercises.map(e => e.id === ex.id ? { ...e, sets: [...e.sets, ns] } : e),
            })),
          })),
        };
      });
    }
    setSaving(false);
  };

  const removeSet = async (ex: EditorEx) => {
    if (ex.sets.length <= 1) return;
    setSaving(true);
    const lastSet = ex.sets[ex.sets.length - 1];
    await supabase.from("exercise_sets").delete().eq("id", lastSet.id);
    setProgram(p => {
      if (!p) return p;
      return {
        ...p,
        days: p.days.map(d => ({
          ...d,
          microcycles: d.microcycles.map(mc => ({
            ...mc,
            exercises: mc.exercises.map(e => e.id === ex.id ? { ...e, sets: e.sets.slice(0, -1) } : e),
          })),
        })),
      };
    });
    setSaving(false);
  };

  // Grupos musculares únicos del catálogo (normalizados para evitar duplicados por espacios/mayúsculas)
  const allGroups = [...new Map(
    catalog.map(e => [e.muscle_group.trim().toLowerCase(), e.muscle_group.trim()])
  ).values()].sort((a, b) => a.localeCompare(b, "es"));

  // Cambia el exercise_id de un microcycle_exercise sin borrar sus series.
  // Sincroniza por POSICIÓN (order_index): actualiza el ejercicio que esté
  // en la misma posición en TODOS los demás microciclos del día.
  const swapExercise = async () => {
    if (!swapping || !swapping.selectedExId || !currentDay) return;
    setSaving(true);

    // 1. Buscar el order_index del ejercicio que se está cambiando
    let orderIndex: number | null = null;
    for (const mc of currentDay.microcycles) {
      const found = mc.exercises.find(e => e.id === swapping.meId);
      if (found) { orderIndex = found.order_index; break; }
    }

    // 2. Actualizar el microcycle_exercise concreto que editó el admin
    const { error: errMain } = await supabase.from("microcycle_exercises")
      .update({ exercise_id: swapping.selectedExId })
      .eq("id", swapping.meId);

    if (errMain) {
      alert(`Error al guardar: ${errMain.message}`);
      setSaving(false);
      return;
    }

    // 3. Propagar a TODOS los demás microciclos por posición (order_index)
    let synced = 0;
    if (orderIndex !== null) {
      for (const mc of currentDay.microcycles) {
        const atSamePosition = mc.exercises.find(
          e => e.order_index === orderIndex && e.id !== swapping.meId
        );
        if (atSamePosition) {
          const { error } = await supabase.from("microcycle_exercises")
            .update({ exercise_id: swapping.selectedExId })
            .eq("id", atSamePosition.id);
          if (!error) synced++;
          else console.error("Error sync mc", mc.number, error);
        }
      }
    }

    setSwapping(null);
    await loadAll();
    setSaving(false);

    if (synced > 0) {
      setSyncFlash(true);
      setTimeout(() => setSyncFlash(false), 2000);
    } else if (orderIndex === null) {
      alert("⚠️ No se encontró la posición del ejercicio. Recarga la página e inténtalo de nuevo.");
    }
  };

  // Guarda reps/RIR de una serie.
  // Puede recibir valores directos (desde el select) o leerlos del estado (al perder foco).
  // Si autoSync está activo, propaga el valor al mismo ejercicio+serie en todos los Mcs del día.
  const saveSetField = async (setId: number, overrideReps?: string | null) => {
    const edit = setEdits[setId];
    if (!edit && overrideReps === undefined) return;

    const newReps = overrideReps !== undefined ? (overrideReps || null) : ((edit?.target_reps ?? "").trim() || null);
    const newRpe  = overrideReps !== undefined ? null : ((edit?.target_rpe ?? "").trim() || null);

    // Guardar el campo actual
    await supabase.from("exercise_sets").update({
      target_reps: newReps,
      target_rpe:  newRpe,
    }).eq("id", setId);

    // Propagar a los demás microciclos si autoSync está ON
    if (autoSync && currentDay) {
      // Buscar exactamente en qué microciclo/ejercicio/serie está este setId
      let srcMcId:    number | null = null;
      let exerciseId: number | null = null;
      let setNumber:  number | null = null;

      for (const mc of currentDay.microcycles) {
        for (const ex of mc.exercises) {
          const found = ex.sets.find(s => s.id === setId);
          if (found) {
            srcMcId    = mc.id;
            exerciseId = ex.exercise_id;
            setNumber  = found.set_number;
            break;
          }
        }
        if (srcMcId !== null) break;
      }

      if (srcMcId !== null && exerciseId !== null && setNumber !== null) {
        // Excluir el microciclo que contiene el setId editado (no el currentMc del selector)
        const otherMcs = currentDay.microcycles.filter(m => m.id !== srcMcId);
        let synced = 0;

        for (const mc of otherMcs) {
          const sameEx = mc.exercises.find(e => e.exercise_id === exerciseId);
          if (!sameEx) continue;
          const sameSet = sameEx.sets.find(s => s.set_number === setNumber);
          if (!sameSet) continue;

          await supabase.from("exercise_sets").update({
            target_reps: newReps,
            target_rpe:  newRpe,
          }).eq("id", sameSet.id);

          // Actualizar estado local para que el select refleje el nuevo valor
          setSetEdits(prev => ({
            ...prev,
            [sameSet.id]: { target_reps: newReps ?? "", target_rpe: newRpe ?? "" },
          }));
          synced++;
        }

        if (synced > 0) {
          setSyncFlash(true);
          setTimeout(() => setSyncFlash(false), 1500);
        }
      }
    }
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
              note: srcEx.note ?? null,
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
          // 2b. Ejercicio ya existe: actualizar orden, ajustar series y propagar note
          await supabase
            .from("microcycle_exercises")
            .update({ order_index: srcEx.order_index, total_sets: srcEx.sets.length, note: srcEx.note ?? null })
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
        <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Días · arrastra para reordenar</p>

        {/* Formulario de renombre inline (flota encima si está activo) */}
        {editingDayId !== null && (
          <form
            onSubmit={e => { e.preventDefault(); saveDayName(editingDayId); }}
            className="flex gap-1.5 mb-3">
            <input
              autoFocus
              value={dayNameInput}
              onChange={e => setDayNameInput(e.target.value)}
              className="flex-1 bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
              placeholder="Nombre del día"
            />
            <button type="submit" disabled={saving}
              className="px-3 py-2 rounded-lg bg-white text-black text-xs font-bold disabled:opacity-40">✓ Guardar</button>
            <button type="button" onClick={() => setEditingDayId(null)}
              className="px-3 py-2 rounded-lg text-neutral-300 text-xs"
              style={{ background: "#2a2a2a" }}>✕</button>
          </form>
        )}

        <div className="flex flex-wrap gap-2 items-center">
          {program?.days.map((d, idx) => {
            const isSelected = selectedDayIdx === idx;
            const isDragging = dragFromIdx === idx;
            const isOver = dragOverIdx === idx && dragFromIdx !== idx;
            return (
              <div
                key={d.id}
                draggable
                onDragStart={() => { setDragFromIdx(idx); }}
                onDragEnd={() => { setDragFromIdx(null); setDragOverIdx(null); }}
                onDragOver={e => { e.preventDefault(); setDragOverIdx(idx); }}
                onDrop={e => { e.preventDefault(); if (dragFromIdx !== null) moveDay(dragFromIdx, idx); setDragFromIdx(null); setDragOverIdx(null); }}
                className={"flex items-center rounded-lg text-xs font-medium cursor-grab active:cursor-grabbing select-none transition-all " +
                  (isSelected ? "bg-white text-black " : "bg-neutral-800 text-neutral-300 ") +
                  (isDragging ? "opacity-40 " : "") +
                  (isOver ? "ring-2 ring-blue-500 " : "")}
                style={{ height: 38 }}
              >
                <button
                  onClick={() => { setSelectedDayIdx(idx); setSelectedMcNum(1); }}
                  className="pl-3 pr-1.5 h-full flex items-center"
                  style={{ background: "transparent", fontSize: "inherit", color: "inherit" }}
                >
                  {d.name}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); deleteDay(d.id, idx); }}
                  disabled={saving}
                  className="pr-2 pl-0.5 h-full flex items-center disabled:opacity-30"
                  style={{ background: "transparent", color: isSelected ? "#999" : "#555", fontSize: 15, lineHeight: 1 }}
                  title="Eliminar día"
                >×</button>
              </div>
            );
          })}

          {/* Botón añadir día */}
          <button
            onClick={addDay}
            disabled={saving}
            className="px-3 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-40 flex items-center gap-1"
            style={{ background: "#0E2010", border: "1px solid #1E4020", color: "#4ADE80" }}
            title="Añadir nuevo día"
          >
            + Día
          </button>
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

      {/* Toggle auto-sync + flash de confirmación */}
      {currentDay && currentDay.microcycles.length > 1 && (
        <div className="px-4 pb-3 max-w-3xl mx-auto flex items-center justify-between gap-3">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <button
              onClick={() => setAutoSync(v => !v)}
              className={"w-10 h-6 rounded-full transition-colors relative flex-shrink-0 " +
                (autoSync ? "bg-blue-600" : "bg-neutral-700")}
              role="switch" aria-checked={autoSync}
            >
              <span className={"absolute top-1 w-4 h-4 rounded-full bg-white transition-all " +
                (autoSync ? "left-5" : "left-1")} />
            </button>
            <span className="text-xs text-neutral-400">
              Aplicar reps/RIR a <span className="font-semibold text-neutral-200">todos los microciclos</span>
            </span>
          </label>
          {syncFlash && (
            <span className="text-xs text-blue-400 font-medium animate-pulse">
              ✓ Sincronizado
            </span>
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
                      {ex.note && (
                        <p className="mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded inline-block"
                          style={{
                            background: ex.note.toLowerCase().includes("drop") ? "#2d1a3a" : "#2a1f00",
                            color: ex.note.toLowerCase().includes("drop") ? "#c084fc" : "#fbbf24",
                          }}>
                          {ex.note.toLowerCase().includes("drop") ? "📉" : "🔁"} {ex.note}
                        </p>
                      )}
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
                      <select
                        value={edit.target_reps ?? ""}
                        onChange={e => {
                          const val = e.target.value;
                          // Actualizar estado local
                          setSetEdits(prev => ({ ...prev, [s.id]: { ...edit, target_reps: val, target_rpe: "" } }));
                          // Guardar directamente pasando el valor (no esperar al estado)
                          saveSetField(s.id, val);
                        }}
                        className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-neutral-500 appearance-none cursor-pointer"
                      >
                        <option value="">— Seleccionar —</option>
                        {REPS_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        {/* Si el valor actual no está en la lista predefinida, mostrarlo igualmente */}
                        {edit.target_reps && !REPS_OPTIONS.includes(edit.target_reps) && (
                          <option value={edit.target_reps}>{edit.target_reps}</option>
                        )}
                      </select>
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
