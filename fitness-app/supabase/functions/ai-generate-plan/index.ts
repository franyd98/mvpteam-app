// ai-generate-plan — Supabase Edge Function
// Genera macros + dieta + entrenamiento personalizado usando Claude Haiku.
// Variables de entorno requeridas:
//   ANTHROPIC_API_KEY
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const GOAL_MAP: Record<string, string> = {
  lose_fat_aggressive: "Pérdida de grasa agresiva (−20% déficit)",
  lose_fat:            "Pérdida de grasa (−15% déficit)",
  lose_fat_soft:       "Pérdida de grasa suave (−10% déficit)",
  maintain:            "Mantenimiento (0%)",
  gain_muscle:         "Ganancia muscular (+5% superávit)",
  bulk:                "Volumen (+10% superávit)",
};

const EQUIPMENT_MAP: Record<string, string> = {
  gym_full:     "Gimnasio completo (máquinas, cables, barras, mancuernas)",
  dumbbells:    "Sala de pesas libres (barras y mancuernas, sin máquinas de cable)",
  home:         "Entrenamiento en casa (mancuernas ligeras, bandas elásticas)",
  calisthenics: "Calistenia (peso corporal, barra de dominadas, anillas)",
};

const EXPERIENCE_MAP: Record<string, string> = {
  beginner:     "Principiante (< 1 año)",
  intermediate: "Intermedio (1–3 años)",
  advanced:     "Avanzado (> 3 años)",
};

// ── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      client_id,
      personal_data,  // { sex, age, height, weight, activity_factor, goal }
      training_prefs, // { days_per_week, equipment, experience, injuries }
      photo_base64,   // optional: base64 sin prefijo data:
      photo_mime,     // "image/jpeg" | "image/png"
    } = await req.json();

    // ── Supabase admin client ─────────────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Fetch data from DB ────────────────────────────────────────────────────

    const [{ data: profile }, { data: exercises }, { data: lastCheckin }] =
      await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", client_id).single(),
        supabase.from("exercises").select("id, name, muscle_group").order("muscle_group"),
        supabase
          .from("check_in_records")
          .select("weight_kg, body_fat_pct")
          .eq("client_id", client_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    // ── Build exercise list (grouped, max 8 per muscle) ──────────────────────
    const byMuscle: Record<string, string[]> = {};
    for (const ex of exercises ?? []) {
      const mg = (ex.muscle_group ?? "OTROS").toUpperCase();
      if (!byMuscle[mg]) byMuscle[mg] = [];
      if (byMuscle[mg].length < 10) byMuscle[mg].push(ex.name);
    }
    const exerciseBlock = Object.entries(byMuscle)
      .map(([mg, names]) => `  ${mg}: ${names.join(" | ")}`)
      .join("\n");

    // ── Build prompt ─────────────────────────────────────────────────────────
    const { sex, age, height, weight, activity_factor, goal } = personal_data;
    const { days_per_week, equipment, experience, injuries } = training_prefs;

    const extraContext = lastCheckin?.body_fat_pct
      ? `Último % grasa registrado: ${lastCheckin.body_fat_pct}%`
      : "";

    const photoNote = photo_base64
      ? "NOTA: Se adjunta foto corporal del cliente. Analiza su composición corporal para personalizar las recomendaciones."
      : "";

    const systemPrompt =
      `Eres un entrenador personal y nutricionista deportivo experto. ` +
      `Responde ÚNICAMENTE con JSON válido y compacto, sin texto antes ni después, sin bloques markdown.`;

    const userText = `
DATOS DEL CLIENTE: ${profile?.full_name ?? "Cliente"}
  Sexo: ${sex === "female" ? "Mujer" : "Hombre"} | Edad: ${age} años | Peso: ${weight} kg | Altura: ${height} cm
  Factor de actividad: ${activity_factor}x | Objetivo: ${GOAL_MAP[goal] ?? goal}
  ${extraContext}
  ${photoNote}

PREFERENCIAS DE ENTRENAMIENTO:
  Días/semana: ${days_per_week} | Equipamiento: ${EQUIPMENT_MAP[equipment] ?? equipment}
  Experiencia: ${EXPERIENCE_MAP[experience] ?? experience}
  Lesiones/Limitaciones: ${injuries || "Ninguna"}

EJERCICIOS DISPONIBLES (usa SOLO estos nombres exactos, sin modificarlos):
${exerciseBlock}

Genera exactamente este JSON:
{
  "analysis": "2-3 frases de análisis personalizado del cliente",
  "macros": {
    "kcal_on": <entero>,
    "protein_g": <entero, 1.8-2.2g por kg de peso>,
    "carbs_on_g": <entero>,
    "fat_g": <entero, 0.8-1.2g por kg>,
    "kcal_off": <entero, 10-15% menos que kcal_on>,
    "carbs_off_g": <entero, 15-20% menos que carbs_on_g>
  },
  "program": {
    "name": "Plan IA - [tipo] ${days_per_week} días",
    "days": [
      {
        "name": "Día A - [músculos principales]",
        "exercises": [
          {"name": "<nombre EXACTO del ejercicio>", "sets": 4, "reps": "8-10", "rir": 2}
        ]
      }
    ]
  },
  "diet": {
    "name": "Dieta IA - [objetivo corto]",
    "notes": "Pesa los alimentos en crudo. Hidratación mínima 2.5L/día.",
    "meals": [
      {
        "name": "Desayuno",
        "day_type": "both",
        "options": [
          {
            "name": "Opción A - [descripción]",
            "groups": [
              {"label": "BASE",    "isChoice": false, "items": ["Xg Alimento"], "note": null},
              {"label": "HIDRATO", "isChoice": true,  "items": ["Xg Opción 1", "Xg Opción 2"], "note": null},
              {"label": "GRASA",   "isChoice": false, "items": ["Xg Alimento"], "note": null}
            ]
          }
        ]
      }
    ]
  }
}

REGLAS IMPORTANTES:
- Programa: exactamente ${days_per_week} días, 4-6 ejercicios/día, 3-5 series, formato reps "8-10 (2)" donde el número entre paréntesis es RIR
- Macros: usa fórmula Mifflin-St Jeor × ${activity_factor} ajustado al objetivo
- Dieta: 4-5 comidas, 2-3 opciones por comida, porciones realistas en gramos
- Gramaje: porciones coherentes (pollo 150-200g, arroz 60-80g crudo, etc.)
- Alimentos en español, sin emojis, sin texto fuera del JSON
`.trim();

    // ── Build message content ─────────────────────────────────────────────────
    type ContentBlock =
      | { type: "text"; text: string }
      | { type: "image"; source: { type: "base64"; media_type: string; data: string } };

    const contentBlocks: ContentBlock[] = [];

    if (photo_base64) {
      contentBlocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: (photo_mime ?? "image/jpeg") as string,
          data: photo_base64 as string,
        },
      });
    }
    contentBlocks.push({ type: "text", text: userText });

    // ── Call Anthropic ────────────────────────────────────────────────────────
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: contentBlocks }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      throw new Error(`Anthropic API ${anthropicRes.status}: ${errText}`);
    }

    const anthropicData = await anthropicRes.json();
    let rawText: string = anthropicData.content[0].text;

    // Strip optional markdown fences
    rawText = rawText
      .replace(/^```json\s*/m, "")
      .replace(/^```\s*/m, "")
      .replace(/```\s*$/m, "")
      .trim();

    const plan = JSON.parse(rawText);

    // ── Exercise name → id map ────────────────────────────────────────────────
    const exMap = new Map<string, number>();
    for (const ex of exercises ?? []) {
      exMap.set(ex.name.toLowerCase().trim(), ex.id);
    }

    const findExId = (name: string): number | null => {
      const lower = name.toLowerCase().trim();
      if (exMap.has(lower)) return exMap.get(lower)!;
      // Substring fallback
      for (const [key, id] of exMap) {
        if (key.includes(lower) || lower.includes(key)) return id;
      }
      return null;
    };

    // ── Save program ──────────────────────────────────────────────────────────
    const { data: programRow, error: progErr } = await supabase
      .from("programs")
      .insert({
        name: plan.program.name,
        description: `Generado por IA el ${new Date().toLocaleDateString("es-ES")} · MVP Team`,
        owner_client_id: client_id,
        source: "ai",
      })
      .select("id")
      .single();

    if (progErr) throw new Error(`programs insert: ${progErr.message}`);
    const programId = programRow.id;

    for (let di = 0; di < plan.program.days.length; di++) {
      const day = plan.program.days[di];

      const { data: dayRow } = await supabase
        .from("program_days")
        .insert({ program_id: programId, name: day.name, order_index: di + 1, optional: false })
        .select("id")
        .single();

      const { data: mcRow } = await supabase
        .from("microcycles")
        .insert({ day_id: dayRow!.id, number: 1 })
        .select("id")
        .single();

      for (let ei = 0; ei < day.exercises.length; ei++) {
        const ex = day.exercises[ei];
        const exId = findExId(ex.name);
        if (!exId) continue;

        const { data: meRow } = await supabase
          .from("microcycle_exercises")
          .insert({
            microcycle_id: mcRow!.id,
            exercise_id: exId,
            order_index: ei + 1,
            total_sets: ex.sets,
          })
          .select("id")
          .single();

        // Target reps with RIR in parentheses: "8-10 (2)"
        const repsStr = ex.rir !== undefined ? `${ex.reps} (${ex.rir})` : ex.reps;

        for (let sn = 1; sn <= ex.sets; sn++) {
          await supabase.from("exercise_sets").insert({
            microcycle_exercise_id: meRow!.id,
            set_number: sn,
            target_reps: repsStr,
            target_weight: null,
            target_rpe: null,
          });
        }
      }
    }

    // Auto-assign: deactivate previous, insert new
    await supabase
      .from("program_assignments")
      .update({ active: false })
      .eq("client_id", client_id);

    await supabase.from("program_assignments").insert({
      client_id,
      program_id: programId,
      active: true,
    });

    // ── Save diet ─────────────────────────────────────────────────────────────
    const { data: dietPlanRow, error: dietErr } = await supabase
      .from("diet_plans")
      .insert({
        name: plan.diet.name,
        kcal_on:     plan.macros.kcal_on,
        kcal_off:    plan.macros.kcal_off,
        protein_on:  plan.macros.protein_g,
        protein_off: plan.macros.protein_g,
        carbs_on:    plan.macros.carbs_on_g,
        carbs_off:   plan.macros.carbs_off_g,
        fat_on:      plan.macros.fat_g,
        fat_off:     plan.macros.fat_g,
        notes:       plan.diet.notes,
        source:      "ai",
      })
      .select("id")
      .single();

    if (dietErr) throw new Error(`diet_plans insert: ${dietErr.message}`);
    const dietPlanId = dietPlanRow.id;

    for (let mi = 0; mi < plan.diet.meals.length; mi++) {
      const meal = plan.diet.meals[mi];

      const { data: mealRow } = await supabase
        .from("diet_meals")
        .insert({
          plan_id:    dietPlanId,
          name:       meal.name,
          day_type:   meal.day_type ?? "both",
          sort_order: mi,
        })
        .select("id")
        .single();

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
          meal_id:    mealRow!.id,
          name:       opt.name,
          content,
          sort_order: oi,
        });
      }
    }

    // Auto-assign diet (upsert on client_id unique constraint)
    await supabase.from("diet_assignments").upsert(
      { client_id, plan_id: dietPlanId, active: true, assigned_at: new Date().toISOString() },
      { onConflict: "client_id" },
    );

    // ── Update client_macros ──────────────────────────────────────────────────
    const proteinMult = parseFloat((plan.macros.protein_g / weight).toFixed(2));
    const fatMult     = parseFloat((plan.macros.fat_g     / weight).toFixed(2));

    await supabase.from("client_macros").upsert(
      {
        client_id,
        sex,
        age:             Number(age),
        height_cm:       Number(height),
        weight_kg:       Number(weight),
        activity_factor: Number(activity_factor),
        protein_mult:    proteinMult,
        fat_mult:        fatMult,
        bmr:             Math.round(plan.macros.kcal_on / Number(activity_factor)),
        tdee:            plan.macros.kcal_on,
        protein_g:       plan.macros.protein_g,
        carbs_g:         plan.macros.carbs_on_g,
        fat_g:           plan.macros.fat_g,
        goal,
        days_on:         days_per_week,
        updated_at:      new Date().toISOString(),
      },
      { onConflict: "client_id" },
    );

    // ── Track generation ──────────────────────────────────────────────────────
    await supabase.from("ai_plan_generations").insert({
      client_id,
      program_id:   programId,
      diet_plan_id: dietPlanId,
      analysis:     plan.analysis,
      photo_used:   !!photo_base64,
    });

    return new Response(
      JSON.stringify({
        success:      true,
        analysis:     plan.analysis,
        macros:       plan.macros,
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
