// Aquí definimos las "formas" (tipos) de los datos que maneja la app.
// TypeScript usa esto para avisarnos si por error pasamos el dato equivocado.

// === Datos del programa (plantilla pautada por el entrenador) ===

export type ExerciseSet = {
  number: number;
  targetReps: string | null; // ej. "8 a 10 (0)" → rango con RIR pautado entre paréntesis
  targetWeight: string | null;
  targetRpe: string | null;
};

export type Exercise = {
  muscleGroup: string;
  name: string;
  videoRef: string | null;
  coachNote: string | null;
  sets: ExerciseSet[];
  totalSets: number;
  note: string | null;
};

export type Microcycle = {
  number: number;
  exercises: Exercise[];
};

export type Day = {
  id: string;
  name: string;
  order: number;
  optional: boolean;
  microcycles: Microcycle[];
};

export type Program = {
  programName: string;
  description: string;
  days: Day[];
};

// === Datos que registra el usuario ===

export type WeightUnit = "kg" | "lb";

export type SetLog = {
  // Identificador único de qué serie es: día + microciclo + índice del ejercicio + nº serie
  dayId: string;
  microcycleNumber: number;
  exerciseIndex: number;
  setNumber: number;

  // Lo que el usuario ha registrado
  weight: number;
  reps: number;
  rpe: number; // 0-10
  unit: WeightUnit;

  // Cuándo se registró
  loggedAt: string; // ISO timestamp
};

export type Settings = {
  weightUnit: WeightUnit;
  // Cronómetro de descanso (Fase 3)
  restSeconds: number; // duración por defecto en segundos
  autoStartRestTimer: boolean; // ¿arranca solo al guardar una serie?
};

// Helper para construir la "key" única de una serie (la usamos como id).
export function setKey(
  dayId: string,
  microcycleNumber: number,
  exerciseIndex: number,
  setNumber: number,
): string {
  return `${dayId}|${microcycleNumber}|${exerciseIndex}|${setNumber}`;
}
