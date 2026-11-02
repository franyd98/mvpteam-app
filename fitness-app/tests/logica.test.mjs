// Pruebas automáticas de la lógica clave de la app.
// Se ejecutan con `npm test` y también en cada despliegue de Vercel (npm run build):
// si alguna falla, NO se publica la versión rota.
//
// Usan el sistema de pruebas que trae Node de serie (node:test): nada que instalar.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { localDay, resumePosition, currentMicrocycleForDay } from "../.test-build/lib/resumePosition.js";
import { buildLogIndex, findLatestLog, findPreviousMicrocycleLog } from "../.test-build/lib/logIndex.js";
import { fetchAllRows } from "../.test-build/lib/fetchAll.js";
import { buildVideoFinder, fixVideoUrl, normalizeExerciseName } from "../.test-build/lib/videoMatch.js";
import { photoPath } from "../.test-build/lib/photoPath.js";

// ── Datos de prueba: programa de 4 días × 16 microciclos (como el de franvyother) ──
const mkDay = (id, order) => ({
  id, name: id, order, optional: false,
  microcycles: Array.from({ length: 16 }, (_, i) => ({
    number: i + 1,
    exercises: [{ sets: [{ number: 1 }, { number: 2 }] }, { sets: [{ number: 1 }, { number: 2 }] }],
  })),
});
const PROGRAM = { programName: "", description: "", days: [mkDay("Empuje", 0), mkDay("Tiron", 1), mkDay("Pierna", 2), mkDay("Torso", 3)] };
const L = (d, mc, ex, s, date, extra = {}) => ({
  dayId: d, microcycleNumber: mc, exerciseIndex: ex, setNumber: s,
  loggedAt: `${date}T10:00:00`, weight: 20, reps: 10, rpe: 8, unit: "kg", ...extra,
});
const full = (d, mc, date) => [L(d, mc, 0, 1, date), L(d, mc, 0, 2, date), L(d, mc, 1, 1, date), L(d, mc, 1, 2, date)];
const noLock = () => false;
const TODAY = "2026-11-05";

// ── Retomar día y microciclo donde lo dejó el cliente ──────────────────
test("cliente nuevo abre en el primer día, Mc1", () => {
  assert.deepEqual(resumePosition(PROGRAM, [], noLock, TODAY), { dayId: "Empuje", microcycleNumber: 1 });
});
test("ayer hizo Empuje Mc5 → hoy toca Tirón Mc5", () => {
  const logs = [...full("Tiron", 4, "2026-10-30"), ...full("Empuje", 5, "2026-11-04")];
  assert.deepEqual(resumePosition(PROGRAM, logs, noLock, TODAY), { dayId: "Tiron", microcycleNumber: 5 });
});
test("hoy está a mitad de Tirón Mc5 → sigue en Tirón Mc5", () => {
  const logs = [...full("Tiron", 4, "2026-10-30"), L("Tiron", 5, 0, 1, TODAY)];
  assert.deepEqual(resumePosition(PROGRAM, logs, noLock, TODAY), { dayId: "Tiron", microcycleNumber: 5 });
});
test("hoy terminó Tirón Mc5 → se queda en Mc5 para ver lo que hizo", () => {
  const logs = [...full("Empuje", 5, "2026-11-04"), ...full("Tiron", 5, TODAY)];
  assert.deepEqual(resumePosition(PROGRAM, logs, noLock, TODAY), { dayId: "Tiron", microcycleNumber: 5 });
});
test("lo último fue Torso Mc5 → vuelve a Empuje Mc6", () => {
  const logs = [...full("Empuje", 5, "2026-11-01"), ...full("Torso", 5, "2026-11-04")];
  assert.deepEqual(resumePosition(PROGRAM, logs, noLock, TODAY), { dayId: "Empuje", microcycleNumber: 6 });
});
test("en el último microciclo del bloque no se pasa de 16", () => {
  assert.equal(currentMicrocycleForDay(PROGRAM, full("Pierna", 16, "2026-10-01"), "Pierna", noLock, TODAY), 16);
});

// ── Fechas en hora local (antes UTC: de 00:00 a 02:00 marcaba el día anterior) ──
test("localDay devuelve la fecha local, no la UTC", () => {
  const d = new Date(2026, 10, 5, 0, 30); // 5 nov 00:30 hora local
  assert.equal(localDay(d), "2026-11-05");
});

