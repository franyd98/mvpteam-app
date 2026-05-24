// Pequeña capa para guardar/leer datos del localStorage del navegador.
// localStorage = pequeña memoria del navegador (texto plano, hasta ~5MB).
// Si el usuario borra los datos del navegador, esto se pierde. En Fase 5 lo migraremos a nube.

import { useEffect, useState } from "react";
import type { SetLog, Settings } from "./types";

// "Claves" donde guardamos cada cosa. Prefijo común para no chocar con otras apps.
const LOGS_KEY = "fitness-app:logs";
const SETTINGS_KEY = "fitness-app:settings";

const DEFAULT_SETTINGS: Settings = {
  weightUnit: "kg",
  restSeconds: 150, // 2:30 por defecto
  autoStartRestTimer: true,
};

// === Funciones puras (no React) para leer/escribir ===

export function loadLogs(): SetLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Si el JSON está corrupto, empezamos vacío en vez de romper la app.
    return [];
  }
}

export function saveLogs(logs: SetLog[]): void {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    // Hacemos merge con DEFAULT_SETTINGS para que campos nuevos tengan valor por defecto.
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// === Hooks de React: "useState" que se autosincroniza con localStorage ===

/**
 * Hook genérico: comportamiento de useState, pero el valor se guarda en localStorage
 * cada vez que cambia. Al recargar la página, se recupera.
 */
function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  loader: () => T,
): [T, (v: T | ((prev: T) => T)) => void] {
  // Inicialización perezosa: lee localStorage solo en el primer render.
  const [state, setState] = useState<T>(() => loader());

  // Cuando cambia el estado, lo persistimos en localStorage.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // localStorage podría estar lleno o deshabilitado; ignoramos en silencio.
    }
  }, [key, state]);

  return [state, setState];
}

export function useLogs() {
  return useLocalStorageState<SetLog[]>(LOGS_KEY, [], loadLogs);
}

export function useSettings() {
  return useLocalStorageState<Settings>(
    SETTINGS_KEY,
    DEFAULT_SETTINGS,
    loadSettings,
  );
}

// === Helpers de búsqueda ===

/**
 * Devuelve el último log de una serie concreta, si existe.
 * Usado para mostrar "última vez que hiciste esta serie".
 */
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
