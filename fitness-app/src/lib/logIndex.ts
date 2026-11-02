// Índice de registros y búsquedas de series registradas.
// Lógica pura (sin React ni Supabase): se puede probar con las pruebas automáticas.

import type { SetLog } from "../types";

/**
 * Índice de registros para consultas instantáneas.
 * Se construye UNA vez cada vez que cambian los logs (useMemo) en lugar de
 * recorrer y ordenar todo el historial por cada serie en cada pintado.
 * Mismo resultado que findLatestLog / findPreviousMicrocycleLog.
 */
export type LogIndex = {
  latest: (dayId: string, mc: number, exIdx: number, setNumber: number) => SetLog | undefined;
  previous: (dayId: string, mc: number, exIdx: number, setNumber: number) => SetLog | undefined;
};

export function buildLogIndex(logs: SetLog[]): LogIndex {
  // dayId:exIdx:set → registros de esa serie en cualquier microciclo, del más reciente al más antiguo
  const bySeries = new Map<string, SetLog[]>();
  // dayId:mc:exIdx:set → el más reciente
  const byExact = new Map<string, SetLog>();
  for (const l of logs) {
    const sk = `${l.dayId}:${l.exerciseIndex}:${l.setNumber}`;
    const arr = bySeries.get(sk);
    if (arr) arr.push(l); else bySeries.set(sk, [l]);
    const ek = `${l.dayId}:${l.microcycleNumber}:${l.exerciseIndex}:${l.setNumber}`;
    const cur = byExact.get(ek);
    if (!cur || l.loggedAt > cur.loggedAt) byExact.set(ek, l);
  }
  for (const arr of bySeries.values()) arr.sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
  return {
    latest: (d, mc, ex, s) => byExact.get(`${d}:${mc}:${ex}:${s}`),
    previous: (d, mc, ex, s) => bySeries.get(`${d}:${ex}:${s}`)?.find(l => l.microcycleNumber !== mc),
  };
}

export function findLatestLog(
  logs: SetLog[],
  dayId: string,
  microcycleNumber: number,
  exerciseIndex: number,
  setNumber: number,
): SetLog | undefined {
  // Filtramos los logs de esa serie y nos quedamos con el más reciente.
  const matches = logs.filter(
    (l) =>
      l.dayId === dayId &&
      l.microcycleNumber === microcycleNumber &&
      l.exerciseIndex === exerciseIndex &&
      l.setNumber === setNumber,
  );
  if (matches.length === 0) return undefined;
  // El más reciente: ordenamos por loggedAt descendente y cogemos el primero.
  return matches.sort((a, b) => b.loggedAt.localeCompare(a.loggedAt))[0];
}

/**
 * Devuelve el log más reciente de esa misma serie en cualquier microciclo
 * DISTINTO al actual. Usado para mostrar "la semana pasada hiciste X".
 */
export function findPreviousMicrocycleLog(
  logs: SetLog[],
  dayId: string,
  currentMicrocycleNumber: number,
  exerciseIndex: number,
  setNumber: number,
): SetLog | undefined {
  const matches = logs.filter(
    (l) =>
      l.dayId === dayId &&
      l.microcycleNumber !== currentMicrocycleNumber &&
      l.exerciseIndex === exerciseIndex &&
      l.setNumber === setNumber,
  );
  if (matches.length === 0) return undefined;
  // El más reciente de los anteriores microciclos.
  return matches.sort((a, b) => b.loggedAt.localeCompare(a.loggedAt))[0];
}
