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

type Profile = { id: string; full_name: string; role: string };

type ActiveTab = "workout" | "diet" | "checkin";

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

  const [logs, setLogs] = useState<SetLog[]>([]);
  const [settings, setSettings] = useSettings();

  const setKeyToIdRef = useRef(new Map<string, number>());
  const idToEntryRef = useRef(new Map<number, SetIdEntry>());

  useEffect(() => {
    loadAssignedProgram();
  }, []);

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
                exercises ( id, name, muscle_group, video_ref ),
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

    const { data: logsData } = await supabase
      .from("set_logs")
      .select("*")
      .eq("client_id", profile.id);

    if (logsData) {
      const converted = logsData.flatMap((row) => {
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

  const handleSave = async (data: { weight: number; reps: number; rpe: number }) => {
    if (!editing) return;

    const k = setKey(editing.dayId, editing.microcycleNumber, editing.exerciseIndex, editing.setNumber);
    const exerciseSetId = setKeyToIdRef.current.get(k);

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
        },
        { onConflict: "client_id,exercise_set_id" },
      );
    }

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
  };

  const handleDelete = async () => {
    if (!editing) return;

    const k = setKey(editing.dayId, editing.microcycleNumber, editing.exerciseIndex, editing.setNumber);
    const exerciseSetId = setKeyToIdRef.current.get(k);

    if (exerciseSetId) {
      await supabase
        .from("set_logs")
        .delete()
        .eq("client_id", profile.id)
        .eq("exercise_set_id", exerciseSetId);
    }

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
  };

  const editingExercise = editing && microcycle ? microcycle.exercises[editing.exerciseIndex] : null;
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

            {/* Acciones del header: solo timer + ajustes */}
            <div className="flex gap-2 shrink-0">
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

          {/* Selector de microciclo */}
          {day && (
            <section className="mb-5">
              <label className="text-xs uppercase tracking-wider text-neutral-500 mb-2 block">Semana</label>
              <div className="flex flex-wrap gap-2">
                {day.microcycles.map((m) => (
                  <button
                    key={m.number}
                    onClick={() => setMicrocycleNumber(m.number)}
                    className={"w-10 h-10 rounded-xl text-sm font-medium transition-colors active:scale-95 " +
                      (m.number === microcycleNumber ? "text-white" : "text-neutral-300")}
                    style={m.number === microcycleNumber
                      ? { background: "#8B1A2F", border: "1px solid #A01F38" }
                      : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}
                  >
                    {m.number}
                  </button>
                ))}
              </div>
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
                      <h2 className="text-sm font-semibold text-white leading-snug line-clamp-2" title={ex.name}>{ex.name}</h2>
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
                      return (
                        <div key={setKey(dayId, microcycleNumber, idx, s.number)}>
                          <button
                            onClick={() => setEditing({ dayId, microcycleNumber, exerciseIndex: idx, setNumber: s.number })}
                            className={"w-full flex items-center gap-3 text-sm rounded-xl px-3 py-3 text-left transition-colors active:scale-[0.98] " +
                              (log
                                ? "bg-emerald-950 border border-emerald-800 active:bg-emerald-900"
                                : "bg-neutral-950 border border-neutral-800 active:bg-neutral-900")}
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
                              </span>
                            ) : (
                              <span className="text-neutral-500 text-xs">Registrar →</span>
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
