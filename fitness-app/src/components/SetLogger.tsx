// Panel modal con teclado numérico grande para registrar una serie.
// Inspirado en Hevy / Strong: pestañas Peso / Reps / RPE, teclado numpad.

import { useEffect, useState } from "react";
import type { ExerciseSet, SetLog, WeightUnit } from "../types";

// Calcula el volumen (peso × reps) para comparar progresión.
function volume(log: SetLog): number {
  return log.weight * log.reps;
}

type Field = "weight" | "reps" | "rpe";

type Props = {
  exerciseName: string;
  coachNote?: string | null;
  targetSet: ExerciseSet;
  setNumber: number;
  weightUnit: WeightUnit;
  // Si la serie ya estaba registrada en el microciclo actual, lo pasamos para precargar.
  existingLog?: SetLog;
  // Log del microciclo anterior (para mostrar referencia histórica).
  previousLog?: SetLog;
  // Callback cuando el usuario guarda.
  onSave: (data: { weight: number; reps: number; rpe: number }) => void;
  // Callback cuando el usuario cierra sin guardar.
  onCancel: () => void;
  // Callback para borrar el registro existente.
  onDelete?: () => void;
};

export default function SetLogger({
  exerciseName,
  coachNote,
  targetSet,
  setNumber,
  weightUnit,
  existingLog,
  previousLog,
  onSave,
  onCancel,
  onDelete,
}: Props) {
  // Estado: tres strings para que el usuario pueda escribir con decimales sin pelearse.
  const [weight, setWeight] = useState<string>(
    existingLog ? String(existingLog.weight) : "",
  );
  const [reps, setReps] = useState<string>(
    existingLog ? String(existingLog.reps) : "",
  );
  const [rpe, setRpe] = useState<string>(
    existingLog ? String(existingLog.rpe) : "",
  );
  const [activeField, setActiveField] = useState<Field>("weight");

  // Previene el "ghost-click" en móvil: el touchend que abrió el modal
  // no debe cerrar el backdrop inmediatamente.
  const [backdropReady, setBackdropReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBackdropReady(true), 250);
    return () => clearTimeout(t);
  }, []);

  // Tecla pulsada en el teclado numérico → actualiza el campo activo.
  const handleKey = (k: string) => {
    const current = getCurrent();
    const setter = getSetter();

    if (k === "back") {
      setter(current.slice(0, -1));
      return;
    }
    if (k === ".") {
      // Solo válido en peso y RPE, no en reps.
      if (activeField === "reps") return;
      if (current.includes(".")) return;
      setter(current === "" ? "0." : current + ".");
      return;
    }
    // Dígito 0-9
    // Limitamos longitud para que no se rompa el layout.
    if (current.length >= 5) return;
    setter(current + k);
  };

  const getCurrent = (): string => {
    if (activeField === "weight") return weight;
    if (activeField === "reps") return reps;
    return rpe;
  };
  const getSetter = (): ((v: string) => void) => {
    if (activeField === "weight") return setWeight;
    if (activeField === "reps") return setReps;
    return setRpe;
  };

  // Validación: peso y reps son obligatorios; RPE opcional pero recomendado.
  const isValid =
    weight.trim() !== "" &&
    !isNaN(Number(weight)) &&
    reps.trim() !== "" &&
    !isNaN(Number(reps)) &&
    Number(reps) > 0;

  const handleSave = () => {
    if (!isValid) return;
    const rpeNum = rpe.trim() === "" ? 0 : Number(rpe);
    onSave({
      weight: Number(weight),
      reps: Number(reps),
      rpe: Math.max(0, Math.min(10, rpeNum)),
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
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={backdropReady ? onCancel : undefined}
    >
      <div
        className="bg-neutral-900 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden footer-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <header className="px-4 pt-4 pb-3 border-b border-neutral-800">
          <p className="text-[10px] uppercase tracking-wider text-neutral-500">
            Serie {setNumber} · Objetivo: {targetSet.targetReps ?? "-"}
          </p>
          <h2 className="text-base font-semibold text-white truncate">
            {exerciseName}
          </h2>
          {coachNote && (
            <p className="mt-1.5 text-xs text-amber-400 leading-snug">
              📝 {coachNote}
            </p>
          )}
        </header>

        {/* Banner historial: muestra lo del microciclo anterior si existe */}
        {previousLog && (
          <div className="px-4 py-2.5 bg-blue-950/40 border-b border-blue-900/30 flex items-center gap-2">
            <span className="text-blue-400 text-lg">📊</span>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-blue-500">
                Mc {previousLog.microcycleNumber} — referencia anterior
              </p>
              <p className="text-sm font-semibold text-blue-200">
                {previousLog.weight} {previousLog.unit} × {previousLog.reps} reps
                {previousLog.rpe > 0 && (
                  <span className="ml-2 text-blue-400 font-normal text-xs">
                    · RPE {previousLog.rpe}
                  </span>
                )}
              </p>
            </div>
            {/* Indicador de progresión si ya hay un log actual */}
            {existingLog && (
              <span className="ml-auto text-lg font-bold">
                {volume(existingLog) > volume(previousLog) ? (
                  <span className="text-emerald-400">↑</span>
                ) : volume(existingLog) === volume(previousLog) ? (
                  <span className="text-yellow-400">=</span>
                ) : (
                  <span className="text-red-400">↓</span>
                )}
              </span>
            )}
          </div>
        )}

        {/* Pestañas de campo */}
        <div className="grid grid-cols-3 gap-2 p-3">
          <FieldTab
            label={`Peso (${weightUnit})`}
            value={weight}
            active={activeField === "weight"}
            onClick={() => setActiveField("weight")}
          />
          <FieldTab
            label="Reps"
            value={reps}
            active={activeField === "reps"}
            onClick={() => setActiveField("reps")}
          />
          <FieldTab
            label="RPE"
            value={rpe}
            active={activeField === "rpe"}
            onClick={() => setActiveField("rpe")}
          />
        </div>

        {/* Teclado numérico */}
        <div className="grid grid-cols-3 gap-1.5 px-3 pb-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
            <Key key={k} label={k} onClick={() => handleKey(k)} />
          ))}
          <Key
            label="."
            onClick={() => handleKey(".")}
            disabled={activeField === "reps"}
          />
          <Key label="0" onClick={() => handleKey("0")} />
          <Key label="⌫" onClick={() => handleKey("back")} />
        </div>

        {/* Acciones */}
        <div className="flex gap-2 p-3 border-t border-neutral-800 bg-neutral-950">
          {existingLog && onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-3 rounded-xl text-sm font-medium bg-red-950 text-red-300 hover:bg-red-900"
            >
              Borrar
            </button>
          )}
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-medium bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="flex-1 py-3 rounded-xl text-sm font-bold bg-white text-black disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Guardar
          </button>
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
