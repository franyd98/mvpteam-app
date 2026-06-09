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
  const isRP   = allNotes.includes("r&p");
  const isDrop = allNotes.includes("drop") || allNotes.includes("ds últ");

  // Estados principales
  const [weight, setWeight] = useState<string>(existingLog ? String(existingLog.weight) : "");
  const [reps,   setReps]   = useState<string>(existingLog ? String(existingLog.reps)   : "");
  const [rpe,    setRpe]    = useState<string>(existingLog ? String(existingLog.rpe ?? "") : "");
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
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center"
      onClick={backdropReady ? onCancel : undefined}
    >
      {/* Modal: flex column para que los botones queden siempre visibles abajo */}
      <div
        className="bg-neutral-900 w-full max-w-lg rounded-t-2xl border border-neutral-800 shadow-2xl flex flex-col max-h-[95dvh] footer-safe"
        onClick={(e) => e.stopPropagation()}
      >
          {/* Parte scrollable: cabecera + historial + campos + teclado */}
          <div className="overflow-y-auto flex-1" style={{ WebkitOverflowScrolling: "touch" }}>

            {/* Cabecera */}
            <header className="px-4 pt-4 pb-3 border-b border-neutral-800">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                Serie {setNumber} · Objetivo: {targetSet.targetReps ?? "-"}
              </p>
              <h2 className="text-sm font-semibold text-white">
                {exerciseName}
              </h2>
              {coachNote && (
                <p className="mt-1 text-xs text-amber-400 leading-snug">
                  📝 {coachNote}
                </p>
              )}
            </header>

            {/* Banner historial */}
            {previousLog && (
              <div className="px-4 py-2 bg-blue-950/40 border-b border-blue-900/30 flex items-center gap-2">
                <span className="text-blue-400">📊</span>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-blue-500">
                    Mc {previousLog.microcycleNumber} — referencia
                  </p>
                  <p className="text-xs font-semibold text-blue-200">
                    {previousLog.weight} {previousLog.unit} × {previousLog.reps} reps
                    {previousLog.rpe > 0 && <span className="ml-2 text-blue-400 font-normal">· RPE {previousLog.rpe}</span>}
                  </p>
                </div>
                {existingLog && (
                  <span className="ml-auto text-base font-bold">
                    {volume(existingLog) > volume(previousLog) ? <span className="text-emerald-400">↑</span>
                      : volume(existingLog) === volume(previousLog) ? <span className="text-yellow-400">=</span>
                      : <span className="text-red-400">↓</span>}
                  </span>
                )}
              </div>
            )}

            {/* Pestañas principales */}
            <div className="grid grid-cols-3 gap-2 p-3 pb-2">
              <FieldTab label={`Peso (${weightUnit})`} value={weight} active={activeField === "weight"} onClick={() => setActiveField("weight")} />
              <FieldTab label="Reps" value={reps} active={activeField === "reps"} onClick={() => setActiveField("reps")} />
              <FieldTab label="RPE" value={rpe} active={activeField === "rpe"} onClick={() => setActiveField("rpe")} />
            </div>

            {/* Tabs extra: R&P Última Serie */}
            {isRP && (
              <div className="px-3 pb-2">
                <p className="text-[9px] uppercase tracking-widest text-amber-500 mb-1 px-1">🔁 Rest &amp; Pause — última serie</p>
                <div className="grid grid-cols-1 gap-1.5">
                  <FieldTabSmall label="Reps extra (R&P)" value={rpReps} active={activeField === "rp_reps"} onClick={() => setActiveField("rp_reps")} />
                </div>
              </div>
            )}

            {/* Tabs extra: Drop Set */}
            {isDrop && (
              <div className="px-3 pb-2">
                <p className="text-[9px] uppercase tracking-widest text-purple-400 mb-1 px-1">📉 Drop Set</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <FieldTabSmall label={`Peso drop (${weightUnit})`} value={dropWeight} active={activeField === "drop_weight"} onClick={() => setActiveField("drop_weight")} />
                  <FieldTabSmall label="Reps drop" value={dropReps} active={activeField === "drop_reps"} onClick={() => setActiveField("drop_reps")} />
                </div>
              </div>
            )}

            {/* Teclado numérico */}
            <div className="grid grid-cols-3 gap-1.5 p-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
                <Key key={k} label={k} onClick={() => handleKey(k)} />
              ))}
              <Key label="." onClick={() => handleKey(".")} disabled={activeField === "reps"} />
              <Key label="0" onClick={() => handleKey("0")} />
              <Key label="⌫" onClick={() => handleKey("back")} />
            </div>

          </div>

          {/* Botones — siempre visibles en la parte inferior, fuera del scroll */}
          <div className="shrink-0 flex gap-2 p-3 border-t border-neutral-800 bg-neutral-950">
            {existingLog && onDelete && (
              <button onClick={onDelete} className="px-3 py-3 rounded-xl text-sm font-medium bg-red-950 text-red-300 hover:bg-red-900">Borrar</button>
            )}
            <button onClick={onCancel} className="flex-1 py-3 rounded-xl text-sm font-medium bg-neutral-800 text-neutral-300 hover:bg-neutral-700">Cancelar</button>
            <button onClick={handleSave} disabled={!isValid} className="flex-1 py-3 rounded-xl text-sm font-bold bg-white text-black disabled:opacity-30 disabled:cursor-not-allowed">Guardar</button>
          </div>
      </div>
    </div>
  );
}

function FieldTab({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-xl px-2 py-3.5 text-center transition-colors active:scale-95 " +
        (active
          ? "bg-white text-black"
          : "bg-neutral-800 text-neutral-300 active:bg-neutral-700")
      }
    >
      <p className="text-[10px] uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-0.5 tabular-nums min-h-[2rem]">
        {value || "—"}
      </p>
    </button>
  );
}

// Tab compacto para campos extra (R&P / Drop Set)
function FieldTabSmall({
  label, value, active, onClick,
}: { label: string; value: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-xl px-2 py-2 text-center transition-colors active:scale-95 " +
        (active ? "bg-white text-black" : "bg-neutral-800 text-neutral-300 active:bg-neutral-700")
      }
    >
      <p className="text-[9px] uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-lg font-bold mt-0.5 tabular-nums min-h-[1.4rem]">
        {value || "—"}
      </p>
    </button>
  );
}

function Key({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="py-5 rounded-xl text-2xl font-medium bg-neutral-800 text-white active:bg-neutral-600 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-transform"
    >
      {label}
    </button>
  );
}
