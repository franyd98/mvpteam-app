// Vista del cliente: carga el programa asignado desde Supabase.
// Los registros de entrenamiento se guardan en Supabase (set_logs).

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Program, SetLog } from "../types";
import { setKey } from "../types";
import { findLatestLog, findPreviousMicrocycleLog, useSettings } from "../storage";
import SetLogger from "../components/SetLogger";
import SettingsPanel from "../components/SettingsPanel";
import RestTimer from "../components/RestTimer";
import CheckInPage from "./CheckInPage";
import DietPage from "./DietPage";
import { MVPWordmark } from "../components/MVPLogo";
import MiniChart from "../components/MiniChart";
import type { ChartPoint } from "../components/MiniChart";

type Profile = { id: string; full_name: string; role: string };

type ActiveTab = "workout" | "diet" | "checkin";

const lockKey = (dId: string, mcNum: number) => `${dId}:${mcNum}`;

type EditingTarget = {
  dayId: string;
  microcycleNumber: number;
  exerciseIndex: number;
  setNumber: number;
} | null;

type RestState = { endAt: number; totalSeconds: number } | null;

type SetIdEntry = {
  dayId: string;
  microcycleNumber: number;
  exerciseIndex: number;
  setNumber: number;
};

export default function FitnessApp({ profile }: { profile: Profile }) {
  const [program, setProgram] = useState<Program | null>(null);
  const [loadingProgram, setLoadingProgram] = useState(true);
  const [dayId, setDayId] = useState<string>("");
  const [microcycleNumber, setMicrocycleNumber] = useState<number>(1);
  const [editing, setEditing] = useState<EditingTarget>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("workout");

  // Resetear scroll del contenedor al cambiar de tab (antes de pintar)
  useLayoutEffect(() => {
    const el = document.getElementById("tab-scroll");
    if (el) el.scrollTop = 0;
  }, [activeTab]);

  const [rest, setRest] = useState<RestState>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  // Clave: "dayId:mcNumber" → true si está bloqueado
  const [lockedMcs, setLockedMcs] = useState<Set<string>>(new Set());
  const [lockingSaving, setLockingSaving] = useState(false);

  const [logs, setLogs] = useState<SetLog[]>([]);
  const [settings, setSettings] = useSettings();

  // Historial de cargas por ejercicio + panel de stats global
  const [exHistory, setExHistory] = useState<{ name: string; dayId: string; exerciseIndex: number } | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Calendario mensual de entrenamientos
  const [showCalendar, setShowCalendar] = useState(false);
  const [calYear,  setCalYear]  = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

  // Días de descanso marcados manualmente (persist en localStorage)
  const [manualRestDays, setManualRestDays] = useState<Set<string>>(() => {
    try {
      const s = localStorage.getItem("mvp_manual_rest_days");
      return s ? new Set(JSON.parse(s)) : new Set();
    } catch { return new Set(); }
  });
  const toggleManualRest = (ds: string) => {
    setManualRestDays(prev => {
      const next = new Set(prev);
      if (next.has(ds)) next.delete(ds); else next.add(ds);
      try { localStorage.setItem("mvp_manual_rest_days", JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  // Sustituciones de ejercicio — persisten en localStorage por cliente
  // Clave localStorage: mvp_subs_v1_{profileId}
  // Clave de cada entrada: "{dayId}:{mcNum}:{exIdx}" → solo aplica al microciclo concreto
  const subsStorageKey = `mvp_subs_v1_${profile.id}`;
  const [substitutions, setSubstitutions] = useState<Record<string, { name: string; muscleGroup: string }>>(() => {
    try {
      const s = localStorage.getItem(`mvp_subs_v1_${profile.id}`);
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });
  const updateSubstitutions = (updater: (prev: Record<string, { name: string; muscleGroup: string }>) => Record<string, { name: string; muscleGroup: string }>) => {
    setSubstitutions(prev => {
      const next = updater(prev);
      try { localStorage.setItem(subsStorageKey, JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const [swapTarget, setSwapTarget] = useState<{ dayId: string; mcNum: number; exIdx: number; origName: string } | null>(null);
  const [swapSearch, setSwapSearch] = useState("");
  // Lista completa de ejercicios de la BD (para el buscador de sustitución)
  const [dbExercises, setDbExercises] = useState<{ name: string; muscleGroup: string }[]>([]);

  const setKeyToIdRef = useRef(new Map<string, number>());
  const idToEntryRef = useRef(new Map<number, SetIdEntry>());

  // Lista completa de ejercicios para el modal de sustitución:
  // usa la BD si está cargada; si no, cae al programa asignado.
  const allExercises = useMemo(() => {
    if (dbExercises.length > 0) return dbExercises;
    if (!program) return [];
    const seen = new Set<string>();
    const list: { name: string; muscleGroup: string }[] = [];
    program.days.forEach(d => {
      d.microcycles[0]?.exercises.forEach(ex => {
        if (!seen.has(ex.name)) {
          seen.add(ex.name);
          list.push({ name: ex.name, muscleGroup: ex.muscleGroup });
        }
      });
    });
    return list.sort((a, b) => (a.muscleGroup ?? "").localeCompare(b.muscleGroup ?? "") || a.name.localeCompare(b.name));
  }, [dbExercises, program]);

  const subKey = (dId: string, mcNum: number, exIdx: number) => `${dId}:${mcNum}:${exIdx}`;

  useEffect(() => {
    loadAssignedProgram();
    // Cargar todos los ejercicios de la BD para el buscador de sustitución
    supabase
      .from("exercises")
      .select("name, muscle_group")
      .order("muscle_group")
      .then(({ data }) => {
        if (data) {
          setDbExercises(data.map((e: any) => ({ name: e.name, muscleGroup: e.muscle_group ?? "" })));
        }
      });
  }, []);

  // ── Helpers de bloqueo ────────────────────────────────────────
  const isLocked = (dId: string, mcNum: number) => lockedMcs.has(lockKey(dId, mcNum));

  const toggleLock = async (dId: string, mcNum: number) => {
    setLockingSaving(true);
    const key = lockKey(dId, mcNum);
    if (lockedMcs.has(key)) {
      // Desbloquear
      await supabase
        .from("locked_microcycles")
        .delete()
        .eq("client_id", profile.id)
        .eq("day_id", dId)
        .eq("microcycle_number", mcNum);
      setLockedMcs(prev => { const s = new Set(prev); s.delete(key); return s; });
    } else {
      // Bloquear
      await supabase
        .from("locked_microcycles")
        .upsert({ client_id: profile.id, day_id: dId, microcycle_number: mcNum },
          { onConflict: "client_id,day_id,microcycle_number" });
      setLockedMcs(prev => new Set([...prev, key]));
    }
    setLockingSaving(false);
  };

  const loadAssignedProgram = async () => {
    const { data, error } = await supabase
      .from("program_assignments")
      .select(`
        programs (
          id, name, description,
          program_days (
            id, name, order_index, optional,
            microcycles (
              id, number,
              microcycle_exercises (
                id, order_index, total_sets, note,
                exercises ( id, name, muscle_group, video_ref, coach_note ),
                exercise_sets ( id, set_number, target_reps, target_weight, target_rpe )
              )
            )
          )
        )
      `)
      .eq("client_id", profile.id)
      .eq("active", true)
      .limit(1)
      .single();

    if (error || !data) {
      setLoadingProgram(false);
      return;
    }

    const raw = (data as any).programs;

    setKeyToIdRef.current.clear();
    idToEntryRef.current.clear();

    const transformed: Program = {
      programName: raw.name,
      description: raw.description ?? "",
      days: (raw.program_days ?? [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((day: any) => ({
          id: String(day.id),
          name: day.name,
          order: day.order_index,
          optional: day.optional,
          microcycles: (day.microcycles ?? [])
            .sort((a: any, b: any) => a.number - b.number)
            .map((mc: any) => ({
              number: mc.number,
              exercises: (mc.microcycle_exercises ?? [])
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((me: any, exIdx: number) => ({
                  muscleGroup: me.exercises?.muscle_group ?? "",
                  name: me.exercises?.name ?? "",
                  videoRef: me.exercises?.video_ref ?? null,
                  coachNote: me.exercises?.coach_note ?? null,
                  totalSets: me.total_sets,
                  note: me.note ?? null,
                  sets: (me.exercise_sets ?? [])
                    .sort((a: any, b: any) => a.set_number - b.set_number)
                    .map((s: any) => {
                      const k = setKey(String(day.id), mc.number, exIdx, s.set_number);
                      setKeyToIdRef.current.set(k, s.id);
                      idToEntryRef.current.set(s.id, {
                        dayId: String(day.id),
                        microcycleNumber: mc.number,
                        exerciseIndex: exIdx,
                        setNumber: s.set_number,
                      });
                      return {
                        number: s.set_number,
                        targetReps: s.target_reps ?? null,
                        targetWeight: s.target_weight ?? null,
                        targetRpe: s.target_rpe ?? null,
                      };
                    }),
                })),
            })),
        })),
    };

    setProgram(transformed);
    if (transformed.days.length > 0) setDayId(transformed.days[0].id);

    const [logsRes, locksRes] = await Promise.all([
      supabase.from("set_logs").select("*").eq("client_id", profile.id),
      supabase.from("locked_microcycles").select("day_id,microcycle_number").eq("client_id", profile.id),
    ]);

    if (logsRes.data) {
      const converted = logsRes.data.flatMap((row) => {
        const entry = idToEntryRef.current.get(row.exercise_set_id);
        if (!entry) return [];
        return [{
          dayId: entry.dayId,
          microcycleNumber: entry.microcycleNumber,
          exerciseIndex: entry.exerciseIndex,
          setNumber: entry.setNumber,
          weight: row.weight ?? 0,
          reps: row.reps ?? 0,
          rpe: row.rpe ?? 0,
          unit: (row.unit ?? settings.weightUnit) as "kg" | "lb",
          loggedAt: row.logged_at ?? new Date().toISOString(),
          rp_reps:     row.rp_reps     ?? null,
          drop_weight: row.drop_weight ?? null,
          drop_reps:   row.drop_reps   ?? null,
        } as SetLog];
      });
      setLogs(converted);
    }

    if (locksRes.data) {
      setLockedMcs(new Set(locksRes.data.map((r: any) => lockKey(String(r.day_id), r.microcycle_number))));
    }

    setLoadingProgram(false);
  };

  const day = useMemo(
    () => program?.days.find((d) => d.id === dayId) ?? null,
    [program, dayId],
  );
  const microcycle = useMemo(
    () => day?.microcycles.find((m) => m.number === microcycleNumber) ?? day?.microcycles[0] ?? null,
    [day, microcycleNumber],
  );

  const openVideo = (url: string) => {
    // YouTube: watch?v=ID o youtu.be/ID
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&/?]+)/);
    if (yt) {
      setVideoUrl(`https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`);
      return;
    }
    // Google Drive
    const gd = url.match(/\/file\/d\/([^/]+)/);
    if (gd) {
      setVideoUrl(`https://drive.google.com/file/d/${gd[1]}/preview`);
      return;
    }
    // URL directa (mp4, etc.)
    setVideoUrl(url);
  };

  const startRestTimer = () => {
    setRest({ endAt: Date.now() + settings.restSeconds * 1000, totalSeconds: settings.restSeconds });
  };

  const adjustRest = (delta: number) => {
    setRest((prev) =>
      prev
        ? { endAt: Math.max(Date.now(), prev.endAt + delta * 1000), totalSeconds: prev.totalSeconds + delta }
        : prev,
    );
  };

  const handleSave = async (data: { weight: number; reps: number; rpe: number; rp_reps?: number; drop_weight?: number; drop_reps?: number }) => {
    if (!editing) return;

    // Capturar antes de cualquier setState (los setState son asíncronos)
    const snap = { ...editing };
    const k = setKey(snap.dayId, snap.microcycleNumber, snap.exerciseIndex, snap.setNumber);
    const exerciseSetId = setKeyToIdRef.current.get(k);

    // ── 1. Actualizar UI al instante (cierra modal, muestra la serie) ──
    const newLog: SetLog = {
      ...snap,
      weight: data.weight,
      reps: data.reps,
      rpe: data.rpe,
      unit: settings.weightUnit,
      loggedAt: new Date().toISOString(),
      rp_reps:     data.rp_reps     ?? null,
      drop_weight: data.drop_weight ?? null,
      drop_reps:   data.drop_reps   ?? null,
    };
    setLogs((prev) => [
      ...prev.filter(
        (l) =>
          !(
            l.dayId === snap.dayId &&
            l.microcycleNumber === snap.microcycleNumber &&
            l.exerciseIndex === snap.exerciseIndex &&
            l.setNumber === snap.setNumber
          ),
      ),
      newLog,
    ]);
    setEditing(null);
    if (settings.autoStartRestTimer) startRestTimer();

    // ── 2. Persistir en Supabase (awaited) ──
    if (exerciseSetId) {
      await supabase.from("set_logs").upsert(
        {
          client_id: profile.id,
          exercise_set_id: exerciseSetId,
          weight: data.weight,
          reps: data.reps,
          rpe: data.rpe,
          unit: settings.weightUnit,
          logged_at: new Date().toISOString(),
          rp_reps:     data.rp_reps     ?? null,
          drop_weight: data.drop_weight ?? null,
          drop_reps:   data.drop_reps   ?? null,
        },
        { onConflict: "client_id,exercise_set_id" },
      );
    }
  };

  const handleDelete = async () => {
    if (!editing) return;

    const snap = { ...editing };
    const k = setKey(snap.dayId, snap.microcycleNumber, snap.exerciseIndex, snap.setNumber);
    const exerciseSetId = setKeyToIdRef.current.get(k);

    // ── 1. Eliminar de la UI al instante ──
    setLogs((prev) =>
      prev.filter(
        (l) =>
          !(
            l.dayId === snap.dayId &&
            l.microcycleNumber === snap.microcycleNumber &&
            l.exerciseIndex === snap.exerciseIndex &&
            l.setNumber === snap.setNumber
          ),
      ),
    );
    setEditing(null);

    // ── 2. Borrar en Supabase (awaited) ──
    if (exerciseSetId) {
      await supabase
        .from("set_logs")
        .delete()
        .eq("client_id", profile.id)
        .eq("exercise_set_id", exerciseSetId);
    }
  };

  // IMPORTANTE: se deriva del editing.dayId/microcycleNumber, NO del selector de UI.
  // Así el SetLogger no desaparece si el usuario cambia de día/semana mientras el modal está abierto.
  const editingExercise = (() => {
    if (!editing || !program) return null;
    const ed = program.days.find(d => d.id === editing.dayId)
      ?.microcycles.find(m => m.number === editing.microcycleNumber)
      ?.exercises[editing.exerciseIndex];
    return ed ?? null;
  })();
  // Nombre efectivo del ejercicio en edición (sustitución activa o nombre original)
  const editingSub = editing
    ? substitutions[subKey(editing.dayId, editing.microcycleNumber, editing.exerciseIndex)]
    : null;
  const editingTargetSet = editingExercise?.sets.find((s) => s.number === editing?.setNumber);
  const editingExistingLog = editing
    ? findLatestLog(logs, editing.dayId, editing.microcycleNumber, editing.exerciseIndex, editing.setNumber)
    : undefined;
  const editingPreviousLog = editing
    ? findPreviousMicrocycleLog(logs, editing.dayId, editing.microcycleNumber, editing.exerciseIndex, editing.setNumber)
    : undefined;

  // ── Pantallas de carga / sin programa ──────────────────────────

  if (loadingProgram)
    return (
      <div className="min-h-dvh flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #0A0A0A 60%, #1A0810 100%)" }}>
        <p className="text-neutral-500 text-sm">Cargando tu programa...</p>
      </div>
    );

  if (!program)
    return (
      <div className="min-h-dvh flex items-center justify-center p-6"
        style={{ background: "linear-gradient(160deg, #0A0A0A 60%, #1A0810 100%)" }}>
        <div className="text-center">
          <p className="text-4xl mb-4">💪</p>
          <p className="text-white font-semibold mb-2">No tienes un programa asignado</p>
          <p className="text-neutral-400 text-sm">Dile a tu entrenador que te asigne uno.</p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-6 px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 text-sm active:bg-neutral-700"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );

  // ── Render del modal historial ────────────────────────────────
  const renderExHistoryModal = () => {
    if (!exHistory) return null;
    // Nombre original del ejercicio en ese slot (sin sustitución)
    const origExName = program?.days.find(d => d.id === exHistory.dayId)
      ?.microcycles[0]?.exercises[exHistory.exerciseIndex]?.name ?? "";
    // Filtrar solo los logs del ejercicio actual (exHistory.name)
    // — excluye microciclos donde se usó un ejercicio diferente en ese slot
    const exLogs = logs.filter(l => {
      if (l.dayId !== exHistory.dayId || l.exerciseIndex !== exHistory.exerciseIndex) return false;
      const mcSub = substitutions[subKey(l.dayId, l.microcycleNumber, l.exerciseIndex)];
      const mcExName = mcSub?.name ?? origExName;
      return mcExName === exHistory.name;
    });
    const byMc: Record<number, { mc: number; maxWeight: number; totalVol: number }> = {};
    exLogs.forEach(l => {
      if (!byMc[l.microcycleNumber]) byMc[l.microcycleNumber] = { mc: l.microcycleNumber, maxWeight: 0, totalVol: 0 };
      if (l.weight > byMc[l.microcycleNumber].maxWeight) byMc[l.microcycleNumber].maxWeight = l.weight;
      byMc[l.microcycleNumber].totalVol += l.weight * l.reps;
    });
    const sorted = Object.values(byMc).sort((a, b) => a.mc - b.mc);
    const weightPts: ChartPoint[] = sorted.map(s => ({ label: `S${s.mc}`, value: s.maxWeight }));
    const volPts: ChartPoint[]    = sorted.map(s => ({ label: `S${s.mc}`, value: Math.round(s.totalVol) }));
    const unit = exLogs[0]?.unit ?? "kg";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-3"
        onClick={() => setExHistory(null)}>
        <div className="w-full max-w-lg rounded-2xl p-5 space-y-4 max-h-[85dvh] overflow-y-auto"
          style={{ background: "#111", border: "1px solid #222" }}
          onClick={e => e.stopPropagation()}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Historial</p>
              <p className="text-white font-bold text-sm leading-snug">{exHistory.name}</p>
            </div>
            <button onClick={() => setExHistory(null)}
              className="w-8 h-8 rounded-xl bg-neutral-800 text-neutral-400 active:text-white flex items-center justify-center text-sm shrink-0">✕</button>
          </div>

          {weightPts.length >= 2 ? (
            <div className="space-y-4">
              <div className="rounded-xl p-3" style={{ background: "#0D0D0D", border: "1px solid #1E1E1E" }}>
                <p className="text-xs text-neutral-500 mb-2">💪 Peso máximo por semana ({unit})</p>
                <MiniChart data={weightPts} color="#C0394F" unit={` ${unit}`} height={90} />
              </div>
              {volPts.length >= 2 && (
                <div className="rounded-xl p-3" style={{ background: "#0D0D0D", border: "1px solid #1E1E1E" }}>
                  <p className="text-xs text-neutral-500 mb-2">📦 Volumen total por semana ({unit}×reps)</p>
                  <MiniChart data={volPts} color="#3B82F6" unit="" height={90} />
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-neutral-500 text-sm">Registra al menos 2 semanas para ver la evolución.</p>
            </div>
          )}

          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-600 mb-2">Últimos registros</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {[...exLogs].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt)).slice(0, 10).map((l, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "#0D0D0D" }}>
                  <span className="text-[10px] text-neutral-600 w-14 shrink-0">S{l.microcycleNumber}</span>
                  <span className="text-white text-xs font-medium flex-1">{l.weight} {unit} × {l.reps} reps</span>
                  {l.rpe > 0 && <span className="text-neutral-500 text-[10px]">RPE {l.rpe}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Render del widget streak + semana ────────────────────────
  const renderStreakWidget = () => {
    const trainedDates = new Set(logs.map(l => l.loggedAt.slice(0, 10)));
    if (trainedDates.size === 0) return null;

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    // ── Semana actual (L a D) ──
    const dow = now.getDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() + mondayOffset + i);
      return d.toISOString().slice(0, 10);
    });
    const mondayStr = weekDays[0]; // límite inferior del streak
    const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

    // ── Streak: solo cuenta desde el lunes de esta semana,
    //    permite 1 día de descanso consecutivo sin romper racha ──
    let streak = 0;
    let restConsec = 0;
    const checkDate = new Date();
    for (let i = 0; i < 14; i++) {
      const ds = checkDate.toISOString().slice(0, 10);
      if (ds < mondayStr) break; // no pasar del lunes de esta semana
      if (trainedDates.has(ds)) { streak++; restConsec = 0; }
      else { restConsec++; if (restConsec > 1) break; }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // ── Días CONSECUTIVOS sin ningún descanso (para avisar de sobreentrenamiento) ──
    // Los días de descanso manuales cortan la racha igual que los días no entrenados.
    let consecWithoutRest = 0;
    const cd2 = new Date();
    for (let i = 0; i < 14; i++) {
      const ds = cd2.toISOString().slice(0, 10);
      if (trainedDates.has(ds) && !manualRestDays.has(ds)) {
        consecWithoutRest++;
        cd2.setDate(cd2.getDate() - 1);
      } else break;
    }
    const todayIsManualRest = manualRestDays.has(todayStr);
    const needsRest   = consecWithoutRest >= 3 && !todayIsManualRest;
    const overTrained = consecWithoutRest >= 4 && !todayIsManualRest;

    return (
      <div className="mb-4 rounded-2xl p-3 space-y-2.5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="flex items-center justify-between px-0.5">
          <p className="text-[10px] uppercase tracking-widest font-medium text-neutral-600">Esta semana</p>
          {overTrained ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" }}>
              ⚠️ Descansa hoy
            </span>
          ) : needsRest ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{ background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.2)", color: "#94a3b8" }}>
              💤 Descansa mañana
            </span>
          ) : todayIsManualRest ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{ background: "rgba(96,165,250,0.10)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa" }}>
              🌙 Descanso
            </span>
          ) : streak > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{ background: "var(--mvp-red-soft)", border: "1px solid var(--mvp-red-border)", color: "var(--mvp-red)" }}>
              🔥 {streak} {streak === 1 ? "día" : "días"}
            </span>
          ) : null}
        </div>
        <div className="flex gap-1.5">
          {weekDays.map((ds, i) => {
            const trained    = trainedDates.has(ds);
            const isToday    = ds === todayStr;
            const isPast     = ds <= todayStr;
            const isManualRest = manualRestDays.has(ds);
            const canToggle  = isPast;

            let bg = "#0d0d0d", border = "#161616", textColor = "#333", content = DAY_LABELS[i];
            if (isManualRest) {
              bg = "rgba(30,58,95,0.4)"; border = "rgba(96,165,250,0.2)"; textColor = "#4a8fd4"; content = "🌙";
            } else if (trained) {
              bg = "var(--mvp-green-soft)"; border = "var(--mvp-green-border)"; textColor = "var(--mvp-green)"; content = "✓";
            } else if (isToday) {
              bg = "var(--mvp-red)"; border = "transparent"; textColor = "#fff"; content = DAY_LABELS[i];
            } else if (isPast) {
              bg = "#111"; border = "#1a1a1a"; textColor = "#444";
            }

            return (
              <div key={ds} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-semibold tracking-wider" style={{ color: isToday ? "var(--mvp-red)" : "#444" }}>
                  {DAY_LABELS[i]}
                </span>
                <button
                  onClick={() => canToggle && toggleManualRest(ds)}
                  className="w-full rounded-xl flex items-center justify-center transition-all active:opacity-60"
                  style={{
                    height: 30,
                    background: bg,
                    border: `1px solid ${border}`,
                    cursor: canToggle ? "pointer" : "default",
                    color: textColor,
                    fontSize: isManualRest ? 14 : 11,
                    fontWeight: 700,
                    boxShadow: isToday ? "0 0 0 3px rgba(220,38,38,0.2)" : "none",
                  }}
                  title={canToggle ? (isManualRest ? "Quitar descanso manual" : trained ? "Marcar como descanso" : "Marcar como descanso") : undefined}
                >
                  {content}
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-[9px] text-neutral-800 text-center tracking-wide">
          Toca un día pasado para marcar descanso
        </p>
      </div>
    );
  };

  // ── Shell principal ────────────────────────────────────────────

  return (
    <div className="h-dvh flex flex-col" style={{ background: "linear-gradient(160deg, #0A0A0A 80%, #1A0810 100%)" }}>

      {/* ── Área de scroll por tab: se monta fresco en cada cambio ── */}
      <div id="tab-scroll" tabIndex={-1} className="flex-1 overflow-y-auto overscroll-contain outline-none" style={{ WebkitOverflowScrolling: 'touch', overflowAnchor: 'none' }}>

      {/* ── Tab: Entrenamiento ── */}
      {activeTab === "workout" && (
        <div className="max-w-2xl mx-auto px-4">

          {/* Header sticky con safe area */}
          <header
            className="header-safe sticky top-0 z-10 flex items-center justify-between gap-3 pb-3 mb-2"
            style={{ background: "linear-gradient(160deg, #0A0A0A 80%, #1A0810 100%)" }}
          >
            <div className="min-w-0 flex-1">
              <MVPWordmark className="mb-0.5" />
              <p className="text-xs text-neutral-500 pl-1 truncate">
                <span className="font-medium text-neutral-300">{profile.full_name}</span>
                <span className="hidden xs:inline"> · {program.programName}</span>
              </p>
            </div>

            {/* Acciones del header */}
            <div className="flex gap-1.5 shrink-0">
              {[
                { onClick: () => { setCalYear(new Date().getFullYear()); setCalMonth(new Date().getMonth()); setShowCalendar(true); }, icon: "calendar", title: "Calendario" },
                { onClick: () => setShowStats(true),    icon: "chart-line", title: "Estadísticas" },
                { onClick: startRestTimer,              icon: "timer",      title: "Cronómetro" },
                { onClick: () => setShowSettings(true), icon: "settings",   title: "Ajustes" },
              ].map(({ onClick, icon, title }) => (
                <button key={icon}
                  onClick={onClick}
                  className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all"
                  style={{ background: "#141414", border: "1px solid #1e1e1e", color: "#555" }}
                  title={title}
                >
                  <i className={`ti ti-${icon}`} style={{ fontSize: 18 }} />
                </button>
              ))}
            </div>
          </header>

          {/* ── Streak + Vista semanal ── */}
          {renderStreakWidget()}

          {/* Nombre del programa (debajo del header) */}
          <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-4 pl-0.5 truncate">
            {program.programName}
          </p>

          {/* Selector de día */}
          <section className="mb-4">
            <label className="text-xs uppercase tracking-wider text-neutral-500 mb-2 block">Día</label>
            <div className="flex flex-wrap gap-2">
              {program.days.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setDayId(d.id); setMicrocycleNumber(1); }}
                  className={"px-3 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 " +
                    (d.id === dayId ? "text-white" : "text-neutral-500")}
                  style={d.id === dayId
                    ? { background: "var(--mvp-red)", border: "1px solid rgba(220,38,38,0.5)" }
                    : { background: "#111", border: "1px solid #1c1c1c" }}
                >
                  {d.name}{d.optional && <span className="ml-1 text-[10px] opacity-50">(opc.)</span>}
                </button>
              ))}
            </div>
          </section>

          {/* Selector de microciclo + botón de bloqueo */}
          {day && (
            <section className="mb-5">
              <label className="text-xs uppercase tracking-wider text-neutral-500 mb-2 block">Semana</label>
              <div className="flex flex-wrap gap-2 items-center">
                {day.microcycles.map((m) => {
                  const locked = isLocked(dayId, m.number);
                  return (
                    <button
                      key={m.number}
                      onClick={() => setMicrocycleNumber(m.number)}
                      className={"relative w-10 h-10 rounded-xl text-sm font-bold transition-all active:scale-95 " +
                        (m.number === microcycleNumber ? "text-white" : "text-neutral-600")}
                      style={m.number === microcycleNumber
                        ? { background: "var(--mvp-red)", border: "1px solid rgba(220,38,38,0.5)" }
                        : { background: "#111", border: "1px solid #1c1c1c" }}
                    >
                      {m.number}
                      {locked && (
                        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px]"
                          style={{ background: "#1a1208", border: "1px solid #5a4010", color: "#fbbf24" }}>🔒</span>
                      )}
                    </button>
                  );
                })}

                {/* Botón bloquear/desbloquear microciclo actual */}
                {day.microcycles.length > 0 && (
                  <button
                    onClick={() => toggleLock(dayId, microcycleNumber)}
                    disabled={lockingSaving}
                    className="ml-1 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 disabled:opacity-40"
                    style={isLocked(dayId, microcycleNumber)
                      ? { background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }
                      : { background: "#111", border: "1px solid #1c1c1c", color: "#555" }}
                    title={isLocked(dayId, microcycleNumber) ? "Desbloquear semana" : "Bloquear semana completada"}
                  >
                    {isLocked(dayId, microcycleNumber) ? "🔒 Bloqueada" : "🔓 Bloquear"}
                  </button>
                )}
              </div>

              {/* Aviso visible cuando el microciclo actual está bloqueado */}
              {isLocked(dayId, microcycleNumber) && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-800/30">
                  <span className="text-amber-400 text-sm">🔒</span>
                  <p className="text-amber-300 text-xs">
                    Semana bloqueada — los registros están protegidos. Pulsa "Bloqueada" para editar.
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Lista de ejercicios — espacio extra para el bottom nav */}
          {microcycle && (
            <section className="space-y-3 pb-8">
              {microcycle.exercises.map((ex, idx) => {
                const sub = substitutions[subKey(dayId, microcycleNumber, idx)];
                const displayName = sub?.name ?? ex.name;
                const displayGroup = sub?.muscleGroup ?? ex.muscleGroup;
                return (
                <article key={idx} className="rounded-2xl overflow-hidden"
                  style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                  <div className="flex">
                    {/* Borde de acento izquierdo */}
                    <div className="w-[3px] shrink-0"
                      style={{ background: sub ? "var(--mvp-green)" : "var(--mvp-red)" }} />
                    <div className="flex-1 p-4">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] uppercase tracking-widest mb-0.5 font-semibold"
                        style={{ color: sub ? "var(--mvp-green)" : "var(--mvp-red)" }}>{displayGroup}</p>
                      <h2 className="text-sm font-semibold text-white leading-snug" title={displayName}>{displayName}</h2>
                      {sub && (
                        <p className="text-[10px] text-neutral-600 mt-0.5 truncate">
                          ↩ Pautado: {ex.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Botón cambiar ejercicio */}
                      <button
                        onClick={() => { setSwapTarget({ dayId, mcNum: microcycleNumber, exIdx: idx, origName: ex.name }); setSwapSearch(""); }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-colors"
                        style={{ background: "#161616", border: "1px solid #222", color: "#555" }}
                        title="Cambiar ejercicio">
                        🔄
                      </button>
                      {ex.videoRef && ex.videoRef !== "-" && (
                        ex.videoRef.startsWith("http") ? (
                          <button
                            onClick={() => openVideo(ex.videoRef!)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                            style={{ background: "#161616", border: "1px solid #222", color: "#555" }}
                            title="Ver vídeo">
                            📹
                          </button>
                        ) : (
                          <span className="w-9 h-9 rounded-xl flex items-center justify-center opacity-30"
                            style={{ background: "#161616" }}
                            title={ex.videoRef}>
                            📹
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {ex.sets.map((s) => {
                      const log = findLatestLog(logs, dayId, microcycleNumber, idx, s.number);
                      const prevLog = findPreviousMicrocycleLog(logs, dayId, microcycleNumber, idx, s.number);

                      // Verificar que el ejercicio del microciclo anterior es el mismo que el actual
                      // (si se cambió el ejercicio, los datos previos pertenecen a otro ejercicio)
                      const prevMcSub = substitutions[subKey(dayId, microcycleNumber - 1, idx)];
                      const prevExName  = prevMcSub?.name ?? ex.name;
                      const currExName  = sub?.name ?? ex.name;
                      const sameExercise = prevExName === currExName;
                      const validPrevLog = sameExercise ? prevLog : null;

                      // Comparar 1RM estimado (Epley): peso × (1 + reps/30)
                      // Mejor que volumen (peso×reps) porque captura subidas de carga con menos reps
                      const est1RM = (w: number, r: number) => w * (1 + r / 30);
                      const prog =
                        log && validPrevLog
                          ? est1RM(log.weight, log.reps) > est1RM(validPrevLog.weight, validPrevLog.reps) + 0.5
                            ? "↑"
                            : est1RM(log.weight, log.reps) < est1RM(validPrevLog.weight, validPrevLog.reps) - 0.5
                            ? "↓"
                            : "="
                          : null;
                      const mcLocked = isLocked(dayId, microcycleNumber);
                      return (
                        <div key={setKey(dayId, microcycleNumber, idx, s.number)}>
                          <button
                            onClick={() => !mcLocked && setEditing({ dayId, microcycleNumber, exerciseIndex: idx, setNumber: s.number })}
                            className={"w-full flex items-center gap-3 text-sm rounded-xl px-3 py-2.5 text-left transition-all " +
                              (mcLocked ? "cursor-default " : "active:scale-[0.98] ")}
                            style={log
                              ? { background: "var(--done-bg)", border: "1px solid var(--done-border)" }
                              : mcLocked
                                ? { background: "#0a0a0a", border: "1px solid #141414" }
                                : { background: "#0f0f0f", border: "1px solid #1a1a1a" }}
                          >
                            {/* Círculo numerado */}
                            <span className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold"
                              style={log
                                ? { background: "rgba(255,255,255,0.12)", color: "#ddd" }
                                : mcLocked
                                  ? { background: "#141414", color: "#2a2a2a" }
                                  : { background: "#181818", color: "#444" }}>
                              {log ? "✓" : s.number}
                            </span>
                            <span className="text-neutral-700 text-xs flex-1 truncate">
                              {s.targetReps ?? "—"}
                              {s.targetRpe && !(s.targetReps ?? "").includes("(")
                                ? ` · ${s.targetRpe}`
                                : ""}
                            </span>
                            {log ? (
                              <span className="font-semibold tabular-nums flex flex-wrap items-center gap-1.5 text-sm text-white">
                                {log.weight} {log.unit} × {log.reps}
                                {log.rpe > 0 && (
                                  <span className="font-normal text-[11px] px-1.5 py-0.5 rounded-md"
                                    style={{ background: "rgba(255,255,255,0.07)", color: "#888" }}>RPE {log.rpe}</span>
                                )}
                                {log.rp_reps != null && (
                                  <span className="font-normal text-[11px] px-1.5 py-0.5 rounded-md"
                                    style={{ background: "rgba(255,255,255,0.07)", color: "#888" }}>+{log.rp_reps}r</span>
                                )}
                                {log.drop_weight != null && (
                                  <span className="font-normal text-[11px] px-1.5 py-0.5 rounded-md"
                                    style={{ background: "rgba(255,255,255,0.07)", color: "#888" }}>↓ {log.drop_weight}×{log.drop_reps ?? "?"}</span>
                                )}
                                {prog && (
                                  <span className={"text-sm font-bold " +
                                    (prog === "↑" ? "text-white" : prog === "=" ? "text-neutral-600" : "text-neutral-500")}>
                                    {prog}
                                  </span>
                                )}
                                {mcLocked && <span className="text-neutral-600 text-xs ml-1">🔒</span>}
                              </span>
                            ) : (
                              <span className="text-xs" style={{ color: mcLocked ? "#2a2a2a" : "#444" }}>
                                {mcLocked ? "🔒" : "→"}
                              </span>
                            )}
                          </button>
                          {!log && validPrevLog && (
                            <p className="text-[10px] text-neutral-600 px-3 pt-0.5 pb-1">
                              Mc{validPrevLog.microcycleNumber}: {validPrevLog.weight} {validPrevLog.unit} × {validPrevLog.reps}
                              {validPrevLog.rpe > 0 ? ` · RPE ${validPrevLog.rpe}` : ""}
                              {validPrevLog.rp_reps != null ? ` · +${validPrevLog.rp_reps}r` : ""}
                              {validPrevLog.drop_weight != null ? ` · ↓ ${validPrevLog.drop_weight}×${validPrevLog.drop_reps ?? "?"}` : ""}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {ex.note && <p className="mt-3 text-xs text-amber-400">{ex.note}</p>}
                  </div>{/* flex-1 p-4 */}
                  </div>{/* flex */}
                </article>
                );
              })}
            </section>
          )}
        </div>
      )}

      {/* ── Tab: Dieta ── */}
      {activeTab === "diet" && (
        <DietPage profile={profile} onBack={() => setActiveTab("workout")} />
      )}

      {/* ── Tab: Check-in ── */}
      {activeTab === "checkin" && (
        <CheckInPage profile={profile} onBack={() => setActiveTab("workout")} />
      )}

      </div>{/* fin scroll container */}

      {/* ── Barra de navegación inferior (in-flow, no fixed) ── */}
      <nav
        className="shrink-0 z-30 footer-safe"
        style={{ background: "#0F0F0F", borderTop: "1px solid #1E1E1E" }}
      >
        <div className="flex items-stretch max-w-2xl mx-auto">
          {[
            { tab: "workout" as const, tiIcon: "barbell",   label: "Entreno" },
            { tab: "diet"    as const, tiIcon: "apple",      label: "Dieta" },
            { tab: "checkin" as const, tiIcon: "chart-bar",  label: "Check-in" },
          ].map(({ tab, tiIcon, label }) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all active:scale-95 relative"
                style={{ color: active ? "var(--mvp-red)" : "#444" }}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--mvp-red)" }} />
                )}
                <i className={`ti ti-${tiIcon}`} style={{ fontSize: 22, lineHeight: 1 }} />
                <span className="text-[10px] font-semibold tracking-wide mt-0.5"
                  style={{ color: active ? "var(--mvp-red)" : "#444" }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Modal: Calendario mensual de entrenamientos ── */}
      {showCalendar && (() => {
        const trainedDates = new Set(logs.map(l => l.loggedAt.slice(0, 10)));
        const todayStr = new Date().toISOString().slice(0, 10);
        const firstDay = new Date(calYear, calMonth, 1);
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        // Día de la semana del primer día (0=Dom → ajustamos a Lunes=0)
        const startDow = (firstDay.getDay() + 6) % 7;
        const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
        const DAY_LABELS = ["L","M","X","J","V","S","D"];

        // Contar días entrenados en el mes
        const trainedThisMonth = Array.from({ length: daysInMonth }, (_, i) => {
          const d = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
          return trainedDates.has(d);
        }).filter(Boolean).length;

        // Total días pasados del mes (hasta hoy)
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === calYear && today.getMonth() === calMonth;
        const daysPassed = isCurrentMonth ? today.getDate() : daysInMonth;

        // Celdas del grid (blancos al inicio + días del mes)
        const cells: (number | null)[] = [
          ...Array(startDow).fill(null),
          ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
        ];

        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCalendar(false)}>
            <div className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden"
              style={{ background: "#111", border: "1px solid #222" }}
              onClick={e => e.stopPropagation()}>

              {/* Cabecera */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <button
                  onClick={() => { const d = new Date(calYear, calMonth - 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 active:bg-neutral-800 text-lg">‹</button>
                <div className="text-center">
                  <p className="text-white font-bold text-base">{MONTH_NAMES[calMonth]} {calYear}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--mvp-red)" }}>
                    {trainedThisMonth} {trainedThisMonth === 1 ? "día entrenado" : "días entrenados"}
                    {isCurrentMonth && daysPassed > 0 && (
                      <span className="text-neutral-500"> · {Math.round(trainedThisMonth / daysPassed * 100)}% del mes</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => { const d = new Date(calYear, calMonth + 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 active:bg-neutral-800 text-lg">›</button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 px-3 pb-1">
                {DAY_LABELS.map(l => (
                  <div key={l} className="text-center text-[10px] font-semibold text-neutral-600 py-1">{l}</div>
                ))}
              </div>

              {/* Grid de días */}
              <div className="grid grid-cols-7 px-3 pb-5 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <div key={`e${i}`} />;
                  const ds = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const trained    = trainedDates.has(ds);
                  const isRest     = manualRestDays.has(ds);
                  const isToday    = ds === todayStr;
                  const isPast     = ds <= todayStr;

                  // entrenado pero marcado como descanso manual → descanso gana
                  const showTrained = trained && !isRest;

                  return (
                    <div key={day}
                      className="aspect-square flex items-center justify-center rounded-xl text-sm font-semibold relative"
                      style={
                        showTrained
                          ? { background: "var(--mvp-green-soft)", border: "1px solid var(--mvp-green-border)", color: "var(--mvp-green)" }
                          : isRest
                          ? { background: "#0D1B2E", color: "#3A7BD5", border: "1px solid #1E3A5F" }
                          : isToday
                          ? { background: "var(--mvp-red)", color: "#fff", boxShadow: "0 0 0 3px rgba(220,38,38,0.2)" }
                          : isPast
                          ? { background: "#0D0D0D", color: "#333" }
                          : { background: "transparent", color: "#1E1E1E" }
                      }>
                      {day}
                      {isToday && !showTrained && !isRest && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white opacity-60" />
                      )}
                      {showTrained && isToday && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white opacity-80" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className="flex items-center justify-center gap-4 pb-5 text-xs text-neutral-600 flex-wrap px-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded" style={{ background: "var(--mvp-green-soft)", border: "1px solid var(--mvp-green-border)" }} /> Entrenado
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded" style={{ background: "#0D1B2E", border: "1px solid #1E3A5F" }} /> Descanso
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded" style={{ background: "#0D0D0D", border: "1px solid #1a1a1a" }} /> Sin actividad
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Modales (siempre por encima de todo) ── */}
      {editing && editingExercise && editingTargetSet && (
        <SetLogger
          exerciseName={editingSub?.name ?? editingExercise.name}
          coachNote={editingExercise.coachNote}
          exerciseNote={editingExercise.note}
          targetSet={editingTargetSet}
          setNumber={editing.setNumber}
          totalSets={editingExercise.sets.length}
          weightUnit={settings.weightUnit}
          existingLog={editingExistingLog}
          previousLog={editingPreviousLog}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          onDelete={editingExistingLog ? handleDelete : undefined}
        />
      )}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowSettings(false)}
          onLogout={() => supabase.auth.signOut()}
        />
      )}
      {rest && (
        <RestTimer
          endAt={rest.endAt}
          totalSeconds={rest.totalSeconds}
          onAdjust={adjustRest}
          onDismiss={() => setRest(null)}
        />
      )}

      {/* ── Modal: Historial de cargas ── */}
      {renderExHistoryModal()}

      {/* ── Panel global de estadísticas ── */}
      {showStats && program && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-3"
          onClick={() => setShowStats(false)}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[85dvh] flex flex-col"
            style={{ background: "#111", border: "1px solid #222" }}
            onClick={e => e.stopPropagation()}>
            {/* Cabecera fija */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 shrink-0">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-500">Estadísticas</p>
                <p className="text-white font-bold text-sm">Progresión de cargas</p>
              </div>
              <button onClick={() => setShowStats(false)}
                className="w-8 h-8 rounded-xl bg-neutral-800 text-neutral-400 active:text-white flex items-center justify-center text-sm shrink-0">✕</button>
            </div>
            {/* Lista de días y ejercicios con sparklines */}
            <div className="overflow-y-auto">
              {program.days.map(d => {
                const dayExercises = d.microcycles[0]?.exercises ?? [];
                if (dayExercises.length === 0) return null;
                return (
                  <div key={d.id}>
                    <p className="px-4 py-2 text-[10px] uppercase tracking-wider text-neutral-500 bg-neutral-900/60 sticky top-0">
                      {d.name}
                    </p>
                    {dayExercises.map((ex, exIdx) => {
                      const exLogs = logs.filter(l => l.dayId === d.id && l.exerciseIndex === exIdx);
                      const hasLogs = exLogs.length > 0;

                      // Agrupar por microciclo → peso máximo
                      const byMc: Record<number, number> = {};
                      exLogs.forEach(l => {
                        if (!byMc[l.microcycleNumber] || l.weight > byMc[l.microcycleNumber])
                          byMc[l.microcycleNumber] = l.weight;
                      });
                      const sparkPts: ChartPoint[] = Object.entries(byMc)
                        .sort((a, b) => Number(a[0]) - Number(b[0]))
                        .map(([mc, w]) => ({ label: `S${mc}`, value: w }));

                      const latestLog = hasLogs
                        ? [...exLogs].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt))[0]
                        : null;

                      // Tendencia: ↑ sube, = igual, ↓ baja
                      const trend = sparkPts.length >= 2
                        ? sparkPts[sparkPts.length - 1].value > sparkPts[sparkPts.length - 2].value ? "↑"
                          : sparkPts[sparkPts.length - 1].value < sparkPts[sparkPts.length - 2].value ? "↓" : "="
                        : null;
                      const trendColor = trend === "↑" ? "#4ADE80" : trend === "↓" ? "#F87171" : "#FACC15";

                      return (
                        <button key={exIdx}
                          onClick={() => { setShowStats(false); setExHistory({ name: ex.name, dayId: d.id, exerciseIndex: exIdx }); }}
                          disabled={!hasLogs}
                          className={"w-full flex items-center gap-3 px-4 py-3 border-b text-left transition-colors " +
                            (hasLogs ? "active:bg-neutral-800/60" : "opacity-35 cursor-default")}
                          style={{ borderColor: "#1a1a1a" }}>

                          {/* Info ejercicio */}
                          <div className="min-w-0" style={{ width: "38%" }}>
                            <p className="text-[10px] text-neutral-500 truncate">{ex.muscleGroup}</p>
                            <p className="text-xs text-white font-medium leading-snug" style={{
                              display: "-webkit-box", WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical", overflow: "hidden"
                            }}>{ex.name}</p>
                          </div>

                          {/* Sparkline */}
                          <div className="flex-1 min-w-0">
                            {sparkPts.length >= 2 ? (
                              <MiniChart data={sparkPts} color="#C0394F" unit="" height={36} hideLabels />
                            ) : hasLogs ? (
                              <p className="text-[10px] text-neutral-600 text-center">1 registro</p>
                            ) : null}
                          </div>

                          {/* Último + tendencia */}
                          {latestLog ? (
                            <div className="text-right shrink-0" style={{ width: "22%" }}>
                              <p className="text-xs font-bold text-white tabular-nums">
                                {latestLog.weight}<span className="text-neutral-500 font-normal text-[10px]"> {latestLog.unit}</span>
                              </p>
                              <p className="text-[10px] tabular-nums" style={{ color: trendColor }}>
                                {trend ?? "—"} {latestLog.reps} reps
                              </p>
                            </div>
                          ) : (
                            <span className="text-[10px] text-neutral-600 shrink-0">Sin datos</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Cambiar ejercicio ── */}
      {swapTarget && (() => {
        const filtered = swapSearch.trim() === ""
          ? allExercises
          : allExercises.filter(e =>
              e.name.toLowerCase().includes(swapSearch.toLowerCase()) ||
              (e.muscleGroup ?? "").toLowerCase().includes(swapSearch.toLowerCase())
            );
        // Agrupar por músculo
        const byGroup: Record<string, typeof filtered> = {};
        filtered.forEach(e => {
          const g = e.muscleGroup || "Otros";
          if (!byGroup[g]) byGroup[g] = [];
          byGroup[g].push(e);
        });
        const hasSub = !!substitutions[subKey(swapTarget.dayId, swapTarget.mcNum, swapTarget.exIdx)];
        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setSwapTarget(null)}>
            <div className="w-full max-w-lg rounded-t-2xl flex flex-col footer-safe"
              style={{ background: "#0F0F0F", border: "1px solid #1E1E1E", maxHeight: "80dvh" }}
              onClick={e => e.stopPropagation()}>

              {/* Cabecera */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-800 shrink-0">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500">Cambiar ejercicio</p>
                  <p className="text-white font-bold text-sm truncate">{swapTarget.origName}</p>
                </div>
                <button onClick={() => setSwapTarget(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-white shrink-0"
                  style={{ background: "#1A1A1A" }}>✕</button>
              </div>

              {/* Buscador */}
              <div className="px-4 py-3 border-b border-neutral-800 shrink-0">
                <input
                  type="text"
                  value={swapSearch}
                  onChange={e => setSwapSearch(e.target.value)}
                  placeholder="Buscar ejercicio o músculo…"
                  autoFocus
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
                />
              </div>

              {/* Lista */}
              <div className="overflow-y-auto flex-1">
                {/* Opción: restablecer el original */}
                {hasSub && (
                  <button
                    onClick={() => {
                      updateSubstitutions(prev => { const n = { ...prev }; delete n[subKey(swapTarget.dayId, swapTarget.mcNum, swapTarget.exIdx)]; return n; });
                      setSwapTarget(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 border-b text-left active:bg-neutral-800"
                    style={{ borderColor: "#1a1a1a", background: "#0F1A0F" }}>
                    <span className="text-lg">↩</span>
                    <div>
                      <p className="text-xs text-emerald-400 font-semibold">Restablecer ejercicio original</p>
                      <p className="text-[11px] text-neutral-500">{swapTarget.origName}</p>
                    </div>
                  </button>
                )}

                {(() => {
                  // Nombres ya asignados a OTRAS posiciones en el mismo día/microciclo
                  const usedElsewhere = new Set(
                    Object.entries(substitutions)
                      .filter(([k]) => {
                        const [kDay, kMc, kEx] = k.split(":");
                        return kDay === swapTarget.dayId &&
                               kMc === String(swapTarget.mcNum) &&
                               kEx !== String(swapTarget.exIdx);
                      })
                      .map(([, v]) => v.name)
                  );
                  return Object.entries(byGroup).map(([group, exs]) => (
                    <div key={group}>
                      <p className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-neutral-600 font-semibold sticky top-0"
                        style={{ background: "#0F0F0F" }}>{group}</p>
                      {exs.map((e, i) => {
                        const isCurrent = e.name === (substitutions[subKey(swapTarget.dayId, swapTarget.mcNum, swapTarget.exIdx)]?.name ?? swapTarget.origName);
                        const isUsedElsewhere = !isCurrent && usedElsewhere.has(e.name);
                        return (
                          <button key={i}
                            onClick={() => {
                              if (e.name === swapTarget.origName) {
                                updateSubstitutions(prev => { const n = { ...prev }; delete n[subKey(swapTarget.dayId, swapTarget.mcNum, swapTarget.exIdx)]; return n; });
                              } else {
                                updateSubstitutions(prev => ({ ...prev, [subKey(swapTarget.dayId, swapTarget.mcNum, swapTarget.exIdx)]: { name: e.name, muscleGroup: e.muscleGroup } }));
                              }
                              setSwapTarget(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 border-b text-left active:bg-neutral-800 transition-colors"
                            style={{ borderColor: "#1a1a1a", background: isCurrent ? "#1A2A1A" : "transparent" }}>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: isUsedElsewhere ? "#888" : "#fff" }}>{e.name}</p>
                              {isUsedElsewhere && (
                                <p className="text-[10px] mt-0.5" style={{ color: "#F59E0B" }}>⚠ ya asignado a otro ejercicio</p>
                              )}
                            </div>
                            {isCurrent && <span className="text-emerald-400 text-xs font-bold shrink-0">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  ));
                })()}
                {filtered.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-neutral-500 text-sm">Sin resultados para "{swapSearch}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal de vídeo */}
      {videoUrl && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setVideoUrl(null)}
        >
          <div
            className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden w-full max-w-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
              <p className="text-white text-sm font-medium">Vídeo del ejercicio</p>
              <button
                onClick={() => setVideoUrl(null)}
                className="w-8 h-8 rounded-xl bg-neutral-800 text-neutral-400 active:text-white active:bg-neutral-700 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={videoUrl}
                className="absolute inset-0 w-full h-full"
                allow="autoplay"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