// ── Índice de registros: mismo resultado que la búsqueda antigua ────────
test("el índice de registros da exactamente lo mismo que la búsqueda antigua", () => {
  const logs = [];
  const days = ["A", "B", "C", "D"];
  const t0 = Date.parse("2026-07-01T00:00:00Z");
  for (let i = 0; i < 2200; i++) {
    logs.push({ dayId: days[i % 4], microcycleNumber: 1 + (i % 16), exerciseIndex: i % 10, setNumber: 1 + (i % 5),
                loggedAt: new Date(t0 + i * 3.6e6 + (i % 7) * 1000).toISOString() });
  }
  const idx = buildLogIndex(logs);
  for (const d of days) for (let mc = 1; mc <= 16; mc++) for (let e = 0; e < 10; e++) for (let s = 1; s <= 5; s++) {
    assert.equal(idx.latest(d, mc, e, s), findLatestLog(logs, d, mc, e, s));
    assert.equal(idx.previous(d, mc, e, s), findPreviousMicrocycleLog(logs, d, mc, e, s));
  }
});

// ── Carga por tandas (Supabase corta en 1.000 filas por petición) ───────
for (const total of [0, 999, 1000, 1001, 2187]) {
  test(`fetchAllRows trae las ${total} filas sin perder ninguna`, async () => {
    const db = Array.from({ length: total }, (_, i) => i);
    const r = await fetchAllRows(async (from, to) => ({ data: db.slice(from, to + 1), error: null }));
    assert.equal(r.error, null);
    assert.deepEqual(r.data, db);
  });
}
test("fetchAllRows devuelve el error si una tanda falla", async () => {
  let n = 0;
  const r = await fetchAllRows(async () => (++n === 2
    ? { data: null, error: { message: "red" } }
    : { data: Array(1000).fill(0), error: null }));
  assert.equal(r.error?.message, "red");
});

// ── Vídeos: encontrar el vídeo aunque el nombre esté escrito distinto ───
const catalog = JSON.parse(readFileSync(new URL("../src/data/videoCatalog.json", import.meta.url), "utf8"));
const findVideo = buildVideoFinder(catalog);
for (const name of [
  "Press banca plano libre",
  "Press banca inclinado a 45º libre",
  "Fondos en máquina de placas",
  "Six way con mancuernas de pie",
  "Peso muerto rumano con barra libre",
  "Curl de bíceps banco Scott Barra Z",
]) {
  test(`vídeo encontrado: ${name}`, () => assert.match(findVideo(name) ?? "", /^https:\/\/www\.youtube\.com\//));
}
test("Abductor y Aductor tienen vídeos distintos (no se confunden)", () => {
  assert.notEqual(findVideo("Abductor sentado en máquina"), findVideo("Aductor sentado en máquina"));
});
for (const name of ["Escaleras", "Flexiones inclinadas", "Dominadas asistidas con goma"]) {
  test(`sin vídeo inventado: ${name}`, () => assert.equal(findVideo(name), null));
}
test("normaliza mayúsculas, acentos, º/° y prefijos", () => {
  assert.equal(normalizeExerciseName("TRí- Fondos en Máquina"), normalizeExerciseName("fondos en maquina"));
  assert.equal(normalizeExerciseName("Press 45º"), normalizeExerciseName("PRESS 45°"));
});
test("arregla enlaces de YouTube sin https://", () => {
  assert.equal(fixVideoUrl("youtu.be/abc"), "https://youtu.be/abc");
  assert.equal(fixVideoUrl("-"), null);
});

// ── Fotos: ruta del archivo a partir de cualquier enlace guardado ───────
test("ruta de la foto desde enlace público, firmado o ruta directa", () => {
  const B = "https://x.supabase.co/storage/v1/object";
  assert.equal(photoPath(`${B}/public/checkin-photos/uid/1.jpg`), "uid/1.jpg");
  assert.equal(photoPath(`${B}/sign/checkin-photos/uid/1.jpg?token=abc`), "uid/1.jpg");
  assert.equal(photoPath("uid/1.jpg"), "uid/1.jpg");
  assert.equal(photoPath("https://otra-web.com/foto.jpg"), null);
});
