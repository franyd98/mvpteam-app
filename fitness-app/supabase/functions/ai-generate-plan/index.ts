// ai-generate-plan — Supabase Edge Function v2
// Macros pre-calculados con Mifflin-St Jeor (igual que MacroCalculator).
// Claude recibe datos reales del cuerpo y solo diseña comidas + entreno.
//
// Env vars requeridas: ANTHROPIC_API_KEY · SUPABASE_URL · SUPABASE_SERVICE_ROLE_KEY

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Fórmula Mifflin-St Jeor (idéntica a MacroCalculator.tsx) ─────────────────
function calcBMR(sex: string, weight: number, height: number, age: number): number {
  if (sex === "female") return 10 * weight + 6.25 * height - 5 * age - 161;
  return 10 * weight + 6.25 * height - 5 * age + 5;
}

const GOAL_ADJUSTMENT: Record<string, number> = {
  lose_fat_aggressive: -0.20,
  lose_fat:            -0.15,
  lose_fat_soft:       -0.10,
  maintain:             0.00,
  gain_muscle:         +0.05,
  bulk:                +0.10,
};

// Proteína más alta en déficit (preservar músculo)
const PROTEIN_PER_KG: Record<string, number> = {
  lose_fat_aggressive: 2.4,
  lose_fat:            2.2,
  lose_fat_soft:       2.1,
  maintain:            2.0,
  gain_muscle:         1.9,
  bulk:                1.8,
};

// Grasa conservadora según objetivo
const FAT_PER_KG: Record<string, number> = {
  lose_fat_aggressive: 0.65,
  lose_fat:            0.70,
  lose_fat_soft:       0.80,
  maintain:            0.90,
  gain_muscle:         1.00,
  bulk:                1.10,
};

interface Macros {
  bmr: number; tdee: number;
  kcal_on: number; kcal_off: number;
  protein_g: number; fat_g: number;
  carbs_on_g: number; carbs_off_g: number;
}

function calcMacros(
  sex: string, weight: number, height: number,
  age: number, activityFactor: number, goal: string
): Macros {
  const bmr  = Math.round(calcBMR(sex, weight, height, age));
  const tdee = Math.round(bmr * activityFactor);
  const adj  = GOAL_ADJUSTMENT[goal] ?? 0;

  const kcal_on  = Math.round(tdee * (1 + adj));
  const kcal_off = Math.round(kcal_on * 0.87); // días descanso: −13%

  const protein_g = Math.round(weight * (PROTEIN_PER_KG[goal] ?? 2.0));
  const fat_g     = Math.round(weight * (FAT_PER_KG[goal]     ?? 0.8));

  const carbs_on_g  = Math.max(20, Math.round((kcal_on  - protein_g * 4 - fat_g * 9) / 4));
  const carbs_off_g = Math.max(20, Math.round((kcal_off - protein_g * 4 - fat_g * 9) / 4));

  return { bmr, tdee, kcal_on, kcal_off, protein_g, fat_g, carbs_on_g, carbs_off_g };
}

// ── Formatear datos de composición corporal ───────────────────────────────────
function formatBodyComposition(fold: any, perim: any, weight: number): string {
  const lines: string[] = [];

  if (fold) {
    const fatPct = fold.fat_pct_real ?? null;
    if (fatPct != null) {
      const fatMass  = Math.round(weight * fatPct / 100 * 10) / 10;
      const leanMass = Math.round((weight - fatMass) * 10) / 10;
      lines.push(`  % Grasa: ${fatPct}% | Masa grasa: ${fatMass}kg | Masa magra: ${leanMass}kg`);
    }
    const folds = [
      ["Gemelo", fold.calf], ["Cuádriceps", fold.quad], ["Abd. Baja", fold.navel],
      ["Abd. Alta", fold.abd_upper], ["Pecho", fold.chest], ["Hombro", fold.shoulder],
      ["Bíceps", fold.bicep], ["Tríceps", fold.tricep],
      ["Subescapular", fold.subscapular], ["Lumbar", fold.lumbar],
    ].filter(([, v]) => v != null).map(([n, v]) => `${n}:${v}mm`);
    if (folds.length) lines.push(`  Pliegues: ${folds.join(" | ")}`);
    if (fold.critical_abdomen) lines.push(`  Pliegue crítico abdomen: ${fold.critical_abdomen}mm`);
  }

  if (perim) {
    const perims = [
      ["Bíceps D", perim.bicep_r_r], ["Bíceps I", perim.bicep_l_r],
      ["Pecho",    perim.chest_r],   ["Espalda",  perim.back_r],
      ["Abd.",     perim.abd_navel_r],["Cadera",  perim.hip_r],
      ["Cuád. D",  perim.quad_r_r],  ["Cuád. I", perim.quad_l_r],
      ["Gemelo D", perim.calf_r_r],  ["Gemelo I", perim.calf_l_r],
    ].filter(([, v]) => v != null).map(([n, v]) => `${n}:${v}cm`);
    if (perims.length) lines.push(`  Perímetros: ${perims.join(" | ")}`);
  }

  return lines.length ? lines.join("\n") : "  Sin datos de composición corporal registrados";
}

