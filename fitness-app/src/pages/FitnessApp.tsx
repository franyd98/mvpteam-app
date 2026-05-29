// Vista del cliente: carga el programa asignado desde Supabase.
// Los registros de entrenamiento se guardan en Supabase (set_logs).

import { useEffect, useMemo, useRef, useState } from "react";
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

  const setKeyToIdRef = useRef(new Map<string, number>());
  const idToEntryRef = useRef(new Map<number, SetIdEntry>());

  useEffect(() => {
    loadAssignedProgram();
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
    const match = url.match(/\/file\/d\/([^/]+)/);
    if (match) {
      setVideoUrl(`https://drive.google.com/file/d/${match[1]}/preview`);
    } else {
      setVideoUrl(url);
    }
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

  const handleSave = (data: { weight: number; reps: number; rpe: number }) => {
    if (!editing) return;

    // ── Optimistic update: cierra el modal y actualiza la UI al instante ──
    const newLog: SetLog = {
      ...editing,
      weight: data.weight,
      reps: data.reps,
      rpe: data.rpe,
      unit: settings.weightUnit,
      loggedAt: new Date().toISOString(),
    };
    setLogs((prev) => [
      ...prev.filter(
        (l) =>
          !(
            l.dayId === editing.dayId &&
            l.microcycleNumber === editing.microcycleNumber &&
            l.exerciseIndex === editing.exerciseIndex &&
            l.setNumber === editing.setNumber
          ),
      ),
      newLog,
    ]);
    setEditing(null);
    if (settings.autoStartRestTimer) startRestTimer();

    // ── Persistir en Supabase en segundo plano (sin bloquear la UI) ──
    const k = setKey(editing.dayId, editing.microcycleNumber, editing.exerciseIndex, editing.setNumber);
    const exerciseSetId = setKeyToIdRef.current.get(k);
    if (exerciseSetId) {
      supabase.from("set_logs").upsert(
        {
          client_id: profile.id,
          exercise_set_id: exerciseSetId,
          weight: data.weight,
          reps: data.reps,
          rpe: data.rpe,
          unit: settings.weightUnit,
          logged_at: new Date().toISOString(),
        },
        { onConflict: "client_id,exercise_set_id" },
      );
    }
  };

  const handleDelete = () => {
    if (!editing) return;

    // ── Optimistic update: elimina de la UI al instante ──
    setLogs((prev) =>
      prev.filter(
        (l) =>
          !(
            l.dayId === editing.dayId &&
            l.microcycleNumber === editing.microcycleNumber &&
            l.exerciseIndex === editing.exerciseIndex &&
            l.setNumber === editing.setNumber
          ),
      ),
    );
    setEditing(null);

    // ── Borrar en Supabase en segundo plano ──
    const k = setKey(editing.dayId, editing.microcycleNumber, editing.exerciseIndex, editing.setNumber);
    const exerciseSetId = setKeyToIdRef.current.get(k);
    if (exerciseSetId) {
      supabase
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
    const exLogs = logs.filter(l => l.dayId === exHistory.dayId && l.exerciseIndex === exHistory.exerciseIndex);
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

    const todayStr = new Date().toISOString().slice(0, 10);

    // ── Streak: permite 1 día de descanso, rompe con 2+ descansos seguidos ──
    let streak = 0;
    let restConsec = 0;
    const checkDate = new Date();
    for (let i = 0; i < 365; i++) {
      const ds = checkDate.toISOString().slice(0, 10);
      if (trainedDates.has(ds)) { streak++; restConsec = 0; }
      else { restConsec++; if (restConsec > 1) break; }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // ── Días CONSECUTIVOS sin descanso (para avisar de sobreentrenamiento) ──
    let consecWithoutRest = 0;
    const cd2 = new Date();
    for (let i = 0; i < 365; i++) {
      const ds = cd2.toISOString().slice(0, 10);
      if (trainedDates.has(ds)) { consecWithoutRest++; cd2.setDate(cd2.getDate() - 1); }
      else break; // primer día sin entrenar → para
    }
    // needsRest: lleva 3+ días seguidos sin ningún descanso
    const needsRest = consecWithoutRest >= 3;
    // overTrained: lleva 4+ días sin descansar (ya debería haber descansado)
    const overTrained = consecWithoutRest >= 4;

    const now = new Date();
    const dow = now.getDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() + mondayOffset + i);
      return d.toISOString().slice(0, 10);
    });
    const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

    return (
      <div className="mb-4 rounded-2xl p-3 space-y-2" style={{ background: "#0F0F0F", border: "1px solid #1A1A1A" }}>
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] uppercase tracking-wider text-neutral-600">Esta semana</p>
          {overTrained ? (
            <span className="text-xs font-bold" style={{ color: "#EF4444" }}>
              ⚠️ Necesitas descansar hoy
            </span>
          ) : needsRest ? (
            <span className="text-xs font-bold" style={{ color: "#94A3B8" }}>
              💤 Descansa mañana
            </span>
          ) : streak > 0 ? (
            <span className="text-xs font-bold" style={{ color: "#F59E0B" }}>
              🔥 {streak} {streak === 1 ? "día seguido" : "días seguidos"}
            </span>
          ) : null}
        </div>
        <div className="flex gap-1.5">
          {weekDays.map((ds, i) => {
            const trained = trainedDates.has(ds);
            const isToday = ds === todayStr;
            // Marca en azul/gris los días de descanso recomendado
            // (el día siguiente a 3 consecutivos de entrenamiento)
            const dayIdx = weekDays.indexOf(ds);
            const prevThreeTrained =
              dayIdx >= 3 &&
              weekDays.slice(dayIdx - 3, dayIdx).every(d => trainedDates.has(d));
            const isRecommendedRest = !trained && prevThreeTrained;
            return (
              <div key={ds} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-semibold" style={{ color: isToday ? "#fff" : "#555" }}>
                  {DAY_LABELS[i]}
                </span>
                <div
                  className="w-full rounded-lg flex items-center justify-center"
                  style={{
                    height: 28,
                    background: trained
                      ? "#8B1A2F"
                      : isRecommendedRest
                        ? "#1A2535"
                        : isToday ? "#1E1E1E" : "#131313",
                    border: isToday
                      ? "1px solid #333"
                      : isRecommendedRest
                        ? "1px solid #2A3F5F"
                        : "1px solid transparent",
                  }}
                >
                  {trained && <span className="text-white text-xs">✓</span>}
                  {isRecommendedRest && <span style={{ fontSize: 10, color: "#4A6FA5" }}>💤</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Shell principal ────────────────────────────────────────────

  return (
    <div className="min-h-dvh" style={{ background: "linear-gradient(160deg, #0A0A0A 80%, #1A0810 100%)" }}>

      {/* ── Tab: Entrenamiento ── */}
      {activeTab === "workout" && (
        <div className="max-w-2xl mx-auto px-4">

          {/* Header sticky con safe area */}
          <header
            className="header-safe sticky top-0 z-10 flex items-center justify-between gap-3 pt-4 pb-3 mb-2"
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
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setShowStats(true)}
                className="w-10 h-10 rounded-xl text-neutral-300 flex items-center justify-center text-lg active:scale-95 transition-transform"
                style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
                title="Estadísticas"
              >📊</button>
              <button
                onClick={startRestTimer}
                className="w-10 h-10 rounded-xl text-neutral-300 flex items-center justify-center text-lg active:scale-95 transition-transform"
                style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
                title="Cronómetro"
              >⏱</button>
              <button
                onClick={() => setShowSettings(true)}
                className="w-10 h-10 rounded-xl text-neutral-300 flex items-center justify-center text-lg active:scale-95 transition-transform"
                style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
                title="Ajustes"
              >⚙</button>
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
                  className={"px-3 py-2 rounded-xl text-sm font-medium transition-colors active:scale-95 " +
                    (d.id === dayId ? "text-white" : "text-neutral-300")}
                  style={d.id === dayId
                    ? { background: "#8B1A2F", border: "1px solid #A01F38" }
                    : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}
                >
                  {d.name}{d.optional && <span className="ml-1 text-[10px] opacity-60">(opc.)</span>}
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
                      className={"relative w-10 h-10 rounded-xl text-sm font-medium transition-colors active:scale-95 " +
                        (m.number === microcycleNumber ? "text-white" : "text-neutral-300")}
                      style={m.number === microcycleNumber
                        ? { background: "#8B1A2F", border: "1px solid #A01F38" }
                        : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}
                    >
                      {m.number}
                      {locked && (
                        <span className="absolute -top-1 -right-1 text-[9px] leading-none">🔒</span>
                      )}
                    </button>
                  );
                })}

                {/* Botón bloquear/desbloquear microciclo actual */}
                {day.microcycles.length > 0 && (
                  <button
                    onClick={() => toggleLock(dayId, microcycleNumber)}
                    disabled={lockingSaving}
                    className={"ml-1 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors active:scale-95 disabled:opacity-40 " +
                      (isLocked(dayId, microcycleNumber)
                        ? "bg-amber-950/60 text-amber-300 border border-amber-800/50"
                        : "bg-neutral-800 text-neutral-400 border border-neutral-700")}
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
            <section className="space-y-3 pb-28">
              {microcycle.exercises.map((ex, idx) => (
                <article key={idx} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">{ex.muscleGroup}</p>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-white leading-snug line-clamp-2 flex-1" title={ex.name}>{ex.name}</h2>
                      </div>
                    </div>
                    {ex.videoRef && ex.videoRef !== "-" && (
                      ex.videoRef.startsWith("http") ? (
                        <button
                          onClick={() => openVideo(ex.videoRef!)}
                          className="shrink-0 w-9 h-9 rounded-xl bg-neutral-800 active:bg-blue-900 flex items-center justify-center transition-colors"
                          title="Ver vídeo"
                        >
                          📹
                        </button>
                      ) : (
                        <span className="shrink-0 w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center opacity-40" title={ex.videoRef}>
                          📹
                        </span>
                      )
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {ex.sets.map((s) => {
                      const log = findLatestLog(logs, dayId, microcycleNumber, idx, s.number);
                      const prevLog = findPreviousMicrocycleLog(logs, dayId, microcycleNumber, idx, s.number);
                      const prog =
                        log && prevLog
                          ? log.weight * log.reps > prevLog.weight * prevLog.reps
                            ? "↑"
                            : log.weight * log.reps === prevLog.weight * prevLog.reps
                            ? "="
                            : "↓"
                          : null;
                      const mcLocked = isLocked(dayId, microcycleNumber);
                      return (
                        <div key={setKey(dayId, microcycleNumber, idx, s.number)}>
                          <button
                            onClick={() => !mcLocked && setEditing({ dayId, microcycleNumber, exerciseIndex: idx, setNumber: s.number })}
                            className={"w-full flex items-center gap-3 text-sm rounded-xl px-3 py-3 text-left transition-colors " +
                              (mcLocked
                                ? "cursor-default opacity-75 "
                                : "active:scale-[0.98] ") +
                              (log
                                ? "bg-emerald-950 border border-emerald-800 " + (mcLocked ? "" : "active:bg-emerald-900")
                                : "bg-neutral-950 border border-neutral-800 " + (mcLocked ? "" : "active:bg-neutral-900"))}
                          >
                            <span className="text-neutral-500 w-14 shrink-0 text-xs">Serie {s.number}</span>
                            <span className="text-neutral-400 text-xs flex-1 truncate">
                              Obj: {s.targetReps ?? "-"}
                              {s.targetRpe && !(s.targetReps ?? "").includes("(")
                                ? ` (${s.targetRpe})`
                                : ""}
                            </span>
                            {log ? (
                              <span className="font-bold text-emerald-200 tabular-nums flex items-center gap-1.5 text-sm">
                                {log.weight} {log.unit} × {log.reps}
                                {log.rpe > 0 && (
                                  <span className="text-emerald-400 font-normal text-xs">RPE {log.rpe}</span>
                                )}
                                {prog && (
                                  <span className={"text-sm font-bold " +
                                    (prog === "↑" ? "text-emerald-300" : prog === "=" ? "text-yellow-400" : "text-red-400")}>
                                    {prog}
                                  </span>
                                )}
                                {mcLocked && <span className="text-amber-400 text-xs ml-1">🔒</span>}
                              </span>
                            ) : (
                              <span className="text-neutral-500 text-xs">
                                {mcLocked ? "🔒 Bloqueado" : "Registrar →"}
                              </span>
                            )}
                          </button>
                          {!log && prevLog && (
                            <p className="text-[10px] text-blue-400 px-3 pt-0.5 pb-1">
                              Ant (Mc {prevLog.microcycleNumber}): {prevLog.weight} {prevLog.unit} × {prevLog.reps}
                              {prevLog.rpe > 0 ? ` · RPE ${prevLog.rpe}` : ""}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {ex.note && <p className="mt-3 text-xs text-amber-400">{ex.note}</p>}
                </article>
              ))}
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

      {/* ── Barra de navegación inferior ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 footer-safe"
        style={{ background: "#0F0F0F", borderTop: "1px solid #1E1E1E" }}
      >
        <div className="flex items-stretch max-w-2xl mx-auto">
          {([
            { tab: "workout" as const, icon: "🏋️", label: "Entreno" },
            { tab: "diet"    as const, icon: "🥗",  label: "Dieta" },
            { tab: "checkin" as const, icon: "📋",  label: "Check-in" },
          ] as const).map(({ tab, icon, label }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={"flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors active:scale-95 " +
                (activeTab === tab ? "" : "opacity-40 active:opacity-60")}
              style={{ color: activeTab === tab ? "#C0394F" : "#888" }}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className={"text-[10px] font-semibold tracking-wide mt-0.5 " +
                (activeTab === tab ? "" : "text-neutral-500")}>
                {label}
              </span>
              {activeTab === tab && (
                <span className="w-4 h-0.5 rounded-full mt-0.5" style={{ background: "#C0394F" }} />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Modales (siempre por encima de todo) ── */}
      {editing && editingExercise && editingTargetSet && (
        <SetLogger
          exerciseName={editingExercise.name}
          coachNote={editingExercise.coachNote}
          targetSet={editingTargetSet}
          setNumber={editing.setNumber}
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
                <p className="text-white font-bold text-sm">Historial de entrenamientos</p>
              </div>
              <button onClick={() => setShowStats(false)}
                className="w-8 h-8 rounded-xl bg-neutral-800 text-neutral-400 active:text-white flex items-center justify-center text-sm shrink-0">✕</button>
            </div>
            {/* Lista de días y ejercicios */}
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
                      const hasLogs = logs.some(l => l.dayId === d.id && l.exerciseIndex === exIdx);
                      const latestLog = hasLogs
                        ? [...logs.filter(l => l.dayId === d.id && l.exerciseIndex === exIdx)]
                            .sort((a, b) => b.loggedAt.localeCompare(a.loggedAt))[0]
                        : null;
                      return (
                        <button key={exIdx}
                          onClick={() => { setShowStats(false); setExHistory({ name: ex.name, dayId: d.id, exerciseIndex: exIdx }); }}
                          disabled={!hasLogs}
                          className={"w-full flex items-center gap-3 px-4 py-3 border-b text-left transition-colors " +
                            (hasLogs ? "active:bg-neutral-800" : "opacity-40 cursor-default")}
                          style={{ borderColor: "#1a1a1a" }}>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-neutral-400 truncate">{ex.muscleGroup}</p>
                            <p className="text-sm text-white font-medium truncate">{ex.name}</p>
                          </div>
                          {latestLog ? (
                            <div className="text-right shrink-0">
                              <p className="text-xs font-bold text-emerald-400">{latestLog.weight} {latestLog.unit} × {latestLog.reps}</p>
                              <p className="text-[10px] text-neutral-600">último</p>
                            </div>
                          ) : (
                            <span className="text-[10px] text-neutral-600">Sin datos</span>
                          )}
                          {hasLogs && <span className="text-neutral-600 text-xs shrink-0">›</span>}
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
