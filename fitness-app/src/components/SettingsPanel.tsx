// Mini-panel de ajustes.
// - Unidad de peso (kg/lb)
// - Duración por defecto del cronómetro de descanso
// - Auto-arranque del cronómetro al guardar una serie

import type { Settings, WeightUnit } from "../types";

type Props = {
  settings: Settings;
  onChange: (next: Settings) => void;
  onClose: () => void;
};

// Opciones predefinidas para el menú de descanso.
const REST_OPTIONS: { label: string; seconds: number }[] = [
  { label: "1:00", seconds: 60 },
  { label: "1:30", seconds: 90 },
  { label: "2:00", seconds: 120 },
  { label: "2:30", seconds: 150 },
  { label: "3:00", seconds: 180 },
  { label: "4:00", seconds: 240 },
];

export default function SettingsPanel({ settings, onChange, onClose }: Props) {
  const setUnit = (unit: WeightUnit) =>
    onChange({ ...settings, weightUnit: unit });
  const setRest = (seconds: number) =>
    onChange({ ...settings, restSeconds: seconds });
  const toggleAutoStart = () =>
    onChange({ ...settings, autoStartRestTimer: !settings.autoStartRestTimer });

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-4 py-4 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-neutral-900">
          <h2 className="text-lg font-semibold text-white">Ajustes</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-2xl leading-none px-2"
          >
            ×
          </button>
        </header>

        <div className="p-4 space-y-6">
          {/* === Unidad de peso === */}
          <section>
            <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
              Unidad de peso
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setUnit("kg")}
                className={
                  "flex-1 py-3 rounded-xl text-sm font-medium transition-colors " +
                  (settings.weightUnit === "kg"
                    ? "bg-white text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700")
                }
              >
                Kilogramos (kg)
              </button>
              <button
                onClick={() => setUnit("lb")}
                className={
                  "flex-1 py-3 rounded-xl text-sm font-medium transition-colors " +
                  (settings.weightUnit === "lb"
                    ? "bg-white text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700")
                }
              >
                Libras (lb)
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Solo cambia la etiqueta y la unidad por defecto al registrar. Los
              registros antiguos conservan la unidad con la que se guardaron.
            </p>
          </section>

          {/* === Descanso por defecto === */}
          <section>
            <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
              Descanso por defecto entre series
            </p>
            <div className="grid grid-cols-3 gap-2">
              {REST_OPTIONS.map((opt) => (
                <button
                  key={opt.seconds}
                  onClick={() => setRest(opt.seconds)}
                  className={
                    "py-3 rounded-xl text-sm font-medium tabular-nums transition-colors " +
                    (settings.restSeconds === opt.seconds
                      ? "bg-white text-black"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700")
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* === Auto-arranque === */}
          <section>
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-white">
                  Arrancar cronómetro al guardar
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Si lo desactivas, podrás arrancarlo manualmente más adelante.
                </p>
              </div>
              <button
                onClick={toggleAutoStart}
                className={
                  "w-12 h-7 rounded-full transition-colors flex-shrink-0 relative " +
                  (settings.autoStartRestTimer
                    ? "bg-emerald-500"
                    : "bg-neutral-700")
                }
                role="switch"
                aria-checked={settings.autoStartRestTimer}
              >
                <span
                  className={
                    "absolute top-1 w-5 h-5 rounded-full bg-white transition-all " +
                    (settings.autoStartRestTimer ? "left-6" : "left-1")
                  }
                />
              </button>
            </label>
          </section>
        </div>

        <footer className="px-4 py-3 border-t border-neutral-800 bg-neutral-950 sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-bold bg-white text-black"
          >
            Hecho
          </button>
        </footer>
      </div>
    </div>
  );
}
