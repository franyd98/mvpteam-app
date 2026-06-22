// AIPlanWizard.tsx
// Wizard de 5 pasos para generar un plan personalizado con IA:
// Paso 1: Datos personales | 2: Preferencias entreno | 3: Foto (opcional)
// 4: Generando... | 5: Resultados (análisis + macros + links)

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

type Profile = { id: string; full_name: string; role: string };

interface Props {
  profile:         Profile;
  onGoToWorkout:   () => void;
  onGoToDiet:      () => void;
  onPlanGenerated: () => void; // recarga el programa en FitnessApp
}

type Step = 1 | 2 | 3 | 4 | 5;

interface PersonalData {
  sex:             "male" | "female";
  age:             string;
  height:          string;
  weight:          string;
  activity_factor: string;
  goal:            string;
}

interface TrainingPrefs {
  days_per_week: number;
  equipment:     string;
  experience:    string;
  injuries:      string;
}

interface GenerationResult {
  analysis:     string;
  macros: {
    kcal_on:     number;
    protein_g:   number;
    carbs_on_g:  number;
    fat_g:       number;
    kcal_off:    number;
    carbs_off_g: number;
  };
  program_id:   number;
  diet_plan_id: string;
}

// ── Constantes de opciones ────────────────────────────────────────────────────

const ACTIVITY_OPTIONS = [
  { value: "1.2",   label: "Sedentario",         desc: "Sin ejercicio o muy poco" },
  { value: "1.375", label: "Ligero",              desc: "1–3 días/semana" },
  { value: "1.55",  label: "Moderado",            desc: "3–5 días/semana" },
  { value: "1.725", label: "Activo",              desc: "6–7 días/semana" },
  { value: "1.9",   label: "Muy activo",          desc: "Entreno intenso + trabajo físico" },
];

const GOAL_OPTIONS = [
  { value: "lose_fat_aggressive", label: "Bajar grasa (rápido)", desc: "−20% calorías" },
  { value: "lose_fat",            label: "Bajar grasa",          desc: "−15% calorías" },
  { value: "lose_fat_soft",       label: "Bajar grasa (suave)",  desc: "−10% calorías" },
  { value: "maintain",            label: "Mantenimiento",        desc: "0% ajuste" },
  { value: "gain_muscle",         label: "Ganar músculo",        desc: "+5% calorías" },
  { value: "bulk",                label: "Volumen",              desc: "+10% calorías" },
];

const EQUIPMENT_OPTIONS = [
  { value: "gym_full",     label: "Gimnasio completo", icon: "ti-building-store" },
  { value: "dumbbells",    label: "Pesas libres",       icon: "ti-barbell" },
  { value: "home",         label: "Casa",               icon: "ti-home" },
  { value: "calisthenics", label: "Calistenia",         icon: "ti-accessible" },
];

const EXPERIENCE_OPTIONS = [
  { value: "beginner",     label: "Principiante",  desc: "< 1 año" },
  { value: "intermediate", label: "Intermedio",    desc: "1–3 años" },
  { value: "advanced",     label: "Avanzado",      desc: "> 3 años" },
];

