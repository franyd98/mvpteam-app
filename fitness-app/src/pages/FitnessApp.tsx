// Vista del cliente: carga el programa asignado desde Supabase.
// Los registros de entrenamiento se guardan en Supabase (set_logs).

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

// ── Cola de guardado offline (persistente en localStorage) ───────
type PendingSaveRow = {
  exerciseSetId: number; client_id: string;
  weight: number; reps: number; rpe: number; unit: string; logged_at: string;
  rp_reps: number | null; drop_weight: number | null; drop_reps: number | null;
};
const PENDING_KEY = "mvp_pending_saves_v1";
const getPending = (): PendingSaveRow[] => { try { return JSON.parse(localStorage.getItem(PENDING_KEY) ?? "[]"); } catch { return []; } };
const upsertPending = (row: PendingSaveRow) => {
  try {
    const list = getPending().filter(r => r.exerciseSetId !== row.exerciseSetId);
    list.push(row);
    localStorage.setItem(PENDING_KEY, JSON.stringify(list));
  } catch {}
};
const removePending = (id: number) => {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(getPending().filter(r => r.exerciseSetId !== id))); } catch {}
};
import { supabase } from "../lib/supabase";
import type { Program, SetLog } from "../types";
import { setKey } from "../types";
import { findLatestLog, findPreviousMicrocycleLog, useSettings } from "../storage";
import SetLogger from "../components/SetLogger";
import SettingsPanel from "../components/SettingsPanel";
import RestTimer from "../components/RestTimer";
import CheckInPage from "./CheckInPage";
import DietPage from "./DietPage";
import AIPlanWizard from "../components/AIPlanWizard";
import { MVPWordmark } from "../components/MVPLogo";
import MiniChart from "../components/MiniChart";
import type { ChartPoint } from "../components/MiniChart";

type Profile = { id: string; full_name: string; role: string };

