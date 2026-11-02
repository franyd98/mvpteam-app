// Decide en qué día y microciclo abrir la app para retomar donde lo dejó el cliente.
//
// Día:
//   · Si hoy ya ha registrado algo → ese día (sesión en curso).
//   · Si no → el SIGUIENTE día del programa tras el último que entrenó.
//   · Sin registros → el primer día.
// Microciclo de un día:
//   · El último microciclo con registros en ese día, si se entrenó HOY.
//   · Si se entrenó otro día anterior → el siguiente microciclo.
//   · Sin registros en ese día → Mc 1.

import type { Program, SetLog } from "../types";

/** Fecha local YYYY-MM-DD (no UTC: a las 00:30 en España sigue siendo "hoy"). */
export function localDay(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function currentMicrocycleForDay(
  program: Program,
  logs: SetLog[],
  dayId: string,
  isLocked: (dayId: string, mcNum: number) => boolean,
  today: string = localDay(new Date()),
): number {
  const day = program.days.find(d => d.id === dayId);
  if (!day || day.microcycles.length === 0) return 1;
  const mcNumbers = day.microcycles.map(m => m.number).sort((a, b) => a - b);

  const dayLogs = logs.filter(l => l.dayId === dayId);
  if (dayLogs.length === 0) return mcNumbers[0];

  const lastMc = Math.max(...dayLogs.map(l => l.microcycleNumber));
  const mcLogs = dayLogs.filter(l => l.microcycleNumber === lastMc);
  const lastDate = mcLogs.reduce((max, l) => (localDay(l.loggedAt) > max ? localDay(l.loggedAt) : max), "");

  // Entrenado hoy → quedarse (sesión en curso o recién terminada: que vea lo que hizo).
  // Entrenado otro día → esa sesión ya pasó: toca el siguiente microciclo.
  if (lastDate >= today) return lastMc;
  const next = mcNumbers.find(n => n > lastMc);
  return next ?? lastMc; // era el último microciclo del bloque: quedarse en él
}

export function resumePosition(
  program: Program,
  logs: SetLog[],
  isLocked: (dayId: string, mcNum: number) => boolean,
  today: string = localDay(new Date()),
): { dayId: string; microcycleNumber: number } | null {
  const days = [...program.days].sort((a, b) => a.order - b.order);
  if (days.length === 0) return null;

  const dayIds = new Set(days.map(d => d.id));
  const relevant = logs.filter(l => dayIds.has(l.dayId));

  let dayId = days[0].id;
  if (relevant.length > 0) {
    const last = relevant.reduce((a, b) => (b.loggedAt > a.loggedAt ? b : a));
    if (localDay(last.loggedAt) === today) {
      dayId = last.dayId;
    } else {
      const idx = days.findIndex(d => d.id === last.dayId);
      dayId = days[(idx + 1) % days.length].id;
    }
  }
  return { dayId, microcycleNumber: currentMicrocycleForDay(program, logs, dayId, isLocked, today) };
}