const LOADING_STEPS = [
  { icon: "ti-brain",    text: "Analizando tus datos corporales…" },
  { icon: "ti-chart-bar",text: "Calculando macros personalizados…" },
  { icon: "ti-barbell",  text: "Diseñando tu entrenamiento…" },
  { icon: "ti-salad",    text: "Creando tu plan de dieta…" },
  { icon: "ti-database", text: "Guardando tu plan completo…" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AIPlanWizard({ profile, onGoToWorkout, onGoToDiet, onPlanGenerated }: Props) {
  const STORAGE_KEY = `mvp_aiplan_result_${profile.id}`;

  const [step, setStep] = useState<Step>(() => {
    // Si hay resultado guardado, ir directo a paso 5
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return 5;
    } catch {}
    return 1;
  });

  // Step 1 — datos personales
  const [personal, setPersonal] = useState<PersonalData>({
    sex:             "male",
    age:             "",
    height:          "",
    weight:          "",
    activity_factor: "1.55",
    goal:            "lose_fat",
  });

  // Step 2 — preferencias entreno
  const [prefs, setPrefs] = useState<TrainingPrefs>({
    days_per_week: 4,
    equipment:     "gym_full",
    experience:    "intermediate",
    injuries:      "",
  });

  // Step 3 — foto
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMime,   setPhotoMime]   = useState<string>("image/jpeg");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 4 — loading
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Step 5 — resultado (se restaura desde localStorage)
  const [result, setResult] = useState<GenerationResult | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Pre-fill desde client_macros
  useEffect(() => {
    supabase
      .from("client_macros")
      .select("sex, age, height_cm, weight_kg, activity_factor, goal")
      .eq("client_id", profile.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setPersonal(prev => ({
          ...prev,
          sex:             (data.sex as "male" | "female") ?? prev.sex,
          age:             data.age             ? String(data.age)             : prev.age,
          height:          data.height_cm       ? String(data.height_cm)       : prev.height,
          weight:          data.weight_kg       ? String(data.weight_kg)       : prev.weight,
          activity_factor: data.activity_factor ? String(data.activity_factor) : prev.activity_factor,
          goal:            data.goal            ? String(data.goal)            : prev.goal,
        }));
      });
  }, [profile.id]);

  // Loading step animation
  useEffect(() => {
    if (step !== 4) return;
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 3500);
    return () => clearInterval(interval);
  }, [step]);

  // ── Photo handler ──────────────────────────────────────────────────────────
  const handlePhoto = (file: File) => {
    setPhotoMime(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPhotoPreview(dataUrl);
      // Strip data: prefix
      const base64 = dataUrl.split(",")[1];
      setPhotoBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  // ── Generate ───────────────────────────────────────────────────────────────
  const generate = async () => {
    setStep(4);
    setError(null);
    setLoadingStep(0);

    try {
      const { data, error: fnErr } = await supabase.functions.invoke("ai-generate-plan", {
        body: {
          client_id:     profile.id,
          personal_data: {
            sex:             personal.sex,
            age:             Number(personal.age),
            height:          Number(personal.height),
            weight:          Number(personal.weight),
            activity_factor: Number(personal.activity_factor),
            goal:            personal.goal,
          },
          training_prefs: {
            days_per_week: prefs.days_per_week,
            equipment:     prefs.equipment,
            experience:    prefs.experience,
            injuries:      prefs.injuries || "",
          },
          photo_base64: photoBase64 ?? undefined,
          photo_mime:   photoBase64 ? photoMime : undefined,
        },
      });

      if (fnErr || data?.error) {
        throw new Error(fnErr?.message ?? data?.error ?? "Error desconocido");
      }

      const generationResult = data as GenerationResult;
      setResult(generationResult);
      // Persistir en localStorage para sobrevivir cambios de pestaña
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(generationResult)); } catch {}
      // Recargar el programa asignado en FitnessApp
      onPlanGenerated();
      setStep(5);
    } catch (err) {
      setError(String(err));
      setStep(3); // back to photo step with error
    }
  };

  // ── Validation helpers ─────────────────────────────────────────────────────
  const step1Valid =
    personal.age.trim()    !== "" &&
    personal.height.trim() !== "" &&
    personal.weight.trim() !== "" &&
    Number(personal.age)    > 10  && Number(personal.age)    < 99 &&
    Number(personal.height) > 100 && Number(personal.height) < 250 &&
    Number(personal.weight) > 30  && Number(personal.weight) < 300;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ minHeight: "100dvh", background: "#08090d" }}>

      {/* Header */}
      <div className="header-safe shrink-0 flex items-center gap-3 px-4 pt-4 pb-3"
        style={{ borderBottom: "1px solid #1a1a1a" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--mvp-red-soft)", border: "1px solid var(--mvp-red-border)" }}>
          <i className="ti ti-sparkles" style={{ fontSize: 18, color: "var(--mvp-red)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--mvp-red)" }}>
            IA · MVP Team
          </p>
          <p className="text-white font-bold text-sm leading-tight">Tu Plan Personalizado</p>
        </div>
        {step > 1 && step < 4 && (
          <button onClick={() => setStep((step - 1) as Step)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#1a1a1a", color: "#aaa", border: "1px solid #2a2a2a" }}>
            <i className="ti ti-arrow-left" style={{ fontSize: 16 }} />
          </button>
        )}
        {step === 5 && (
          <button
            onClick={() => {
              try { localStorage.removeItem(STORAGE_KEY); } catch {}
              setResult(null);
              setPhotoBase64(null);
              setPhotoPreview(null);
              setError(null);
              setLoadingStep(0);
              setStep(1);
            }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ background: "#1a1a1a", color: "#777", border: "1px solid #2a2a2a" }}>
            Nuevo plan
          </button>
        )}
      </div>

      {/* Step indicator (steps 1–3) */}
      {step <= 3 && (
        <div className="shrink-0 flex items-center gap-2 px-4 py-3">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: s <= step ? "var(--mvp-red)" : "#1a1a1a",
                  border: s === step ? "none" : "1px solid #2a2a2a",
                }}>
                <span className="text-[10px] font-bold" style={{ color: s <= step ? "#fff" : "#444" }}>
                  {s}
                </span>
              </div>
              {s < 3 && (
                <div className="flex-1 h-px" style={{ background: s < step ? "var(--mvp-red)" : "#1a1a1a", width: 28 }} />
              )}
            </div>
          ))}
          <p className="ml-2 text-[10px] text-neutral-500 font-medium">
            {step === 1 ? "Datos personales" : step === 2 ? "Entreno" : "Foto (opcional)"}
          </p>
        </div>
      )}

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto">

        {/* ══ PASO 1: Datos personales ══════════════════════════════════════ */}
        {step === 1 && (
          <div className="px-4 pt-2 pb-6 space-y-5">

            {/* Sexo */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">Sexo</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "male",   label: "Hombre", icon: "ti-mars" },
                  { value: "female", label: "Mujer",  icon: "ti-venus" },
                ].map(({ value, label, icon }) => {
                  const active = personal.sex === value;
                  return (
                    <button key={value}
                      onClick={() => setPersonal(p => ({ ...p, sex: value as "male" | "female" }))}
                      className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all"
                      style={{
                        background: active ? "var(--mvp-red-soft)" : "#141414",
                        border: `1px solid ${active ? "var(--mvp-red-border)" : "#222"}`,
                        color: active ? "var(--mvp-red)" : "#777",
                      }}>
                      <i className={`ti ${icon}`} style={{ fontSize: 18 }} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Edad / Peso / Altura */}
            <div className="grid grid-cols-3 gap-3">
              {([
                { field: "age",    label: "Edad",    unit: "años", min: 12,  max: 90  },
                { field: "weight", label: "Peso",    unit: "kg",   min: 30,  max: 300 },
                { field: "height", label: "Altura",  unit: "cm",   min: 100, max: 250 },
              ] as const).map(({ field, label, unit, min, max }) => (
                <div key={field} className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">{label}</p>
                  <div className="rounded-xl overflow-hidden"
                    style={{ background: "#141414", border: "1px solid #222" }}>
                    <input
                      type="number"
                      value={personal[field]}
                      onChange={e => setPersonal(p => ({ ...p, [field]: e.target.value }))}
                      min={min} max={max}
                      placeholder="—"
                      className="w-full px-3 py-3 text-white font-bold text-sm text-center bg-transparent focus:outline-none"
                    />
                  </div>
                  <p className="text-[9px] text-neutral-600 text-center">{unit}</p>
                </div>
              ))}
            </div>

            {/* Actividad */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
                Nivel de actividad
              </p>
              <div className="space-y-1.5">
                {ACTIVITY_OPTIONS.map(opt => {
                  const active = personal.activity_factor === opt.value;
                  return (
                    <button key={opt.value}
                      onClick={() => setPersonal(p => ({ ...p, activity_factor: opt.value }))}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                      style={{
                        background: active ? "var(--mvp-red-soft)" : "#141414",
                        border: `1px solid ${active ? "var(--mvp-red-border)" : "#222"}`,
                      }}>
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: active ? "var(--mvp-red)" : "#444" }}>
                        {active && (
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--mvp-red)" }} />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold"
                          style={{ color: active ? "var(--mvp-red)" : "#ccc" }}>
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-neutral-500">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Objetivo */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">Objetivo</p>
              <div className="grid grid-cols-2 gap-2">
                {GOAL_OPTIONS.map(opt => {
                  const active = personal.goal === opt.value;
                  return (
                    <button key={opt.value}
                      onClick={() => setPersonal(p => ({ ...p, goal: opt.value }))}
                      className="flex flex-col items-start px-3 py-3 rounded-xl transition-all"
                      style={{
                        background: active ? "var(--mvp-red-soft)" : "#141414",
                        border: `1px solid ${active ? "var(--mvp-red-border)" : "#222"}`,
                      }}>
                      {active && (
                        <i className="ti ti-check mb-1" style={{ fontSize: 12, color: "var(--mvp-red)" }} />
                      )}
                      <p className="text-xs font-bold leading-tight"
                        style={{ color: active ? "var(--mvp-red)" : "#ccc" }}>
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ PASO 2: Preferencias de entrenamiento ════════════════════════ */}
        {step === 2 && (
          <div className="px-4 pt-2 pb-6 space-y-5">

            {/* Días a la semana */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
                Días de entrenamiento / semana
              </p>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map(d => {
                  const active = prefs.days_per_week === d;
                  return (
                    <button key={d}
                      onClick={() => setPrefs(p => ({ ...p, days_per_week: d }))}
                      className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: active ? "var(--mvp-red)" : "#141414",
                        border: `1px solid ${active ? "transparent" : "#222"}`,
                        color: active ? "#fff" : "#666",
                      }}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Equipamiento */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">Equipamiento</p>
              <div className="grid grid-cols-2 gap-2">
                {EQUIPMENT_OPTIONS.map(opt => {
                  const active = prefs.equipment === opt.value;
                  return (
                    <button key={opt.value}
                      onClick={() => setPrefs(p => ({ ...p, equipment: opt.value }))}
                      className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl transition-all"
                      style={{
                        background: active ? "var(--mvp-red-soft)" : "#141414",
                        border: `1px solid ${active ? "var(--mvp-red-border)" : "#222"}`,
                      }}>
                      <i className={`ti ${opt.icon}`} style={{ fontSize: 20, color: active ? "var(--mvp-red)" : "#555" }} />
                      <span className="text-sm font-semibold"
                        style={{ color: active ? "var(--mvp-red)" : "#aaa" }}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experiencia */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">Experiencia</p>
              <div className="space-y-1.5">
                {EXPERIENCE_OPTIONS.map(opt => {
                  const active = prefs.experience === opt.value;
                  return (
                    <button key={opt.value}
                      onClick={() => setPrefs(p => ({ ...p, experience: opt.value }))}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                      style={{
                        background: active ? "var(--mvp-red-soft)" : "#141414",
                        border: `1px solid ${active ? "var(--mvp-red-border)" : "#222"}`,
                      }}>
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: active ? "var(--mvp-red)" : "#444" }}>
                        {active && (
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--mvp-red)" }} />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold"
                          style={{ color: active ? "var(--mvp-red)" : "#ccc" }}>
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-neutral-500">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lesiones */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
                Lesiones o limitaciones
                <span className="ml-2 normal-case text-[10px] text-neutral-600 font-normal">(opcional)</span>
              </p>
              <textarea
                value={prefs.injuries}
                onChange={e => setPrefs(p => ({ ...p, injuries: e.target.value }))}
                placeholder="Ej: Lesión de rodilla, dolor lumbar, no puedo hacer sentadilla…"
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-700 focus:outline-none resize-none"
                style={{ background: "#141414", border: "1px solid #222" }}
              />
            </div>
          </div>
        )}

        {/* ══ PASO 3: Foto (opcional) ═══════════════════════════════════════ */}
        {step === 3 && (
          <div className="px-4 pt-2 pb-6 space-y-4">

            <div className="rounded-2xl p-4 space-y-1"
              style={{ background: "#141414", border: "1px solid var(--mvp-red-border)" }}>
              <div className="flex items-center gap-2">
                <i className="ti ti-info-circle" style={{ fontSize: 16, color: "var(--mvp-red)" }} />
                <p className="text-xs font-semibold text-white">La foto es opcional pero mejora el análisis</p>
              </div>
              <p className="text-[11px] text-neutral-500 ml-6">
                Sube una foto de cuerpo completo (de pie, ropa ajustada). La IA analiza tu composición corporal
                para personalizar mejor tus macros y entrenamiento. No se guarda en nuestros servidores.
              </p>
            </div>

            {/* Upload area */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handlePhoto(file);
              }}
            />

            {photoPreview ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden"
                  style={{ border: "1px solid var(--mvp-red-border)" }}>
                  <img src={photoPreview} alt="foto" className="w-full object-cover" style={{ maxHeight: 300 }} />
                  <button
                    onClick={() => { setPhotoBase64(null); setPhotoPreview(null); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.7)", color: "#fff", border: "1px solid #333" }}>
                    <i className="ti ti-x" style={{ fontSize: 14 }} />
                  </button>
                </div>
                <p className="text-[11px] text-center text-neutral-500">
                  Foto cargada — la IA la analizará durante la generación
                </p>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center gap-3 py-10 rounded-2xl transition-all active:opacity-70"
                style={{ background: "#141414", border: "2px dashed #2a2a2a" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--mvp-red-soft)", border: "1px solid var(--mvp-red-border)" }}>
                  <i className="ti ti-camera" style={{ fontSize: 28, color: "var(--mvp-red)" }} />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-sm">Subir foto</p>
                  <p className="text-neutral-500 text-xs mt-0.5">JPG, PNG — de pie, cuerpo completo</p>
                </div>
              </button>
            )}

            {error && (
              <div className="rounded-xl px-4 py-3 flex items-start gap-2"
                style={{ background: "#1a0a0a", border: "1px solid #4a1a1a" }}>
                <i className="ti ti-alert-triangle shrink-0 mt-0.5" style={{ fontSize: 14, color: "#f87171" }} />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <p className="text-center text-[10px] text-neutral-600">
              También puedes generar sin foto — igual de preciso con tus datos
            </p>
          </div>
        )}

        {/* ══ PASO 4: Generando ════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center px-8 py-16 gap-8">

            {/* Animated ring */}
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#1a1a1a" strokeWidth="6" />
                <circle cx="48" cy="48" r="40" fill="none" stroke="var(--mvp-red)" strokeWidth="6"
                  strokeDasharray="251"
                  strokeDashoffset={251 - 251 * ((loadingStep + 1) / LOADING_STEPS.length)}
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className={`ti ${LOADING_STEPS[loadingStep].icon}`}
                  style={{ fontSize: 28, color: "var(--mvp-red)" }} />
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-white font-bold text-lg">Generando tu plan…</p>
              <p className="text-neutral-400 text-sm transition-all"
                style={{ minHeight: 20 }}>
                {LOADING_STEPS[loadingStep].text}
              </p>
            </div>

            {/* Steps list */}
            <div className="w-full max-w-xs space-y-2">
              {LOADING_STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: i < loadingStep ? "var(--mvp-red)" : i === loadingStep ? "var(--mvp-red-soft)" : "#1a1a1a",
                      border: i === loadingStep ? "1px solid var(--mvp-red-border)" : "none",
                      transition: "all 0.5s ease",
                    }}>
                    {i < loadingStep ? (
                      <i className="ti ti-check" style={{ fontSize: 11, color: "#fff" }} />
                    ) : i === loadingStep ? (
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ background: "var(--mvp-red)" }} />
                    ) : null}
                  </div>
                  <p className="text-xs transition-colors"
                    style={{ color: i <= loadingStep ? "#ccc" : "#333" }}>
                    {s.text}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-neutral-600 text-center">
              Esto puede tardar 15–30 segundos
            </p>
          </div>
        )}

        {/* ══ PASO 5: Resultados ═══════════════════════════════════════════ */}
        {step === 5 && result && (
          <div className="px-4 pt-2 pb-8 space-y-5">

            {/* Análisis */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <div className="flex">
                <div className="w-[3px] shrink-0" style={{ background: "var(--mvp-red)" }} />
                <div className="flex-1 px-4 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ti ti-sparkles" style={{ fontSize: 14, color: "var(--mvp-red)" }} />
                    <p className="text-[10px] uppercase tracking-wider font-bold"
                      style={{ color: "var(--mvp-red)" }}>
                      Análisis de IA
                    </p>
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed">{result.analysis}</p>
                </div>
              </div>
            </div>

            {/* Macros ON */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
                Tus macros · Día de entreno
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Calorías",  val: `${result.macros.kcal_on}`,      unit: "kcal" },
                  { label: "Proteína",  val: `${result.macros.protein_g}g`,   unit: "" },
                  { label: "Hidratos",  val: `${result.macros.carbs_on_g}g`,  unit: "" },
                  { label: "Grasa",     val: `${result.macros.fat_g}g`,       unit: "" },
                ].map(({ label, val, unit }) => (
                  <div key={label} className="rounded-2xl px-4 py-4"
                    style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold text-white mt-1 tabular-nums">{val}</p>
                    {unit && <p className="text-[10px] text-neutral-600">{unit}</p>}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-neutral-600 text-center">
                Día de descanso: {result.macros.kcal_off} kcal · {result.macros.carbs_off_g}g hidratos
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 text-center">
                Tu plan está listo
              </p>

              <button
                onClick={onGoToWorkout}
                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all active:scale-[0.98]"
                style={{ background: "var(--mvp-red)", color: "#fff" }}>
                <div className="flex items-center gap-3">
                  <i className="ti ti-barbell" style={{ fontSize: 22 }} />
                  <div className="text-left">
                    <p className="font-bold text-sm">Ver mi entrenamiento</p>
                    <p className="text-[11px] opacity-75">{prefs.days_per_week} días · ya asignado</p>
                  </div>
                </div>
                <i className="ti ti-chevron-right" style={{ fontSize: 18, opacity: 0.7 }} />
              </button>

              <button
                onClick={onGoToDiet}
                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all active:scale-[0.98]"
                style={{ background: "#141414", border: "1px solid #2a2a2a", color: "#ccc" }}>
                <div className="flex items-center gap-3">
                  <i className="ti ti-salad" style={{ fontSize: 22, color: "#888" }} />
                  <div className="text-left">
                    <p className="font-bold text-sm text-white">Ver mi dieta</p>
                    <p className="text-[11px] text-neutral-500">Plan generado · ya asignado</p>
                  </div>
                </div>
                <i className="ti ti-chevron-right" style={{ fontSize: 18, color: "#555" }} />
              </button>

              <button
                onClick={() => {
                  try { localStorage.removeItem(STORAGE_KEY); } catch {}
                  setStep(1);
                  setResult(null);
                  setPhotoBase64(null);
                  setPhotoPreview(null);
                  setError(null);
                  setLoadingStep(0);
                }}
                className="w-full py-3 rounded-2xl text-sm font-medium"
                style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", color: "#555" }}>
                Generar nuevo plan
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-neutral-700 text-center leading-relaxed px-2">
              Generado por IA · Recomendaciones orientativas. Consulta con un profesional ante dudas de salud.
            </p>
          </div>
        )}

      </div>{/* fin scroll */}

      {/* Footer CTA (steps 1–3) */}
      {step <= 3 && (
        <div className="shrink-0 px-4 pb-6 pt-3 footer-safe"
          style={{ borderTop: "1px solid #1a1a1a", background: "#08090d" }}>
          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as Step)}
              disabled={step === 1 && !step1Valid}
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                background: (step === 1 && !step1Valid) ? "#141414" : "var(--mvp-red)",
                color: (step === 1 && !step1Valid) ? "#444" : "#fff",
                boxShadow: (step === 1 && !step1Valid) ? "none" : "0 4px 20px rgba(192,41,43,0.35)",
              }}>
              Siguiente
              <i className="ti ti-arrow-right" style={{ fontSize: 16 }} />
            </button>
          ) : (
            <button
              onClick={generate}
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                background: "var(--mvp-red)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(192,41,43,0.35)",
              }}>
              <i className="ti ti-sparkles" style={{ fontSize: 16 }} />
              Generar mi plan con IA
            </button>
          )}
          {step === 1 && !step1Valid && (
            <p className="text-[10px] text-neutral-600 text-center mt-2">
              Rellena edad, peso y altura para continuar
            </p>
          )}
        </div>
      )}
    </div>
  );
}
