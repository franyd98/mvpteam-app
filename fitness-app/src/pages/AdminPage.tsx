import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ProgramEditor from "./ProgramEditor";
import { AntroTable } from "./CheckInPage";
import VisitaPresencial from "./VisitaPresencial";
import DietEditor from "./DietEditor";
import DietGenerator from "../components/DietGenerator";
import { MVPWordmark } from "../components/MVPLogo";
import MacroCalculator from "../components/MacroCalculator";
import IngredientsAdmin from "../components/IngredientsAdmin";

type Profile = { id: string; full_name: string; role: string };
type CatalogEx = { id: number; muscle_group: string; name: string; video_ref: string | null; coach_note: string | null };
type ProgramRow = { id: number; name: string; description: string | null; owner_client_id: string | null };
type Assignment = { client_id: string; program_id: number; program_name: string };
type DietPlan = { id: string; name: string; kcal_on: number | null; kcal_off: number | null; notes: string | null };
type DietAssignment = { client_id: string; plan_id: string; plan_name: string };
type Tab = "inicio" | "programas" | "clientes" | "ejercicios" | "dietas" | "alimentos";
type ClientActivity = { clientId: string; lastAt: string | null; sessionsLast30: number; daysAgo: number | null };

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
  const [tab, setTab] = useState<Tab>("inicio");
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
  const [clientDietSubTab, setClientDietSubTab] = useState<"plan" | "macros" | "generar">("plan");
  const [clientCheckIn, setClientCheckIn] = useState<{ weights: any[]; perims: any[]; folds: any[]; fatigues: any[]; photos: any[] } | null>(null);
  const [adminPreviewUrl, setAdminPreviewUrl] = useState<string | null>(null);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [showVisita, setShowVisita] = useState(false);
  const [checkInFilter, setCheckInFilter] = useState<"all" | "presencial" | "auto">("all");
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [dietAssignments, setDietAssignments] = useState<DietAssignment[]>([]);
  // "__none__" = cerrado; null = nuevo plan; string = editar plan existente
  const [editingDietPlanId, setEditingDietPlanId] = useState<string | null | "__none__">("__none__");
  const [assigningDietPlan, setAssigningDietPlan] = useState<string | null>(null);
  // Generador automático de dietas por cliente
  const [generatingDietForClient, setGeneratingDietForClient] = useState<Profile | null>(null);
  // Vista de detalle de un plan de dieta (patrón lista → detalle)
  const [viewingDietPlan, setViewingDietPlan] = useState<DietPlan | null>(null);
  const [dietPlanSubTab, setDietPlanSubTab] = useState<"editar" | "generar" | "asignar">("editar");
  const [editingPlanName, setEditingPlanName] = useState("");
  const [savingPlanMeta, setSavingPlanMeta] = useState(false);

  // Añadir ejercicio al catálogo
  const [newExName, setNewExName] = useState("");
  const [newExGroup, setNewExGroup] = useState("");
  const [newExVideo, setNewExVideo] = useState("");
  const [addingEx, setAddingEx] = useState(false);

  // Búsqueda en catálogo
  const [searchEx, setSearchEx] = useState("");

  // Invitar nuevo cliente
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviting, setInviting] = useState(false);

  // Renombrar programa inline
  const [renamingProgId, setRenamingProgId] = useState<number | null>(null);
  const [renamingName, setRenamingName] = useState("");

  // Clientes colapsados/expandidos en tab Programas
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  // Tab Clientes: búsqueda + colapsable
  const [clientSearch, setClientSearch] = useState("");
  const [expandedClientCardId, setExpandedClientCardId] = useState<string | null>(null);

  // Tab Dietas: secciones colapsables + asignación inline
  const [dietTemplatesOpen, setDietTemplatesOpen] = useState(true);
  const [dietUsersOpen, setDietUsersOpen] = useState(true);
  const [expandedDietClientId, setExpandedDietClientId] = useState<string | null>(null);

  // Edición inline de ejercicios
  type EditingEx = { id: number; name: string; muscle_group: string; video_ref: string; coach_note: string };
  const [editingEx, setEditingEx] = useState<EditingEx | null>(null);
  const [savingEx, setSavingEx] = useState(false);

  // Dashboard: actividad por cliente
  const [clientActivities, setClientActivities] = useState<ClientActivity[]>([]);
  // Filtro rápido en tab Clientes
  const [clientFilter, setClientFilter] = useState<"all" | "noprog" | "nodiet" | "inactive">("all");
  // Notas privadas del entrenador (localStorage)
  const getCoachNote = (clientId: string): string => {
    try { return localStorage.getItem(`mvp_coach_note_${clientId}`) ?? ""; } catch { return ""; }
  };
  const [coachNoteEditing, setCoachNoteEditing] = useState<string | null>(null);
  const [coachNoteDraft, setCoachNoteDraft] = useState("");

  useEffect(() => { loadAll(); }, []);

  const loadClientActivities = async (ids: string[]) => {
    if (ids.length === 0) { setClientActivities([]); return; }
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase.from("set_logs").select("client_id, logged_at")
      .in("client_id", ids).gte("logged_at", since);
    const byClient: Record<string, string> = {};
    const daysSet: Record<string, Set<string>> = {};
    for (const r of (data ?? []) as { client_id: string; logged_at: string }[]) {
      if (!byClient[r.client_id] || r.logged_at > byClient[r.client_id]) byClient[r.client_id] = r.logged_at;
      if (!daysSet[r.client_id]) daysSet[r.client_id] = new Set();
      daysSet[r.client_id].add(r.logged_at.slice(0, 10));
    }
    const now = Date.now();
    setClientActivities(ids.map(id => ({
      clientId: id,
      lastAt: byClient[id] ?? null,
      sessionsLast30: daysSet[id]?.size ?? 0,
      daysAgo: byClient[id] ? Math.floor((now - new Date(byClient[id]).getTime()) / 86400000) : null,
    })));
  };

  const loadAll = async () => {
    setLoading(true);
    const { data: cd } = await supabase.from("profiles").select("*").eq("role", "client").order("full_name");
    const cl = (cd ?? []) as Profile[];
    setClients(cl);
    await Promise.all([
      loadExercises(), loadPrograms(), loadAssignments(), loadDietPlans(), loadDietAssignments(),
      loadClientActivities(cl.map(c => c.id)),
    ]);
    setLoading(false);
  };
  const loadClients = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("role", "client").order("full_name");
    const cl = (data ?? []) as Profile[];
    setClients(cl);
    await loadClientActivities(cl.map(c => c.id));
  };
  const loadExercises = async () => {
    const { data } = await supabase.from("exercises").select("*").order("muscle_group").order("name");
    setExercises(data ?? []);
  };
  const loadPrograms = async () => {
    const { data } = await supabase.from("programs").select("id, name, description, owner_client_id").order("id");
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

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`⚠️ ¿Eliminar a "${clientName}" definitivamente?\n\nSe borrarán todos sus datos: progreso, check-ins, fotos, dieta, etc.\n\nEsta acción no se puede deshacer.`)) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ userId: clientId }),
      });
      const json = await res.json();
      if (json.error) {
        showToast("❌ " + json.error);
      } else {
        showToast(`✅ Cliente "${clientName}" eliminado`);
        await loadClients();
      }
    } catch {
      showToast("❌ Error de red al eliminar el cliente");
    }
  };

  const handleInviteClient = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/invite-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ email: inviteEmail.trim(), full_name: inviteName.trim() }),
      });
      const json = await res.json();
      if (json.error) {
        showToast("❌ " + json.error);
      } else {
        showToast("✅ Invitación enviada a " + inviteEmail.trim());
        setInviteEmail("");
        setInviteName("");
        await loadClients();
      }
    } catch {
      showToast("❌ Error de red al enviar la invitación");
    }
    setInviting(false);
  };

  const openClientProgress = async (client: Profile) => {
    setViewingClient(client);
    setClientViewTab("entreno");
    setSelectedTrainingDay(null);
    setClientCheckIn(null);
    openClientLogs(client);
  };

  const loadClientCheckIn = async (clientId: string) => {
    setLoadingCheckIn(true);
    const [w, p, fl, f, ph] = await Promise.all([
      supabase.from("weight_logs").select("*").eq("client_id", clientId).order("date", { ascending: true }).limit(20),
      supabase.from("perimeter_logs").select("*").eq("client_id", clientId).order("date", { ascending: true }).limit(20),
      supabase.from("fold_logs").select("*").eq("client_id", clientId).order("date", { ascending: true }).limit(20),
      supabase.from("fatigue_logs").select("*").eq("client_id", clientId).order("date", { ascending: false }).limit(20),
      supabase.from("checkin_photos").select("*").eq("client_id", clientId).order("created_at", { ascending: false }).limit(60),
    ]);
    setClientCheckIn({
      weights: w.data ?? [],
      perims: p.data ?? [],
      folds: fl.data ?? [],
      fatigues: f.data ?? [],
      photos: ph.data ?? [],
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
    // 1. Obtener todos los assignments actuales del cliente
    const { data: existing } = await supabase
      .from("program_assignments")
      .select("program_id, programs(owner_client_id)")
      .eq("client_id", clientId);

    // 2. Borrar assignments de programas que NO pertenecen a este cliente
    //    (evita que programas de otros clientes queden contaminando el selector)
    const toDelete = (existing ?? []).filter((a: any) => {
      const owner = a.programs?.owner_client_id;
      return owner !== null && owner !== clientId;
    }).map((a: any) => a.program_id);

    if (toDelete.length > 0) {
      await supabase
        .from("program_assignments")
        .delete()
        .eq("client_id", clientId)
        .in("program_id", toDelete);
    }

    // 3. Desactivar los que quedan (planes propios del cliente, como planes IA)
    await supabase.from("program_assignments").update({ active: false }).eq("client_id", clientId);

    // 4. Insertar el nuevo assignment activo
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

  const handleDeleteProgram = async (prog: ProgramRow) => {
    const clientsAssigned = assignments.filter(a => a.program_id === prog.id);
    const msg = clientsAssigned.length > 0
      ? `¿Eliminar "${prog.name}"? Está asignado a ${clientsAssigned.length} cliente(s). Se eliminará todo el contenido.`
      : `¿Eliminar "${prog.name}"? Se eliminará todo su contenido permanentemente.`;
    if (!confirm(msg)) return;
    const { error } = await supabase.from("programs").delete().eq("id", prog.id);
    if (error) { showToast("❌ Error al eliminar"); return; }
    await Promise.all([loadPrograms(), loadAssignments()]);
    showToast(`✅ "${prog.name}" eliminado`);
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
    if (viewingDietPlan?.id === plan.id) setViewingDietPlan(null);
    await Promise.all([loadDietPlans(), loadDietAssignments()]);
    showToast("✅ Plan eliminado");
  };

  const handleCreateDietPlan = async () => {
    const { data } = await supabase
      .from("diet_plans")
      .insert({ name: "Nuevo plan", notes: "" })
      .select("id, name, kcal_on, kcal_off, notes")
      .single();
    if (data) {
      await loadDietPlans();
      setViewingDietPlan(data as DietPlan);
      setEditingPlanName(data.name);
      setDietPlanSubTab("editar");
    }
  };

  const handleSavePlanMeta = async () => {
    if (!viewingDietPlan || !editingPlanName.trim()) return;
    setSavingPlanMeta(true);
    await supabase.from("diet_plans").update({ name: editingPlanName.trim() }).eq("id", viewingDietPlan.id);
    await loadDietPlans();
    setViewingDietPlan(p => p ? { ...p, name: editingPlanName.trim() } : p);
    setSavingPlanMeta(false);
    showToast("✅ Nombre actualizado");
  };

  // Crear nuevo bloque para un cliente específico
  const handleCreateProgram = async (clientId: string, clientName: string) => {
    const bloquesCliente = programs.filter(p => p.owner_client_id === clientId);
    const nextNum = bloquesCliente.length + 1;
    const { data, error } = await supabase.from("programs")
      .insert({ name: `Bloque ${nextNum} - ${clientName}`, owner_client_id: clientId, created_by: profile.id })
      .select("id, name, description, owner_client_id").single();
    if (error || !data) { showToast("❌ Error al crear bloque"); return; }
    setPrograms(prev => [...prev, data as ProgramRow]);
    setEditingProgramId(data.id);
    showToast(`✅ "${data.name}" creado`);
  };

  // Asignar owner_client_id a un programa existente (mover de Plantillas a cliente)
  const handleSetOwner = async (progId: number, clientId: string) => {
    await supabase.from("programs").update({ owner_client_id: clientId }).eq("id", progId);
    setPrograms(prev => prev.map(p => p.id === progId ? { ...p, owner_client_id: clientId } : p));
    showToast("✅ Bloque vinculado al cliente");
  };

  // Renombrar programa
  const handleRenameProgram = async (progId: number) => {
    const name = renamingName.trim();
    if (!name) return;
    await supabase.from("programs").update({ name }).eq("id", progId);
    setPrograms(prev => prev.map(p => p.id === progId ? { ...p, name } : p));
    setRenamingProgId(null);
    showToast("✅ Nombre actualizado");
  };

  const handleDuplicate = async (prog: ProgramRow, ownerClientId?: string) => {
    showToast("⏳ Duplicando...");

    // 1. Crear programa copia
    const finalOwner = ownerClientId !== undefined ? ownerClientId : prog.owner_client_id;
    const { data: newProg, error: progErr } = await supabase.from("programs")
      .insert({ name: prog.name + " (copia)", description: prog.description, owner_client_id: finalOwner, created_by: profile.id })
      .select().single();
    if (!newProg || progErr) { showToast("❌ Error al duplicar"); return; }

    // 2. Mostrar en lista inmediatamente (sin esperar a copiar estructura)
    setPrograms(prev => [...prev, { id: newProg.id, name: newProg.name, description: newProg.description, owner_client_id: finalOwner ?? null }]);
    showToast(`✅ "${prog.name}" duplicado`);

    // 3. Cargar estructura completa del original
    const { data: fullProg, error: fetchErr } = await supabase.from("programs").select(`
      program_days ( id, name, order_index, optional,
        microcycles ( id, number,
          microcycle_exercises ( id, order_index, total_sets, exercise_id,
            exercise_sets ( set_number, target_reps, target_rpe )
          )
        )
      )
    `).eq("id", prog.id).single();
    if (fetchErr || !fullProg) return;

    // 4. Copiar días en paralelo
    await Promise.all(
      ((fullProg as any).program_days ?? []).map(async (day: any) => {
        const { data: newDay } = await supabase.from("program_days")
          .insert({ program_id: newProg.id, name: day.name, order_index: day.order_index, optional: day.optional })
          .select().single();
        if (!newDay) return;

        await Promise.all(
          (day.microcycles ?? []).map(async (mc: any) => {
            const { data: newMc } = await supabase.from("microcycles")
              .insert({ day_id: newDay.id, number: mc.number })
              .select().single();
            if (!newMc) return;

            await Promise.all(
              (mc.microcycle_exercises ?? []).map(async (me: any) => {
                const { data: newMe } = await supabase.from("microcycle_exercises")
                  .insert({ microcycle_id: newMc.id, exercise_id: me.exercise_id, order_index: me.order_index, total_sets: me.total_sets })
                  .select().single();
                if (!newMe) return;

                if (me.exercise_sets?.length > 0) {
                  await supabase.from("exercise_sets").insert(
                    me.exercise_sets.map((s: any) => ({
                      microcycle_exercise_id: newMe.id,
                      set_number: s.set_number,
                      target_reps: s.target_reps,
                      target_rpe: s.target_rpe,
                    }))
                  );
                }
              })
            );
          })
        );
      })
    );
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
    setEditingEx({ id: ex.id, name: ex.name, muscle_group: ex.muscle_group, video_ref: ex.video_ref ?? "", coach_note: ex.coach_note ?? "" });
  };

  const saveExercise = async () => {
    if (!editingEx || !editingEx.name.trim() || !editingEx.muscle_group.trim()) return;
    setSavingEx(true);
    const { error } = await supabase.from("exercises").update({
      name: editingEx.name.trim(),
      muscle_group: editingEx.muscle_group.trim(),
      video_ref: editingEx.video_ref.trim() || null,
      coach_note: editingEx.coach_note.trim() || null,
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

  // Generador automático de dieta para un cliente específico
  if (generatingDietForClient !== null) {
    return (
      <DietGenerator
        clientId={generatingDietForClient.id}
        clientName={generatingDietForClient.full_name}
        onBack={async () => {
          setGeneratingDietForClient(null);
          await Promise.all([loadDietPlans(), loadDietAssignments()]);
        }}
      />
    );
  }

  // Editor de dieta (standalone — regresa al detalle del plan si venía de ahí)
  if (editingDietPlanId !== "__none__") {
    return (
      <DietEditor
        planId={editingDietPlanId as string | null}
        onBack={async () => { setEditingDietPlanId("__none__"); await loadDietPlans(); }}
      />
    );
  }

  // Generador de plantilla (sin cliente) — lanzado desde Dietas → plan → Generar
  if (tab === "dietas" && viewingDietPlan !== null && dietPlanSubTab === "generar") {
    return (
      <DietGenerator
        onBack={async () => { setDietPlanSubTab("editar"); await loadDietPlans(); }}
      />
    );
  }

  // Vista de detalle de un plan de dieta
  if (tab === "dietas" && viewingDietPlan !== null) {
    const planAssigned = dietAssignments.filter(a => a.plan_id === viewingDietPlan.id);
    return (
      <div className="min-h-screen footer-safe" style={{ background: "#0A0A0A" }}>
        <header className="px-4 flex items-center gap-3 sticky top-0 z-20 header-safe"
          style={{ background: "#0A0A0A", borderBottom: "1px solid #141414", minHeight: 52 }}>
          <button
            onClick={() => { setViewingDietPlan(null); setDietPlanSubTab("editar"); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors active:opacity-70"
            style={{ background: "#141414", border: "1px solid #1E1E1E", color: "#888" }}>
            <i className="ti ti-arrow-left" style={{ fontSize: 16 }} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-sm truncate">{viewingDietPlan.name}</h1>
            <p className="text-[10px]" style={{ color: "#555" }}>
              {viewingDietPlan.kcal_on ? `${viewingDietPlan.kcal_on} kcal ON · ${viewingDietPlan.kcal_off ?? "—"} OFF` : "Sin kcal"}
              {planAssigned.length > 0 ? ` · ${planAssigned.length} cliente${planAssigned.length > 1 ? "s" : ""}` : ""}
            </p>
          </div>
        </header>

        {/* Sub-tabs */}
        <div className="flex gap-1 px-3 py-2 max-w-3xl mx-auto" style={{ borderBottom: "1px solid #141414" }}>
          {([
            { id: "editar"  as const, icon: "pencil",    label: "Editar"  },
            { id: "generar" as const, icon: "sparkles",  label: "Generar" },
            { id: "asignar" as const, icon: "users",     label: "Asignar" },
          ]).map(({ id, icon, label }) => (
            <button key={id} onClick={() => setDietPlanSubTab(id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={dietPlanSubTab === id
                ? { background: "rgba(192,41,43,0.1)", color: "#C0292B", border: "1px solid rgba(192,41,43,0.2)" }
                : { background: "transparent", color: "#444", border: "1px solid transparent" }}>
              <i className={`ti ti-${icon}`} style={{ fontSize: 13 }} />
              {label}
            </button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4 pb-8">

          {/* ── Editar ── */}
          {dietPlanSubTab === "editar" && (
            <div className="space-y-4">
              {/* Editor de nombre */}
              <div className="rounded-2xl p-4 space-y-3" style={{ background: "#111", border: "1px solid #1E1E1E" }}>
                <p className="text-white font-semibold text-sm">Información del plan</p>
                <div className="flex gap-2">
                  <input
                    value={editingPlanName}
                    onChange={e => setEditingPlanName(e.target.value)}
                    placeholder="Nombre del plan"
                    className="flex-1 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                    style={{ background: "#1A1A1A", border: "1px solid #333" }}
                  />
                  <button onClick={handleSavePlanMeta} disabled={savingPlanMeta}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-40"
                    style={{ background: "#8B1A2F" }}>
                    {savingPlanMeta ? "…" : "Guardar"}
                  </button>
                </div>
                {viewingDietPlan.kcal_on && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      { label: "💪 Día ON",  kcal: viewingDietPlan.kcal_on,  color: "text-emerald-400" },
                      { label: "😴 Día OFF", kcal: viewingDietPlan.kcal_off, color: "text-blue-400" },
                    ].map(({ label, kcal, color }) => (
                      <div key={label} className="rounded-xl p-3 text-center"
                        style={{ background: "#0A0A0A", border: "1px solid #1A1A1A" }}>
                        <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${color}`}>{label}</p>
                        <p className="text-white font-bold text-lg">{kcal ?? "—"} <span className="text-neutral-500 text-xs font-normal">kcal</span></p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón abrir editor de comidas */}
              <button
                onClick={() => setEditingDietPlanId(viewingDietPlan.id)}
                className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors active:opacity-80"
                style={{ background: "#161616", border: "1px solid #252525" }}>
                <i className="ti ti-pencil" style={{ fontSize: 15 }} />
                Editar comidas del plan
              </button>

              {/* Acciones secundarias */}
              <div className="flex gap-2">
                <button onClick={() => handleDuplicateDiet(viewingDietPlan)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors active:opacity-80"
                  style={{ background: "#141414", border: "1px solid #1E1E1E", color: "#888" }}>
                  <i className="ti ti-copy" style={{ fontSize: 14 }} /> Duplicar
                </button>
                <button onClick={() => handleDeleteDiet(viewingDietPlan)}
                  className="flex items-center justify-center px-4 py-3 rounded-xl transition-colors active:opacity-80"
                  style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", color: "#f87171" }}>
                  <i className="ti ti-trash" style={{ fontSize: 15 }} />
                </button>
              </div>
            </div>
          )}

          {/* ── Asignar ── */}
          {dietPlanSubTab === "asignar" && (
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500">Asignar a clientes</p>
              {clients.length === 0 ? (
                <p className="text-neutral-500 text-sm text-center py-8">No hay clientes.</p>
              ) : (
                clients.map(c => {
                  const isAssigned = dietAssignments.find(a => a.client_id === c.id && a.plan_id === viewingDietPlan.id);
                  return (
                    <button key={c.id}
                      onClick={() => isAssigned
                        ? handleUnassignDiet(c.id, c.full_name)
                        : handleAssignDiet(viewingDietPlan.id, c.id, c.full_name)}
                      className="w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 transition-colors"
                      style={isAssigned
                        ? { background: "#1A0810", border: "1px solid #8B1A2F" }
                        : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
                      <div className="flex-1">
                        <p className={isAssigned ? "text-white font-semibold text-sm" : "text-neutral-300 text-sm"}>
                          {c.full_name}
                        </p>
                      </div>
                      {isAssigned
                        ? <span className="text-xs font-bold" style={{ color: "#C0394F" }}>✓ Asignado</span>
                        : <span className="text-neutral-600 text-xs">Asignar →</span>}
                    </button>
                  );
                })
              )}
            </div>
          )}

        </div>
      </div>
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
      <>
      <div className="min-h-screen footer-safe" style={{ background: "#0A0A0A" }}>
        <header className="px-4 flex items-center gap-3 sticky top-0 z-20 header-safe"
          style={{ background: "#0A0A0A", borderBottom: "1px solid #141414", minHeight: 52 }}>
          <button
            onClick={() => { setViewingClient(null); setSelectedTrainingDay(null); setClientCheckIn(null); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors active:opacity-70"
            style={{ background: "#141414", border: "1px solid #1E1E1E", color: "#888" }}>
            <i className="ti ti-arrow-left" style={{ fontSize: 16 }} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-sm leading-tight truncate">{viewingClient.full_name}</h1>
            <p className="text-[10px] truncate" style={{ color: "#555" }}>
              {(() => {
                const act = clientActivities.find(a => a.clientId === viewingClient.id);
                const asgn = assignments.find(a => a.client_id === viewingClient.id);
                const parts = [];
                if (asgn) parts.push(asgn.program_name);
                if (act?.daysAgo !== null && act?.daysAgo !== undefined) {
                  parts.push(act.daysAgo === 0 ? "Entrenó hoy" : act.daysAgo === 1 ? "Ayer" : `Hace ${act.daysAgo}d`);
                }
                return parts.join(" · ") || "Sin actividad";
              })()}
            </p>
          </div>
          {clientViewTab === "entreno" && selectedTrainingDay && (
            <button onClick={() => setSelectedTrainingDay(null)}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl shrink-0 transition-colors active:opacity-70"
              style={{ background: "#141414", border: "1px solid #1E1E1E", color: "#666" }}>
              <i className="ti ti-arrow-left" style={{ fontSize: 11 }} />
              Días
            </button>
          )}
        </header>

        {/* Nota del entrenador */}
        <div className="px-4 py-2 max-w-3xl mx-auto" style={{ borderBottom: "1px solid #141414" }}>
          {coachNoteEditing === viewingClient.id ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={coachNoteDraft}
                onChange={e => setCoachNoteDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") { localStorage.setItem(`mvp_coach_note_${viewingClient.id}`, coachNoteDraft); setCoachNoteEditing(null); }
                  if (e.key === "Escape") setCoachNoteEditing(null);
                }}
                placeholder="Nota interna del entrenador..."
                className="flex-1 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none"
                style={{ background: "#141414", border: "1px solid #2A2A2A" }}
              />
              <button onClick={() => { localStorage.setItem(`mvp_coach_note_${viewingClient.id}`, coachNoteDraft); setCoachNoteEditing(null); }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: "#8B1A2F" }}>✓</button>
              <button onClick={() => setCoachNoteEditing(null)}
                className="px-2 py-1.5 rounded-lg text-xs text-neutral-500" style={{ background: "#1A1A1A" }}>✕</button>
            </div>
          ) : (
            <button
              onClick={() => { setCoachNoteDraft(getCoachNote(viewingClient.id)); setCoachNoteEditing(viewingClient.id); }}
              className="w-full text-left text-xs py-1 px-1"
              style={{ color: getCoachNote(viewingClient.id) ? "#888" : "#383838" }}>
              <i className="ti ti-pencil mr-1.5" style={{ fontSize: 10 }} />
              {getCoachNote(viewingClient.id) || "Añadir nota interna..."}
            </button>
          )}
        </div>

        {/* Strip adherencia — últimos 14 días */}
        {clientLogs.length > 0 && (() => {
          const trainedDates = new Set(clientLogs.map(l => l.logged_at.slice(0, 10)));
          const today = new Date();
          const days = Array.from({ length: 14 }, (_, i) => {
            const d = new Date(today); d.setDate(d.getDate() - 13 + i);
            return d.toISOString().slice(0, 10);
          });
          return (
            <div className="flex gap-1 px-4 py-2 max-w-3xl mx-auto">
              {days.map(day => (
                <div key={day} className="flex-1 rounded-sm transition-all"
                  style={{ height: 5, background: trainedDates.has(day) ? "#8B1A2F" : "#1E1E1E" }}
                  title={day} />
              ))}
            </div>
          );
        })()}

        {/* Sub-tabs + botón Visita Presencial */}
        <div className="flex items-center gap-1 px-3 py-2 max-w-3xl mx-auto overflow-x-auto scrollbar-hide"
          style={{ borderBottom: "1px solid #141414" }}>
          {[
            { id: "entreno", icon: "barbell",   label: "Entreno", action: () => { setClientViewTab("entreno"); setSelectedTrainingDay(null); } },
            { id: "checkin", icon: "chart-bar", label: "Control",  action: () => { setClientViewTab("checkin"); if (!clientCheckIn && !loadingCheckIn) loadClientCheckIn(viewingClient.id); } },
            { id: "dieta",   icon: "salad",     label: "Dieta",    action: () => { setClientViewTab("dieta"); setClientDietSubTab("plan"); } },
          ].map(({ id, icon, label, action }) => (
            <button key={id} onClick={action}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 active:scale-95"
              style={clientViewTab === id
                ? { background: "rgba(192,41,43,0.1)", color: "#C0292B", border: "1px solid rgba(192,41,43,0.2)" }
                : { background: "transparent", color: "#444", border: "1px solid transparent" }}>
              <i className={`ti ti-${icon}`} style={{ fontSize: 14 }} />
              {label}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setShowVisita(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 shrink-0"
            style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
            <i className="ti ti-clipboard-list" style={{ fontSize: 14 }} />
            Visita
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

                {/* Fotos de progreso */}
                {clientCheckIn.photos.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">Fotos de progreso</p>
                    <div className="grid grid-cols-3 gap-2">
                      {clientCheckIn.photos.map((photo: any) => (
                        <div key={photo.id} className="relative aspect-square cursor-pointer"
                          onClick={() => setAdminPreviewUrl(photo.url)}>
                          <img
                            src={photo.url}
                            alt="foto progreso"
                            className="w-full h-full object-cover rounded-xl hover:opacity-90 transition-opacity"
                          />
                          <p className="absolute bottom-0 left-0 right-0 text-[9px] text-center text-white/60 bg-black/40 rounded-b-xl py-0.5">
                            {new Date(photo.taken_at + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                        {/* Mini gráfico progresión de peso por microciclo */}
                        {mcNums.length > 1 && (() => {
                          const maxPerMc = mcNums.map(mc =>
                            Math.max(...byMc[mc].map(l => l.weight), 0)
                          );
                          const globalMax = Math.max(...maxPerMc, 1);
                          const first = maxPerMc[0];
                          const last = maxPerMc[maxPerMc.length - 1];
                          const trend = last > first + 0.5 ? "↑" : last < first - 0.5 ? "↓" : "=";
                          const trendColor = trend === "↑" ? "#4ade80" : trend === "↓" ? "#f87171" : "#888";
                          return (
                            <div className="mb-3">
                              <div className="flex items-end gap-0.5" style={{ height: 32 }}>
                                {mcNums.map((mc, i) => (
                                  <div key={mc} className="flex-1 flex flex-col justify-end items-center gap-0.5">
                                    <div className="w-full rounded-sm"
                                      style={{
                                        height: Math.max(3, Math.round((maxPerMc[i] / globalMax) * 28)),
                                        background: i === mcNums.length - 1 ? "#8B1A2F" : "#2A2A2A",
                                        transition: "height 0.3s ease",
                                      }} />
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-[9px]" style={{ color: "#444" }}>Mc{mcNums[0]} → Mc{mcNums[mcNums.length - 1]}</span>
                                <span className="text-[10px] font-bold tabular-nums" style={{ color: trendColor }}>
                                  {maxPerMc[maxPerMc.length - 1]}kg {trend}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                        <div className="space-y-2">
                          {mcNums.map(mcNum => {
                            const sets = byMc[mcNum].sort((a, b) =>
                              (a.exercise_sets?.set_number ?? 0) - (b.exercise_sets?.set_number ?? 0));
                            return (
                              <div key={mcNum}>
                                <p className="text-[10px] uppercase tracking-wider text-neutral-600 mb-1">Mc {mcNum}</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {sets.map(log => (
                                    <div key={log.id} className="rounded-lg px-2.5 py-1.5 text-xs"
                                      style={{ background: "#1A1A1A", border: "1px solid #252525" }}>
                                      <span className="mr-1" style={{ color: "#444" }}>S{log.exercise_sets?.set_number}</span>
                                      <span className="font-bold tabular-nums" style={{ color: "#4ade80" }}>
                                        {log.weight}{log.unit}×{log.reps}
                                      </span>
                                      {log.rpe > 0 && (
                                        <span className="ml-1" style={{ color: "#555" }}>RPE{log.rpe}</span>
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
          {clientViewTab === "dieta" && (
            <div className="space-y-0">

              {/* Sub-tabs: Mi Plan | Mis Macros | Generar */}
              <div className="flex gap-1 pb-4">
                {([
                  { id: "plan"    as const, label: "📋 Mi Plan" },
                  { id: "macros"  as const, label: "📊 Macros" },
                  { id: "generar" as const, label: "✨ Generar" },
                ]).map(({ id, label }) => (
                  <button key={id} onClick={() => setClientDietSubTab(id)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-colors"
                    style={clientDietSubTab === id
                      ? { background: "#8B1A2F", color: "#fff", border: "1px solid #A01F38" }
                      : { background: "#1A1A1A", color: "#888", border: "1px solid #2A2A2A" }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* ── Sub-tab: Mi Plan ── */}
              {clientDietSubTab === "plan" && (() => {
                const da = dietAssignments.find(a => a.client_id === viewingClient.id);
                return (
                  <div className="space-y-4">
                    {/* Plan asignado actualmente */}
                    <div className="rounded-xl p-4" style={{ background: "#111", border: "1px solid #222" }}>
                      <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">Plan asignado al cliente</p>
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
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300"
                            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleUnassignDiet(viewingClient.id, viewingClient.full_name)}
                            className="px-3 py-1.5 rounded-lg text-xs text-red-400"
                            style={{ background: "#1A0A0A", border: "1px solid #3A1010" }}>
                            ✕
                          </button>
                        </div>
                      ) : (
                        <p className="text-neutral-500 text-sm">Sin dieta asignada todavía</p>
                      )}
                    </div>

                    {/* Lista de planes existentes para asignar */}
                    {dietPlans.filter(p => !p.notes?.includes("__CLIENT_GENERATED__")).length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Asignar plan existente</p>
                        <div className="space-y-2">
                          {dietPlans.filter(p => !p.notes?.includes("__CLIENT_GENERATED__")).map(plan => {
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
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ── Sub-tab: Mis Macros ── */}
              {clientDietSubTab === "macros" && (
                <MacroCalculator clientName={viewingClient.full_name} clientId={viewingClient.id} />
              )}

              {/* ── Sub-tab: Generar ── */}
              {clientDietSubTab === "generar" && (
                <DietGenerator
                  clientId={viewingClient.id}
                  clientName={viewingClient.full_name}
                  onBack={() => setClientDietSubTab("plan")}
                />
              )}
            </div>
          )}

        </div>
      </div>

      {/* Lightbox fotos admin */}
      {adminPreviewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setAdminPreviewUrl(null)}>
          <img
            src={adminPreviewUrl}
            alt="preview"
            className="max-w-full max-h-full object-contain p-4"
          />
          <button
            className="absolute right-4 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center text-lg active:bg-white/30"
            style={{ top: "max(env(safe-area-inset-top), 16px)" }}
            onClick={e => { e.stopPropagation(); setAdminPreviewUrl(null); }}>
            ✕
          </button>
        </div>
      )}
      </>
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
    <div className="min-h-screen footer-safe" style={{ background: "#0A0A0A" }}>
      {/* ── Header ── */}
      <header className="px-4 flex items-center justify-between sticky top-0 z-20 header-safe"
        style={{ background: "#0A0A0A", borderBottom: "1px solid #141414", minHeight: 52 }}>
        <div className="flex items-center gap-2.5">
          <MVPWordmark />
          <div className="h-4 w-px" style={{ background: "#1E1E1E" }} />
          <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "#444" }}>
            Entrenador
          </span>
        </div>
        <div className="flex items-center gap-2">
          {clients.length > 0 && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
              style={{ background: "#141414", color: "#555", border: "1px solid #1E1E1E" }}>
              {clients.length} clientes
            </span>
          )}
          <button onClick={() => supabase.auth.signOut()}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors active:opacity-70"
            style={{ background: "#141414", border: "1px solid #1E1E1E", color: "#555" }}
            title="Cerrar sesión">
            <i className="ti ti-logout" style={{ fontSize: 16 }} />
          </button>
        </div>
      </header>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-2xl whitespace-nowrap"
          style={{ top: "max(env(safe-area-inset-top,0px), 16px)", background: "#1C1C1C", border: "1px solid #2A2A2A" }}>
          <span className="text-white text-sm">{toast}</span>
        </div>
      )}

      {/* ── Tab bar con iconos ── */}
      <div className="flex px-2 py-2 max-w-3xl mx-auto overflow-x-auto scrollbar-hide gap-0.5"
        style={{ borderBottom: "1px solid #141414" }}>
        {([
          { t: "inicio" as Tab,     icon: "home",          label: "Inicio" },
          { t: "clientes" as Tab,   icon: "users",         label: "Clientes" },
          { t: "programas" as Tab,  icon: "clipboard-list",label: "Programas" },
          { t: "dietas" as Tab,     icon: "salad",         label: "Dietas" },
          { t: "alimentos" as Tab,  icon: "meat",          label: "Alimentos" },
          { t: "ejercicios" as Tab, icon: "barbell",       label: "Ejercicios" },
        ]).map(({ t, icon, label }) => (
          <button key={t} onClick={() => setTab(t)}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl shrink-0 transition-all active:scale-95"
            style={tab === t
              ? { color: "#C0292B", background: "rgba(192,41,43,0.08)" }
              : { color: "#3A3A3A", background: "transparent" }}>
            <i className={`ti ti-${icon}`} style={{ fontSize: 18, lineHeight: 1 }} />
            <span className="text-[9px] font-semibold tracking-wide">{label}</span>
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4">

        {/* ── TAB INICIO ── */}
        {tab === "inicio" && (() => {
          const withAct = clients.map(c => {
            const act = clientActivities.find(a => a.clientId === c.id);
            const asgn = assignments.find(a => a.client_id === c.id);
            const diet = dietAssignments.find(a => a.client_id === c.id);
            const daysAgo = act?.daysAgo ?? null;
            const status: "ok" | "warning" | "critical" =
              !asgn ? "critical"
              : daysAgo === null || daysAgo > 7 ? "warning"
              : "ok";
            return { c, act, asgn, diet, daysAgo, status };
          });
          const sorted = [...withAct].sort((a, b) => {
            const ord = { critical: 0, warning: 1, ok: 2 };
            if (ord[a.status] !== ord[b.status]) return ord[a.status] - ord[b.status];
            if (a.daysAgo === null && b.daysAgo !== null) return -1;
            if (b.daysAgo === null && a.daysAgo !== null) return 1;
            return (b.daysAgo ?? 0) - (a.daysAgo ?? 0);
          });
          const counts = { ok: 0, warning: 0, critical: 0 };
          withAct.forEach(x => counts[x.status]++);

          return (
            <div className="space-y-3 pb-8">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Activos",   value: counts.ok,       color: "#4ade80", bg: "rgba(74,222,128,0.06)",   border: "rgba(74,222,128,0.12)",  icon: "circle-check" },
                  { label: "Inactivos", value: counts.warning,  color: "#fbbf24", bg: "rgba(251,191,36,0.06)",   border: "rgba(251,191,36,0.12)",  icon: "clock-pause"  },
                  { label: "Sin plan",  value: counts.critical, color: "#f87171", bg: "rgba(248,113,113,0.06)",  border: "rgba(248,113,113,0.12)", icon: "alert-circle" },
                ].map(({ label, value, color, bg, border, icon }) => (
                  <div key={label} className="rounded-2xl p-3.5 flex flex-col items-center gap-1"
                    style={{ background: bg, border: `1px solid ${border}` }}>
                    <i className={`ti ti-${icon}`} style={{ fontSize: 16, color, opacity: 0.7 }} />
                    <span className="text-2xl font-black tabular-nums leading-none" style={{ color }}>{value}</span>
                    <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: "#555" }}>{label}</span>
                  </div>
                ))}
              </div>

              {clients.length === 0 ? (
                <p className="text-neutral-600 text-sm text-center py-12">Sin clientes todavía.</p>
              ) : (
                <div className="space-y-2">
                  {sorted.map(({ c, act, asgn, diet, daysAgo, status }) => {
                    const dotColor = status === "ok" ? "#4ade80" : status === "warning" ? "#fbbf24" : "#f87171";
                    const lastText = daysAgo === null ? "Sin actividad" : daysAgo === 0 ? "Hoy" : daysAgo === 1 ? "Ayer" : `Hace ${daysAgo}d`;
                    const coachNote = getCoachNote(c.id);
                    return (
                      <button key={c.id}
                        onClick={() => openClientProgress(c)}
                        className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 active:opacity-70 transition-opacity"
                        style={{ background: "#111", border: "1px solid #1E1E1E" }}>
                        {/* Avatar + dot */}
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
                            style={{ background: "#1E1E1E", color: "#888" }}>
                            {c.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                            style={{ background: dotColor, border: "2px solid #111" }} />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm">{c.full_name}</p>
                          <p className="text-[10px] truncate" style={{ color: "#555" }}>
                            {asgn ? asgn.program_name : "Sin programa"}
                            {diet ? "" : " · Sin dieta"}
                          </p>
                          {coachNote && (
                            <p className="text-[10px] truncate mt-0.5" style={{ color: "#666", fontStyle: "italic" }}>
                              {coachNote}
                            </p>
                          )}
                        </div>
                        {/* Activity */}
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-bold" style={{ color: dotColor }}>{lastText}</p>
                          {act && act.sessionsLast30 > 0 && (
                            <p className="text-[10px]" style={{ color: "#555" }}>{act.sessionsLast30}d / 30d</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── TAB PROGRAMAS ── */}
        {tab === "programas" && (() => {
          // Programas agrupados por cliente
          const progsByClient = (clientId: string) =>
            programs.filter(p => p.owner_client_id === clientId);
          const templates = programs.filter(p => !p.owner_client_id);

          const ProgramCard = ({ prog, clientId }: { prog: ProgramRow; clientId?: string }) => {
            const isActive = !!assignments.find(a => a.client_id === clientId && a.program_id === prog.id);
            return (
              <div className="rounded-xl p-3 transition-colors"
                style={isActive
                  ? { background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)" }
                  : { background: "#111", border: "1px solid #1E1E1E" }}>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: isActive ? "#34d399" : "#2A2A2A" }} />
                  <p className="flex-1 text-white text-sm font-semibold truncate">{prog.name}</p>
                  {isActive && (
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
                      Activo
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setEditingProgramId(prog.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors active:scale-95"
                    style={{ background: "#1A1A1A", border: "1px solid #252525", color: "#aaa" }}>
                    <i className="ti ti-pencil" style={{ fontSize: 12 }} /> Editar
                  </button>
                  <button onClick={() => handleDuplicate(prog)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors active:scale-95"
                    style={{ background: "#1A1A1A", border: "1px solid #252525", color: "#aaa" }}>
                    <i className="ti ti-copy" style={{ fontSize: 12 }} /> Copiar
                  </button>
                  {clientId && !isActive && (
                    <button onClick={() => handleAssign(prog.id, clientId, clients.find(c => c.id === clientId)?.full_name ?? "")}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-colors active:scale-95"
                      style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
                      <i className="ti ti-check" style={{ fontSize: 12 }} /> Activar
                    </button>
                  )}
                  {clientId && isActive && (
                    <button onClick={() => handleUnassign(clientId, "", true)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors active:scale-95"
                      style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
                      <i className="ti ti-x" style={{ fontSize: 12 }} /> Desactivar
                    </button>
                  )}
                  <button onClick={() => handleDeleteProgram(prog)}
                    className="w-9 flex items-center justify-center py-1.5 rounded-lg transition-colors active:scale-95 shrink-0"
                    style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", color: "#f87171" }}>
                    <i className="ti ti-trash" style={{ fontSize: 13 }} />
                  </button>
                </div>
              </div>
            );
          };

          return (
            <div className="space-y-4">
              {/* ── Sección por cliente (colapsable) ── */}
              {clients.length === 0 ? (
                <p className="text-neutral-500 text-sm text-center py-8">
                  Añade clientes primero en la pestaña Clientes.
                </p>
              ) : clients.map(client => {
                const clientProgs = progsByClient(client.id);
                const isOpen = expandedClientId === client.id;
                const activeProgId = assignments.find(a => a.client_id === client.id)?.program_id;
                return (
                  <div key={client.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                    {/* Header colapsable */}
                    <button
                      onClick={() => setExpandedClientId(isOpen ? null : client.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/50 transition-colors text-left">
                      <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {client.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm">{client.full_name}</p>
                        <p className="text-neutral-500 text-xs">
                          {clientProgs.length === 0 ? "Sin bloques" : `${clientProgs.length} bloque${clientProgs.length !== 1 ? "s" : ""}`}
                          {activeProgId && clientProgs.find(p => p.id === activeProgId) && (
                            <span className="ml-2 text-emerald-500">· Activo</span>
                          )}
                        </p>
                      </div>
                      <span className="text-neutral-500 text-xs">{isOpen ? "▲" : "▼"}</span>
                    </button>

                    {/* Contenido expandido */}
                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-neutral-800 pt-3">
                        <button
                          onClick={() => handleCreateProgram(client.id, client.full_name)}
                          className="w-full mb-3 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors active:scale-95"
                          style={{ background: "#111", border: "1px solid #1E1E1E", color: "#666" }}>
                          <i className="ti ti-plus" style={{ fontSize: 12 }} />
                          Nuevo bloque
                        </button>
                        {clientProgs.length === 0 ? (
                          <p className="text-neutral-600 text-xs text-center py-2">
                            Sin bloques. Crea uno nuevo o asigna una plantilla.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {clientProgs.map(prog => (
                              <div key={prog.id}>
                                <ProgramCard prog={prog} clientId={client.id} />
                                {/* Mover a plantillas */}
                                <button
                                  onClick={async () => {
                                    await supabase.from("programs").update({ owner_client_id: null }).eq("id", prog.id);
                                    setPrograms(prev => prev.map(p => p.id === prog.id ? { ...p, owner_client_id: null } : p));
                                    showToast("✅ Movido a Plantillas");
                                  }}
                                  className="mt-1 w-full py-1 rounded-lg text-[10px] text-neutral-600 hover:text-neutral-400 hover:bg-neutral-800 transition-colors">
                                  → Mover a Plantillas
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* ── Plantillas (sin cliente asignado) ── */}
              <div className="bg-neutral-900 border border-neutral-700/50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setTemplatesOpen(o => !o)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/50 transition-colors text-left">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs shrink-0">📁</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-neutral-300 font-medium text-sm">Plantillas</p>
                    <p className="text-neutral-600 text-xs">{templates.length === 0 ? "Sin plantillas" : `${templates.length} plantilla${templates.length !== 1 ? "s" : ""}`}</p>
                  </div>
                  <span className="text-neutral-500 text-xs">{templatesOpen ? "▲" : "▼"}</span>
                </button>
                {templatesOpen && (
                <div className="px-4 pb-4 border-t border-neutral-800 pt-3">
                {templates.length === 0 ? (
                  <p className="text-neutral-600 text-xs text-center py-3">
                    No hay plantillas. Los programas sin cliente aparecen aquí.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {templates.map(prog => (
                      <div key={prog.id} className="rounded-xl p-3 bg-neutral-800/60 border border-neutral-700/50">

                        {/* Nombre con edición inline */}
                        {renamingProgId === prog.id ? (
                          <div className="flex gap-2 mb-2">
                            <input
                              autoFocus
                              value={renamingName}
                              onChange={e => setRenamingName(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter") handleRenameProgram(prog.id); if (e.key === "Escape") setRenamingProgId(null); }}
                              className="flex-1 px-2 py-1.5 rounded-lg bg-neutral-700 border border-neutral-500 text-white text-sm focus:outline-none focus:border-neutral-300"
                            />
                            <button onClick={() => handleRenameProgram(prog.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                              style={{ background: "#8B1A2F" }}>
                              ✓
                            </button>
                            <button onClick={() => setRenamingProgId(null)}
                              className="px-2 py-1.5 rounded-lg text-xs text-neutral-400 bg-neutral-700">
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mb-2">
                            <p className="flex-1 text-neutral-200 text-sm font-medium truncate">{prog.name}</p>
                            <button
                              onClick={() => { setRenamingProgId(prog.id); setRenamingName(prog.name); }}
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors active:opacity-70 shrink-0"
                              style={{ color: "#555" }}>
                              <i className="ti ti-pencil" style={{ fontSize: 11 }} /> Renombrar
                            </button>
                          </div>
                        )}

                        {/* Acciones */}
                        <div className="flex gap-1.5 mb-3">
                          <button onClick={() => setEditingProgramId(prog.id)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors active:scale-95"
                            style={{ background: "#1A1A1A", border: "1px solid #252525", color: "#aaa" }}>
                            <i className="ti ti-pencil" style={{ fontSize: 12 }} /> Editar
                          </button>
                          <button onClick={() => handleDuplicate(prog)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors active:scale-95"
                            style={{ background: "#1A1A1A", border: "1px solid #252525", color: "#aaa" }}>
                            <i className="ti ti-copy" style={{ fontSize: 12 }} /> Copiar
                          </button>
                          <button onClick={() => handleDeleteProgram(prog)}
                            className="w-9 flex items-center justify-center py-1.5 rounded-lg transition-colors active:scale-95 shrink-0"
                            style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", color: "#f87171" }}>
                            <i className="ti ti-trash" style={{ fontSize: 13 }} />
                          </button>
                        </div>

                        {/* Asignar a cliente */}
                        {clients.length > 0 && (
                          <div>
                            <p className="text-neutral-600 text-[10px] uppercase tracking-wider mb-1.5">Asignar a cliente →</p>
                            <div className="flex flex-wrap gap-1.5">
                              {clients.map(c => (
                                <button key={c.id}
                                  onClick={() => handleSetOwner(prog.id, c.id)}
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-colors active:scale-95">
                                  <span className="w-4 h-4 rounded-full bg-neutral-500 flex items-center justify-center text-[9px] font-bold">
                                    {c.full_name.charAt(0).toUpperCase()}
                                  </span>
                                  {c.full_name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── TAB CLIENTES ── */}
        {tab === "clientes" && (
          <div className="space-y-3">
            {/* ── Formulario de invitación ── */}
            <div className="rounded-2xl p-4" style={{ background: "#111", border: "1px solid #1E1E1E" }}>
              <div className="flex items-center gap-2 mb-3">
                <i className="ti ti-user-plus" style={{ fontSize: 15, color: "#555" }} />
                <p className="text-white text-sm font-semibold">Invitar nuevo cliente</p>
              </div>
              <div className="space-y-2">
                <input type="text" value={inviteName} onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Nombre del cliente (opcional)"
                  className="w-full px-3 py-2.5 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none"
                  style={{ background: "#141414", border: "1px solid #1E1E1E" }} />
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  onKeyDown={(e) => e.key === "Enter" && handleInviteClient()}
                  className="w-full px-3 py-2.5 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none"
                  style={{ background: "#141414", border: "1px solid #1E1E1E" }} />
                <button onClick={handleInviteClient} disabled={inviting || !inviteEmail.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all active:scale-95"
                  style={{ background: "#C0292B" }}>
                  <i className="ti ti-send" style={{ fontSize: 14 }} />
                  {inviting ? "Enviando…" : "Enviar invitación"}
                </button>
              </div>
              <p className="text-neutral-600 text-xs mt-2">El cliente recibirá un email para crear su contraseña.</p>
            </div>

            {/* ── Buscador + filtros ── */}
            {clients.length > 0 && (
              <div className="space-y-2">
                <div className="relative">
                  <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: 14, color: "#444" }} />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={e => setClientSearch(e.target.value)}
                    placeholder="Buscar cliente..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none"
                    style={{ background: "#111", border: "1px solid #1E1E1E" }}
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {([
                    { id: "all",      label: "Todos" },
                    { id: "noprog",   label: "Sin programa" },
                    { id: "nodiet",   label: "Sin dieta" },
                    { id: "inactive", label: "+7 días sin entrenar" },
                  ] as { id: typeof clientFilter; label: string }[]).map(({ id, label }) => (
                    <button key={id} onClick={() => setClientFilter(id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
                      style={clientFilter === id
                        ? { background: "rgba(192,41,43,0.1)", color: "#C0292B", border: "1px solid rgba(192,41,43,0.25)" }
                        : { background: "#111", color: "#555", border: "1px solid #1E1E1E" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Lista de clientes ── */}
            {clients.length === 0 ? (
              <div className="text-center py-16">
                <i className="ti ti-users" style={{ fontSize: 36, color: "#333" }} />
                <p className="text-neutral-600 text-sm mt-3">Aún no hay clientes.</p>
              </div>
            ) : (() => {
              const filtered = clients.filter(c => {
                if (!c.full_name.toLowerCase().includes(clientSearch.toLowerCase())) return false;
                const act = clientActivities.find(a => a.clientId === c.id);
                if (clientFilter === "noprog")   return !assignments.find(a => a.client_id === c.id);
                if (clientFilter === "nodiet")   return !dietAssignments.find(a => a.client_id === c.id);
                if (clientFilter === "inactive") return act?.daysAgo === null || (act?.daysAgo ?? 999) > 7;
                return true;
              });
              return filtered.length === 0 ? (
                <p className="text-neutral-500 text-sm text-center py-6">Sin resultados</p>
              ) : (
                <div className="space-y-2">
                  {filtered.map((c) => {
                    const isOpen = expandedClientCardId === c.id;
                    const assignment = assignments.find(a => a.client_id === c.id);
                    const dietAssignment = dietAssignments.find(a => a.client_id === c.id);
                    const act = clientActivities.find(a => a.clientId === c.id);
                    const daysAgo = act?.daysAgo ?? null;
                    const dotColor = !assignment ? "#f87171" : daysAgo === null || daysAgo > 7 ? "#fbbf24" : "#4ade80";
                    const lastText = daysAgo === null ? "Sin actividad" : daysAgo === 0 ? "Hoy" : daysAgo === 1 ? "Ayer" : `${daysAgo}d`;
                    const coachNote = getCoachNote(c.id);
                    return (
                      <div key={c.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                        {/* Header colapsable */}
                        <button
                          onClick={() => setExpandedClientCardId(isOpen ? null : c.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/50 transition-colors text-left">
                          {/* Avatar + dot */}
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-bold text-white">
                              {c.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                              style={{ background: dotColor, border: "2px solid #171717" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <p className="text-white text-sm font-semibold">{c.full_name}</p>
                              <span className="text-[10px] font-semibold" style={{ color: dotColor }}>{lastText}</span>
                            </div>
                            <p className="text-[11px] truncate" style={{ color: "#555" }}>
                              {assignment ? assignment.program_name : "Sin programa"}
                              {dietAssignment ? "" : " · Sin dieta"}
                            </p>
                            {coachNote && (
                              <p className="text-[10px] truncate" style={{ color: "#666", fontStyle: "italic" }}>{coachNote}</p>
                            )}
                          </div>
                          <span className="text-neutral-600 text-xs shrink-0">{isOpen ? "▲" : "▼"}</span>
                        </button>

                        {/* Acciones expandidas */}
                        {isOpen && (
                          <div className="px-4 pb-3 pt-1 border-t border-neutral-800 space-y-2">
                            {/* Nota del entrenador */}
                            {coachNoteEditing === c.id ? (
                              <div className="flex gap-2">
                                <input
                                  autoFocus
                                  value={coachNoteDraft}
                                  onChange={e => setCoachNoteDraft(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === "Enter") { localStorage.setItem(`mvp_coach_note_${c.id}`, coachNoteDraft); setCoachNoteEditing(null); }
                                    if (e.key === "Escape") setCoachNoteEditing(null);
                                  }}
                                  placeholder="Nota interna..."
                                  className="flex-1 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none"
                                  style={{ background: "#141414", border: "1px solid #2A2A2A" }}
                                />
                                <button onClick={() => { localStorage.setItem(`mvp_coach_note_${c.id}`, coachNoteDraft); setCoachNoteEditing(null); }}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: "#8B1A2F" }}>✓</button>
                                <button onClick={() => setCoachNoteEditing(null)}
                                  className="px-2 py-1.5 rounded-lg text-xs text-neutral-500" style={{ background: "#1A1A1A" }}>✕</button>
                              </div>
                            ) : (
                              <button onClick={() => { setCoachNoteDraft(getCoachNote(c.id)); setCoachNoteEditing(c.id); }}
                                className="w-full text-left text-xs px-3 py-2 rounded-lg"
                                style={{ background: "#141414", border: "1px solid #222", color: coachNote ? "#888" : "#444" }}>
                                {coachNote || "＋ Nota interna del entrenador..."}
                              </button>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => openClientProgress(c)}
                                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-colors"
                                style={{ background: "#1A1A2A", border: "1px solid #2A2A4A", color: "#a5b4fc" }}>
                                Ver progreso
                              </button>
                              <button onClick={() => { setTab("programas"); setExpandedClientId(c.id); setExpandedClientCardId(null); }}
                                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-colors"
                                style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#ccc" }}>
                                Programa
                              </button>
                              {assignment && (
                                <button onClick={() => handleUnassign(c.id, c.full_name)}
                                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition-colors"
                                  style={{ background: "#1A0808", border: "1px solid #3A1010", color: "#f87171" }}>
                                  Desasignar
                                </button>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteClient(c.id, c.full_name)}
                              className="w-full py-2 rounded-lg text-xs font-semibold transition-colors"
                              style={{ background: "#1A0808", border: "1px solid #3A1515", color: "#F87171" }}>
                              Eliminar cliente permanentemente
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── TAB DIETAS ── */}
        {tab === "dietas" && (
          <div className="space-y-3 pb-8">
            {/* Botones de acción */}
            <div className="flex gap-2">
              <button onClick={handleCreateDietPlan}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{ background: "#111", border: "1px solid #1E1E1E", color: "#777" }}>
                <i className="ti ti-plus" style={{ fontSize: 14 }} />
                Plan vacío
              </button>
              <button onClick={() => { setViewingDietPlan({ id: "__new__", name: "", kcal_on: null, kcal_off: null, notes: null }); setDietPlanSubTab("generar"); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{ background: "#C0292B", color: "white" }}>
                <i className="ti ti-sparkles" style={{ fontSize: 14 }} />
                Generar con IA
              </button>
            </div>

            {/* ── SECCIÓN PLANTILLAS ── */}
            <button onClick={() => setDietTemplatesOpen(o => !o)}
              className="w-full flex items-center justify-between px-1 py-1">
              <div className="flex items-center gap-2">
                <i className="ti ti-clipboard-list" style={{ fontSize: 13, color: "#444" }} />
                <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "#555" }}>
                  Plantillas ({dietPlans.filter(p => !p.notes?.includes("__CLIENT_GENERATED__")).length})
                </span>
              </div>
              <i className={`ti ti-chevron-${dietTemplatesOpen ? "up" : "down"}`} style={{ fontSize: 13, color: "#444" }} />
            </button>

            {dietTemplatesOpen && (
              <div className="space-y-2">
                {dietPlans.filter(p => !p.notes?.includes("__CLIENT_GENERATED__")).length === 0 ? (
                  <p className="text-neutral-600 text-xs text-center py-4">Sin plantillas. Crea una arriba.</p>
                ) : (
                  dietPlans.filter(p => !p.notes?.includes("__CLIENT_GENERATED__")).map(plan => {
                    const assigned = dietAssignments.filter(a => a.plan_id === plan.id);
                    return (
                      <button key={plan.id}
                        onClick={() => { setViewingDietPlan(plan); setEditingPlanName(plan.name); setDietPlanSubTab("editar"); }}
                        className="w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3 active:opacity-70 transition-opacity"
                        style={{ background: "#111", border: "1px solid #1E1E1E" }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "#1A1A1A", border: "1px solid #252525" }}>
                          <i className="ti ti-salad" style={{ fontSize: 14, color: "#555" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm">{plan.name}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: "#555" }}>
                            {plan.kcal_on ? `${plan.kcal_on} / ${plan.kcal_off ?? "—"} kcal` : "Sin kcal"}
                            {assigned.length > 0 ? ` · ${assigned.length} cliente${assigned.length > 1 ? "s" : ""}` : ""}
                          </p>
                        </div>
                        <i className="ti ti-chevron-right" style={{ fontSize: 14, color: "#333" }} />
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* ── SECCIÓN USUARIOS ── */}
            <button onClick={() => setDietUsersOpen(o => !o)}
              className="w-full flex items-center justify-between px-1 py-1 mt-2">
              <div className="flex items-center gap-2">
                <i className="ti ti-users" style={{ fontSize: 13, color: "#444" }} />
                <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "#555" }}>
                  Clientes ({clients.length})
                </span>
              </div>
              <i className={`ti ti-chevron-${dietUsersOpen ? "up" : "down"}`} style={{ fontSize: 13, color: "#444" }} />
            </button>

            {dietUsersOpen && (
              <div className="space-y-2">
                {clients.map(client => {
                  const da = dietAssignments.find(a => a.client_id === client.id);
                  const isExpanded = expandedDietClientId === client.id;
                  return (
                    <div key={client.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid #1E1E1E" }}>
                      {/* Cabecera cliente */}
                      <button
                        onClick={() => setExpandedDietClientId(isExpanded ? null : client.id)}
                        className="w-full flex items-center gap-3 px-4 py-3.5"
                        style={{ background: "#111" }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                          style={{ background: "#1E1E1E", color: "#8B1A2F" }}>
                          {client.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-white text-sm font-semibold">{client.full_name}</p>
                          <p className="text-neutral-500 text-xs truncate">
                            {da ? `🥗 ${da.plan_name}` : "Sin dieta asignada"}
                          </p>
                        </div>
                        <span className="text-neutral-600 text-xs">{isExpanded ? "▲" : "▼"}</span>
                      </button>

                      {/* Expansión: selector de plan */}
                      {isExpanded && (
                        <div className="px-4 py-3 space-y-2" style={{ background: "#0D0D0D", borderTop: "1px solid #1E1E1E" }}>
                          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-2">Asignar plantilla</p>
                          {dietPlans.filter(p => !p.notes?.includes("__CLIENT_GENERATED__")).length === 0 ? (
                            <p className="text-neutral-600 text-xs">No hay plantillas disponibles.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {dietPlans.filter(p => !p.notes?.includes("__CLIENT_GENERATED__")).map(plan => (
                                <button key={plan.id}
                                  onClick={() => handleAssignDiet(plan.id, client.id, client.full_name)}
                                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors active:opacity-70"
                                  style={{
                                    background: da?.plan_id === plan.id ? "#1A0810" : "#1A1A1A",
                                    border: `1px solid ${da?.plan_id === plan.id ? "#8B1A2F" : "#2A2A2A"}`,
                                    color: da?.plan_id === plan.id ? "#E88" : "#ccc",
                                  }}>
                                  <span>{plan.name}</span>
                                  {da?.plan_id === plan.id && <span className="text-xs">✓ Asignada</span>}
                                </button>
                              ))}
                            </div>
                          )}
                          {da && (
                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={() => setEditingDietPlanId(da.plan_id)}
                                className="flex-1 py-2 rounded-lg text-xs font-medium text-neutral-200"
                                style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
                                ✏️ Editar dieta
                              </button>
                              <button
                                onClick={async () => {
                                  await supabase.from("diet_assignments").update({ active: false }).eq("client_id", client.id);
                                  showToast(`Dieta desasignada de ${client.full_name}`);
                                  await loadDietAssignments();
                                }}
                                className="flex-1 py-2 rounded-lg text-xs text-red-500"
                                style={{ background: "#1A0808", border: "1px solid #3A1010" }}>
                                ✕ Quitar dieta
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB ALIMENTOS ── */}
        {tab === "alimentos" && (
          <IngredientsAdmin />
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
                            {/* Campo URL de vídeo con preview del link actual */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-wider text-neutral-500">URL vídeo</span>
                                {editingEx.video_ref && editingEx.video_ref !== "-" && (
                                  <a href={editingEx.video_ref} target="_blank" rel="noopener noreferrer"
                                    className="text-[10px] text-red-400 hover:text-red-300 underline truncate max-w-[160px]">
                                    ▶ Ver actual
                                  </a>
                                )}
                              </div>
                              <input
                                value={editingEx.video_ref}
                                onChange={e => setEditingEx(prev => prev ? { ...prev, video_ref: e.target.value } : prev)}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white font-mono text-xs"
                                placeholder="https://www.youtube.com/watch?v=..." />
                            </div>
                            <textarea
                              value={editingEx.coach_note}
                              onChange={e => setEditingEx(prev => prev ? { ...prev, coach_note: e.target.value } : prev)}
                              rows={3}
                              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white resize-none"
                              placeholder="Nota técnica del entrenador (el cliente la verá durante el ejercicio)" />
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
                            <p className="text-white text-sm flex-1 leading-snug">{ex.name}</p>
                            {ex.coach_note && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 shrink-0">📝</span>
                            )}
                            {ex.video_ref && ex.video_ref !== "-" ? (
                              <a
                                href={ex.video_ref}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm hover:opacity-80 transition-opacity"
                                style={{ background: "#1A0808", border: "1px solid #CC0000", color: "#FF4444" }}
                                title={ex.video_ref}>
                                ▶
                              </a>
                            ) : (
                              <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px]"
                                style={{ background: "#111", border: "1px solid #222", color: "#444" }}
                                title="Sin vídeo">
                                —
                              </span>
                            )}
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