type ActiveTab = "workout" | "diet" | "checkin" | "aiplan";

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
  const [loadError, setLoadError] = useState(false);
  const [pendingSaves, setPendingSaves] = useState<number>(() => getPending().length);
  // Todos los programas asignados (activo + anteriores)
  const [allPrograms, setAllPrograms] = useState<{ programId: number; name: string; source: string }[]>([]);
  const [showProgramPicker, setShowProgramPicker] = useState(false);
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
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Timer de sesión ──────────────────────────────────────────
  const [sessionStart,     setSessionStart]     = useState<number | null>(null);
  const [sessionFinalTime, setSessionFinalTime] = useState<number | null>(null); // segundos, cuando se bloquea
  const [sessionTick,      setSessionTick]      = useState(0);
  useEffect(() => {
    if (!sessionStart) return;
    const id = setInterval(() => setSessionTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [sessionStart]);
  const sessionElapsed = sessionStart ? Math.floor((Date.now() - sessionStart) / 1000) : 0;
  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;
  // Tiempo a mostrar: si está parado (bloqueado) usa el final, si corre usa el elapsed
  const displayTime = sessionFinalTime !== null ? sessionFinalTime : sessionElapsed;

  // Historial de cargas por ejercicio + panel de stats global
  const [exHistory, setExHistory] = useState<{ name: string; dayId: string; exerciseIndex: number } | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Calendario mensual de entrenamientos
  const [showCalendar, setShowCalendar] = useState(false);
  const [calYear,  setCalYear]  = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

  // Estadísticas — filtro de músculo y ejercicio expandido
  const [statsMuscle,      setStatsMuscle]      = useState<string>("Todos");
  const [statsExpandedKey, setStatsExpandedKey] = useState<string | null>(null);

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
  const [isSyncing, setIsSyncing] = useState(false);

  // Función reutilizable de sync (botón manual + online + visibilitychange + interval)
  // useCallback con [] porque solo usa setters estables y el cliente supabase (module-level)
  const flushPending = useCallback(async () => {
    const pending = getPending();
    if (!pending.length || !navigator.onLine) return;
    setIsSyncing(true);
    let synced = 0;
    for (const row of pending) {
      const { error } = await supabase.from("set_logs").upsert(
        { client_id: row.client_id, exercise_set_id: row.exerciseSetId, weight: row.weight,
          reps: row.reps, rpe: row.rpe, unit: row.unit, logged_at: row.logged_at,
          rp_reps: row.rp_reps, drop_weight: row.drop_weight, drop_reps: row.drop_reps },
        { onConflict: "client_id,exercise_set_id" },
      );
      if (!error) { removePending(row.exerciseSetId); synced++; }
    }
    const remaining = getPending().length;
    setPendingSaves(remaining);
    if (synced > 0 && remaining === 0) setSaveError(null);
    setIsSyncing(false);
  }, []);

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

  // Auto-cerrar el banner de error tras 7 segundos
  useEffect(() => {
    if (!saveError) return;
    const t = setTimeout(() => setSaveError(null), 7000);
    return () => clearTimeout(t);
  }, [saveError]);

  // Sincronizar cola pendiente al recuperar conexión (online, visibilitychange, retry periódico)
  useEffect(() => {
    const handleVisibility = () => { if (document.visibilityState === "visible") flushPending(); };
    // Retry periódico cada 30 s mientras haya pendientes
    const interval = setInterval(() => { if (getPending().length > 0) flushPending(); }, 30_000);
    window.addEventListener("online", flushPending);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("online", flushPending);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [flushPending]);

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
      // Bloquear — detener el timer de sesión y guardar el tiempo final
      if (sessionStart) {
        setSessionFinalTime(Math.floor((Date.now() - sessionStart) / 1000));
        setSessionStart(null);
      }
      await supabase
        .from("locked_microcycles")
        .upsert({ client_id: profile.id, day_id: dId, microcycle_number: mcNum },
          { onConflict: "client_id,day_id,microcycle_number" });
      setLockedMcs(prev => new Set([...prev, key]));
    }
    setLockingSaving(false);
  };

  const loadAssignedProgram = async () => {
    setLoadError(false);
    // Cargar programas para el selector:
    // - Los que están activos ahora, O
    // - Los que pertenecen a este cliente (owner_client_id) aunque estén inactivos (ej: plan IA anterior)
    // NO mostrar programas de otros clientes que quedaron asignados por error
    const { data: allAssign } = await supabase
      .from("program_assignments")
      .select("program_id, active, programs(id, name, source, owner_client_id)")
      .eq("client_id", profile.id)
      .order("program_id", { ascending: false });

    if (allAssign) {
      const seen = new Set<number>();
      const list = allAssign
        .filter((a: any) => {
          if (seen.has(a.program_id)) return false;
          const prog = a.programs as any;
          // Incluir solo si: está activo ahora, o el programa es propiedad de este cliente
          if (!a.active && prog?.owner_client_id !== profile.id) return false;
          seen.add(a.program_id);
          return true;
        })
        .map((a: any) => ({
          programId: a.program_id,
          name:      a.programs?.name   ?? `Programa ${a.program_id}`,
          source:    a.programs?.source ?? "manual",
        }));
      setAllPrograms(list);
    }

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
      if (error) setLoadError(true);
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
      supabase.from("set_logs").select("*").eq("client_id", profile.id)
        .order("logged_at", { ascending: false }).limit(600),
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

    // Intentar sincronizar guardados pendientes al cargar
    const pending = getPending();
    if (pending.length > 0) {
      let synced = 0;
      for (const row of pending) {
        const { error: pe } = await supabase.from("set_logs").upsert(
          { client_id: row.client_id, exercise_set_id: row.exerciseSetId, weight: row.weight,
            reps: row.reps, rpe: row.rpe, unit: row.unit, logged_at: row.logged_at,
            rp_reps: row.rp_reps, drop_weight: row.drop_weight, drop_reps: row.drop_reps },
          { onConflict: "client_id,exercise_set_id" },
        );
        if (!pe) { removePending(row.exerciseSetId); synced++; }
      }
      const remaining = getPending();
      setPendingSaves(remaining.length);
      // Aunque la sincronización falle, mostrar los registros pendientes en la UI
      // para que el usuario sepa que sus datos están guardados localmente
      if (remaining.length > 0) {
        const extraLogs: SetLog[] = remaining.flatMap(row => {
          const entry = idToEntryRef.current.get(row.exerciseSetId);
          if (!entry) return [];
          return [{
            dayId: entry.dayId,
            microcycleNumber: entry.microcycleNumber,
            exerciseIndex: entry.exerciseIndex,
            setNumber: entry.setNumber,
            weight: row.weight,
            reps: row.reps,
            rpe: row.rpe,
            unit: row.unit as "kg" | "lb",
            loggedAt: row.logged_at,
            rp_reps: row.rp_reps,
            drop_weight: row.drop_weight,
            drop_reps: row.drop_reps,
          } as SetLog];
        });
        if (extraLogs.length > 0) {
          // Fusionar: los pendientes tienen prioridad sobre lo que hay en BD (pueden ser más recientes)
          setLogs(prev => {
            const pendingKeys = new Set(extraLogs.map(l => setKey(l.dayId, l.microcycleNumber, l.exerciseIndex, l.setNumber)));
            return [...prev.filter(l => !pendingKeys.has(setKey(l.dayId, l.microcycleNumber, l.exerciseIndex, l.setNumber))), ...extraLogs];
          });
        }
      }
    }

    setLoadingProgram(false);
  };

  // Cambiar entre programa del coach y programa IA
  const switchToProgram = async (programId: number) => {
    setShowProgramPicker(false);
    setLoadingProgram(true);
    await supabase.from("program_assignments").update({ active: false }).eq("client_id", profile.id);
    await supabase.from("program_assignments").update({ active: true }).eq("client_id", profile.id).eq("program_id", programId);
    await loadAssignedProgram();
  };

  // Borrar programa IA (solo programas con source = 'ai')
  const deleteAIProgram = async (programId: number) => {
    setShowProgramPicker(false);
    setLoadingProgram(true);
    // Eliminar assignment
    await supabase.from("program_assignments").delete().eq("client_id", profile.id).eq("program_id", programId);
    // Eliminar el programa (cascade borra días, microciclos, ejercicios, series)
    await supabase.from("programs").delete().eq("id", programId);
    // Si era el activo, activar el primero que quede
    const remaining = allPrograms.filter(p => p.programId !== programId);
    if (remaining.length > 0) {
      await supabase.from("program_assignments").update({ active: true }).eq("client_id", profile.id).eq("program_id", remaining[0].programId);
    }
    await loadAssignedProgram();
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
    if (!sessionStart) setSessionStart(Date.now());
    if (settings.autoStartRestTimer) startRestTimer();

    // ── 2. Persistir en Supabase (awaited) ──
    if (!exerciseSetId) {
      console.error("❌ exerciseSetId no encontrado para key:", k, "— serie NO guardada en BD");
      setSaveError("Error interno: no se encontró el ID de la serie. Recarga la página e inténtalo de nuevo.");
      return;
    }

    const { error: upsertError } = await supabase.from("set_logs").upsert(
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

    if (upsertError) {
      console.error("❌ Error guardando serie en Supabase:", upsertError);
      const isNetworkError = !navigator.onLine
        || upsertError.message?.toLowerCase().includes("load failed")
        || upsertError.message?.toLowerCase().includes("failed to fetch")
        || (upsertError as any).code === "FETCH_ERROR";

      if (isNetworkError) {
        // Sin red: guardar en cola local, NO revertir UI (el registro se ve en pantalla)
        upsertPending({
          exerciseSetId: exerciseSetId!, client_id: profile.id,
          weight: data.weight, reps: data.reps, rpe: data.rpe,
          unit: settings.weightUnit, logged_at: new Date().toISOString(),
          rp_reps: data.rp_reps ?? null, drop_weight: data.drop_weight ?? null, drop_reps: data.drop_reps ?? null,
        });
        const n = getPending().length;
        setPendingSaves(n);
        setSaveError(`Sin conexión — ${n} registro${n > 1 ? "s" : ""} pendiente${n > 1 ? "s" : ""}, se sincronizarán al reconectar`);
      } else {
        // Error de BD: revertir UI para que el usuario lo vea
        setSaveError(`No se pudo guardar: ${upsertError.message}`);
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
      }
    } else {
      // Guardado OK — limpiar de pendientes si estaba en cola
      removePending(exerciseSetId!);
      setPendingSaves(getPending().length);
      setSaveError(null);
    }
  };

  const handleDelete = async () => {
    if (!editing) return;

    const snap = { ...editing };
    const k = setKey(snap.dayId, snap.microcycleNumber, snap.exerciseIndex, snap.setNumber);
    const exerciseSetId = setKeyToIdRef.current.get(k);

    // Guardar copia del log antes de borrar (para rollback si falla)
    const deletedLog = logs.find(
      (l) => l.dayId === snap.dayId && l.microcycleNumber === snap.microcycleNumber &&
             l.exerciseIndex === snap.exerciseIndex && l.setNumber === snap.setNumber
    );

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

    // ── 2. Borrar en Supabase ──
    if (exerciseSetId) {
      const { error: delError } = await supabase
        .from("set_logs")
        .delete()
        .eq("client_id", profile.id)
        .eq("exercise_set_id", exerciseSetId);

      if (delError && deletedLog) {
        // Revertir UI si el borrado falló
        setLogs((prev) => [...prev, deletedLog]);
        setSaveError("No se pudo borrar el registro. Comprueba tu conexión.");
      }
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
  // Solo mostrar log anterior si el ejercicio del microciclo anterior es el mismo que el actual
  // (si hubo sustitución en el Mc anterior, esos datos pertenecen a otro ejercicio)
  const editingPrevMcSub = editing
    ? substitutions[subKey(editing.dayId, editing.microcycleNumber - 1, editing.exerciseIndex)]
    : null;
  const editingCurrExName = editingSub?.name ?? editingExercise?.name ?? "";
  const editingPrevExName = editingPrevMcSub?.name ?? editingExercise?.name ?? "";
  const editingPreviousLog = editing && editingCurrExName === editingPrevExName
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

  if (loadError)
    return (
      <div className="min-h-dvh flex items-center justify-center p-6"
        style={{ background: "linear-gradient(160deg, #0A0A0A 60%, #1A0810 100%)" }}>
        <div className="text-center">
          <i className="ti ti-wifi-off mb-4 block" style={{ fontSize: 40, color: "#555" }} />
          <p className="text-white font-semibold mb-2">No se pudo cargar el programa</p>
          <p className="text-neutral-400 text-sm mb-5">Comprueba tu conexión e inténtalo de nuevo.</p>
          <button
            onClick={() => { setLoadingProgram(true); loadAssignedProgram(); }}
            className="px-5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "#C8102E", color: "#fff" }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );

  if (!program)
    return (
      <div className="min-h-dvh flex items-center justify-center p-6"
        style={{ background: "linear-gradient(160deg, #0A0A0A 60%, #1A0810 100%)" }}>
        <div className="text-center">
          <i className="ti ti-barbell mb-4 block" style={{ fontSize: 40, color: "#333" }} />
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
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#1a1a1a", border: "1px solid #222", color: "#666" }}>
              <i className="ti ti-x" style={{ fontSize: 14 }} />
            </button>
          </div>

          {weightPts.length >= 2 ? (
            <div className="space-y-4">
              <div className="rounded-xl p-3" style={{ background: "#0D0D0D", border: "1px solid #1E1E1E" }}>
                <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2">Peso máximo · {unit}</p>
                <MiniChart data={weightPts} color="#C0394F" unit={` ${unit}`} height={90} />
              </div>
              {volPts.length >= 2 && (
                <div className="rounded-xl p-3" style={{ background: "#0D0D0D", border: "1px solid #1E1E1E" }}>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2">Volumen total · {unit}×reps</p>
                  <MiniChart data={volPts} color="rgba(192,41,43,0.5)" unit="" height={90} />
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
      <div className="mb-4 rounded-2xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>

        {/* Top section: big streak number + status badge */}
        <div className="flex items-end justify-between px-4 pt-4 pb-3">
          <div>
            <p className="text-[9px] uppercase tracking-[0.12em] font-black mb-1" style={{ color: "#444" }}>
              Racha
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black leading-none tabular-nums"
                style={{ fontSize: 52, color: streak > 0 ? "var(--mvp-red)" : "#2a2a2a", lineHeight: 1 }}>
                {streak}
              </span>
              <span className="text-sm font-semibold pb-1" style={{ color: "#555" }}>
                {streak === 1 ? "día" : "días"}
              </span>
            </div>
          </div>

          <div className="pb-1">
            {overTrained ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold"
                style={{ background: "var(--mvp-red-soft)", border: "1px solid var(--mvp-red-border)", color: "var(--mvp-red)" }}>
                <i className="ti ti-alert-triangle" style={{ fontSize: 11 }} /> Descansa hoy
              </span>
            ) : needsRest ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#444" }}>
                <i className="ti ti-moon" style={{ fontSize: 11 }} /> Descansa mañana
              </span>
            ) : todayIsManualRest ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#444" }}>
                <i className="ti ti-moon" style={{ fontSize: 11 }} /> Descanso
              </span>
            ) : null}
          </div>
        </div>

        {/* Divider */}
        <div className="divider-fade" />

        {/* Week circles */}
        <div className="flex gap-2 px-4 pt-3 pb-4">
          {weekDays.map((ds, i) => {
            const trained      = trainedDates.has(ds);
            const isToday      = ds === todayStr;
            const isPast       = ds <= todayStr;
            const isManualRest = manualRestDays.has(ds);
            const canToggle    = isPast;

            // Rest takes visual priority over trained (user explicitly marked it)
            const showAsRest = isManualRest;
            const showAsTrained = trained && !isManualRest;

            let bg: string, borderStyle: string, color: string, shadow = "none";
            if (showAsTrained && isToday) {
              bg = "var(--mvp-red)"; borderStyle = "none"; color = "#fff";
              shadow = "0 0 20px rgba(192,41,43,0.5)";
            } else if (showAsTrained) {
              bg = "var(--mvp-red)"; borderStyle = "none"; color = "#fff";
            } else if (isToday && !showAsRest) {
              bg = "transparent"; borderStyle = "2px solid var(--mvp-red)"; color = "var(--mvp-red)";
            } else if (showAsRest) {
              bg = "#1c1c1c"; borderStyle = "1px solid #303030"; color = "#777";
            } else if (isPast) {
              bg = "#141414"; borderStyle = "1px solid #1e1e1e"; color = "#444";
            } else {
              bg = "#0d0d0d"; borderStyle = "1px solid #161616"; color = "#2a2a2a";
            }

            return (
              <div key={ds} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[9px] font-black tracking-wider"
                  style={{ color: isToday ? "var(--mvp-red)" : "#555" }}>
                  {DAY_LABELS[i]}
                </span>
                <button
                  onClick={() => canToggle && toggleManualRest(ds)}
                  className="w-full flex items-center justify-center transition-all active:opacity-60"
                  style={{
                    aspectRatio: "1 / 1",
                    borderRadius: "50%",
                    background: bg,
                    border: borderStyle,
                    cursor: canToggle ? "pointer" : "default",
                    color,
                    boxShadow: shadow,
                  }}
                  title={canToggle ? (isManualRest ? "Quitar descanso" : "Marcar descanso") : undefined}
                >
                  {showAsTrained
                    ? <i className="ti ti-check" style={{ fontSize: 12 }} />
                    : showAsRest
                      ? <i className="ti ti-moon" style={{ fontSize: 11 }} />
                      : null}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Shell principal ────────────────────────────────────────────

  return (
    <div className="h-dvh flex flex-col" style={{ background: "linear-gradient(160deg, #0A0A0A 80%, #1A0810 100%)" }}>

      {/* ── Banner de error / pendientes offline ── */}
      {(saveError || pendingSaves > 0) && (
        <div
          className="flex items-center gap-3 px-4 py-3 z-50"
          style={{
            background: pendingSaves > 0 && !saveError?.includes("No se pudo") ? "#2a1a00" : "#3b0000",
            borderBottom: `1px solid ${pendingSaves > 0 && !saveError?.includes("No se pudo") ? "#855" : "#600"}`,
          }}
        >
          <i
            className={`ti ${pendingSaves > 0 && !saveError?.includes("No se pudo") ? "ti-wifi-off" : "ti-alert-triangle"} shrink-0`}
            style={{ fontSize: 15, color: pendingSaves > 0 && !saveError?.includes("No se pudo") ? "#fbbf24" : "#f87171" }}
          />
          <p className="flex-1 text-xs font-semibold"
            style={{ color: pendingSaves > 0 && !saveError?.includes("No se pudo") ? "#fde68a" : "#fca5a5" }}>
            {saveError ?? `${pendingSaves} registro${pendingSaves > 1 ? "s" : ""} pendiente${pendingSaves > 1 ? "s" : ""} de sincronizar`}
          </p>
          {/* Botón reintentar sync si hay conexión y hay pendientes */}
          {pendingSaves > 0 && navigator.onLine && (
            <button
              onClick={flushPending}
              disabled={isSyncing}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-all active:scale-95 disabled:opacity-50"
              style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
              {isSyncing ? "…" : "Subir"}
            </button>
          )}
          <button onClick={() => { setSaveError(null); }} style={{ color: "#f87171", fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* ── Área de scroll por tab: se monta fresco en cada cambio ── */}
      <div id="tab-scroll" tabIndex={-1} className="flex-1 overflow-y-auto overscroll-contain outline-none" style={{ WebkitOverflowScrolling: 'touch', overflowAnchor: 'none' }}>

      {/* ── Tab: Entrenamiento ── */}
      {activeTab === "workout" && (
        <div className="max-w-2xl mx-auto px-4">

          {/* Header sticky con safe area */}
          <header
            className="header-safe sticky top-0 z-10 flex items-center justify-between gap-3 pb-3 mb-2 relative"
            style={{ background: "linear-gradient(160deg, #0A0A0A 80%, #1A0810 100%)" }}
          >
            <div className="min-w-0 flex-1">
              <MVPWordmark className="mb-0.5" />
              <div className="flex items-center gap-1 pl-1">
                <span className="text-xs font-medium text-neutral-300 truncate">{profile.full_name}</span>
                {allPrograms.length > 1 ? (
                  <button
                    onClick={() => setShowProgramPicker(p => !p)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 active:opacity-60"
                    style={{ background: "var(--mvp-red-soft)", border: "1px solid var(--mvp-red-border)", color: "var(--mvp-red)" }}
                  >
                    <i className="ti ti-switch-horizontal" style={{ fontSize: 10 }} />
                    <span className="max-w-[90px] truncate">{program.programName}</span>
                  </button>
                ) : (
                  <span className="text-xs text-neutral-500 truncate hidden xs:inline"> · {program.programName}</span>
                )}
              </div>
            </div>

            {/* Picker de programas */}
            {showProgramPicker && allPrograms.length > 1 && (
              <div className="absolute left-4 right-4 top-full mt-1 rounded-2xl overflow-hidden z-50 shadow-2xl"
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 px-4 pt-3 pb-2">
                  Cambiar programa
                </p>
                {allPrograms.map(p => (
                  <div key={p.programId} className="flex items-center border-t" style={{ borderColor: "#222" }}>
                    <button
                      onClick={() => switchToProgram(p.programId)}
                      className="flex-1 flex items-center gap-3 px-4 py-3 active:opacity-60">
                      <i className={`ti ${p.source === "ai" ? "ti-sparkles" : "ti-barbell"}`}
                        style={{ fontSize: 16, color: p.source === "ai" ? "var(--mvp-red)" : "#555" }} />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm text-white font-medium truncate">{p.name}</p>
                        <p className="text-[10px] text-neutral-500">
                          {p.source === "ai" ? "Generado con IA" : "Asignado por coach"}
                        </p>
                      </div>
                      {program.programName === p.name && (
                        <i className="ti ti-check shrink-0" style={{ fontSize: 14, color: "var(--mvp-red)" }} />
                      )}
                    </button>
                    {p.source === "ai" && (
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Borrar "${p.name}"? Esta acción no se puede deshacer.`)) {
                            deleteAIProgram(p.programId);
                          }
                        }}
                        className="px-4 py-3 active:opacity-60 shrink-0"
                        title="Borrar plan IA">
                        <i className="ti ti-trash" style={{ fontSize: 16, color: "#555" }} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => setShowProgramPicker(false)}
                  className="w-full py-3 text-xs text-neutral-600 border-t" style={{ borderColor: "#222" }}>
                  Cancelar
                </button>
              </div>
            )}

            {/* Acciones del header */}
            <div className="flex gap-1.5 shrink-0 items-center">
              {/* Timer de sesión */}
              {(sessionStart || sessionFinalTime !== null) && (
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl"
                  style={{
                    background: "#111",
                    border: `1px solid ${sessionFinalTime !== null ? "rgba(74,222,128,0.2)" : "#1e1e1e"}`,
                  }}>
                  <i className="ti ti-clock" style={{
                    fontSize: 12,
                    color: sessionFinalTime !== null ? "#4ade80" : "var(--mvp-red)",
                  }} />
                  <span className="text-xs font-bold tabular-nums" style={{ color: sessionFinalTime !== null ? "#4ade80" : "#ddd", letterSpacing: "0.02em" }}>
                    {fmtTime(displayTime)}
                  </span>
                </div>
              )}
              {[
                { onClick: () => { setCalYear(new Date().getFullYear()); setCalMonth(new Date().getMonth()); setShowCalendar(true); }, icon: "calendar", title: "Calendario" },
                { onClick: () => setShowStats(true),    icon: "chart-line", title: "Estadísticas" },
                { onClick: startRestTimer,              icon: "stopwatch",      title: "Cronómetro" },
                { onClick: () => setShowSettings(true), icon: "settings",   title: "Ajustes" },
              ].map(({ onClick, icon, title }) => (
                <button key={icon}
                  onClick={onClick}
                  className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all"
                  style={{ background: "#161616", border: "1px solid #242424", color: "#aaa" }}
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
            <div className="flex gap-2 flex-wrap">
              {program.days.map((d, i) => {
                const letter = String.fromCharCode(65 + i);
                const isActive = d.id === dayId;
                void sessionTick; // para que React re-renderice el timer
                // Nombre corto: quitar la letra final y abreviar
                const shortName = d.name
                  .replace(/\s+[A-Z]\d*\s*$/, "")
                  .replace(/^día\s+[a-z]\s*[-–]\s*/i, "")
                  .replace(/^[a-z]\s*[-–]\s*/i, "")
                  .replace("Cuádriceps", "Cuád.")
                  .replace("Femorales", "Feml.")
                  .replace("Hombro-Brazos", "H-B")
                  .replace("Superior", "Sup.")
                  .replace("Inferior", "Inf.")
                  .replace("Full Body", "Full")
                  .trim();
                return (
                  <button
                    key={d.id}
                    onClick={() => { setDayId(d.id); setMicrocycleNumber(1); }}
                    className="flex flex-col items-center justify-center rounded-xl transition-all active:scale-95 shrink-0"
                    style={{
                      width: 48, minHeight: 52, paddingTop: 6, paddingBottom: 6,
                      ...(isActive
                        ? { background: "var(--mvp-red)", color: "#fff", border: "1px solid rgba(192,41,43,0.6)", boxShadow: "0 2px 12px rgba(192,41,43,0.3)" }
                        : { background: "#111", color: "#555", border: "1px solid #1c1c1c" }),
                    }}
                    title={d.name}
                  >
                    <span className="text-sm font-black leading-none">{letter}</span>
                    <span className="text-[8px] font-semibold leading-tight mt-0.5 text-center px-0.5 break-words"
                      style={{ opacity: isActive ? 0.85 : 0.5, maxWidth: 44 }}>
                      {shortName}
                    </span>
                  </button>
                );
              })}
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
                      className={"relative w-10 h-10 rounded-xl text-sm font-black transition-all active:scale-95 "}
                      style={m.number === microcycleNumber
                        ? { background: "var(--mvp-red)", color: "#fff", border: "1px solid rgba(192,41,43,0.6)", boxShadow: "0 2px 12px rgba(192,41,43,0.3)" }
                        : { background: "#161616", border: "1px solid #252525", color: locked ? "#888" : "#999" }}
                    >
                      {m.number}
                      {locked && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: "var(--mvp-red-soft)", border: "1px solid var(--mvp-red-border)" }}>
                          <i className="ti ti-lock" style={{ fontSize: 8, color: "var(--mvp-red)" }} />
                        </span>
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
                      ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#777" }
                      : { background: "#111", border: "1px solid #1c1c1c", color: "#555" }}
                    title={isLocked(dayId, microcycleNumber) ? "Desbloquear semana" : "Bloquear semana completada"}
                  >
                    <i className={`ti ti-${isLocked(dayId, microcycleNumber) ? "lock" : "lock-open"}`}
                      style={{ fontSize: 13, color: isLocked(dayId, microcycleNumber) ? "var(--mvp-red)" : undefined }} />
                    {isLocked(dayId, microcycleNumber) ? " Bloqueada" : " Bloquear"}
                  </button>
                )}
              </div>

              {/* Aviso visible cuando el microciclo actual está bloqueado */}
              {isLocked(dayId, microcycleNumber) && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: "#111", border: "1px solid #222" }}>
                  <i className="ti ti-lock shrink-0" style={{ fontSize: 14, color: "var(--mvp-red)" }} />
                  <p className="text-xs font-medium" style={{ color: "#888" }}>
                    Semana bloqueada — registros protegidos. Pulsa para editar.
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Lista de ejercicios — espacio extra para el bottom nav y el rest timer */}
          {microcycle && (() => {
            const totalSetsInDay = microcycle.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
            const completedSetsInDay = microcycle.exercises.reduce((sum, ex, exIdx) =>
              sum + ex.sets.filter(s => findLatestLog(logs, dayId, microcycleNumber, exIdx, s.number)).length, 0
            );
            const allDayDone = totalSetsInDay > 0 && completedSetsInDay === totalSetsInDay;
            const pct = totalSetsInDay > 0 ? Math.round((completedSetsInDay / totalSetsInDay) * 100) : 0;
            return (
            <section className="space-y-3" style={{ paddingBottom: rest ? "200px" : "32px" }}>
              {/* Barra de progreso del día */}
              {totalSetsInDay > 0 && (
                <div className="mb-1">
                  <div className="flex justify-between mb-1.5" style={{ fontSize: 10, color: "#555" }}>
                    <span>{completedSetsInDay} / {totalSetsInDay} series</span>
                    <span style={{ color: allDayDone ? "#4ade80" : "#555" }}>{pct}%</span>
                  </div>
                  <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: "#1a1a1a" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: allDayDone ? "#4ade80" : "var(--mvp-red)" }} />
                  </div>
                </div>
              )}
              {microcycle.exercises.map((ex, idx) => {
                const sub = substitutions[subKey(dayId, microcycleNumber, idx)];
                const displayName = sub?.name ?? ex.name;
                const displayGroup = sub?.muscleGroup ?? ex.muscleGroup;
                {/* Progreso de series */}
                const completedSets = ex.sets.filter(s =>
                  findLatestLog(logs, dayId, microcycleNumber, idx, s.number)
                ).length;
                const totalSets = ex.sets.length;
                const allDone = completedSets === totalSets;
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
                      {/* Progreso series */}
                      <span className="tabular-nums text-[11px] font-semibold mr-1"
                        style={{ color: allDone ? "var(--mvp-red)" : completedSets > 0 ? "#888" : "#666" }}>
                        {completedSets}/{totalSets}
                      </span>
                      {/* Botón cambiar ejercicio */}
                      <button
                        onClick={() => { setSwapTarget({ dayId, mcNum: microcycleNumber, exIdx: idx, origName: ex.name }); setSwapSearch(""); }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                        style={{ background: "#161616", border: "1px solid #222", color: "#888" }}
                        title="Cambiar ejercicio">
                        <i className="ti ti-refresh" style={{ fontSize: 16 }} />
                      </button>
                      {ex.videoRef && ex.videoRef !== "-" && (
                        ex.videoRef.startsWith("http") ? (
                          <button
                            onClick={() => openVideo(ex.videoRef!)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                            style={{ background: "#161616", border: "1px solid #222", color: "#888" }}
                            title="Ver vídeo">
                            <i className="ti ti-player-play" style={{ fontSize: 15 }} />
                          </button>
                        ) : (
                          <span className="w-9 h-9 rounded-xl flex items-center justify-center opacity-30"
                            style={{ background: "#161616" }}>
                            <i className="ti ti-player-play" style={{ fontSize: 15 }} />
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
                            className={"w-full flex items-center gap-3 px-3 text-left transition-all " +
                              (mcLocked ? "cursor-default" : "active:opacity-80")}
                            style={{
                              minHeight: 52,
                              borderRadius: 14,
                              ...(log
                                ? { background: "rgba(192,41,43,0.06)", border: "1px solid rgba(192,41,43,0.12)" }
                                : mcLocked
                                  ? { background: "#0a0a0a", border: "1px solid #111" }
                                  : { background: "#0f0f0f", border: "1px solid #161616" }),
                            }}
                          >
                            {/* Completion circle */}
                            <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all"
                              style={log
                                ? { background: "var(--mvp-red)", boxShadow: "0 0 12px rgba(192,41,43,0.3)" }
                                : mcLocked
                                  ? { background: "#111", border: "1px solid #1a1a1a" }
                                  : { background: "#141414", border: "1px solid #1e1e1e" }}>
                              {log
                                ? <i className="ti ti-check" style={{ fontSize: 14, color: "#fff" }} />
                                : <span className="text-[11px] font-black" style={{ color: mcLocked ? "#333" : "#888" }}>
                                    {s.number}
                                  </span>
                              }
                            </div>

                            {/* Target */}
                            <span className="text-xs flex-1 truncate" style={{ color: log ? "#777" : "#666" }}>
                              {s.targetReps ?? "—"}
                              {s.targetRpe && !(s.targetReps ?? "").includes("(") ? ` · ${s.targetRpe}` : ""}
                            </span>

                            {/* Logged data */}
                            {log ? (
                              <div className="flex items-baseline gap-1 tabular-nums shrink-0">
                                <span className="font-black text-white" style={{ fontSize: 17, letterSpacing: "-0.02em" }}>
                                  {log.weight}
                                </span>
                                <span className="text-xs font-medium" style={{ color: "#888" }}>{log.unit}</span>
                                <span className="text-xs" style={{ color: "#666" }}>×</span>
                                <span className="font-black text-white" style={{ fontSize: 17, letterSpacing: "-0.02em" }}>
                                  {log.reps}
                                </span>
                                {log.rpe > 0 && (
                                  <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                                    style={{ background: "#141414", color: "#777" }}>RPE {log.rpe}</span>
                                )}
                                {log.rp_reps != null && (
                                  <span className="ml-1 text-[10px] font-medium" style={{ color: "#777" }}>+{log.rp_reps}r</span>
                                )}
                                {log.drop_weight != null && (
                                  <span className="ml-1 text-[10px] font-medium" style={{ color: "#777" }}>↓{log.drop_weight}×{log.drop_reps ?? "?"}</span>
                                )}
                                {prog && (
                                  <span className="ml-1 text-xs font-black px-1 py-0.5 rounded"
                                    style={{
                                      color: prog === "↑" ? "#4ade80" : prog === "↓" ? "#f87171" : "#555",
                                      background: prog === "↑" ? "rgba(74,222,128,0.1)" : prog === "↓" ? "rgba(248,113,113,0.1)" : "transparent",
                                    }}>
                                    {prog}
                                  </span>
                                )}
                                {mcLocked && <i className="ti ti-lock ml-1" style={{ fontSize: 10, color: "#666" }} />}
                              </div>
                            ) : (
                              <i className={`ti ti-${mcLocked ? "lock" : "chevron-right"}`}
                                style={{ fontSize: 13, color: mcLocked ? "#777" : "#666" }} />
                            )}
                          </button>
                          {!log && validPrevLog && (
                            <div className="flex items-center gap-1.5 px-3 pt-0.5 pb-1">
                              <span className="text-[9px] uppercase tracking-wider font-bold shrink-0"
                                style={{ color: "var(--mvp-red)", opacity: 0.75 }}>Mc{validPrevLog.microcycleNumber}</span>
                              <span className="text-[10px]" style={{ color: "#666" }}>
                                {validPrevLog.weight} {validPrevLog.unit} × {validPrevLog.reps}
                                {validPrevLog.rpe > 0 ? ` · RPE ${validPrevLog.rpe}` : ""}
                                {validPrevLog.rp_reps != null ? ` · +${validPrevLog.rp_reps}r` : ""}
                                {validPrevLog.drop_weight != null ? ` · ↓${validPrevLog.drop_weight}×${validPrevLog.drop_reps ?? "?"}` : ""}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {ex.note && (
                    <p className="mt-3 text-[11px] leading-relaxed" style={{ color: "#666" }}>
                      <i className="ti ti-note mr-1" style={{ fontSize: 11 }} />{ex.note}
                    </p>
                  )}
                  </div>{/* flex-1 p-4 */}
                  </div>{/* flex */}
                </article>
                );
              })}
              {/* Banner de completado */}
              {allDayDone && (
                <div className="mt-2 flex flex-col items-center gap-2 py-6 px-4 rounded-2xl"
                  style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.14)" }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.18)" }}>
                    <i className="ti ti-trophy" style={{ fontSize: 22, color: "#4ade80" }} />
                  </div>
                  <p className="text-sm font-bold" style={{ color: "#4ade80" }}>¡Entreno completado!</p>
                  <p className="text-xs text-center" style={{ color: "#666" }}>
                    {completedSetsInDay} series completadas
                    {(sessionFinalTime !== null || sessionStart) ? ` · ${fmtTime(displayTime)}` : ""}
                  </p>
                </div>
              )}
            </section>
            );
          })()}
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

      {/* ── Tab: Tu Plan (IA) ── */}
      {activeTab === "aiplan" && (
        <AIPlanWizard
          profile={profile}
          onGoToWorkout={() => { loadAssignedProgram(); setActiveTab("workout"); }}
          onGoToDiet={() => setActiveTab("diet")}
          onPlanGenerated={loadAssignedProgram}
        />
      )}

      </div>{/* fin scroll container */}

      {/* ── Barra de navegación inferior (in-flow, no fixed) ── */}
      <nav
        className="shrink-0 z-30 footer-safe"
        style={{ background: "#0F0F0F", borderTop: "1px solid #1E1E1E" }}
      >
        <div className="flex items-stretch max-w-2xl mx-auto">
          {[
            { tab: "workout" as const, tiIcon: "barbell",    label: "Entreno" },
            { tab: "diet"    as const, tiIcon: "salad",      label: "Dieta" },
            { tab: "aiplan"  as const, tiIcon: "sparkles",   label: "Tu Plan" },
            { tab: "checkin" as const, tiIcon: "heartbeat",  label: "Check-in" },
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
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowCalendar(false)}>
            <div className="w-full max-w-sm overflow-hidden"
              style={{
                background: "#0a0a0a",
                border: "1px solid #1a1a1a",
                borderRadius: "24px 24px 0 0",
                boxShadow: "0 -24px 60px rgba(0,0,0,0.8)",
              }}
              onClick={e => e.stopPropagation()}>

              {/* Cabecera */}
              <div className="flex items-center justify-between px-5 pt-6 pb-4">
                <button
                  onClick={() => { const d = new Date(calYear, calMonth - 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }}
                  className="w-9 h-9 rounded-2xl flex items-center justify-center active:scale-90 transition-all"
                  style={{ background: "#141414", border: "1px solid #1e1e1e", color: "#666" }}>
                  <i className="ti ti-chevron-left" style={{ fontSize: 16 }} />
                </button>
                <div className="text-center">
                  <p className="text-white font-black text-lg">{MONTH_NAMES[calMonth]} {calYear}</p>
                  <div className="flex items-center justify-center gap-2 mt-0.5">
                    <span className="font-black tabular-nums" style={{ fontSize: 22, color: "var(--mvp-red)" }}>
                      {trainedThisMonth}
                    </span>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-wide" style={{ color: "var(--mvp-red)" }}>
                        {trainedThisMonth === 1 ? "día" : "días"}
                      </p>
                      {isCurrentMonth && daysPassed > 0 && (
                        <p className="text-[9px]" style={{ color: "#444" }}>
                          {Math.round(trainedThisMonth / daysPassed * 100)}% del mes
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { const d = new Date(calYear, calMonth + 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }}
                  className="w-9 h-9 rounded-2xl flex items-center justify-center active:scale-90 transition-all"
                  style={{ background: "#141414", border: "1px solid #1e1e1e", color: "#666" }}>
                  <i className="ti ti-chevron-right" style={{ fontSize: 16 }} />
                </button>
              </div>

              {/* Divisor */}
              <div className="divider-fade mb-3" />

              {/* Labels de días */}
              <div className="grid grid-cols-7 px-4 mb-1">
                {DAY_LABELS.map(l => (
                  <div key={l} className="text-center text-[9px] font-black tracking-wider py-1"
                    style={{ color: "#333" }}>{l}</div>
                ))}
              </div>

              {/* Grid de días */}
              <div className="grid grid-cols-7 px-4 pb-6 gap-1.5">
                {cells.map((day, i) => {
                  if (!day) return <div key={`e${i}`} />;
                  const ds = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const trained    = trainedDates.has(ds);
                  const isRest     = manualRestDays.has(ds);
                  const isToday    = ds === todayStr;
                  const isPast     = ds <= todayStr;
                  const showTrained = trained && !isRest;

                  let bg: string, border: string, color: string, shadow = "none";
                  if (showTrained && isToday) {
                    bg = "var(--mvp-red)"; border = "none"; color = "#fff";
                    shadow = "0 0 14px rgba(192,41,43,0.5)";
                  } else if (showTrained) {
                    bg = "var(--mvp-red)"; border = "none"; color = "#fff";
                  } else if (isRest) {
                    bg = "#1c1c1c"; border = "1px solid #2a2a2a"; color = "#666";
                  } else if (isToday) {
                    bg = "transparent"; border = "2px solid var(--mvp-red)"; color = "var(--mvp-red)";
                  } else if (isPast) {
                    bg = "#0e0e0e"; border = "1px solid #141414"; color = "#333";
                  } else {
                    bg = "transparent"; border = "none"; color = "#1e1e1e";
                  }

                  return (
                    <div key={day}
                      className="aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-black relative transition-all"
                      style={{ background: bg, border, color, boxShadow: shadow }}>
                      {showTrained
                        ? <i className="ti ti-check" style={{ fontSize: 11 }} />
                        : isRest
                          ? <i className="ti ti-moon" style={{ fontSize: 10 }} />
                          : <span>{day}</span>
                      }
                    </div>
                  );
                })}
              </div>

              {/* Leyenda compacta */}
              <div className="flex items-center justify-center gap-5 pb-6 px-4">
                {[
                  { bg: "var(--mvp-red)", label: "Entrenado" },
                  { bg: "#1c1c1c", border: "1px solid #2a2a2a", label: "Descanso" },
                  { bg: "#0e0e0e", border: "1px solid #141414", label: "Sin actividad" },
                ].map(({ bg, border: b, label }) => (
                  <span key={label} className="flex items-center gap-1.5 text-[10px]" style={{ color: "#555" }}>
                    <span className="w-3 h-3 rounded-md shrink-0"
                      style={{ background: bg, border: b }} />
                    {label}
                  </span>
                ))}
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
      {showStats && program && (() => {
        // Normaliza a Title Case para evitar duplicados por capitalización inconsistente en BD
        const normMuscle = (s: string) => {
          const t = (s ?? "").trim();
          if (!t) return "Otros";
          return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
        };

        // Extraer todos los ejercicios únicos con sus datos de logs
        type ExEntry = { name: string; muscle: string; dayId: string; exIdx: number; sparkPts: ChartPoint[]; latestLog: SetLog | null; trend: "↑"|"="|"↓"|null };
        const allEntries: ExEntry[] = [];
        program.days.forEach(d => {
          const exList = d.microcycles[0]?.exercises ?? [];
          exList.forEach((ex, exIdx) => {
            // Excluir microciclos donde el slot estaba sustituido por un ejercicio diferente
            const exLogs = logs.filter(l => {
              if (l.dayId !== d.id || l.exerciseIndex !== exIdx) return false;
              const mcSub = substitutions[subKey(d.id, l.microcycleNumber, l.exerciseIndex)];
              const mcExName = mcSub?.name ?? ex.name;
              return mcExName === ex.name;
            });
            const byMc: Record<number, number> = {};
            exLogs.forEach(l => {
              if (!byMc[l.microcycleNumber] || l.weight > byMc[l.microcycleNumber])
                byMc[l.microcycleNumber] = l.weight;
            });
            const sparkPts: ChartPoint[] = Object.entries(byMc)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([mc, w]) => ({ label: `Mc${mc}`, value: w }));
            const latestLog = exLogs.length > 0
              ? [...exLogs].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt))[0]
              : null;
            const trend: "↑"|"="|"↓"|null = sparkPts.length >= 2
              ? sparkPts[sparkPts.length-1].value > sparkPts[sparkPts.length-2].value ? "↑"
                : sparkPts[sparkPts.length-1].value < sparkPts[sparkPts.length-2].value ? "↓" : "="
              : null;
            allEntries.push({ name: ex.name, muscle: normMuscle(ex.muscleGroup ?? ""), dayId: d.id, exIdx, sparkPts, latestLog, trend });
          });
        });

        // Grupos musculares únicos
        const muscles = ["Todos", ...Array.from(new Set(allEntries.map(e => e.muscle))).sort()];

        // Filtrar
        const filtered = statsMuscle === "Todos"
          ? allEntries
          : allEntries.filter(e => e.muscle === statsMuscle);

        // Separar: con datos y sin datos
        const withLogs    = filtered.filter(e => e.latestLog !== null);
        const withoutLogs = filtered.filter(e => e.latestLog === null);

        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
            onClick={() => { setShowStats(false); setStatsExpandedKey(null); }}>
            <div className="w-full max-w-lg flex flex-col sm:rounded-2xl overflow-hidden"
              style={{
                background: "#080808",
                border: "1px solid #141414",
                borderRadius: "24px 24px 0 0",
                maxHeight: "90dvh",
                boxShadow: "0 -24px 60px rgba(0,0,0,0.8)",
              }}
              onClick={e => e.stopPropagation()}>

              {/* Cabecera */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.12em] font-black mb-0.5" style={{ color: "#333" }}>Estadísticas</p>
                  <p className="text-white font-black text-lg">Progresión</p>
                </div>
                <button
                  onClick={() => { setShowStats(false); setStatsExpandedKey(null); }}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all active:scale-90"
                  style={{ background: "#141414", border: "1px solid #1e1e1e", color: "#555" }}>
                  <i className="ti ti-x" style={{ fontSize: 16 }} />
                </button>
              </div>

              {/* Chips de grupos musculares */}
              <div className="px-5 pb-3 shrink-0">
                <div className="flex flex-wrap gap-2">
                  {muscles.map(m => (
                    <button key={m}
                      onClick={() => { setStatsMuscle(m); setStatsExpandedKey(null); }}
                      className="shrink-0 px-3.5 py-2 rounded-2xl text-[11px] font-bold transition-all active:scale-95"
                      style={statsMuscle === m
                        ? { background: "var(--mvp-red)", color: "#fff", boxShadow: "0 2px 12px rgba(192,41,43,0.3)" }
                        : { background: "#111", border: "1px solid #1a1a1a", color: "#555" }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divisor */}
              <div className="divider-fade mx-5 shrink-0 mb-1" />

              {/* Lista */}
              <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
                {withLogs.length === 0 && (
                  <div className="text-center py-16">
                    <i className="ti ti-chart-line block mb-3" style={{ fontSize: 36, color: "#1e1e1e" }} />
                    <p className="text-sm font-semibold" style={{ color: "#333" }}>Sin registros para este músculo</p>
                    <p className="text-xs mt-1" style={{ color: "#222" }}>Entrena y guarda series para ver la progresión</p>
                  </div>
                )}
                {withLogs.map(entry => {
                  const key = `${entry.dayId}:${entry.exIdx}`;
                  const isExpanded = statsExpandedKey === key;

                  return (
                    <div key={key}
                      className="rounded-2xl overflow-hidden transition-all"
                      style={{ background: isExpanded ? "#0e0e0e" : "#0c0c0c", border: `1px solid ${isExpanded ? "rgba(192,41,43,0.2)" : "#161616"}` }}>

                      {/* Fila principal — siempre visible */}
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all active:opacity-80"
                        onClick={() => setStatsExpandedKey(isExpanded ? null : key)}>

                        {/* Icono tendencia */}
                        <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center"
                          style={entry.trend === "↑"
                            ? { background: "var(--mvp-red-soft)", border: "1px solid var(--mvp-red-border)" }
                            : { background: "#141414", border: "1px solid #1e1e1e" }}>
                          <i className={`ti ti-trending-${entry.trend === "↑" ? "up" : entry.trend === "↓" ? "down" : "flat"}`}
                            style={{ fontSize: 14, color: entry.trend === "↑" ? "var(--mvp-red)" : "#444" }} />
                        </div>

                        {/* Nombre + músculo */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-wider mb-0.5" style={{ color: "#333" }}>
                            {entry.muscle}
                          </p>
                          <p className="text-sm font-semibold text-white leading-snug"
                            style={{ display: "-webkit-box", WebkitLineClamp: isExpanded ? 10 : 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {entry.name}
                          </p>
                        </div>

                        {/* Último peso */}
                        {entry.latestLog && !isExpanded && (
                          <div className="text-right shrink-0">
                            <p className="font-black tabular-nums text-white" style={{ fontSize: 18, letterSpacing: "-0.02em" }}>
                              {entry.latestLog.weight}
                            </p>
                            <p className="text-[10px]" style={{ color: "#444" }}>
                              {entry.latestLog.unit} × {entry.latestLog.reps}
                            </p>
                          </div>
                        )}

                        <i className={`ti ti-chevron-${isExpanded ? "up" : "down"} shrink-0`}
                          style={{ fontSize: 14, color: "#333" }} />
                      </button>

                      {/* Expansión — chart grande + métricas */}
                      {isExpanded && (
                        <div className="px-4 pb-4">
                          {/* Métricas clave */}
                          {entry.latestLog && (
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              {[
                                { label: "Último peso", val: `${entry.latestLog.weight} ${entry.latestLog.unit}` },
                                { label: "Últimas reps", val: `${entry.latestLog.reps} reps` },
                                { label: "Sesiones", val: String(entry.sparkPts.length) },
                              ].map(({ label, val }) => (
                                <div key={label} className="rounded-xl py-2.5 px-3 text-center"
                                  style={{ background: "#111", border: "1px solid #1a1a1a" }}>
                                  <p className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color: "#333" }}>{label}</p>
                                  <p className="text-sm font-black text-white tabular-nums">{val}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Sparkline grande */}
                          {entry.sparkPts.length >= 2 ? (
                            <MiniChart data={entry.sparkPts} color="var(--mvp-red)" unit={` ${entry.latestLog?.unit ?? ""}`} height={80} />
                          ) : (
                            <p className="text-center text-sm py-4" style={{ color: "#444" }}>Solo 1 semana registrada — sigue entrenando</p>
                          )}
                          {/* Botón ver historial completo */}
                          <button
                            onClick={() => { setShowStats(false); setStatsExpandedKey(null); setExHistory({ name: entry.name, dayId: entry.dayId, exerciseIndex: entry.exIdx }); }}
                            className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                            style={{ background: "#141414", border: "1px solid #1e1e1e", color: "#666" }}>
                            <i className="ti ti-history" style={{ fontSize: 13 }} />
                            Ver historial completo
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Ejercicios sin datos — colapsados al final */}
                {withoutLogs.length > 0 && withLogs.length > 0 && (
                  <p className="text-[9px] uppercase tracking-wider px-1 pt-3 pb-1" style={{ color: "#1e1e1e" }}>
                    Sin registros ({withoutLogs.length})
                  </p>
                )}
                {withoutLogs.map(entry => (
                  <div key={`${entry.dayId}:${entry.exIdx}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl opacity-30"
                    style={{ background: "#0a0a0a", border: "1px solid #111" }}>
                    <div className="w-8 h-8 rounded-xl shrink-0"
                      style={{ background: "#111", border: "1px solid #1a1a1a" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-wider mb-0.5" style={{ color: "#1e1e1e" }}>{entry.muscle}</p>
                      <p className="text-xs text-white truncate">{entry.name}</p>
                    </div>
                    <i className="ti ti-minus shrink-0" style={{ fontSize: 12, color: "#222" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

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
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#1a1a1a", border: "1px solid #222", color: "#666" }}>
                  <i className="ti ti-x" style={{ fontSize: 14 }} />
                </button>
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
                    style={{ borderColor: "#1a1a1a", background: "#111" }}>
                    <i className="ti ti-arrow-back-up" style={{ fontSize: 16, color: "#555" }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "var(--mvp-red)" }}>Restablecer ejercicio original</p>
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
                            style={{ borderColor: "#1a1a1a", background: isCurrent ? "var(--mvp-red-soft)" : "transparent" }}>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: isUsedElsewhere ? "#555" : "#fff" }}>{e.name}</p>
                              {isUsedElsewhere && (
                                <p className="text-[10px] mt-0.5 text-neutral-600">
                                  <i className="ti ti-alert-triangle mr-0.5" style={{ fontSize: 9 }} />ya asignado a otro ejercicio
                                </p>
                              )}
                            </div>
                            {isCurrent && <i className="ti ti-check shrink-0" style={{ fontSize: 14, color: "var(--mvp-red)" }} />}
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
                className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "#1a1a1a", border: "1px solid #222", color: "#666" }}>
                <i className="ti ti-x" style={{ fontSize: 14 }} />
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