// ── Formatear historial de entrenamiento ──────────────────────────────────────
function formatTrainingHistory(logs: any[]): string {
  if (!logs?.length) return "  Sin historial de entrenamientos registrado";

  // Agrupar por nombre de ejercicio → máx peso reciente
  const byEx: Record<string, { maxWeight: number; count: number; muscle: string }> = {};
  for (const log of logs) {
    const exName = log.exercise_sets?.microcycle_exercises?.exercises?.name;
    const muscle = log.exercise_sets?.microcycle_exercises?.exercises?.muscle_group ?? "";
    if (!exName) continue;
    if (!byEx[exName]) byEx[exName] = { maxWeight: 0, count: 0, muscle };
    byEx[exName].count++;
    if ((log.actual_weight ?? 0) > byEx[exName].maxWeight) {
      byEx[exName].maxWeight = log.actual_weight ?? 0;
    }
  }

  const entries = Object.entries(byEx).slice(0, 12);
  if (!entries.length) return "  Historial disponible pero sin nombres de ejercicio";

  return entries
    .map(([name, d]) => `  ${name} (${d.muscle}): ${d.maxWeight > 0 ? d.maxWeight + "kg max" : "peso corporal"} · ${d.count} sets`)
    .join("\n");
}

// ── Constantes de texto para el prompt ───────────────────────────────────────
const GOAL_ES: Record<string, string> = {
  lose_fat_aggressive: "Pérdida de grasa agresiva (−20%)",
  lose_fat:            "Pérdida de grasa (−15%)",
  lose_fat_soft:       "Pérdida de grasa suave (−10%)",
  maintain:            "Mantenimiento",
  gain_muscle:         "Ganancia muscular (+5%)",
  bulk:                "Volumen (+10%)",
};
const EQUIP_ES: Record<string, string> = {
  gym_full:     "Gimnasio completo",
  dumbbells:    "Pesas libres",
  home:         "Casa",
  calisthenics: "Calistenia",
};
const EXP_ES: Record<string, string> = {
  beginner:     "Principiante (<1 año)",
  intermediate: "Intermedio (1–3 años)",
  advanced:     "Avanzado (>3 años)",
};

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const {
      client_id,
      personal_data,   // { sex, age, height, weight, activity_factor, goal }
      training_prefs,  // { days_per_week, equipment, experience, injuries }
      photos,          // { front, side, back } — cada uno { base64, mime } | null
      // legacy compat
      photo_base64,
      photo_mime,
    } = await req.json();

    // Normalizar: soporte tanto el nuevo formato (photos) como el legado (photo_base64)
    const photoFront = photos?.front ?? (photo_base64 ? { base64: photo_base64, mime: photo_mime ?? "image/jpeg" } : null);
    const photoSide  = photos?.side  ?? null;
    const photoBack  = photos?.back  ?? null;
    const anyPhoto   = photoFront ?? photoSide ?? photoBack;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { sex, age, height, weight, activity_factor, goal } = personal_data;
    const { days_per_week, equipment, experience, injuries } = training_prefs;

    // ── 1. Calcular macros matemáticamente ─────────────────────────────────
    const macros = calcMacros(sex, weight, height, age, activity_factor, goal);

    // ── 2. Fetch datos del cliente en paralelo ──────────────────────────────
    const [
      { data: profile },
      { data: exercises },
      { data: lastFold },
      { data: lastPerim },
      { data: recentLogs },
    ] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", client_id).single(),

      supabase.from("exercises").select("id, name, muscle_group").order("muscle_group"),

      supabase.from("fold_logs")
        .select("fat_pct_real, critical_abdomen, critical_lumbar, calf, quad, navel, abd_upper, chest, shoulder, bicep, tricep, subscapular, lumbar")
        .eq("client_id", client_id)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase.from("perimeter_logs")
        .select("bicep_r_r, bicep_l_r, chest_r, back_r, abd_navel_r, hip_r, quad_r_r, quad_l_r, calf_r_r, calf_l_r")
        .eq("client_id", client_id)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase.from("set_logs")
        .select(`
          actual_weight, actual_reps, logged_at,
          exercise_sets (
            microcycle_exercises (
              exercises ( name, muscle_group )
            )
          )
        `)
        .eq("client_id", client_id)
        .order("logged_at", { ascending: false })
        .limit(150),
    ]);

    // ── 3. Agrupar ejercicios por músculo (máx 10 por grupo) ───────────────
    const byMuscle: Record<string, string[]> = {};
    for (const ex of exercises ?? []) {
      const mg = (ex.muscle_group ?? "OTROS").toUpperCase();
      if (!byMuscle[mg]) byMuscle[mg] = [];
      if (byMuscle[mg].length < 10) byMuscle[mg].push(ex.name);
    }
    const exerciseBlock = Object.entries(byMuscle)
      .map(([mg, names]) => `  ${mg}: ${names.join(" | ")}`)
      .join("\n");

    // ── 4. Contexto corporal e historial ───────────────────────────────────
    const bodyContext  = formatBodyComposition(lastFold, lastPerim, weight);
    const trainingHist = formatTrainingHistory(recentLogs ?? []);
    const hasBodyData  = !!(lastFold?.fat_pct_real || lastPerim?.bicep_r_r || lastPerim?.chest_r);
    const hasTrainHist = (recentLogs?.length ?? 0) > 5;

    // Lean mass para personalizar el entreno (solo si hay % grasa medido)
    const fatPct = lastFold?.fat_pct_real ?? null;
    const leanKg = fatPct != null ? Math.round((weight * (1 - fatPct / 100)) * 10) / 10 : null;

    // ── Instrucción de fotos según disponibilidad ─────────────────────────
    const photoLabels = [
      photoFront ? "FRENTE" : null,
      photoSide  ? "LATERAL" : null,
      photoBack  ? "ESPALDA" : null,
    ].filter(Boolean).join(", ");

    let photoInstruction = "";
    if (anyPhoto && !hasBodyData) {
      photoInstruction =
        `IMPORTANTE — Se adjuntan fotos corporales (${photoLabels}). No hay pliegues ni perímetros registrados. ` +
        "Analiza las fotos para ESTIMAR visualmente: % grasa aproximado, distribución de grasa " +
        "(abdominal, periférica), desarrollo muscular visible por zona (hombros, pecho, brazos, piernas, " +
        "glúteos, femorales), simetría entre lados y postura. Usa esa estimación para personalizar " +
        "el entreno y el análisis. Sé específico en el campo 'analysis'.";
    } else if (anyPhoto && hasBodyData) {
      photoInstruction =
        `Se adjuntan fotos corporales (${photoLabels}) como referencia visual adicional a los datos medidos. ` +
        "Úsalas para confirmar o matizar los datos de composición corporal y detectar asimetrías o puntos débiles visuales.";
    } else if (!anyPhoto && !hasBodyData) {
      photoInstruction =
        "No hay fotos ni mediciones corporales. Basa el análisis en los datos básicos " +
        "(peso, altura, edad, objetivo, actividad) y sé conservador en las estimaciones. " +
        "En 'analysis' indica que sería útil subir fotos de frente y lateral para personalizar más.";
    }

    // ── 5. Construir prompt ────────────────────────────────────────────────
    const systemPrompt =
      "Eres un entrenador personal y nutricionista deportivo de élite. " +
      "Responde ÚNICAMENTE con JSON válido y compacto, sin texto antes ni después, sin bloques markdown.";

    const macroSummary =
      `Calorías ON: ${macros.kcal_on} kcal | OFF: ${macros.kcal_off} kcal\n` +
      `  Proteína: ${macros.protein_g}g (exacto) | Grasa: ${macros.fat_g}g (exacto)\n` +
      `  Hidratos ON: ${macros.carbs_on_g}g | Hidratos OFF: ${macros.carbs_off_g}g`;

    const userText = `
CLIENTE: ${profile?.full_name ?? "Cliente"}
DATOS: ${sex === "female" ? "Mujer" : "Hombre"} | ${age} años | ${weight}kg | ${height}cm
OBJETIVO: ${GOAL_ES[goal] ?? goal} | Actividad: ×${activity_factor}

${photoInstruction}

COMPOSICIÓN CORPORAL (datos reales del cliente):
${bodyContext}
${leanKg ? `  → Masa magra estimada: ${leanKg}kg` : ""}

HISTORIAL DE ENTRENAMIENTO (últimas sesiones):
${trainingHist}

PREFERENCIAS:
  Días/semana: ${days_per_week} | Equipamiento: ${EQUIP_ES[equipment] ?? equipment}
  Experiencia: ${EXP_ES[experience] ?? experience}
  Lesiones: ${injuries || "Ninguna"}

MACROS CALCULADOS — DEBES RESPETARLOS EXACTAMENTE (calculados con Mifflin-St Jeor):
  ${macroSummary}

EJERCICIOS DISPONIBLES (usa SOLO estos nombres exactos):
${exerciseBlock}

Genera este JSON:
{
  "analysis": "3-4 frases de análisis detallado basado en la composición corporal real del cliente. Menciona % grasa si disponible, puntos débiles en perímetros, nivel de fuerza del historial, y cómo el plan aborda esas necesidades específicas.",
  "program": {
    "name": "Plan IA - [tipo] ${days_per_week} días",
    "days": [
      {
        "name": "[Músculo/Músculo]",
        "exercises": [
          {"name": "<nombre EXACTO>", "sets": 4, "reps": "8-10", "rir": 2, "note": "técnica o foco opcional"}
        ]
      }
    ]
  },
  "diet": {
    "name": "Dieta IA - ${macros.kcal_on}kcal",
    "notes": "Pesa todos los alimentos en crudo/seco. Hidratación mínima 35ml/kg peso = ${Math.round(weight * 35 / 100) / 10}L/día.",
    "meals": [
      {
        "name": "Desayuno",
        "day_type": "both",
        "options": [
          {
            "name": "Opción A - [descripción]",
            "groups": [
              {"label": "BASE",    "isChoice": false, "items": ["Xg Alimento"], "note": null},
              {"label": "HIDRATO", "isChoice": true,  "items": ["Xg opción 1", "Xg opción 2"], "note": null},
              {"label": "GRASA",   "isChoice": false, "items": ["Xg Alimento"], "note": null}
            ]
          }
        ]
      }
    ]
  }
}

REGLAS CRÍTICAS:
PROGRAMA (diseña los ejercicios BASE — el servidor aplicará automáticamente 8 semanas de sobrecarga progresiva):
- Exactamente ${days_per_week} días de entrenamiento${leanKg ? ` para ${leanKg}kg masa magra` : ""}
- Nombre de día: MÁXIMO 15 caracteres, sin "Día X -", solo músculos separados por "/" (ej: "Pecho/Tríceps", "Tirón", "Piernas", "Hombros", "Espalda/Bíceps", "Glúteos/Core")
- 4-6 ejercicios/día con rango base semana 1
- Nivel ${experience}: ${experience === "beginner" ? "sets: 3, reps: '12-15', rir: 3 (sin técnicas avanzadas)" : experience === "intermediate" ? "sets: 3, reps: '10-12', rir: 2 (última serie puede ser drop set o rest-pause)" : "sets: 4, reps: '6-10', rir: 2 (última serie con técnica de alta intensidad: drop set, rest-pause o myo-reps — indicarlo en note)"}
- ${fatPct && fatPct > 25 ? "Incluir ejercicio cardiovascular o circuitos metabólicos — % grasa elevado" : "Priorizar fuerza e hipertrofia con ejercicios básicos (sentadilla, peso muerto, press, remo)"}
- Si hay historial de entrenamiento úsalo para elegir ejercicios donde ya tiene base de fuerza
- Equilibrar grupos musculares antagonistas; si hay desequilibrio en perímetros, priorizar el lado débil

DIETA:
- Las comidas deben sumar EXACTAMENTE: P=${macros.protein_g}g, G=${macros.fat_g}g, H=${macros.carbs_on_g}g para día ON
- 4-5 comidas según calorías totales (${macros.kcal_on}kcal)
- 2 opciones por comida mínimo
- Porciones realistas (pollo 150-200g, arroz 60-80g crudo, huevos 2-3 unidades)
- Distribuir proteína uniformemente en todas las comidas (${Math.round(macros.protein_g / 4)}-${Math.round(macros.protein_g / 4) + 10}g por comida)
- La grasa total NO debe superar ${macros.fat_g}g — distribuye con precisión
- Sin emojis, alimentos en español, gramajes en enteros
`.trim();

    // ── 6. Llamar a Anthropic ───────────────────────────────────────────────
    type ContentBlock =
      | { type: "text"; text: string }
      | { type: "image"; source: { type: "base64"; media_type: string; data: string } };

    const content: ContentBlock[] = [];
    // Insertar fotos antes del texto, etiquetadas con su plano
    const photoSlots = [
      { p: photoFront, label: "FOTO FRENTE" },
      { p: photoSide,  label: "FOTO LATERAL" },
      { p: photoBack,  label: "FOTO ESPALDA" },
    ];
    for (const { p, label } of photoSlots) {
      if (p) {
        content.push({ type: "text", text: `[${label}]` });
        content.push({ type: "image", source: { type: "base64", media_type: p.mime, data: p.base64 } });
      }
    }
    content.push({ type: "text", text: userText });

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":          Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version":  "2023-06-01",
        "content-type":       "application/json",
      },
      body: JSON.stringify({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 6000,
        system:     systemPrompt,
        messages:   [{ role: "user", content }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      throw new Error(`Anthropic API ${anthropicRes.status}: ${errText}`);
    }

    const anthropicData = await anthropicRes.json();
    let rawText: string = anthropicData.content[0].text;
    rawText = rawText
      .replace(/^```json\s*/m, "").replace(/^```\s*/m, "").replace(/```\s*$/m, "").trim();

    const plan = JSON.parse(rawText);

    // ── 7. Mapa ejercicio → id ──────────────────────────────────────────────
    const exMap = new Map<string, number>();
    for (const ex of exercises ?? []) exMap.set(ex.name.toLowerCase().trim(), ex.id);

    const findExId = (name: string): number | null => {
      const lower = name.toLowerCase().trim();
      if (exMap.has(lower)) return exMap.get(lower)!;
      for (const [key, id] of exMap) {
        if (key.includes(lower) || lower.includes(key)) return id;
      }
      return null;
    };

    // ── Helpers de sobrecarga progresiva ───────────────────────────────────
    function parseRepRange(s: string): [number, number] {
      const clean = String(s).replace(/\s*\([^)]*\)/g, "").trim();
      const m = clean.match(/(\d+)\s*[-–]\s*(\d+)/);
      if (m) return [parseInt(m[1]), parseInt(m[2])];
      const n = parseInt(clean);
      return isNaN(n) ? [8, 10] : [n, n];
    }

    // 8 semanas: 2 bloques (hipertrofia → fuerza) con descarga en S4 y S8.
    // repMod: ajuste sobre el rango base de Claude (+reps = más ligero, −reps = más pesado)
    const PROG_MATRIX = [
      { rpe: 7, repMod:  0, setsMod:  0, label: "S1 · Adaptación"     }, // bloque 1 – acumulación
      { rpe: 8, repMod:  0, setsMod:  0, label: "S2 · Progresión"      },
      { rpe: 9, repMod:  0, setsMod:  0, label: "S3 · Sobrecarga"      },
      { rpe: 6, repMod:  2, setsMod: -1, label: "S4 · Descarga"        }, // deload
      { rpe: 8, repMod: -2, setsMod:  0, label: "S5 · Bloque fuerza"   }, // bloque 2 – intensificación
      { rpe: 9, repMod: -2, setsMod:  0, label: "S6 · Sobrecarga II"   },
      { rpe: 10,repMod: -3, setsMod:  0, label: "S7 · Semana de PR"    }, // pico de intensidad
      { rpe: 6, repMod:  2, setsMod: -1, label: "S8 · Descarga final"  }, // deload
    ] as const;

    // ── 8. Guardar programa con 8 microciclos por día ──────────────────────
    const { data: programRow, error: progErr } = await supabase
      .from("programs")
      .insert({
        name:            plan.program.name,
        description:     `IA · ${new Date().toLocaleDateString("es-ES")} · ${macros.kcal_on}kcal · 8 semanas prog.`,
        owner_client_id: client_id,
        source:          "ai",
      })
      .select("id").single();

    if (progErr) throw new Error(`programs: ${progErr.message}`);
    const programId = programRow.id;

    for (let di = 0; di < plan.program.days.length; di++) {
      const day = plan.program.days[di];
      const { data: dayRow } = await supabase
        .from("program_days")
        .insert({ program_id: programId, name: day.name, order_index: di + 1, optional: false })
        .select("id").single();

      // Insertar los 8 microciclos del día de golpe
      const { data: mcRows } = await supabase
        .from("microcycles")
        .insert(PROG_MATRIX.map((_, i) => ({ day_id: dayRow!.id, number: i + 1 })))
        .select("id");

      if (!mcRows?.length) continue;

      // Para cada semana, insertar ejercicios + series en batch
      for (let mc = 0; mc < 8; mc++) {
        const prog  = PROG_MATRIX[mc];
        const mcId  = mcRows[mc].id;

        // Construir los ejercicios con sus valores semanales ya calculados
        type MeInput = {
          microcycle_id: string;
          exercise_id:   number;
          order_index:   number;
          total_sets:    number;
          note:          string | null;
          _minR:         number;
          _maxR:         number;
          _rpe:          number;
        };

        const meInputs: MeInput[] = [];
        for (let ei = 0; ei < day.exercises.length; ei++) {
          const ex   = day.exercises[ei];
          const exId = findExId(ex.name);
          if (!exId) continue;

          const [minR, maxR]  = parseRepRange(ex.reps);
          const adjMin        = Math.max(1, minR + prog.repMod);
          const adjMax        = Math.max(1, maxR + prog.repMod);
          const targetSets    = Math.max(2, (ex.sets ?? 4) + prog.setsMod);
          const weekNote      = [ex.note, prog.label].filter(Boolean).join(" · ") || null;

          meInputs.push({
            microcycle_id: mcId,
            exercise_id:   exId,
            order_index:   ei + 1,
            total_sets:    targetSets,
            note:          weekNote,
            _minR:         adjMin,
            _maxR:         adjMax,
            _rpe:          prog.rpe,
          });
        }
        if (!meInputs.length) continue;

        // Batch insert microcycle_exercises (sin los campos internos _)
        const { data: meRows } = await supabase
          .from("microcycle_exercises")
          .insert(meInputs.map(({ _minR: _a, _maxR: _b, _rpe: _c, ...row }) => row))
          .select("id");

        if (!meRows?.length) continue;

        // Batch insert exercise_sets para todos los ejercicios de esta semana.
        // RIR = 10 - RPE (ej: RPE 8 → RIR 2). Se guarda en target_reps: "8-10 (2)"
        // igual que en los programas del coach. target_rpe = null (el usuario lo marca al registrar).
        const setInserts: Array<{
          microcycle_exercise_id: string;
          set_number: number;
          target_reps: string;
          target_weight: null;
          target_rpe: null;
        }> = [];

        for (let ei = 0; ei < meRows.length; ei++) {
          const meId = meRows[ei].id;
          const inp  = meInputs[ei];
          const rir  = Math.max(0, 10 - inp._rpe);
          const base = inp._minR === inp._maxR ? String(inp._minR) : `${inp._minR}-${inp._maxR}`;
          const repsStr = `${base} (${rir})`;

          for (let sn = 1; sn <= inp.total_sets; sn++) {
            setInserts.push({
              microcycle_exercise_id: meId,
              set_number:    sn,
              target_reps:   repsStr,
              target_weight: null,
              target_rpe:    null,
            });
          }
        }
        if (setInserts.length) {
          await supabase.from("exercise_sets").insert(setInserts);
        }
      }
    }

    // Auto-asignar programa
    await supabase.from("program_assignments").update({ active: false }).eq("client_id", client_id);
    await supabase.from("program_assignments").insert({ client_id, program_id: programId, active: true });

    // ── 9. Guardar dieta ────────────────────────────────────────────────────
    const { data: dietRow, error: dietErr } = await supabase
      .from("diet_plans")
      .insert({
        name:        plan.diet.name,
        kcal_on:     macros.kcal_on,
        kcal_off:    macros.kcal_off,
        protein_on:  macros.protein_g,
        protein_off: macros.protein_g,
        carbs_on:    macros.carbs_on_g,
        carbs_off:   macros.carbs_off_g,
        fat_on:      macros.fat_g,
        fat_off:     macros.fat_g,
        notes:       plan.diet.notes,
        source:      "ai",
      })
      .select("id").single();

    if (dietErr) throw new Error(`diet_plans: ${dietErr.message}`);
    const dietPlanId = dietRow.id;

    for (let mi = 0; mi < plan.diet.meals.length; mi++) {
      const meal = plan.diet.meals[mi];
      const { data: mealRow } = await supabase
        .from("diet_meals")
        .insert({ plan_id: dietPlanId, name: meal.name, day_type: meal.day_type ?? "both", sort_order: mi })
        .select("id").single();

      for (let oi = 0; oi < (meal.options ?? []).length; oi++) {
        const opt = meal.options[oi];
        const content = (opt.groups ?? []).map((g: {
          label?: string; isChoice?: boolean; items?: string[]; note?: string
        }) => ({
          label:    g.label    ?? null,
          isChoice: g.isChoice ?? false,
          items:    g.items    ?? [],
          note:     g.note     ?? null,
        }));
        await supabase.from("diet_options").insert({
          meal_id: mealRow!.id, name: opt.name, content, sort_order: oi,
        });
      }
    }

    // Auto-asignar dieta (desactivar existentes + insertar nueva para no machacar la del coach)
    await supabase.from("diet_assignments").update({ active: false }).eq("client_id", client_id);
    await supabase.from("diet_assignments").insert({
      client_id, plan_id: dietPlanId, active: true, source: "ai",
      assigned_at: new Date().toISOString(),
    });

    // ── 10. Actualizar client_macros ────────────────────────────────────────
    await supabase.from("client_macros").upsert({
      client_id,
      sex,
      age:             Number(age),
      height_cm:       Number(height),
      weight_kg:       Number(weight),
      activity_factor: Number(activity_factor),
      protein_mult:    parseFloat((macros.protein_g / weight).toFixed(2)),
      fat_mult:        parseFloat((macros.fat_g     / weight).toFixed(2)),
      bmr:             macros.bmr,
      tdee:            macros.tdee,
      protein_g:       macros.protein_g,
      carbs_g:         macros.carbs_on_g,
      fat_g:           macros.fat_g,
      goal,
      days_on:         days_per_week,
      updated_at:      new Date().toISOString(),
    }, { onConflict: "client_id" });

    // ── 11. Tracking ────────────────────────────────────────────────────────
    await supabase.from("ai_plan_generations").insert({
      client_id,
      program_id:   programId,
      diet_plan_id: dietPlanId,
      analysis:     plan.analysis,
      photo_used:   !!anyPhoto,
    });

    return new Response(
      JSON.stringify({
        success:      true,
        analysis:     plan.analysis,
        macros,
        program_id:   programId,
        diet_plan_id: dietPlanId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (err) {
    console.error("ai-generate-plan error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
