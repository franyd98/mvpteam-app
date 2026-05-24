import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ProgramEditor from "./ProgramEditor";
import { AntroTable } from "./CheckInPage";
import VisitaPresencial from "./VisitaPresencial";
import DietEditor from "./DietEditor";
import { MVPWordmark } from "../components/MVPLogo";

type Profile = { id: string; full_name: string; role: string };
type CatalogEx = { id: number; muscle_group: string; name: string; video_ref: string | null };
type ProgramRow = { id: number; name: string; description: string | null };
type Assignment = { client_id: string; program_id: number; program_name: string };
type DietPlan = { id: string; name: string; kcal_on: number | null; kcal_off: number | null; notes: string | null };
type DietAssignment = { client_id: string; plan_id: string; plan_name: string };
type Tab = "programas" | "clientes" | "ejercicios" | "dietas";

type ClientLog = {
  id: number;
  weight: number;
  reps: number;
  rpe: number;
  unit: string;
  logged_at: string;
  exercise_sets: {
    set_number: number;
    microcycle_exercises: {
      exercises: { name: string; muscle_group: string } | null;
      microcycles: {
        number: number;
        program_days: { name: string } | null;
      } | null;
    } | null;
  } | null;
};

export default function AdminPage({ profile }: { profile: Profile }) {
  const [tab, setTab] = useState<Tab>("programas");
  const [clients, setClients] = useState<Profile[]>([]);
  const [exercises, setExercises] = useState<CatalogEx[]>([]);
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [editingProgramId, setEditingProgramId] = useState<number | null>(null);

  // Vista de progreso de cliente
  const [viewingClient, setViewingClient] = useState<Profile | null>(null);
  const [clientLogs, setClientLogs] = useState<ClientLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [selectedTrainingDay, setSelectedTrainingDay] = useState<string | null>(null);
  const [clientViewTab, setClientViewTab] = useState<"entreno" | "checkin" | "dieta">("entreno");
  const [clientCheckIn, setClientCheckIn] = useState<{ weights: any[]; perims: any[]; folds: any[]; fatigues: any[] } | null>(null);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [showVisita, setShowVisita] = useState(false);
  const [checkInFilter, setCheckInFilter] = useState<"all" | "presencial" | "auto">("all");
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [dietAssignments, setDietAssignments] = useState<DietAssignment[]>([]);
  // "__none__" = cerrado; null = nuevo plan; string = editar plan existente
  const [editingDietPlanId, setEditingDietPlanId] = useState<string | null | "__none__">("__none__");
  const [assigningDietPlan, setAssigningDietPlan] = useState<string | null>(null);

  // Añadir ejercicio al catálogo
  const [newExName, setNewExName] = useState("");
  const [newExGroup, setNewExGroup] = useState("");
  const [newExVideo, setNewExVideo] = useState("");
  const [addingEx, setAddingEx] = useState(false);

  // Búsqueda en catálogo
  const [searchEx, setSearchEx] = useState("");

  // Edición inline de ejercicios
  type EditingEx = { id: number; name: string; muscle_group: string; video_ref: string };
  const [editingEx, setEditingEx] = useState<EditingEx | null>(null);
  const [savingEx, setSavingEx] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadClients(), loadExercises(), loadPrograms(), loadAssignments(), loadDietPlans(), loadDietAssignments()]);
    setLoading(false);
  };
  const loadClients = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("role", "client").order("full_name");
    setClients(data ?? []);
  };
  const loadExercises = async () => {
    const { data } = await supabase.from("exercises").select("*").order("muscle_group").order("name");
    setExercises(data ?? []);
  };
  const loadPrograms = async () => {
    const { data } = await supabase.from("programs").select("id, name, description").order("name");
    setPrograms(data ?? []);
  };
  const loadAssignments = async () => {
    const { data } = await supabase
      .from("program_assignments")
      .select("client_id, program_id, programs(name)")
      .eq("active", true);
    setAssignments(
      (data ?? []).map((a: any) => ({
        client_id: a.client_id,
        program_id: a.program_id,
        program_name: a.programs?.name ?? "Programa desconocido",
      }))
    );
  };
  const loadDietPlans = async () => {
    const { data } = await supabase.from("diet_plans").select("id, name, kcal_on, kcal_off, notes").order("name");
    setDietPlans(data ?? []);
  };
  const loadDietAssignments = async () => {
    const { data } = await supabase
      .from("diet_assignments")
      .select("client_id, plan_id, diet_plans(name)")
      .eq("active", true);
    setDietAssignments(
      (data ?? []).map((a: any) => ({
        client_id: a.client_id,
        plan_id: a.plan_id,
        plan_name: a.diet_plans?.name ?? "Plan desconocido",
      }))
    );
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const openClientProgress = async (client: Profile) => {
    setViewingClient(client);
    setClientViewTab("entreno");
    setSelectedTrainingDay(null);
    setClientCheckIn(null);
    openClientLogs(client);
  };

  const loadClientCheckIn = async (clientId: string) => {
    setLoadingCheckIn(true);
    const [w, p, fl, f] = await Promise.all([
      supabase.from("weight_logs").select("*").eq("client_id", clientId).order("date", { ascending: true }).limit(20),
      supabase.from("perimeter_logs").select("*").eq("client_id", clientId).order("date", { ascending: true }).limit(20),
      supabase.from("fold_logs").select("*").eq("client_id", clientId).order("date", { ascending: true }).limit(20),
      supabase.from("fatigue_logs").select("*").eq("client_id", clientId).order("date", { ascending: false }).limit(20),
    ]);
    setClientCheckIn({
      weights: w.data ?? [],
      perims: p.data ?? [],
      folds: fl.data ?? [],
      fatigues: f.data ?? [],
    });
    setLoadingCheckIn(false);
  };

  const openClientLogs = async (client: Profile) => {
    setViewingClient(client);
    setLoadingLogs(true);
    const { data } = await supabase
      .from("set_logs")
      .select(`
        id, weight, reps, rpe, unit, logged_at,
        exercise_sets (
          set_number,
          microcycle_exercises (
            exercises ( name, muscle_group ),
            microcycles (
              number,
              program_days ( name )
            )
          )
        )
      `)
      .eq("client_id", client.id)
      .order("logged_at", { ascending: false })
      .limit(300);
    setClientLogs((data as unknown as ClientLog[]) ?? []);
    setLoadingLogs(false);
  };

  const handleAssign = async (programId: number, clientId: string, clientName: string) => {
    await supabase.from("program_assignments").update({ active: false }).eq("client_id", clientId);
    const { error } = await supabase.from("program_assignments").insert({ program_id: programId, client_id: clientId, active: true });
    showToast(error ? "Error al asignar" : `✅ Asignado a ${clientName}`);
    setAssigning(null);
    await loadAssignments();
  };

  const handleUnassign = async (clientId: string, clientName: string, skipConfirm = false) => {
    if (!skipConfirm && !confirm(`¿Desasignar el programa de ${clientName}?`)) return;
    await supabase.from("program_assignments").update({ active: false }).eq("client_id", clientId);
    showToast(`✅ Programa desasignado de ${clientName}`);
    await loadAssignments();
  };

  // ── Diet handlers ────────────────────────────────────────────
  const handleAssignDiet = async (planId: string, clientId: string, clientName: string) => {
    await supabase.from("diet_assignments").update({ active: false }).eq("client_id", clientId);
    const { error } = await supabase.from("diet_assignments").insert({ plan_id: planId, client_id: clientId, active: true });
    showToast(error ? "Error al asignar dieta" : `✅ Dieta asignada a ${clientName}`);
    setAssigningDietPlan(null);
    await loadDietAssignments();
  };
  const handleUnassignDiet = async (clientId: string, clientName: string) => {
    await supabase.from("diet_assignments").update({ active: false }).eq("client_id", clientId);
    showToast(`✅ Dieta desasignada de ${clientName}`);
    await loadDietAssignments();
  };
  const handleDuplicateDiet = async (plan: DietPlan) => {
    const { data: newPlan } = await supabase.from("diet_plans")
      .insert({ name: plan.name + " (copia)", kcal_on: plan.kcal_on, kcal_off: plan.kcal_off, notes: plan.notes })
      .select().single();
    if (!newPlan) { showToast("Error al duplicar"); return; }
    const { data: meals } = await supabase.from("diet_meals").select("*, diet_options(*)").eq("plan_id", plan.id).order("sort_order");
    for (const meal of meals ?? []) {
      const { data: newMeal } = await supabase.from("diet_meals")
        .insert({ plan_id: newPlan.id, name: meal.name, emoji: meal.emoji, day_type: meal.day_type, sort_order: meal.sort_order })
        .select().single();
      if (!newMeal) continue;
      for (const opt of (meal as any).diet_options ?? []) {
        await supabase.from("diet_options").insert({ meal_id: newMeal.id, name: opt.name, content: opt.content, sort_order: opt.sort_order });
      }
    }
    await loadDietPlans();
    showToast(`✅ "${plan.name}" duplicado`);
  };
  const handleDeleteDiet = async (plan: DietPlan) => {
    if (!confirm(`¿Eliminar "${plan.name}"? También se desasignará de los clientes.`)) return;
    await supabase.from("diet_plans").delete().eq("id", plan.id);
    await Promise.all([loadDietPlans(), loadDietAssignments()]);
    showToast("✅ Plan eliminado");
  };

  const handleDuplicate = async (prog: ProgramRow) => {
    // 1. Crear programa copia
    const { data: newProg } = await supabase.from("programs")
      .insert({ name: prog.name + " (copia)", description: prog.description, created_by: profile.id })
      .select().single();
    if (!newProg) { showToast("Error al duplicar"); return; }

    // 2. Cargar estructura completa del original
    const { data: fullProg } = await supabase.from("programs").select(`
      program_days ( id, name, order_index, optional,
        microcycles ( id, number,
          microcycle_exercises ( id, order_index, total_sets, note, exercise_id,
            exercise_sets ( set_number, target_reps, target_weight, target_rpe )
          )
        )
      )
    `).eq("id", prog.id).single();

    // 3. Copiar días, microciclos, ejercicios, series
    for (const day of (fullProg as any)?.program_days ?? []) {
      const { data: newDay } = await supabase.from("program_days")
        .insert({ program_id: newProg.id, name: day.name, order_index: day.order_index, optional: day.optional })
        .select().single();
      if (!newDay) continue;
      for (const mc of day.microcycles ?? []) {
        const { data: newMc } = await supabase.from("microcycles").insert({ day_id: newDay.id, number: mc.number }).select().single();
        if (!newMc) continue;
        for (const me of mc.microcycle_exercises ?? []) {
          const { data: newMe } = await supabase.from("microcycle_exercises")
            .insert({ microcycle_id: newMc.id, exercise_id: me.exercise_id, order_index: me.order_index, total_sets: me.total_sets, note: me.note })
            .select().single();
          if (!newMe) continue;
          if (me.exercise_sets?.length > 0) {
            await supabase.from("exercise_sets").insert(
              me.exercise_sets.map((s: any) => ({ microcycle_exercise_id: newMe.id, set_number: s.set_number, target_reps: s.target_reps, target_weight: s.target_weight, target_rpe: s.target_rpe }))
            );
          }
        }
      }
    }
    await loadPrograms();
    showToast(`✅ "${prog.name}" duplicado`);
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim() || !newExGroup.trim()) return;
    setAddingEx(true);
    const { error } = await supabase.from("exercises").insert({
      name: newExName.trim(), muscle_group: newExGroup.trim(),
      video_ref: newExVideo.trim() || null
    });
    if (!error) {
      setNewExName(""); setNewExGroup(""); setNewExVideo("");
      await loadExercises();
      showToast(`✅ Ejercicio "${newExName}" añadido`);
    }
    setAddingEx(false);
  };

  const startEditEx = (ex: CatalogEx) => {
    setEditingEx({ id: ex.id, name: ex.name, muscle_group: ex.muscle_group, video_ref: ex.video_ref ?? "" });
  };

  const saveExercise = async () => {
    if (!editingEx || !editingEx.name.trim() || !editingEx.muscle_group.trim()) return;
    setSavingEx(true);
    const { error } = await supabase.from("exercises").update({
      name: editingEx.name.trim(),
      muscle_group: editingEx.muscle_group.trim(),
      video_ref: editingEx.video_ref.trim() || null,
    }).eq("id", editingEx.id);
    if (!error) {
      await loadExercises();
      showToast(`✅ Ejercicio actualizado`);
      setEditingEx(null);
    } else {
      showToast("Error al guardar");
    }
    setSavingEx(false);
  };

  const filteredEx = exercises.filter(e =>
    e.name.toLowerCase().includes(searchEx.toLowerCase()) || e.muscle_group.toLowerCase().includes(searchEx.toLowerCase())
  );
  const groupedEx = filteredEx.reduce<Record<string, CatalogEx[]>>((acc, ex) => {
    if (!acc[ex.muscle_group]) acc[ex.muscle_group] = [];
    acc[ex.muscle_group].push(ex);
    return acc;
  }, {});

  // Grupos únicos para el select (normalizados para evitar duplicados por espacios/mayúsculas)
  const muscleGroups = [...new Map(
    exercises.map(e => [e.muscle_group.trim().toLowerCase(), e.muscle_group.trim()])
  ).values()].sort((a, b) => a.localeCompare(b, "es"));

  // Visita Presencial
  if (showVisita && viewingClient) {
    return (
      <VisitaPresencial
        client={viewingClient}
        onBack={() => {
          setShowVisita(false);
          setClientCheckIn(null); // forzar recarga al volver
        }}
      />
    );
  }

  // Editor de dieta (standalone desde pestaña Dietas)
  if (editingDietPlanId !== "__none__") {
    return (
      <DietEditor
        planId={editingDietPlanId as string | null}
        onBack={async () => { setEditingDietPlanId("__none__"); await loadDietPlans(); }}
      />
    );
  }

  // Vista de progreso de un cliente
  if (viewingClient !== null) {
    // Agrupar logs por día de entrenamiento
    const byDay = clientLogs.reduce<Record<string, ClientLog[]>>((acc, log) => {
      const dayName = log.exercise_sets?.microcycle_exercises?.microcycles?.program_days?.name ?? "Sin día";
      if (!acc[dayName]) acc[dayName] = [];
      acc[dayName].push(log);
      return acc;
    }, {});

    const trainingDays = Object.keys(byDay).sort();

    // Dentro de un día: agrupar por ejercicio, luego por microciclo
    const buildDayView = (logs: ClientLog[]) => {
      const byExercise: Record<string, { group: string; byMc: Record<number, ClientLog[]> }> = {};
      for (const log of logs) {
        const me = log.exercise_sets?.microcycle_exercises;
        const exName = me?.exercises?.name ?? "Desconocido";
        const group = me?.exercises?.muscle_group ?? "";
        const mcNum = me?.microcycles?.number ?? 0;
        if (!byExercise[exName]) byExercise[exName] = { group, byMc: {} };
        if (!byExercise[exName].byMc[mcNum]) byExercise[exName].byMc[mcNum] = [];
        byExercise[exName].byMc[mcNum].push(log);
      }
      return byExercise;
    };

    const muscleGroupsAdmin = [
      ["shoulder", "Hombro"], ["chest", "Pecho"], ["bicep", "Bíceps"], ["tricep", "Tríceps"],
      ["back", "Dorsal"], ["upper_back", "Espalda Alta"], ["quad", "Cuádriceps"],
      ["adductor", "Aductor"], ["hamstring", "Femoral"], ["glute", "Glúteo"], ["calf", "Gemelo"],
    ] as const;

    return (
      <div className="min-h-screen pb-10" style={{ background: "linear-gradient(160deg, #0A0A0A 80%, #1A0810 100%)" }}>
        <header className="px-4 py-3 flex items-center gap-3"
          style={{ background: "#0F0F0F", borderBottom: "1px solid #8B1A2F40" }}>
          <button
            onClick={() => { setViewingClient(null); setSelectedTrainingDay(null); setClientCheckIn(null); }}
            className="w-9 h-9 rounded-lg text-neutral-300 flex items-center justify-center shrink-0 text-lg"
            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>←</button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-base">{viewingClient.full_name}</h1>
            <p className="text-neutral-500 text-xs">
              {clientViewTab === "entreno"
                ? selectedTrainingDay ? selectedTrainingDay : `${trainingDays.length} días · ${clientLogs.length} registros`
                : "Punto de Control"}
            </p>
          </div>
          {clientViewTab === "entreno" && selectedTrainingDay && (
            <button onClick={() => setSelectedTrainingDay(null)}
              className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700">
              ← Días
            </button>
          )}
        </header>

        {/* Sub-tabs + botón Visita Presencial */}
        <div className="flex items-center gap-1 px-4 py-3 max-w-3xl mx-auto border-b border-neutral-800 overflow-x-auto">
          <button
            onClick={() => { setClientViewTab("entreno"); setSelectedTrainingDay(null); }}
            className={"px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap " +
              (clientViewTab === "entreno" ? "text-white" : "text-neutral-400")}
            style={clientViewTab === "entreno"
              ? { background: "#8B1A2F", border: "1px solid #A01F38" }
              : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
            🏋️ Entreno
          </button>
          <button
            onClick={() => {
              setClientViewTab("checkin");
              if (!clientCheckIn && !loadingCheckIn) loadClientCheckIn(viewingClient.id);
            }}
            className={"px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap " +
              (clientViewTab === "checkin" ? "text-white" : "text-neutral-400")}
            style={clientViewTab === "checkin"
              ? { background: "#8B1A2F", border: "1px solid #A01F38" }
              : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
            📊 Control
          </button>
          <button
            onClick={() => setClientViewTab("dieta")}
            className={"px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap " +
              (clientViewTab === "dieta" ? "text-white" : "text-neutral-400")}
            style={clientViewTab === "dieta"
              ? { background: "#8B1A2F", border: "1px solid #A01F38" }
              : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
            🥗 Dieta
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setShowVisita(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shrink-0">
            📋 Visita Presencial
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-4 pt-4">

          {/* ── Punto de Control ── */}
          {clientViewTab === "checkin" && (
            loadingCheckIn ? (
              <p className="text-neutral-500 text-sm text-center py-16">Cargando datos...</p>
            ) : !clientCheckIn ? (
              <p className="text-neutral-600 text-sm text-center py-16">Sin datos todavía.</p>
            ) : (
              <div className="space-y-6">
                {/* Filtro visitas */}
                <div className="flex gap-2">
                  {(["all", "presencial", "auto"] as const).map(f => (
                    <button key={f} onClick={() => setCheckInFilter(f)}
                      className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors " +
                        (checkInFilter === f ? "text-white" : "text-neutral-400")}
                      style={checkInFilter === f
                        ? { background: "#8B1A2F", border: "1px solid #A01F38" }
                        : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
                      {f === "all" ? "Todas" : f === "presencial" ? "📋 Presencial" : "📱 Auto-registro"}
                    </button>
                  ))}
                </div>

                {/* Tabla Antropometría */}
                {(() => {
                  const filterFn = (l: any) =>
                    checkInFilter === "all" ? true :
                    checkInFilter === "presencial" ? !!l.is_presencial :
                    !l.is_presencial;
                  return (
                    <AntroTable
                      weightLogs={clientCheckIn.weights.filter(filterFn)}
                      perimLogs={clientCheckIn.perims.filter(filterFn)}
                      foldLogs={clientCheckIn.folds.filter(filterFn)}
                    />
                  );
                })()}

                {/* Historial Fatiga */}
                {clientCheckIn.fatigues.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">Fatiga muscular</p>
                    <div className="space-y-2">
                      {clientCheckIn.fatigues.map((log: any) => (
                        <div key={log.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-neutral-400 text-xs">
                              {new Date(log.date + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            {log.session_type && <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">{log.session_type}</span>}
                            {log.microcycle && <span className="text-neutral-600 text-xs">Mc {log.microcycle}</span>}
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {muscleGroupsAdmin.map(([key, label]) => {
                              const val = log[key] ?? 0;
                              if (!val) return null;
                              const color = val >= 8 ? "bg-red-500" : val >= 5 ? "bg-amber-400" : "bg-emerald-500";
                              return (
                                <div key={key} className="flex flex-col items-center gap-0.5">
                                  <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-xs font-bold text-white`}>{val}</div>
                                  <span className="text-[9px] text-neutral-600 text-center leading-tight">{label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* ── Entrenamiento ── */}
          {clientViewTab === "entreno" && (loadingLogs ? (
            <p className="text-neutral-500 text-sm text-center py-16">Cargando registros...</p>
          ) : clientLogs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-neutral-400 text-sm">Este cliente aún no tiene registros de entrenamiento.</p>
            </div>
          ) : selectedTrainingDay === null ? (
            /* ── Pantalla: botones por día de entrenamiento ── */
            <div className="grid grid-cols-2 gap-3">
              {trainingDays.map(dayName => {
                const dayLogs = byDay[dayName];
                const exCount = new Set(dayLogs.map(l => l.exercise_sets?.microcycle_exercises?.exercises?.name)).size;
                const lastLogged = dayLogs.reduce((latest, l) =>
                  (l.logged_at ?? "") > (latest.logged_at ?? "") ? l : latest, dayLogs[0]);
                const lastDate = lastLogged.logged_at
                  ? new Date(lastLogged.logged_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
                  : "";
                return (
                  <button key={dayName} onClick={() => setSelectedTrainingDay(dayName)}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-left hover:border-neutral-600 hover:bg-neutral-800 transition-colors">
                    <p className="text-white font-bold text-base mb-1">{dayName}</p>
                    <p className="text-neutral-500 text-xs">{exCount} ejercicios</p>
                    {lastDate && <p className="text-neutral-600 text-xs mt-2">Último: {lastDate}</p>}
                  </button>
                );
              })}
            </div>
          ) : (
            /* ── Pantalla: detalle de un día ── */
            (() => {
              const dayLogs = byDay[selectedTrainingDay] ?? [];
              const byExercise = buildDayView(dayLogs);
              return (
                <div className="space-y-4">
                  {Object.entries(byExercise).map(([exName, { group, byMc }]) => {
                    const mcNums = Object.keys(byMc).map(Number).sort((a, b) => a - b);
                    return (
                      <div key={exName} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">{group}</p>
                        <p className="text-white font-semibold text-sm mb-3 leading-snug">{exName}</p>
                        <div className="space-y-2">
                          {mcNums.map(mcNum => {
                            const sets = byMc[mcNum].sort((a, b) =>
                              (a.exercise_sets?.set_number ?? 0) - (b.exercise_sets?.set_number ?? 0));
                            return (
                              <div key={mcNum}>
                                <p className="text-[10px] uppercase tracking-wider text-neutral-600 mb-1">Microciclo {mcNum}</p>
                                <div className="flex flex-wrap gap-2">
                                  {sets.map(log => (
                                    <div key={log.id} className="bg-neutral-800 rounded-lg px-3 py-1.5 text-xs">
                                      <span className="text-neutral-500 mr-1.5">S{log.exercise_sets?.set_number}</span>
                                      <span className="text-emerald-300 font-bold tabular-nums">
                                        {log.weight}{log.unit} × {log.reps}
                                      </span>
                                      {log.rpe > 0 && (
                                        <span className="text-neutral-500 ml-1">RPE {log.rpe}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          ))}

          {/* ── Dieta del cliente ── */}
          {clientViewTab === "dieta" && (() => {
            const da = dietAssignments.find(a => a.client_id === viewingClient.id);
            return (
              <div className="space-y-4">
                {/* Plan asignado actualmente */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">Plan asignado</p>
                  {da ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-white font-semibold">{da.plan_name}</p>
                        {(() => {
                          const plan = dietPlans.find(p => p.id === da.plan_id);
                          return plan?.kcal_on
                            ? <p className="text-neutral-400 text-xs mt-0.5">🔥 {plan.kcal_on} kcal día ON · {plan.kcal_off} día OFF</p>
                            : null;
                        })()}
                      </div>
                      <button
                        onClick={() => setEditingDietPlanId(da.plan_id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white"
                        style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
                        ✏️ Editar plan
                      </button>
                      <button
                        onClick={() => handleUnassignDiet(viewingClient.id, viewingClient.full_name)}
                        className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300"
                        style={{ background: "#1A0A0A", border: "1px solid #3A1010" }}>
                        ✕
                      </button>
                    </div>
                  ) : (
                    <p className="text-neutral-500 text-sm">Sin dieta asignada</p>
                  )}
                </div>

                {/* Lista de planes para asignar */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Asignar plan</p>
                  {dietPlans.length === 0 ? (
                    <p className="text-neutral-600 text-sm">No hay planes creados todavía. Créalos en la pestaña 🥗 Dietas.</p>
                  ) : (
                    <div className="space-y-2">
                      {dietPlans.map(plan => {
                        const isAssigned = da?.plan_id === plan.id;
                        return (
                          <button key={plan.id}
                            onClick={() => handleAssignDiet(plan.id, viewingClient.id, viewingClient.full_name)}
                            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors"
                            style={isAssigned
                              ? { background: "#1A0810", border: "1px solid #8B1A2F" }
                              : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
                            <div className="flex-1">
                              <p className={isAssigned ? "text-white font-semibold text-sm" : "text-neutral-300 text-sm"}>{plan.name}</p>
                              {plan.kcal_on && <p className="text-neutral-500 text-xs">{plan.kcal_on} / {plan.kcal_off} kcal</p>}
                            </div>
                            {isAssigned && <span className="text-xs font-medium" style={{ color: "#8B1A2F" }}>✓ Activa</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  // Si estamos editando un programa, mostrar el editor
  if (editingProgramId !== null) {
    return <ProgramEditor programId={editingProgramId} onBack={() => { setEditingProgramId(null); loadPrograms(); }} />;
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(160deg, #0A0A0A 60%, #1A0810 100%)" }}>
      <p className="text-neutral-500 text-sm">Cargando...</p>
    </div>
  );

  return (
    <div className="min-h-screen pb-10" style={{ background: "linear-gradient(160deg, #0A0A0A 80%, #1A0810 100%)" }}>
      <header className="px-4 py-3 flex items-center justify-between"
        style={{ background: "#0F0F0F", borderBottom: "1px solid #8B1A2F40" }}>
        <div className="flex items-center gap-3">
          <MVPWordmark />
          <div className="h-6 w-px" style={{ background: "#2A2A2A" }} />
          <div>
            <p className="text-[11px] uppercase tracking-widest text-neutral-500">Panel Admin</p>
            <p className="text-xs text-neutral-400">{profile.full_name}</p>
          </div>
        </div>
        <button onClick={() => supabase.auth.signOut()}
          className="px-3 py-2 rounded-lg text-neutral-400 text-sm hover:text-white transition-colors"
          style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
          Salir
        </button>
      </header>

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-neutral-800 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg border border-neutral-700 whitespace-nowrap">
          {toast}
        </div>
      )}

      <div className="flex gap-1 p-4 max-w-3xl mx-auto overflow-x-auto">
        {([["programas", "📋 Programas"], ["clientes", "👥 Clientes"], ["dietas", "🥗 Dietas"], ["ejercicios", "🏋️ Ejercicios"]] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap " + (tab === t ? "text-white" : "text-neutral-400")}
            style={tab === t
              ? { background: "#8B1A2F", border: "1px solid #A01F38" }
              : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
            {label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4">

        {/* ── TAB PROGRAMAS ── */}
        {tab === "programas" && (
          <div>
            {programs.length === 0 ? (
              <div className="bg-amber-950/30 border border-amber-900/40 rounded-xl p-4">
                <p className="text-amber-300 text-sm font-semibold mb-1">No hay programas</p>
                <p className="text-amber-200/70 text-xs">Ejecuta 03_SQL_IMPORTAR_BLOQUE5.sql en Supabase → SQL Editor.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {programs.map((prog) => (
                  <div key={prog.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                    <h2 className="text-white font-semibold mb-3">{prog.name}</h2>

                    <div className="flex gap-2 mb-3">
                      <button onClick={() => setEditingProgramId(prog.id)}
                        className="flex-1 py-2 rounded-lg bg-neutral-800 text-neutral-200 text-sm font-medium hover:bg-neutral-700 transition-colors">
                        ✏️ Editar
                      </button>
                      <button onClick={() => handleDuplicate(prog)}
                        className="flex-1 py-2 rounded-lg bg-neutral-800 text-neutral-200 text-sm font-medium hover:bg-neutral-700 transition-colors">
                        📋 Duplicar
                      </button>
                    </div>

                    {assigning === prog.id ? (
                      <div>
                        <p className="text-xs text-neutral-400 mb-2">Asignar a:</p>
                        {clients.length === 0 ? (
                          <p className="text-neutral-500 text-xs">No hay clientes. Añádelos en Supabase → Authentication → Users.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {clients.map((c) => (
                              <div key={c.id} className="flex items-center gap-2">
                                <button onClick={() => handleAssign(prog.id, c.id, c.full_name)}
                                  className={"flex-1 text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors " +
                                    (assignments.find(a => a.client_id === c.id && a.program_id === prog.id)
                                      ? "bg-emerald-950 border border-emerald-800 text-white"
                                      : "bg-neutral-800 hover:bg-neutral-700 text-white")}>
                                  <span className="w-7 h-7 rounded-full bg-neutral-600 flex items-center justify-center text-xs font-bold shrink-0">
                                    {c.full_name.charAt(0).toUpperCase()}
                                  </span>
                                  <span className="flex-1">{c.full_name}</span>
                                  {assignments.find(a => a.client_id === c.id && a.program_id === prog.id) && (
                                    <span className="text-emerald-400 text-xs shrink-0">✓ Asignado</span>
                                  )}
                                </button>
                                {assignments.find(a => a.client_id === c.id && a.program_id === prog.id) && (
                                  <button
                                    onClick={() => handleUnassign(c.id, c.full_name, true)}
                                    className="w-8 h-8 rounded-lg bg-red-950/50 text-red-400 border border-red-900/40 hover:bg-red-950 flex items-center justify-center text-sm shrink-0"
                                    title="Desasignar">
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <button onClick={() => setAssigning(null)} className="mt-2 text-xs text-neutral-500 hover:text-neutral-300">Cancelar</button>
                      </div>
                    ) : (
                      <button onClick={() => setAssigning(prog.id)}
                        className="w-full py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors">
                        Asignar a cliente →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB CLIENTES ── */}
        {tab === "clientes" && (
          <div>
            <div className="bg-blue-950/30 border border-blue-900/40 rounded-xl p-4 mb-4">
              <p className="text-blue-300 text-sm font-semibold mb-1">Añadir cliente</p>
              <p className="text-blue-200/70 text-xs">Supabase → Authentication → Users → Add user</p>
            </div>
            {clients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">👥</p>
                <p className="text-neutral-400">Aún no hay clientes.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {clients.map((c) => (
                  <div key={c.id} className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {c.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{c.full_name}</p>
                        {(() => {
                          const a = assignments.find(a => a.client_id === c.id);
                          return a
                            ? <p className="text-emerald-400 text-xs truncate">📋 {a.program_name}</p>
                            : <p className="text-neutral-600 text-xs">Sin programa asignado</p>;
                        })()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openClientProgress(c)}
                        className="flex-1 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs hover:bg-neutral-700 transition-colors">
                        📊 Progreso
                      </button>
                      {assignments.find(a => a.client_id === c.id) && (
                        <button
                          onClick={() => handleUnassign(c.id, c.full_name)}
                          className="flex-1 py-1.5 rounded-lg bg-red-950/40 text-red-400 border border-red-900/40 text-xs hover:bg-red-950/70 transition-colors">
                          Desasignar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB DIETAS ── */}
        {tab === "dietas" && (
          <div>
            {/* Botón crear nuevo plan */}
            <button
              onClick={() => setEditingDietPlanId(null)}
              className="w-full py-3 rounded-xl text-sm font-semibold mb-4 transition-colors"
              style={{ background: "#8B1A2F", border: "1px solid #A01F38", color: "white" }}>
              + Nuevo plan de dieta
            </button>

            {dietPlans.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🥗</p>
                <p className="text-neutral-400 text-sm">Aún no hay planes de dieta.</p>
                <p className="text-neutral-600 text-xs mt-1">Pulsa "Nuevo plan" para crear el primero.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dietPlans.map((plan) => {
                  const assigned = dietAssignments.filter(a => a.plan_id === plan.id);
                  return (
                    <div key={plan.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h2 className="text-white font-semibold text-base">{plan.name}</h2>
                        {assigned.length > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
                            style={{ background: "#1A0810", color: "#C4394F", border: "1px solid #8B1A2F50" }}>
                            {assigned.length} cliente{assigned.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      {(plan.kcal_on || plan.kcal_off) && (
                        <p className="text-neutral-500 text-xs mb-3">
                          🔥 ON: {plan.kcal_on ?? "—"} kcal · OFF: {plan.kcal_off ?? "—"} kcal
                        </p>
                      )}
                      {assigned.length > 0 && (
                        <p className="text-neutral-600 text-xs mb-3">
                          Asignado a: {assigned.map(a => {
                            const c = clients.find(cl => cl.id === a.client_id);
                            return c?.full_name ?? "Cliente";
                          }).join(", ")}
                        </p>
                      )}

                      {/* Acciones */}
                      <div className="flex gap-2 mb-3">
                        <button onClick={() => setEditingDietPlanId(plan.id)}
                          className="flex-1 py-2 rounded-lg bg-neutral-800 text-neutral-200 text-sm font-medium hover:bg-neutral-700 transition-colors">
                          ✏️ Editar
                        </button>
                        <button onClick={() => handleDuplicateDiet(plan)}
                          className="flex-1 py-2 rounded-lg bg-neutral-800 text-neutral-200 text-sm font-medium hover:bg-neutral-700 transition-colors">
                          📋 Duplicar
                        </button>
                        <button onClick={() => handleDeleteDiet(plan)}
                          className="px-3 py-2 rounded-lg text-red-400 text-sm hover:bg-red-950/40 transition-colors"
                          style={{ background: "#1A0A0A", border: "1px solid #3A1010" }}>
                          🗑️
                        </button>
                      </div>

                      {/* Asignar a cliente */}
                      {assigningDietPlan === plan.id ? (
                        <div>
                          <p className="text-xs text-neutral-400 mb-2">Asignar a:</p>
                          {clients.length === 0 ? (
                            <p className="text-neutral-500 text-xs">No hay clientes.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {clients.map((c) => {
                                const isAssigned = dietAssignments.find(a => a.client_id === c.id && a.plan_id === plan.id);
                                return (
                                  <div key={c.id} className="flex items-center gap-2">
                                    <button onClick={() => handleAssignDiet(plan.id, c.id, c.full_name)}
                                      className={"flex-1 text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors " +
                                        (isAssigned ? "text-white" : "text-neutral-300 hover:text-white")}
                                      style={isAssigned
                                        ? { background: "#1A0810", border: "1px solid #8B1A2F" }
                                        : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
                                      <span className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold shrink-0">
                                        {c.full_name.charAt(0).toUpperCase()}
                                      </span>
                                      <span className="flex-1">{c.full_name}</span>
                                      {isAssigned && <span className="text-xs shrink-0" style={{ color: "#C4394F" }}>✓ Asignado</span>}
                                    </button>
                                    {isAssigned && (
                                      <button
                                        onClick={() => handleUnassignDiet(c.id, c.full_name)}
                                        className="w-8 h-8 rounded-lg text-red-400 border flex items-center justify-center text-sm shrink-0 hover:bg-red-950/40"
                                        style={{ background: "#1A0A0A", border: "1px solid #3A1010" }}>
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          <button onClick={() => setAssigningDietPlan(null)} className="mt-2 text-xs text-neutral-500 hover:text-neutral-300">Cancelar</button>
                        </div>
                      ) : (
                        <button onClick={() => setAssigningDietPlan(plan.id)}
                          className="w-full py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors">
                          Asignar a cliente →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB EJERCICIOS ── */}
        {tab === "ejercicios" && (
          <div>
            {/* Formulario para añadir ejercicio */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-4">
              <p className="text-white text-sm font-semibold mb-3">Añadir ejercicio al catálogo</p>
              <form onSubmit={handleAddExercise} className="space-y-2">
                <input value={newExName} onChange={e => setNewExName(e.target.value)}
                  placeholder="Nombre del ejercicio *"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white text-sm" required />
                <div className="flex gap-2">
                  <select value={newExGroup} onChange={e => setNewExGroup(e.target.value)}
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-white text-sm" required>
                    <option value="">Grupo muscular *</option>
                    {muscleGroups.map(g => <option key={g} value={g}>{g}</option>)}
                    <option value="__nuevo__">+ Nuevo grupo...</option>
                  </select>
                  {newExGroup === "__nuevo__" && (
                    <input onChange={e => setNewExGroup(e.target.value)} placeholder="Nombre del grupo"
                      className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white text-sm" autoFocus />
                  )}
                </div>
                <input value={newExVideo} onChange={e => setNewExVideo(e.target.value)}
                  placeholder="Referencia de video (opcional)"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white text-sm" />
                <button type="submit" disabled={addingEx}
                  className="w-full py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-neutral-200 disabled:opacity-40 transition-colors">
                  {addingEx ? "Añadiendo..." : "Añadir ejercicio"}
                </button>
              </form>
            </div>

            {/* Búsqueda y listado */}
            <input type="text" value={searchEx} onChange={e => setSearchEx(e.target.value)}
              placeholder="Buscar en el catálogo..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-white mb-4 text-sm" />
            <div className="space-y-4">
              {Object.entries(groupedEx).map(([group, exs]) => (
                <div key={group}>
                  <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">{group} <span className="text-neutral-700">({exs.length})</span></p>
                  <div className="space-y-1">
                    {exs.map(ex => (
                      <div key={ex.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                        {editingEx?.id === ex.id ? (
                          /* ── modo edición inline ── */
                          <div className="p-3 space-y-2">
                            <input
                              value={editingEx.name}
                              onChange={e => setEditingEx(prev => prev ? { ...prev, name: e.target.value } : prev)}
                              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
                              placeholder="Nombre del ejercicio" />
                            <div className="flex gap-2">
                              <select
                                value={muscleGroups.includes(editingEx.muscle_group) ? editingEx.muscle_group : "__otro__"}
                                onChange={e => {
                                  const v = e.target.value;
                                  if (v !== "__otro__") setEditingEx(prev => prev ? { ...prev, muscle_group: v } : prev);
                                }}
                                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white">
                                {muscleGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                {!muscleGroups.includes(editingEx.muscle_group) && (
                                  <option value="__otro__">{editingEx.muscle_group}</option>
                                )}
                                <option value="__otro__">+ Otro grupo...</option>
                              </select>
                              {(!muscleGroups.includes(editingEx.muscle_group) || editingEx.muscle_group === "__otro__") && (
                                <input
                                  value={editingEx.muscle_group === "__otro__" ? "" : editingEx.muscle_group}
                                  onChange={e => setEditingEx(prev => prev ? { ...prev, muscle_group: e.target.value } : prev)}
                                  placeholder="Nombre del grupo"
                                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
                                  autoFocus />
                              )}
                            </div>
                            <input
                              value={editingEx.video_ref}
                              onChange={e => setEditingEx(prev => prev ? { ...prev, video_ref: e.target.value } : prev)}
                              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
                              placeholder="Referencia video (opcional)" />
                            <div className="flex gap-2 pt-1">
                              <button onClick={saveExercise} disabled={savingEx}
                                className="flex-1 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-neutral-200 disabled:opacity-40">
                                {savingEx ? "Guardando..." : "Guardar"}
                              </button>
                              <button onClick={() => setEditingEx(null)}
                                className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 text-xs hover:bg-neutral-700">
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ── modo vista ── */
                          <div className="px-3 py-2.5 flex items-center gap-2">
                            <p className="text-white text-sm flex-1">{ex.name}</p>
                            {ex.video_ref && ex.video_ref !== "-" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">📹</span>}
                            <button onClick={() => startEditEx(ex)}
                              className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white text-xs flex items-center justify-center shrink-0">
                              ✏️
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filteredEx.length === 0 && <p className="text-neutral-500 text-sm text-center py-8">Sin resultados</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
