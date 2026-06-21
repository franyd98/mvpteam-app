// Panel modal con teclado numérico grande para registrar una serie.
// Inspirado en Hevy / Strong: pestañas Peso / Reps / RPE, teclado numpad.

import { useEffect, useState } from "react";
import type { ExerciseSet, SetLog, WeightUnit } from "../types";

// Calcula el volumen (peso × reps) para comparar progresión.
function volume(log: SetLog): number {
  return log.weight * log.reps;
}

type Field = "weight" | "reps" | "rpe" | "rp_reps" | "drop_weight" | "drop_reps";

type Props = {
  exerciseName: string;
  coachNote?: string | null;
  exerciseNote?: string | null; // nota del microciclo (microcycle_exercises.note)
  targetSet: ExerciseSet;
  setNumber: number;
  totalSets?: number;           // total de series del ejercicio (para saber si es la última)
  weightUnit: WeightUnit;
  existingLog?: SetLog;
  previousLog?: SetLog;
  onSave: (data: { weight: number; reps: number; rpe: number; rp_reps?: number; drop_weight?: number; drop_reps?: number }) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

export default function SetLogger({
  exerciseName,
  coachNote,
  exerciseNote,
  targetSet,
  setNumber,
  totalSets,
  weightUnit,
  existingLog,
  previousLog,
  onSave,
  onCancel,
  onDelete,
}: Props) {
  // Detectar técnica especial — busca en ambas notas (coach_note y microcycle note)
  // "DS Últ. Serie" y "Drop Set Últ. Serie" son equivalentes
  const allNotes = [coachNote ?? "", exerciseNote ?? ""].join(" ").toLowerCase();
  const hasRP   = allNotes.includes("r&p");
  const hasDrop = allNotes.includes("drop") || allNotes.includes("ds últ");

  // Solo mostrar R&P y Drop Set en la ÚLTIMA serie del ejercicio
  const isLastSet = totalSets == null || setNumber >= totalSets;
  const isRP   = hasRP   && isLastSet;
  const isDrop = hasDrop && isLastSet;

  // Estados principales
  const [weight, setWeight] = useState<string>(existingLog ? String(existingLog.weight) : "");
  const [reps,   setReps]   = useState<string>(existingLog ? String(existingLog.reps)   : "");
  // Sólo pre-rellenar RPE si se guardó un valor positivo — rpe=0 significa "no introducido"
  const [rpe,    setRpe]    = useState<string>(existingLog && (existingLog.rpe ?? 0) > 0 ? String(existingLog.rpe) : "");
  // Estados extra para R&P y Drop Set
  const [rpReps,     setRpReps]     = useState<string>((existingLog as any)?.rp_reps    != null ? String((existingLog as any).rp_reps)    : "");
  const [dropWeight, setDropWeight] = useState<string>((existingLog as any)?.drop_weight != null ? String((existingLog as any).drop_weight) : "");
  const [dropReps,   setDropReps]   = useState<string>((existingLog as any)?.drop_reps   != null ? String((existingLog as any).drop_reps)   : "");

  const [activeField, setActiveField] = useState<Field>("weight");

  // Previene el "ghost-click" en móvil
  const [backdropReady, setBackdropReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBackdropReady(true), 250);
    return () => clearTimeout(t);
  }, []);

  // Devuelve el valor y setter del campo activo
  const getCurrent = (): string => {
    if (activeField === "weight")      return weight;
    if (activeField === "reps")        return reps;
    if (activeField === "rpe")         return rpe;
    if (activeField === "rp_reps")     return rpReps;
    if (activeField === "drop_weight") return dropWeight;
    if (activeField === "drop_reps")   return dropReps;
    return "";
  };
  const getSetter = (): ((v: string) => void) => {
    if (activeField === "weight")      return setWeight;
    if (activeField === "reps")        return setReps;
    if (activeField === "rpe")         return setRpe;
    if (activeField === "rp_reps")     return setRpReps;
    if (activeField === "drop_weight") return setDropWeight;
    if (activeField === "drop_reps")   return setDropReps;
    return () => {};
  };

  // El punto decimal no aplica en campos de reps enteras
  const noDecimalFields: Field[] = ["reps", "rp_reps", "drop_reps"];

  const handleKey = (k: string) => {
    const current = getCurrent();
    const setter = getSetter();
    if (k === "back") { setter(current.slice(0, -1)); return; }
    if (k === ".") {
      if (noDecimalFields.includes(activeField)) return;
      if (current.includes(".")) return;
      setter(current === "" ? "0." : current + ".");
      return;
    }
    if (current.length >= 5) return;
    setter(current + k);
  };

  const isValid =
    weight.trim() !== "" && !isNaN(Number(weight)) &&
    reps.trim()   !== "" && !isNaN(Number(reps)) && Number(reps) > 0;

  const handleSave = () => {
    if (!isValid) return;
    const rpeNum = rpe.trim() === "" ? 0 : Number(rpe);
    onSave({
      weight: Number(weight),
      reps:   Number(reps),
      rpe:    Math.max(0, Math.min(10, rpeNum)),
      ...(isRP   && rpReps     ? { rp_reps:     Number(rpReps) }     : {}),
      ...(isDrop && dropWeight ? { drop_weight: Number(dropWeight) } : {}),
      ...(isDrop && dropReps   ? { drop_reps:   Number(dropReps) }   : {}),
    });
  };

  // Cerrar con tecla Escape.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={backdropReady ? onCancel : undefined}
    >
      <div
        className="w-full max-w-lg flex flex-col footer-safe"
        style={{
          background: "#080808",
          borderTop: "1px solid #141414",
          borderLeft: "1px solid #0e0e0e",
          borderRight: "1px solid #0e0e0e",
          borderRadius: "24px 24px 0 0",
          maxHeight: "96dvh",
          boxShadow: "0 -24px 60px rgba(0,0,0,0.8)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1" style={{ WebkitOverflowScrolling: "touch" }}>

          {/* Header */}
          <div className="flex items-start gap-3 px-5 pt-5 pb-4">
            {/* Set number badge */}
            <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--mvp-red)", boxShadow: "0 0 16px rgba(192,41,43,0.4)" }}>
              <span className="text-white text-xs font-black">{setNumber}</span>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-[10px] uppercase tracking-[0.1em] font-bold mb-0.5" style={{ color: "#333" }}>
                {targetSet.targetReps ?? "—"}
                {targetSet.targetRpe && !(targetSet.targetReps ?? "").includes("(")
                  ? ` · ${targetSet.targetRpe}` : ""}
              </p>
              <h2 className="text-base font-bold text-white leading-snug">{exerciseName}</h2>
              {coachNote && (
                <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "#555" }}>
                  <i className="ti ti-note mr-1" style={{ fontSize: 10 }} />{coachNote}
                </p>
              )}
            </div>
          </div>

          {/* Previous log reference — compact strip */}
          {previousLog && (
            <div className="mx-5 mb-3 px-4 py-2.5 rounded-xl flex items-center gap-3"
              style={{ background: "#0d0d0d", border: "1px solid #141414" }}>
              <i className="ti ti-history shrink-0" style={{ fontSize: 13, color: "#333" }} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-neutral-700 font-medium">
                  Mc{previousLog.microcycleNumber} ·{" "}
                  <span className="text-neutral-500 font-semibold">
                    {previousLog.weight} {previousLog.unit} × {previousLog.reps}
                  </span>
                  {previousLog.rpe > 0 && <span className="text-neutral-700"> · RPE {previousLog.rpe}</span>}
                </p>
              </div>
              {existingLog && (
                <span className="text-sm font-black shrink-0"
                  style={{ color: volume(existingLog) > volume(previousLog) ? "var(--mvp-red)" : "#333" }}>
                  {volume(existingLog) > volume(previousLog) ? "↑"
                    : volume(existingLog) === volume(previousLog) ? "=" : "↓"}
                </span>
              )}
            </div>
          )}

          {/* ── Unified field display — the hero element ── */}
          <div className="mx-5 mb-3 rounded-2xl overflow-hidden"
            style={{ background: "#050505", border: "1px solid #0f0f0f" }}>
            <div className="grid grid-cols-3">
              {([
                { f: "weight" as const, label: weightUnit.toUpperCase(), val: weight },
                { f: "reps"   as const, label: "REPS", val: reps },
                { f: "rpe"    as const, label: "RPE",  val: rpe  },
              ]).map(({ f, label, val }, i) => {
                const isActive = activeField === f;
                return (
                  <button key={f} onClick={() => setActiveField(f)}
                    className="flex flex-col items-center py-5 relative transition-all active:opacity-70"
                    style={{ background: isActive ? "#0c0c0c" : "transparent" }}>
                    {/* Top accent line when active */}
                    {isActive && (
                      <div className="absolute top-0 left-[20%] right-[20%] h-[2px] rounded-b-full"
                        style={{ background: "var(--mvp-red)" }} />
                    )}
                    {/* Vertical separator */}
                    {i > 0 && (
                      <div className="absolute left-0 top-[20%] bottom-[20%] w-px"
                        style={{ background: "#111" }} />
                    )}
                    <p className="text-[9px] font-black tracking-[0.12em] mb-3"
                      style={{ color: isActive ? "var(--mvp-red)" : "#1e1e1e" }}>
                      {label}
                    </p>
                    <p className="tabular-nums font-black leading-none"
                      style={{
                        fontSize: 44,
                        color: isActive ? "#ffffff" : "#161616",
                        letterSpacing: "-0.02em",
                      }}>
                      {val || "–"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extra fields: R&P */}
          {isRP && (
            <div className="mx-5 mb-3">
              <p className="text-[9px] uppercase tracking-[0.1em] font-bold mb-2 px-1" style={{ color: "#333" }}>
                <i className="ti ti-repeat mr-1" style={{ fontSize: 9 }} />Rest &amp; Pause — última serie
              </p>
              <FieldTabSmall label="Reps extra" value={rpReps} active={activeField === "rp_reps"} onClick={() => setActiveField("rp_reps")} />
            </div>
          )}

          {/* Extra fields: Drop Set */}
          {isDrop && (
            <div className="mx-5 mb-3">
              <p className="text-[9px] uppercase tracking-[0.1em] font-bold mb-2 px-1" style={{ color: "#333" }}>
                <i className="ti ti-trending-down mr-1" style={{ fontSize: 9 }} />Drop Set
              </p>
              <div className="grid grid-cols-2 gap-2">
                <FieldTabSmall label={`Peso drop`} value={dropWeight} active={activeField === "drop_weight"} onClick={() => setActiveField("drop_weight")} />
                <FieldTabSmall label="Reps drop" value={dropReps} active={activeField === "drop_reps"} onClick={() => setActiveField("drop_reps")} />
              </div>
            </div>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2 px-5 pb-3">
            {["1","2","3","4","5","6","7","8","9"].map((k) => (
              <NumKey key={k} label={k} onClick={() => handleKey(k)} />
            ))}
            <NumKey label="." onClick={() => handleKey(".")} disabled={noDecimalFields.includes(activeField)} />
            <NumKey label="0" onClick={() => handleKey("0")} />
            <NumKey isBack onClick={() => handleKey("back")} />
          </div>

        </div>

        {/* Action buttons */}
        <div className="shrink-0 flex gap-2 px-5 pb-2 pt-2" style={{ borderTop: "1px solid #0e0e0e" }}>
          {existingLog && onDelete && (
            <button onClick={onDelete}
              className="px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: "rgba(192,41,43,0.08)", border: "1px solid rgba(192,41,43,0.15)", color: "#c0292b" }}>
              Borrar
            </button>
          )}
          <button onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-95"
            style={{ background: "#111", border: "1px solid #1a1a1a", color: "#555" }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!isValid}
            className="flex-1 py-3.5 rounded-2xl text-sm font-black transition-all active:scale-95 disabled:opacity-20"
            style={{ background: isValid ? "var(--mvp-red)" : "#222", color: "#fff",
              boxShadow: isValid ? "0 4px 20px rgba(192,41,43,0.35)" : "none" }}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// Compact tab for R&P / Drop Set extra fields
function FieldTabSmall({
  label, value, active, onClick,
}: { label: string; value: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full rounded-xl px-3 py-3 text-center transition-all active:opacity-70"
      style={active
        ? { background: "#0c0c0c", border: "1px solid var(--mvp-red-border)" }
        : { background: "#060606", border: "1px solid #111" }}>
      <p className="text-[9px] uppercase tracking-wider font-bold mb-1"
        style={{ color: active ? "var(--mvp-red)" : "#1e1e1e" }}>{label}</p>
      <p className="text-2xl font-black tabular-nums"
        style={{ color: active ? "#fff" : "#222" }}>{value || "–"}</p>
    </button>
  );
}

function NumKey({
  label, onClick, disabled, isBack,
}: {
  label?: string;
  onClick: () => void;
  disabled?: boolean;
  isBack?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="py-6 rounded-2xl font-semibold text-white transition-all active:scale-95 disabled:opacity-20"
      style={{
        background: "#0c0c0c",
        border: "1px solid #141414",
        fontSize: isBack ? undefined : 26,
        letterSpacing: "-0.01em",
      }}>
      {isBack
        ? <i className="ti ti-backspace" style={{ fontSize: 22, color: "#666" }} />
        : label}
    </button>
  );
}
