// AIPlanWizard.tsx — v3
// UX simplificado: una pantalla con datos pre-cargados, foto opcional, genera.
// El usuario solo actualiza el peso si ha cambiado y sube foto si quiere.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../lib/supabase";

type Profile = { id: string; full_name: string; role: string };

interface Props {
  profile:         Profile;
  onGoToWorkout:   () => void;
  onGoToDiet:      () => void;
  onPlanGenerated: () => void;
}

interface ClientData {
  sex:             "male" | "female";
  age:             string;
  height:          string;
  weight:          string;
  activity_factor: string;
  goal:            string;
  days_per_week:   number;
  equipment:       string;
  experience:      string;
  injuries:        string;
}

interface GenerationResult {
  analysis: string;
  macros: {
    kcal_on: number; protein_g: number;
    carbs_on_g: number; fat_g: number;
    kcal_off: number; carbs_off_g: number;
  };
  program_id:   number;
  diet_plan_id: string;
}

// ── Opciones ──────────────────────────────────────────────────────────────────
const GOAL_LABELS: Record<string, string> = {
  lose_fat_aggressive: "Bajar grasa (rápido)",
  lose_fat:            "Bajar grasa",
  lose_fat_soft:       "Bajar grasa (suave)",
  maintain:            "Mantenimiento",
  gain_muscle:         "Ganar músculo",
  bulk:                "Volumen",
};
const EQUIP_LABELS: Record<string, string> = {
  gym_full: "Gimnasio completo", dumbbells: "Pesas libres",
  home: "Casa", calisthenics: "Calistenia",
};
const ACT_LABELS: Record<string, string> = {
  "1.2": "Sedentario", "1.375": "Ligero", "1.55": "Moderado",
  "1.725": "Activo", "1.9": "Muy activo",
};

const LOADING_STEPS = [
  { icon: "ti-brain",    text: "Analizando tus datos…" },
  { icon: "ti-chart-bar",text: "Calculando macros exactos…" },
  { icon: "ti-barbell",  text: "Diseñando tu entrenamiento…" },
  { icon: "ti-salad",    text: "Creando tu dieta personalizada…" },
  { icon: "ti-database", text: "Guardando tu plan completo…" },
];

const DEFAULT_DATA: ClientData = {
  sex: "male", age: "", height: "", weight: "",
  activity_factor: "1.55", goal: "lose_fat",
  days_per_week: 4, equipment: "gym_full",
  experience: "intermediate", injuries: "",
};

const PREFS_KEY = "mvp_ai_prefs_v1";

