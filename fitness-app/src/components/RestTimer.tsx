// Barra flotante con cronómetro de descanso.
// Aparece pegada al fondo de la pantalla cuando hay un "endAt" activo.
// Al llegar a cero: pitido (sintetizado) + vibración + barra en verde durante unos segundos.

import { useEffect, useRef, useState } from "react";

type Props = {
  // Timestamp (Date.now()) al que tiene que terminar el descanso.
  endAt: number;
  // Total inicial (para calcular el progreso visual).
  totalSeconds: number;
  // El usuario quita la barra (botón saltar, o esperar tras terminar).
  onDismiss: () => void;
  // El usuario ajusta el tiempo (delta en segundos, p.ej. +15 o -15).
  onAdjust: (deltaSeconds: number) => void;
};

export default function RestTimer({
  endAt,
  totalSeconds,
  onDismiss,
  onAdjust,
}: Props) {
  // Forzamos re-render cada 250 ms para que el contador se actualice.
  const [now, setNow] = useState<number>(Date.now());
  // Para no disparar el "ding!" más de una vez por sesión de timer.
  const finishedRef = useRef<boolean>(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  // Reseteamos el "ya he pitado" cuando cambia endAt (nueva serie).
  useEffect(() => {
    finishedRef.current = false;
  }, [endAt]);

  const remainingMs = endAt - now;
  const secondsLeft = Math.max(0, Math.ceil(remainingMs / 1000));
  const isDone = remainingMs <= 0;

  // Al cruzar el cero: pitido + vibración (una sola vez).
  useEffect(() => {
    if (isDone && !finishedRef.current) {
      finishedRef.current = true;
      playBeep();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    }
  }, [isDone]);

  // Auto-cerrar 6 segundos después de terminar (si el usuario no lo cierra antes).
  useEffect(() => {
    if (!isDone) return;
    const id = window.setTimeout(() => onDismiss(), 6000);
    return () => window.clearTimeout(id);
  }, [isDone, onDismiss]);

  // Formato mm:ss
  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;
  const timeStr = `${mm}:${ss.toString().padStart(2, "0")}`;

  // Progreso (0 a 1, va bajando)
  const progress = Math.max(0, Math.min(1, remainingMs / (totalSeconds * 1000)));

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 pointer-events-none">
      <div
        className={
          "pointer-events-auto max-w-2xl mx-auto rounded-2xl border shadow-2xl overflow-hidden transition-colors " +
          (isDone
            ? "bg-emerald-900 border-emerald-700"
            : "bg-neutral-900 border-neutral-700")
        }
      >
        {/* Barra de progreso */}
        <div
          className={
            "h-1 transition-all " +
            (isDone ? "bg-emerald-400" : "bg-white/60")
          }
          style={{ width: `${progress * 100}%` }}
        />

        <div className="flex items-center gap-2 p-3">
          {/* Tiempo grande */}
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400">
              {isDone ? "¡Descanso terminado!" : "Descanso"}
            </p>
            <p
              className={
                "text-3xl font-bold tabular-nums " +
                (isDone ? "text-emerald-200" : "text-white")
              }
            >
              {timeStr}
            </p>
          </div>

          {/* Controles de ajuste */}
          <div className="flex gap-1.5">
            <button
              onClick={() => onAdjust(-15)}
              className="w-12 h-12 rounded-xl bg-neutral-800 text-white font-medium hover:bg-neutral-700"
              title="Quitar 15 segundos"
            >
              −15
            </button>
            <button
              onClick={() => onAdjust(15)}
              className="w-12 h-12 rounded-xl bg-neutral-800 text-white font-medium hover:bg-neutral-700"
              title="Añadir 15 segundos"
            >
              +15
            </button>
            <button
              onClick={onDismiss}
              className={
                "w-12 h-12 rounded-xl font-bold transition-colors " +
                (isDone
                  ? "bg-white text-black"
                  : "bg-neutral-700 text-white hover:bg-neutral-600")
              }
              title={isDone ? "Cerrar" : "Saltar descanso"}
            >
              {isDone ? "✓" : "⤼"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Genera un pitido corto con la Web Audio API.
 * No necesita archivos: el navegador sintetiza el tono.
 */
function playBeep() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    // Doble pitido: 880Hz cortito, pausa, 880Hz.
    const playTone = (start: number, duration: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(
        0.35,
        ctx.currentTime + start + 0.02,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + start + duration,
      );
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration + 0.05);
    };
    playTone(0, 0.2, 880);
    playTone(0.3, 0.3, 1175);
  } catch {
    // Si algo falla con el audio, simplemente no suena.
  }
}
