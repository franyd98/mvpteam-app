// Días marcados (entrenado/descanso) y cambios de ejercicio del cliente en Supabase.
//
// · El móvil sigue guardando una copia local (abre al instante y sin cobertura).
// · Supabase es la copia buena: sobrevive a cambiar de móvil y el coach la ve.
// · Si las tablas aún no existen (no se ha ejecutado fase4_tablas_cliente.sql),
//   se detecta en la primera lectura y NO se intenta escribir (sin avisos de error).

import { supabase } from "./supabase";

export type Sub = { name: string; muscleGroup: string; videoRef?: string | null };
export type DayStatus = "trained" | "rest";

type Availability = "unknown" | "yes" | "no";
const available: Record<"marks" | "subs", Availability> = { marks: "unknown", subs: "unknown" };

function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "42P01" || error.code === "PGRST205"
    || /does not exist|could not find the table/i.test(error.message ?? "");
}

// ── Días marcados ────────────────────────────────────────────────────

export async function fetchDayMarks(clientId: string):
  Promise<{ ok: true; marks: Map<string, DayStatus> } | { ok: false }> {
  const { data, error } = await supabase
    .from("client_day_marks").select("day, status").eq("client_id", clientId);
  if (error) {
    if (isMissingTable(error)) available.marks = "no";
    return { ok: false };
  }
  available.marks = "yes";
  return { ok: true, marks: new Map((data ?? []).map((r: any) => [String(r.day), r.status as DayStatus])) };
}

export async function saveDayMark(clientId: string, day: string, status: DayStatus | null): Promise<void> {
  if (available.marks !== "yes") return;
  if (status) {
    await supabase.from("client_day_marks").upsert(
      { client_id: clientId, day, status, updated_at: new Date().toISOString() },
      { onConflict: "client_id,day" });
  } else {
    await supabase.from("client_day_marks").delete().eq("client_id", clientId).eq("day", day);
  }
}

// ── Cambios de ejercicio ─────────────────────────────────────────────

export async function fetchSubs(clientId: string):
  Promise<{ ok: true; subs: Map<number, Sub> } | { ok: false }> {
  const { data, error } = await supabase
    .from("client_substitutions")
    .select("microcycle_exercise_id, name, muscle_group, video_ref")
    .eq("client_id", clientId);
  if (error) {
    if (isMissingTable(error)) available.subs = "no";
    return { ok: false };
  }
  available.subs = "yes";
  return {
    ok: true,
    subs: new Map((data ?? []).map((r: any) => [
      Number(r.microcycle_exercise_id),
      { name: r.name, muscleGroup: r.muscle_group ?? "", videoRef: r.video_ref ?? null },
    ])),
  };
}

export async function saveSub(clientId: string, meId: number, sub: Sub | null): Promise<void> {
  if (available.subs !== "yes") return;
  if (sub) {
    await supabase.from("client_substitutions").upsert(
      { client_id: clientId, microcycle_exercise_id: meId, name: sub.name,
        muscle_group: sub.muscleGroup, video_ref: sub.videoRef ?? null, updated_at: new Date().toISOString() },
      { onConflict: "client_id,microcycle_exercise_id" });
  } else {
    await supabase.from("client_substitutions").delete()
      .eq("client_id", clientId).eq("microcycle_exercise_id", meId);
  }
}