// ── Pequeño modal de edición inline ──────────────────────────────────────────
// Usa createPortal para renderizar en document.body y escapar del scroll
// container de FitnessApp, evitando el bug de iOS donde fixed queda confinado.
function EditSheet({
  title, children, onClose,
}: { title: string; children: React.ReactNode; onClose: () => void }) {
  return createPortal(
    <div className="fixed inset-0 flex flex-col justify-end" style={{ background: "rgba(0,0,0,0.75)", zIndex: 9999 }}
      onClick={onClose}>
      <div className="rounded-t-3xl flex flex-col overflow-hidden"
        style={{ background: "#0F0F0F", border: "1px solid #1e1e1e", maxHeight: "88dvh" }}
        onClick={e => e.stopPropagation()}>
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <p className="text-white font-bold text-sm">{title}</p>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "#1a1a1a", color: "#777" }}>
            <i className="ti ti-x" style={{ fontSize: 14 }} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function AIPlanWizard({ profile, onGoToWorkout, onGoToDiet, onPlanGenerated }: Props) {
  const RESULT_KEY = `mvp_aiplan_result_${profile.id}`;

  // Estado principal
  const [data, setData] = useState<ClientData>(DEFAULT_DATA);
  const [loadingData, setLoadingData] = useState(true);
  const [isNewClient, setIsNewClient] = useState(false); // true si no hay datos previos

  // Fotos (frente, lateral, espalda)
  type PhotoSlot = { base64: string; mime: string; preview: string } | null;
  const [photos, setPhotos] = useState<{ front: PhotoSlot; side: PhotoSlot; back: PhotoSlot }>({
    front: null, side: null, back: null,
  });
  const fileRefFront = useRef<HTMLInputElement>(null);
  const fileRefSide  = useRef<HTMLInputElement>(null);
  const fileRefBack  = useRef<HTMLInputElement>(null);

  // Estado de generación
  const [generating,   setGenerating]   = useState(false);
  const [loadingStep,  setLoadingStep]  = useState(0);
  const [error,        setError]        = useState<string | null>(null);
  const [result,       setResult]       = useState<GenerationResult | null>(() => {
    try { const s = localStorage.getItem(RESULT_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
  });

  // Modales de edición
  const [editPanel, setEditPanel] = useState<
    "datos" | "objetivo" | "actividad" | "entreno" | null
  >(null);

  // ── Cargar datos del cliente al montar ──────────────────────────────────
  useEffect(() => {
    const loadAll = async () => {
      // Preferencias guardadas localmente (días, equipamiento, etc.)
      let savedPrefs: Partial<ClientData> = {};
      try { const s = localStorage.getItem(PREFS_KEY); if (s) savedPrefs = JSON.parse(s); } catch {}

      // client_macros desde Supabase
      const { data: macros } = await supabase
        .from("client_macros")
        .select("sex, age, height_cm, weight_kg, activity_factor, goal")
        .eq("client_id", profile.id)
        .maybeSingle();

      // Último peso del check-in (puede ser más reciente)
      const { data: lastCheckin } = await supabase
        .from("fold_logs")
        .select("date")
        .eq("client_id", profile.id)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();

      const hasMacros = !!(macros?.weight_kg && macros?.age && macros?.height_cm);
      setIsNewClient(!hasMacros);

      setData(prev => ({
        ...prev,
        sex:             (macros?.sex as "male" | "female") ?? prev.sex,
        age:             macros?.age             ? String(macros.age)             : prev.age,
        height:          macros?.height_cm       ? String(macros.height_cm)       : prev.height,
        weight:          macros?.weight_kg       ? String(macros.weight_kg)       : prev.weight,
        activity_factor: macros?.activity_factor ? String(macros.activity_factor) : prev.activity_factor,
        goal:            macros?.goal            ?? prev.goal,
        // Preferencias de entrenamiento desde localStorage
        days_per_week:   savedPrefs.days_per_week ?? prev.days_per_week,
        equipment:       savedPrefs.equipment     ?? prev.equipment,
        experience:      savedPrefs.experience    ?? prev.experience,
        injuries:        savedPrefs.injuries      ?? prev.injuries,
      }));
      setLoadingData(false);
    };
    loadAll();
  }, [profile.id]);

  // ── Loading step animation ───────────────────────────────────────────────
  useEffect(() => {
    if (!generating) return;
    const iv = setInterval(() => setLoadingStep(p => p < LOADING_STEPS.length - 1 ? p + 1 : p), 3500);
    return () => clearInterval(iv);
  }, [generating]);

  // ── Fotos ────────────────────────────────────────────────────────────────
  const handlePhoto = (file: File, slot: "front" | "side" | "back") => {
    const mime = file.type || "image/jpeg";
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target?.result as string;
      setPhotos(prev => ({ ...prev, [slot]: { base64: url.split(",")[1], mime, preview: url } }));
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = (slot: "front" | "side" | "back") =>
    setPhotos(prev => ({ ...prev, [slot]: null }));

  // ── Guardar prefs en localStorage ────────────────────────────────────────
  const savePrefs = (d: ClientData) => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({
        days_per_week: d.days_per_week, equipment: d.equipment,
        experience: d.experience, injuries: d.injuries,
      }));
    } catch {}
  };

  const upd = (patch: Partial<ClientData>) => {
    setData(prev => { const next = { ...prev, ...patch }; savePrefs(next); return next; });
  };

  // ── Generar ──────────────────────────────────────────────────────────────
  const generate = async () => {
    setGenerating(true);
    setError(null);
    setLoadingStep(0);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("ai-generate-plan", {
        body: {
          client_id:     profile.id,
          personal_data: {
            sex:             data.sex,
            age:             Number(data.age),
            height:          Number(data.height),
            weight:          Number(data.weight),
            activity_factor: Number(data.activity_factor),
            goal:            data.goal,
          },
          training_prefs: {
            days_per_week: data.days_per_week,
            equipment:     data.equipment,
            experience:    data.experience,
            injuries:      data.injuries || "",
          },
          photos: {
            front: photos.front ? { base64: photos.front.base64, mime: photos.front.mime } : null,
            side:  photos.side  ? { base64: photos.side.base64,  mime: photos.side.mime  } : null,
            back:  photos.back  ? { base64: photos.back.base64,  mime: photos.back.mime  } : null,
          },
        },
      });
      if (fnErr || res?.error) throw new Error(fnErr?.message ?? res?.error);
      const r = res as GenerationResult;
      setResult(r);
      try { localStorage.setItem(RESULT_KEY, JSON.stringify(r)); } catch {}
      onPlanGenerated();
    } catch (err) {
      setError(String(err));
    } finally {
      setGenerating(false);
    }
  };

  const resetResult = () => {
    try { localStorage.removeItem(RESULT_KEY); } catch {}
    setResult(null);
    setPhotos({ front: null, side: null, back: null });
    setError(null);
  };

  const canGenerate = photos.front !== null && (
    isNewClient
      ? Number(data.weight) > 0 && Number(data.age) > 0 && Number(data.height) > 0
      : Number(data.weight) > 0
  );

  // ── Render: Loading ───────────────────────────────────────────────────────
  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 px-8"
        style={{ minHeight: "100dvh", background: "#08090d" }}>
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="#1a1a1a" strokeWidth="6" />
            <circle cx="48" cy="48" r="40" fill="none" stroke="var(--mvp-red)" strokeWidth="6"
              strokeDasharray="251"
              strokeDashoffset={251 - 251 * ((loadingStep + 1) / LOADING_STEPS.length)}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
              strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className={`ti ${LOADING_STEPS[loadingStep].icon}`}
              style={{ fontSize: 28, color: "var(--mvp-red)" }} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-white font-bold text-lg">Generando tu plan…</p>
          <p className="text-neutral-400 text-sm">{LOADING_STEPS[loadingStep].text}</p>
        </div>
        <div className="w-full max-w-xs space-y-2">
          {LOADING_STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: i < loadingStep ? "var(--mvp-red)" : i === loadingStep ? "var(--mvp-red-soft)" : "#1a1a1a",
                  border: i === loadingStep ? "1px solid var(--mvp-red-border)" : "none",
                  transition: "all 0.5s",
                }}>
                {i < loadingStep
                  ? <i className="ti ti-check" style={{ fontSize: 11, color: "#fff" }} />
                  : i === loadingStep
                    ? <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--mvp-red)" }} />
                    : null}
              </div>
              <p className="text-xs" style={{ color: i <= loadingStep ? "#ccc" : "#333" }}>{s.text}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-neutral-600">Esto puede tardar 20–30 segundos</p>
      </div>
    );
  }

  // ── Render: Resultados ────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="flex flex-col" style={{ minHeight: "100dvh", background: "#08090d" }}>
        <div className="header-safe shrink-0 flex items-center gap-3 px-4 pt-4 pb-3"
          style={{ borderBottom: "1px solid #1a1a1a" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--mvp-red-soft)", border: "1px solid var(--mvp-red-border)" }}>
            <i className="ti ti-sparkles" style={{ fontSize: 18, color: "var(--mvp-red)" }} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--mvp-red)" }}>
              Tu Plan · IA
            </p>
            <p className="text-white font-bold text-sm">Plan generado</p>
          </div>
          <button onClick={resetResult}
            className="text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ background: "#1a1a1a", color: "#777", border: "1px solid #2a2a2a" }}>
            Nuevo plan
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 space-y-4">
          {/* Análisis */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <div className="flex">
              <div className="w-[3px] shrink-0" style={{ background: "var(--mvp-red)" }} />
              <div className="flex-1 px-4 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="ti ti-sparkles" style={{ fontSize: 14, color: "var(--mvp-red)" }} />
                  <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--mvp-red)" }}>
                    Análisis personalizado
                  </p>
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed">{result.analysis}</p>
              </div>
            </div>
          </div>

          {/* Macros */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
              Tus macros · Día de entreno
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Calorías",  val: `${result.macros.kcal_on}`,     unit: "kcal" },
                { label: "Proteína",  val: `${result.macros.protein_g}g`,  unit: "" },
                { label: "Hidratos",  val: `${result.macros.carbs_on_g}g`, unit: "" },
                { label: "Grasa",     val: `${result.macros.fat_g}g`,      unit: "" },
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
          <div className="space-y-3 pt-1">
            <button onClick={onGoToWorkout}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl active:scale-[0.98] transition-all"
              style={{ background: "var(--mvp-red)", color: "#fff", boxShadow: "0 4px 20px rgba(192,41,43,0.3)" }}>
              <div className="flex items-center gap-3">
                <i className="ti ti-barbell" style={{ fontSize: 22 }} />
                <div className="text-left">
                  <p className="font-bold text-sm">Ver mi entrenamiento</p>
                  <p className="text-[11px] opacity-75">{data.days_per_week} días · ya asignado</p>
                </div>
              </div>
              <i className="ti ti-chevron-right" style={{ fontSize: 18, opacity: 0.7 }} />
            </button>

            <button onClick={onGoToDiet}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl active:scale-[0.98] transition-all"
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
          </div>

          <p className="text-[10px] text-neutral-700 text-center leading-relaxed px-2 pt-2">
            Generado por IA · Recomendaciones orientativas. Consulta con tu entrenador ante cualquier duda.
          </p>
        </div>
      </div>
    );
  }

  // ── Render: Pantalla principal (datos + foto) ─────────────────────────────
  return (
    <div className="flex flex-col" style={{ minHeight: "100dvh", background: "#08090d" }}>
      {/* Header */}
      <div className="header-safe shrink-0 flex items-center gap-3 px-4 pt-4 pb-3"
        style={{ borderBottom: "1px solid #1a1a1a" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--mvp-red-soft)", border: "1px solid var(--mvp-red-border)" }}>
          <i className="ti ti-sparkles" style={{ fontSize: 18, color: "var(--mvp-red)" }} />
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--mvp-red)" }}>
            IA · MVP Team
          </p>
          <p className="text-white font-bold text-sm">Tu Plan Personalizado</p>
        </div>
      </div>

      {/* Scroll */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">

        {loadingData ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: "var(--mvp-red)", borderTopColor: "transparent" }} />
          </div>
        ) : (
          <>
            {/* ── Cliente nuevo: formulario expandido ── */}
            {isNewClient ? (
              <div className="space-y-4">
                <div className="rounded-xl px-4 py-3 flex items-start gap-2"
                  style={{ background: "var(--mvp-red-soft)", border: "1px solid var(--mvp-red-border)" }}>
                  <i className="ti ti-info-circle shrink-0 mt-0.5" style={{ fontSize: 14, color: "var(--mvp-red)" }} />
                  <p className="text-xs leading-relaxed" style={{ color: "var(--mvp-red)" }}>
                    Primera vez · rellena tus datos básicos para generar tu plan personalizado
                  </p>
                </div>

                {/* Sexo */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">Sexo</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ v: "male", l: "Hombre", icon: "ti-mars" }, { v: "female", l: "Mujer", icon: "ti-venus" }].map(({ v, l, icon }) => (
                      <button key={v} onClick={() => upd({ sex: v as "male" | "female" })}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
                        style={{
                          background: data.sex === v ? "var(--mvp-red-soft)" : "#141414",
                          border: `1px solid ${data.sex === v ? "var(--mvp-red-border)" : "#222"}`,
                          color: data.sex === v ? "var(--mvp-red)" : "#666",
                        }}>
                        <i className={`ti ${icon}`} style={{ fontSize: 16 }} />{l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Edad / Altura / Peso */}
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { f: "age",    l: "Edad",   u: "años", ph: "30" },
                    { f: "height", l: "Altura", u: "cm",   ph: "175" },
                    { f: "weight", l: "Peso",   u: "kg",   ph: "75" },
                  ] as const).map(({ f, l, u, ph }) => (
                    <div key={f} className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500 text-center">{l}</p>
                      <div className="rounded-xl overflow-hidden"
                        style={{ background: "#141414", border: `1px solid ${!data[f] ? "var(--mvp-red-border)" : "#222"}` }}>
                        <input type="number" value={data[f]}
                          onChange={e => upd({ [f]: e.target.value } as Partial<ClientData>)}
                          placeholder={ph}
                          className="w-full px-2 py-3 text-white font-bold text-sm text-center bg-transparent focus:outline-none" />
                      </div>
                      <p className="text-[9px] text-neutral-600 text-center">{u}</p>
                    </div>
                  ))}
                </div>

                {/* Objetivo */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">Objetivo</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(GOAL_LABELS).map(([v, l]) => (
                      <button key={v} onClick={() => upd({ goal: v })}
                        className="py-2.5 px-3 rounded-xl text-xs font-semibold text-left"
                        style={{
                          background: data.goal === v ? "var(--mvp-red-soft)" : "#141414",
                          border: `1px solid ${data.goal === v ? "var(--mvp-red-border)" : "#222"}`,
                          color: data.goal === v ? "var(--mvp-red)" : "#777",
                        }}>{l}</button>
                    ))}
                  </div>
                </div>

                {/* Días y equipamiento */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">Días/semana</p>
                    <div className="flex gap-2">
                      {[3, 4, 5, 6].map(d => (
                        <button key={d} onClick={() => upd({ days_per_week: d })}
                          className="w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center shrink-0"
                          style={{
                            background: data.days_per_week === d ? "var(--mvp-red)" : "#141414",
                            border: `1px solid ${data.days_per_week === d ? "transparent" : "#222"}`,
                            color: data.days_per_week === d ? "#fff" : "#555",
                          }}>{d}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">Equipamiento</p>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(EQUIP_LABELS).map(([v, l]) => (
                        <button key={v} onClick={() => upd({ equipment: v })}
                          className="py-1.5 rounded-lg text-[10px] font-semibold leading-tight"
                          style={{
                            background: data.equipment === v ? "var(--mvp-red-soft)" : "#141414",
                            border: `1px solid ${data.equipment === v ? "var(--mvp-red-border)" : "#222"}`,
                            color: data.equipment === v ? "var(--mvp-red)" : "#555",
                          }}>{l}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            ) : (
              /* ── Cliente con datos: peso + resumen colapsado ── */
              <>
                {/* Peso */}
                <div className="rounded-2xl overflow-hidden"
                  style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                  <div className="flex">
                    <div className="w-[3px] shrink-0" style={{ background: "var(--mvp-red)" }} />
                    <div className="flex-1 px-4 py-4">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-2">
                        Tu peso actual
                      </p>
                      <div className="flex items-center gap-3">
                        <input type="number" value={data.weight}
                          onChange={e => upd({ weight: e.target.value })}
                          placeholder="75"
                          className="w-28 text-3xl font-bold text-white bg-transparent focus:outline-none tabular-nums" />
                        <span className="text-neutral-500 text-lg">kg</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumen colapsado */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
                    Tus datos · toca para editar
                  </p>
                  {[
                    { panel: "datos" as const,     icon: "ti-user",    label: "Cuerpo",          val: `${data.sex === "male" ? "Hombre" : "Mujer"} · ${data.age || "—"} años · ${data.height || "—"} cm` },
                    { panel: "objetivo" as const,  icon: "ti-target",  label: "Objetivo",         val: GOAL_LABELS[data.goal] ?? data.goal },
                    { panel: "actividad" as const, icon: "ti-flame",   label: "Actividad diaria", val: ACT_LABELS[data.activity_factor] ?? `×${data.activity_factor}` },
                    { panel: "entreno" as const,   icon: "ti-barbell", label: "Entrenamiento",    val: `${data.days_per_week} días/sem · ${EQUIP_LABELS[data.equipment] ?? data.equipment}` },
                  ].map(({ panel, icon, label, val }) => (
                    <button key={panel} onClick={() => setEditPanel(panel)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl active:opacity-70 transition-all"
                      style={{ background: "#141414", border: "1px solid #222" }}>
                      <i className={`ti ${icon}`} style={{ fontSize: 18, color: "#555" }} />
                      <div className="flex-1 text-left">
                        <p className="text-xs text-neutral-500">{label}</p>
                        <p className="text-sm text-white font-medium">{val}</p>
                      </div>
                      <i className="ti ti-chevron-right" style={{ fontSize: 14, color: "#444" }} />
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── Fotos corporales ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
                  Fotos corporales
                </p>
                <span className="text-[10px] text-neutral-600">
                  mejoran mucho el análisis
                </span>
              </div>

              {/* Inputs ocultos */}
              <input ref={fileRefFront} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handlePhoto(f, "front"); }} />
              <input ref={fileRefSide}  type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handlePhoto(f, "side");  }} />
              <input ref={fileRefBack}  type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handlePhoto(f, "back");  }} />

              {/* Grid de slots */}
              <div className="grid grid-cols-3 gap-2">
                {([
                  { slot: "front" as const, ref: fileRefFront, label: "Frente",  required: true  },
                  { slot: "side"  as const, ref: fileRefSide,  label: "Lateral", required: false },
                  { slot: "back"  as const, ref: fileRefBack,  label: "Espalda", required: false },
                ]).map(({ slot, ref, label, required }) => {
                  const p = photos[slot];
                  return (
                    <div key={slot} className="space-y-1">
                      <p className="text-[10px] text-center font-semibold"
                        style={{ color: required ? "var(--mvp-red)" : "#555" }}>
                        {label}{!required && <span className="text-neutral-600"> (opc)</span>}
                      </p>
                      {p ? (
                        <div className="relative rounded-xl overflow-hidden aspect-[3/4]">
                          <img src={p.preview} alt={label} className="w-full h-full object-cover" />
                          <button onClick={() => clearPhoto(slot)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(0,0,0,0.8)", color: "#fff" }}>
                            <i className="ti ti-x" style={{ fontSize: 11 }} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => ref.current?.click()}
                          className="w-full aspect-[3/4] rounded-xl flex flex-col items-center justify-center gap-1 active:opacity-70"
                          style={{
                            background: "#141414",
                            border: `2px dashed ${required ? "var(--mvp-red-border)" : "#2a2a2a"}`,
                          }}>
                          <i className="ti ti-camera"
                            style={{ fontSize: 22, color: required ? "var(--mvp-red)" : "#444" }} />
                          <span className="text-[9px] font-medium"
                            style={{ color: required ? "var(--mvp-red)" : "#444" }}>
                            {required ? "Requerida" : "Opcional"}
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Hint */}
              <p className="text-[10px] text-neutral-500 text-center leading-relaxed">
                De pie · ropa ajustada · buena iluminación
              </p>
              {photos.front && (!photos.side || !photos.back) && (
                <p className="text-[10px] text-center leading-relaxed px-2"
                  style={{ color: "#666" }}>
                  <i className="ti ti-info-circle" style={{ fontSize: 11, marginRight: 3 }} />
                  Añadir lateral y espalda mejora la precisión del análisis
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl px-4 py-3 flex items-start gap-2"
                style={{ background: "#1a0a0a", border: "1px solid #4a1a1a" }}>
                <i className="ti ti-alert-triangle shrink-0 mt-0.5" style={{ fontSize: 14, color: "#f87171" }} />
                <div>
                  <p className="text-xs text-red-400 font-semibold">Error al generar</p>
                  <p className="text-xs text-red-500 mt-0.5">{error}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Botón generar */}
      <div className="shrink-0 px-4 pb-6 pt-3 footer-safe"
        style={{ borderTop: "1px solid #1a1a1a", background: "#08090d" }}>
        <button
          onClick={generate}
          disabled={!canGenerate || loadingData}
          className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{
            background: canGenerate ? "var(--mvp-red)" : "#141414",
            color: canGenerate ? "#fff" : "#444",
            boxShadow: canGenerate ? "0 4px 20px rgba(192,41,43,0.35)" : "none",
          }}>
          <i className="ti ti-sparkles" style={{ fontSize: 16 }} />
          {error ? "Reintentar generación" : "Generar mi plan con IA"}
        </button>
        {!canGenerate && !loadingData && (
          <p className="text-[10px] text-neutral-600 text-center mt-2">
            {!photos.front
              ? "Sube al menos la foto frontal para continuar"
              : isNewClient
              ? "Rellena edad, altura y peso para continuar"
              : "Introduce tu peso para continuar"}
          </p>
        )}
      </div>

      {/* ── Paneles de edición ── */}

      {editPanel === "datos" && (
        <EditSheet title="Datos corporales" onClose={() => setEditPanel(null)}>
          <div className="space-y-4">
            {/* Sexo */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500">Sexo</p>
              <div className="grid grid-cols-2 gap-2">
                {[{ v: "male", l: "Hombre" }, { v: "female", l: "Mujer" }].map(({ v, l }) => (
                  <button key={v} onClick={() => upd({ sex: v as "male" | "female" })}
                    className="py-3 rounded-xl font-semibold text-sm"
                    style={{
                      background: data.sex === v ? "var(--mvp-red-soft)" : "#1a1a1a",
                      border: `1px solid ${data.sex === v ? "var(--mvp-red-border)" : "#2a2a2a"}`,
                      color: data.sex === v ? "var(--mvp-red)" : "#777",
                    }}>{l}</button>
                ))}
              </div>
            </div>
            {/* Edad / Altura */}
            <div className="grid grid-cols-2 gap-3">
              {([
                { f: "age",    l: "Edad",   u: "años" },
                { f: "height", l: "Altura", u: "cm"   },
              ] as const).map(({ f, l, u }) => (
                <div key={f} className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500">{l}</p>
                  <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                    style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
                    <input type="number" value={data[f]}
                      onChange={e => upd({ [f]: e.target.value } as Partial<ClientData>)}
                      className="w-full text-white text-sm font-bold bg-transparent focus:outline-none" />
                    <span className="text-neutral-600 text-xs shrink-0">{u}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </EditSheet>
      )}

      {editPanel === "objetivo" && (
        <EditSheet title="Tu objetivo" onClose={() => setEditPanel(null)}>
          <div className="space-y-2">
            {Object.entries(GOAL_LABELS).map(([v, l]) => (
              <button key={v} onClick={() => { upd({ goal: v }); setEditPanel(null); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: data.goal === v ? "var(--mvp-red-soft)" : "#1a1a1a",
                  border: `1px solid ${data.goal === v ? "var(--mvp-red-border)" : "#2a2a2a"}`,
                }}>
                {data.goal === v && <i className="ti ti-check shrink-0" style={{ fontSize: 14, color: "var(--mvp-red)" }} />}
                <span className="text-sm font-semibold"
                  style={{ color: data.goal === v ? "var(--mvp-red)" : "#aaa" }}>{l}</span>
              </button>
            ))}
          </div>
        </EditSheet>
      )}

      {editPanel === "actividad" && (
        <EditSheet title="Actividad diaria" onClose={() => setEditPanel(null)}>
          <div className="space-y-2">
            {Object.entries(ACT_LABELS).map(([v, l]) => (
              <button key={v} onClick={() => { upd({ activity_factor: v }); setEditPanel(null); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: data.activity_factor === v ? "var(--mvp-red-soft)" : "#1a1a1a",
                  border: `1px solid ${data.activity_factor === v ? "var(--mvp-red-border)" : "#2a2a2a"}`,
                }}>
                {data.activity_factor === v && <i className="ti ti-check shrink-0" style={{ fontSize: 14, color: "var(--mvp-red)" }} />}
                <div className="text-left">
                  <p className="text-sm font-semibold"
                    style={{ color: data.activity_factor === v ? "var(--mvp-red)" : "#aaa" }}>{l}</p>
                  <p className="text-[10px] text-neutral-600">×{v}</p>
                </div>
              </button>
            ))}
          </div>
        </EditSheet>
      )}

      {editPanel === "entreno" && (
        <EditSheet title="Preferencias de entreno" onClose={() => setEditPanel(null)}>
          <div className="space-y-5">
            {/* Días */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500">Días / semana</p>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map(d => (
                  <button key={d} onClick={() => upd({ days_per_week: d })}
                    className="w-11 h-11 rounded-full text-sm font-bold flex items-center justify-center shrink-0"
                    style={{
                      background: data.days_per_week === d ? "var(--mvp-red)" : "#1a1a1a",
                      border: `1px solid ${data.days_per_week === d ? "transparent" : "#2a2a2a"}`,
                      color: data.days_per_week === d ? "#fff" : "#666",
                    }}>{d}</button>
                ))}
              </div>
            </div>
            {/* Equipamiento */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500">Equipamiento</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(EQUIP_LABELS).map(([v, l]) => (
                  <button key={v} onClick={() => upd({ equipment: v })}
                    className="px-4 py-2 rounded-full text-xs font-semibold"
                    style={{
                      background: data.equipment === v ? "var(--mvp-red-soft)" : "#1a1a1a",
                      border: `1px solid ${data.equipment === v ? "var(--mvp-red-border)" : "#2a2a2a"}`,
                      color: data.equipment === v ? "var(--mvp-red)" : "#777",
                    }}>{l}</button>
                ))}
              </div>
            </div>
            {/* Experiencia */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500">Experiencia</p>
              <div className="space-y-1.5">
                {[
                  { v: "beginner", l: "Principiante", d: "< 1 año" },
                  { v: "intermediate", l: "Intermedio", d: "1–3 años" },
                  { v: "advanced", l: "Avanzado", d: "> 3 años" },
                ].map(({ v, l, d }) => (
                  <button key={v} onClick={() => upd({ experience: v })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{
                      background: data.experience === v ? "var(--mvp-red-soft)" : "#1a1a1a",
                      border: `1px solid ${data.experience === v ? "var(--mvp-red-border)" : "#2a2a2a"}`,
                    }}>
                    {data.experience === v && <i className="ti ti-check shrink-0" style={{ fontSize: 12, color: "var(--mvp-red)" }} />}
                    <div className="text-left">
                      <p className="text-sm font-semibold"
                        style={{ color: data.experience === v ? "var(--mvp-red)" : "#aaa" }}>{l}</p>
                      <p className="text-[10px] text-neutral-600">{d}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {/* Lesiones */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                Lesiones · <span className="normal-case font-normal">opcional</span>
              </p>
              <textarea value={data.injuries} onChange={e => upd({ injuries: e.target.value })}
                placeholder="Ej: rodilla, lumbar…" rows={2}
                className="w-full rounded-xl px-3 py-2.5 text-white text-sm placeholder-neutral-700 focus:outline-none resize-none"
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }} />
            </div>
          </div>
        </EditSheet>
      )}
    </div>
  );
}
