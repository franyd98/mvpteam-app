import { useEffect, useLayoutEffect, useRef, useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import heic2any from "heic2any";
import MiniChart from "../components/MiniChart";
import type { ChartPoint } from "../components/MiniChart";
type Profile = { id: string; full_name: string; role: string };
type Tab = "hoy" | "progreso" | "registro";
type RegTab = "peso" | "perimetros" | "pliegues" | "fatiga" | "antropometria" | "fotos";
type EnergyLevel = "bajo" | "normal" | "alto" | "";

const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
const fmtShort = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" });

// ── Helpers UI ───────────────────────────────────────────────────
function Field({ label, value, onChange, unit = "", placeholder = "", step = "0.1" }: {
  label: string; value: string; onChange: (v: string) => void;
  unit?: string; placeholder?: string; step?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number" step={step} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder || "—"}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-700"
        />
        {unit && <span className="text-neutral-500 text-xs shrink-0">{unit}</span>}
      </div>
    </div>
  );
}

function FatigueSlider({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  const n = Number(value) || 0;
  const color = n >= 8 ? "bg-red-500" : n >= 5 ? "bg-amber-400" : n > 0 ? "bg-emerald-500" : "bg-neutral-700";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-neutral-300 w-28 shrink-0">{label}</span>
      <input type="range" min="0" max="10" step="1" value={value || "0"}
        onChange={e => onChange(e.target.value)}
        className="flex-1 accent-white" />
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
        {value || "0"}
      </div>
    </div>
  );
}

// ── Tabla Antropometría ──────────────────────────────────────────
export function AntroTable({ weightLogs, perimLogs, foldLogs }: {
  weightLogs: any[]; perimLogs: any[]; foldLogs: any[];
}) {
  // Recoger todas las fechas únicas y ordenarlas
  const allDates = [...new Set([
    ...weightLogs.map((l: any) => l.date),
    ...perimLogs.map((l: any) => l.date),
    ...foldLogs.map((l: any) => l.date),
  ])].sort();

  const wByDate: Record<string, any> = Object.fromEntries(weightLogs.map((l: any) => [l.date, l]));
  const pByDate: Record<string, any> = Object.fromEntries(perimLogs.map((l: any) => [l.date, l]));
  const flByDate: Record<string, any> = Object.fromEntries(foldLogs.map((l: any) => [l.date, l]));

  // Los 10 sitios en orden del Excel (fórmula: Σ / 1000 = % grasa)
  const foldFields: [string, string][] = [
    ["calf",       "1. Gemelo"],
    ["quad",       "2. Cuádriceps"],
    ["navel",      "3. Abd. Baja"],
    ["abd_upper",  "4. Abd. Alta"],
    ["chest",      "5. Pecho"],
    ["shoulder",   "6. Hombro"],
    ["bicep",      "7. Bíceps"],
    ["tricep",     "8. Tríceps"],
    ["subscapular","9. Subescapular"],
    ["lumbar",     "10. Lumbar"],
  ];

  // Campos de perímetros (relajado)
  const perimFields: [string, string][] = [
    ["calf_r_r", "Gemelo D"], ["quad_r_r", "Cuádriceps D"],
    ["abd_navel_r", "Abd. Ombligo"], ["abd_upper_r", "Abd. Superior"],
    ["chest_r", "Pecho"], ["back_r", "Espalda"], ["bicep_r_r", "Bíceps D"],
  ];

  if (allDates.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-500 text-sm">Sin datos todavía.</p>
        <p className="text-neutral-600 text-xs mt-1">Registra peso, perímetros y pliegues primero.</p>
      </div>
    );
  }

  const fmt = (v: any) => v != null ? String(v) : "—";

  // ── Calcular valores derivados por fecha ──
  type Visit = {
    peso: number | null;
    sumFolds: number | null;
    critAbd: number | null;
    critLumb: number | null;
    fatPctReal: number | null;
    masaGrasa: number | null;
    masaMagra: number | null;
  };

  const visits: Visit[] = allDates.map(d => {
    const w = wByDate[d];
    const fl = flByDate[d];

    const peso = w?.weight_fasting ?? null;
    const sumFolds = fl
      ? foldFields.reduce((s, [k]) => s + (parseFloat(fl[k]) || 0), 0) || null
      : null;
    const critAbd = fl?.critical_abdomen ?? null;
    const critLumb = fl?.critical_lumbar ?? null;
    const fatPctReal = fl?.fat_pct_real ?? null;
    const masaGrasa = (fatPctReal != null && peso != null) ? parseFloat(((fatPctReal / 100) * peso).toFixed(2)) : null;
    const masaMagra = (masaGrasa != null && peso != null) ? parseFloat((peso - masaGrasa).toFixed(2)) : null;

    return { peso, sumFolds, critAbd, critLumb, fatPctReal, masaGrasa, masaMagra };
  });

  // Gráfica: eje Y = max peso
  const maxPeso = Math.max(...visits.map(v => v.peso ?? 0), 1);

  // ── Componentes de fila ──
  const COL = 20; // ancho px de cada columna visita
  const LABEL_W = 136; // px label

  const Row = ({ label, values, bold = false, gray = false, unit = "" }: {
    label: string; values: string[]; bold?: boolean; gray?: boolean; unit?: string;
  }) => (
    <div className={`flex border-b border-neutral-800 ${bold ? "bg-neutral-800/60" : ""}`}>
      <div style={{ minWidth: LABEL_W }} className={`px-2 py-2 text-xs leading-tight ${bold ? "text-white font-bold" : gray ? "text-neutral-600" : "text-neutral-400"}`}>
        {label}{unit ? <span className="text-neutral-700 font-normal"> {unit}</span> : ""}
      </div>
      {values.map((val, i) => (
        <div key={i} style={{ minWidth: 80 }}
          className={`px-2 py-2 text-center text-xs tabular-nums ${bold ? "text-white font-bold" : val === "—" ? "text-neutral-700" : "text-neutral-200"}`}>
          {val}
        </div>
      ))}
    </div>
  );

  const SectionHead = ({ label }: { label: string }) => (
    <div className="flex bg-neutral-900 border-b border-neutral-700">
      <div style={{ minWidth: LABEL_W }} className="px-2 py-1.5">
        <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">{label}</span>
      </div>
      {allDates.map((_, i) => <div key={i} style={{ minWidth: 80 }} />)}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Tabla principal */}
      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        {/* Header */}
        <div className="flex bg-neutral-900 border-b border-neutral-700">
          <div style={{ minWidth: LABEL_W }} className="px-2 py-2" />
          {allDates.map((date, i) => {
            const isP = !!(wByDate[date]?.is_presencial || pByDate[date]?.is_presencial || flByDate[date]?.is_presencial);
            return (
              <div key={date} style={{ minWidth: 80 }} className="text-center px-1 py-2">
                <div className="flex items-center justify-center gap-1">
                  <p className="text-[10px] text-neutral-500 font-semibold uppercase">V{i + 1}</p>
                  {isP && (
                    <span className="text-[8px] bg-emerald-800 text-emerald-300 rounded px-1 font-bold leading-tight">P</span>
                  )}
                </div>
                <p className="text-[10px] text-neutral-400">{fmtShort(date)}</p>
              </div>
            );
          })}
        </div>

        {/* PESO */}
        <SectionHead label="PESO" />
        <Row label="Ayunas" unit="kg" values={allDates.map(d => fmt(wByDate[d]?.weight_fasting))} />
        <Row label="Noche" unit="kg" gray values={allDates.map(d => fmt(wByDate[d]?.weight_evening))} />

        {/* PERÍMETROS */}
        <SectionHead label="PERÍMETROS (cm)" />
        {perimFields.map(([k, label]) => (
          <Row key={k} label={label} values={allDates.map(d => fmt(pByDate[d]?.[k]))} />
        ))}

        {/* PLIEGUES */}
        <SectionHead label="PLIEGUES (mm)" />
        {foldFields.map(([k, label]) => (
          <Row key={k} label={label} values={allDates.map(d => fmt(flByDate[d]?.[k]))} />
        ))}
        <Row label="Σ Pliegues" unit="mm" bold
          values={visits.map(v => v.sumFolds != null ? v.sumFolds.toFixed(1) : "—")}
        />
        <Row label="% Grasa (Σ/10)" bold
          values={visits.map(v => v.sumFolds != null ? (v.sumFolds / 10).toFixed(2) + "%" : "—")}
        />

        {/* COMPOSICIÓN CORPORAL */}
        <SectionHead label="COMPOSICIÓN" />
        <Row label="Pleg. Crit. Abd." unit="mm" gray
          values={visits.map(v => v.critAbd != null ? String(v.critAbd) : "—")}
        />
        <Row label="Pleg. Crit. Lumb." unit="mm" gray
          values={visits.map(v => v.critLumb != null ? String(v.critLumb) : "—")}
        />
        <Row label="% Grasa Real" unit="%" bold
          values={visits.map(v => v.fatPctReal != null ? v.fatPctReal.toFixed(2) + "%" : "—")}
        />
        <Row label="Masa Grasa" unit="kg"
          values={visits.map(v => v.masaGrasa != null ? v.masaGrasa.toFixed(2) : "—")}
        />
        <Row label="Masa Magra" unit="kg" bold
          values={visits.map(v => v.masaMagra != null ? v.masaMagra.toFixed(2) : "—")}
        />
      </div>

      {/* Gráfica Masa Magra / Masa Grasa */}
      {visits.some(v => v.masaMagra != null) && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wider text-neutral-500 mb-4">Composición corporal por visita</p>

          {/* Eje Y etiquetas */}
          <div className="flex gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-blue-500" />
              <span className="text-[10px] text-neutral-400">Masa magra</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-rose-500" />
              <span className="text-[10px] text-neutral-400">Masa grasa</span>
            </div>
          </div>

          {/* Barras */}
          <div className="flex items-end gap-3 h-40">
            {visits.map((v, i) => {
              const d = allDates[i];
              const isP = !!(wByDate[d]?.is_presencial || pByDate[d]?.is_presencial || flByDate[d]?.is_presencial);
              if (!v.peso) return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-neutral-700 text-[10px]">—</div>
                  <p className="text-[10px] text-neutral-600">V{i + 1}{isP ? " P" : ""}</p>
                </div>
              );

              const totalHeight = (v.peso / maxPeso) * 100;
              const masaMagraH = v.masaMagra != null ? (v.masaMagra / maxPeso) * 100 : totalHeight;
              const masaGrasaH = v.masaGrasa != null ? (v.masaGrasa / maxPeso) * 100 : 0;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end" style={{ height: "136px" }}>
                    {/* Barra apilada */}
                    <div className="w-full flex flex-col rounded-t overflow-hidden"
                      style={{ height: `${totalHeight}%` }}>
                      {/* Masa magra arriba */}
                      <div className="w-full bg-blue-500 flex items-center justify-center relative"
                        style={{ flex: masaMagraH }}>
                        {v.masaMagra != null && (
                          <span className="text-[9px] text-white font-bold">{v.masaMagra.toFixed(1)}</span>
                        )}
                      </div>
                      {/* Masa grasa abajo */}
                      {masaGrasaH > 0 && (
                        <div className="w-full bg-rose-500 flex items-center justify-center"
                          style={{ flex: masaGrasaH }}>
                          <span className="text-[9px] text-white font-bold">{v.masaGrasa?.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-500">V{i + 1}{isP ? " P" : ""}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-componente: Pestaña Progreso ─────────────────────────────
function ProgresoTab({ weightLogs, foldLogs, perimLogs, foldKeys }: {
  weightLogs: any[]; foldLogs: any[]; perimLogs: any[]; foldKeys: string[];
}) {
  const fmtLbl = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" });

  const wSorted  = [...weightLogs].filter(l => l.weight_fasting != null).sort((a, b) => a.date.localeCompare(b.date));
  const flSorted = [...foldLogs].filter(l => l.fat_pct_real != null || foldKeys.some(k => l[k] != null)).sort((a, b) => a.date.localeCompare(b.date));
  const pSorted  = [...perimLogs].filter(l => l.abd_navel_r != null).sort((a, b) => a.date.localeCompare(b.date));

  const weightPts: ChartPoint[] = wSorted.map(l => ({ label: fmtLbl(l.date), value: parseFloat(l.weight_fasting) }));
  const fatPts: ChartPoint[]    = flSorted.map(l => {
    const real = l.fat_pct_real;
    const calc = foldKeys.reduce((s: number, k: string) => s + (parseFloat(l[k]) || 0), 0) / 10;
    return { label: fmtLbl(l.date), value: real != null ? parseFloat(real) : parseFloat(calc.toFixed(2)) };
  });
  const abdPts: ChartPoint[] = pSorted.map(l => ({ label: fmtLbl(l.date), value: parseFloat(l.abd_navel_r) }));

  if (weightPts.length < 2 && fatPts.length < 2 && abdPts.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-4xl mb-3">📈</p>
        <p className="text-white font-semibold mb-1">Sin datos suficientes</p>
        <p className="text-neutral-500 text-sm px-8">Registra al menos 2 mediciones de peso, pliegues o perímetros para ver tu evolución.</p>
      </div>
    );
  }

  const charts: { title: string; pts: ChartPoint[]; color: string; unit: string }[] = [
    { title: "⚖️ Peso corporal",       pts: weightPts, color: "#C0394F", unit: " kg" },
    { title: "📌 % Grasa corporal",    pts: fatPts,    color: "#F59E0B", unit: "%"   },
    { title: "📏 Perímetro abdominal", pts: abdPts,    color: "#3B82F6", unit: " cm" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-[10px] uppercase tracking-wider text-neutral-500">Evolución en el tiempo</p>
      {charts.map(({ title, pts, color, unit }) => {
        if (pts.length < 2) return null;
        const first = pts[0].value;
        const last  = pts[pts.length - 1].value;
        const delta = last - first;
        const deltaColor = delta < 0 ? "#4ADE80" : delta > 0 ? "#F87171" : "#FBBF24";
        return (
          <div key={title} className="rounded-2xl p-4 space-y-2" style={{ background: "#111", border: "1px solid #1E1E1E" }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-neutral-300">{title}</p>
              <span className="text-xs font-bold tabular-nums" style={{ color: deltaColor }}>
                {delta > 0 ? "+" : ""}{delta.toFixed(1)}{unit} total
              </span>
            </div>
            <MiniChart data={pts} color={color} unit={unit} height={100} />
            <div className="flex justify-between text-[10px] text-neutral-600 px-1 pt-1">
              <span>Inicio: <span className="text-neutral-400 font-medium">{first.toFixed(1)}{unit}</span></span>
              <span>{pts.length} mediciones</span>
              <span>Actual: <span className="text-neutral-400 font-medium">{last.toFixed(1)}{unit}</span></span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────
export default function CheckInPage({ profile, onBack }: { profile: Profile; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("hoy");
  const [regTab, setRegTab] = useState<RegTab>("peso");
  const contentScrollRef = useRef<HTMLDivElement>(null);

  // ── REGISTRO RÁPIDO ───────────────────────────────────────────
  const [quickDate,   setQuickDate]   = useState(today());
  const [quickWeight, setQuickWeight] = useState("");
  const [quickEnergy, setQuickEnergy] = useState<EnergyLevel>("");
  const [quickSaved,  setQuickSaved]  = useState(false);
  const [savingQuick, setSavingQuick] = useState(false);
  const [quickPhotoFile, setQuickPhotoFile] = useState<File | null>(null);
  const [quickPhotoReady, setQuickPhotoReady] = useState(false);

  // ── PESO ──────────────────────────────────────────────────────
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [wf, setWf] = useState({ date: today(), fasting: "", evening: "", notes: "" });
  const [savingW, setSavingW] = useState(false);

  // ── PERÍMETROS ────────────────────────────────────────────────
  const [perimLogs, setPerimLogs] = useState<any[]>([]);
  const emptyPerim = () => ({
    date: today(),
    bicep_r_c: "", bicep_l_c: "", chest_c: "", back_c: "",
    iliac_c: "", abd_upper_c: "", abd_navel_c: "", hip_c: "",
    quad_r_c: "", quad_l_c: "", calf_r_c: "", calf_l_c: "",
    bicep_r_r: "", bicep_l_r: "", chest_r: "", back_r: "",
    iliac_r: "", abd_upper_r: "", abd_navel_r: "", hip_r: "",
    quad_r_r: "", quad_l_r: "", calf_r_r: "", calf_l_r: "",
  });
  const [pf, setPf] = useState<Record<string, string>>(emptyPerim());
  const [savingP, setSavingP] = useState(false);

  // ── PLIEGUES ─────────────────────────────────────────────────
  const [foldLogs, setFoldLogs] = useState<any[]>([]);
  // Los 10 sitios en orden del Excel (fórmula: Σ10 / 1000 = % grasa)
  const emptyFold = () => ({
    date: today(),
    calf: "",       // 1. Gemelo
    quad: "",       // 2. Cuádriceps
    navel: "",      // 3. Abd. Baja (ombligo)
    abd_upper: "",  // 4. Abd. Alta
    chest: "",      // 5. Pecho
    shoulder: "",   // 6. Hombro
    bicep: "",      // 7. Bíceps
    tricep: "",     // 8. Tríceps
    subscapular: "",// 9. Subescapular
    lumbar: "",     // 10. Lumbar
    iliac_crest: "", // extra (no está en fórmula pero se mide)
    critical_abdomen: "", critical_lumbar: "", fat_pct_real: "",
  });
  const [flf, setFlf] = useState<Record<string, string>>(emptyFold());
  const [savingFl, setSavingFl] = useState(false);

  // ── FATIGA ────────────────────────────────────────────────────
  const [fatigueLogs, setFatigueLogs] = useState<any[]>([]);
  const emptyFatigue = () => ({
    date: today(), microcycle: "", session_type: "", global_energy: "",
    shoulder: "0", chest: "0", bicep: "0", tricep: "0",
    back: "0", upper_back: "0", quad: "0", adductor: "0",
    hamstring: "0", glute: "0", calf: "0",
  });
  const [ff, setFf] = useState<Record<string, string>>(emptyFatigue());
  const [savingF, setSavingF] = useState(false);

  // ── FOTOS ─────────────────────────────────────────────────────
  const [photoLogs, setPhotoLogs] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ── BORRADO ───────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Reset scroll del contenedor interno al cambiar de pestaña
  useLayoutEffect(() => {
    if (contentScrollRef.current) contentScrollRef.current.scrollTop = 0;
  }, [tab]);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const cid = profile.id;
    const [w, p, fl, f, ph] = await Promise.all([
      supabase.from("weight_logs").select("*").eq("client_id", cid).order("date", { ascending: false }).limit(20),
      supabase.from("perimeter_logs").select("*").eq("client_id", cid).order("date", { ascending: false }).limit(20),
      supabase.from("fold_logs").select("*").eq("client_id", cid).order("date", { ascending: false }).limit(20),
      supabase.from("fatigue_logs").select("*").eq("client_id", cid).order("date", { ascending: false }).limit(20),
      supabase.from("checkin_photos").select("*").eq("client_id", cid).order("created_at", { ascending: false }).limit(60),
    ]);
    setWeightLogs(w.data ?? []);
    setPerimLogs(p.data ?? []);
    setFoldLogs(fl.data ?? []);
    setFatigueLogs(f.data ?? []);
    setPhotoLogs(ph.data ?? []);
  };

  // ── Streak de días consecutivos con registro de peso ─────────
  const streak = useMemo(() => {
    if (!weightLogs.length) return 0;
    const dates = new Set(weightLogs.map((l: any) => l.date));
    let count = 0;
    const d = new Date();
    // Si hoy todavía no hay registro, empieza a contar desde ayer
    if (!dates.has(d.toISOString().split("T")[0])) d.setDate(d.getDate() - 1);
    while (true) {
      const iso = d.toISOString().split("T")[0];
      if (dates.has(iso)) { count++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return count;
  }, [weightLogs]);

  // ── Guardar registro rápido ───────────────────────────────────
  const saveQuick = async () => {
    if (!quickWeight && !quickPhotoFile) return;
    setSavingQuick(true);

    // 1. Guardar peso + energía
    if (quickWeight && parseFloat(quickWeight) > 0) {
      await supabase.from("weight_logs").insert({
        client_id:      profile.id,
        date:           quickDate,
        weight_fasting: parseFloat(quickWeight),
        notes:          quickEnergy ? `energy:${quickEnergy}` : null,
      });
    }

    // 2. Subir foto si hay una elegida
    if (quickPhotoFile) {
      let file = quickPhotoFile;
      try { file = await toJpeg(quickPhotoFile); } catch { /* usa original */ }
      const ext  = file.type === "image/jpeg" ? "jpg" : (quickPhotoFile.name.split(".").pop() ?? "jpg");
      const path = `${profile.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("checkin-photos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("checkin-photos").getPublicUrl(path);
        await supabase.from("checkin_photos").insert({
          client_id: profile.id,
          url:       urlData.publicUrl,
          taken_at:  quickDate,
        });
      }
    }

    await loadAll();
    setQuickWeight("");
    setQuickEnergy("");
    setQuickPhotoFile(null);
    setQuickPhotoReady(false);
    setQuickSaved(true);
    setSavingQuick(false);
    setTimeout(() => setQuickSaved(false), 3000);
  };

  // Manejar selección de foto para registro rápido
  const handleQuickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    if (!raw) return;
    setQuickPhotoFile(raw);
    setQuickPhotoReady(true);
    e.target.value = "";
  };

  const [photoError, setPhotoError] = useState<string | null>(null);

  // Convierte cualquier imagen a JPEG antes de subir.
  // HEIC/HEIF: usa heic2any (funciona en Chrome, Firefox y Safari).
  // Resto: usa createImageBitmap + Canvas (más rápido).
  const toJpeg = async (raw: File): Promise<File> => {
    const isHeic = raw.type === "image/heic" || raw.type === "image/heif"
      || /\.(heic|heif)$/i.test(raw.name);

    if (isHeic) {
      // heic2any convierte en JS puro, sin depender del soporte del navegador
      const result = await heic2any({ blob: raw, toType: "image/jpeg", quality: 0.85 });
      const blob = Array.isArray(result) ? result[0] : result;
      return new File([blob], "photo.jpg", { type: "image/jpeg" });
    }

    // Para JPEG, PNG, WebP: Canvas (rápido y sin dependencias extra)
    const bitmap = await createImageBitmap(raw);
    const maxDim = 1920;
    const ratio = Math.min(maxDim / bitmap.width, maxDim / bitmap.height, 1);
    const canvas = document.createElement("canvas");
    canvas.width  = Math.round(bitmap.width  * ratio);
    canvas.height = Math.round(bitmap.height * ratio);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => blob
          ? resolve(new File([blob], "photo.jpg", { type: "image/jpeg" }))
          : reject(new Error("toBlob falló")),
        "image/jpeg", 0.85
      );
    });
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    if (!raw) return;
    setUploading(true);
    setPhotoError(null);

    // Intentar convertir a JPEG; si falla, subir el archivo original
    let file: File;
    let converted = false;
    try {
      file = await toJpeg(raw);
      converted = true;
    } catch {
      // La conversión falló (HEIC no soportado o error de canvas) → subir original
      file = raw;
    }

    const ext = converted ? "jpg" : (raw.name.split(".").pop()?.toLowerCase() || "jpg");
    const mime = converted ? "image/jpeg" : (raw.type || "image/jpeg");
    const path = `${profile.id}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("checkin-photos")
      .upload(path, file, { contentType: mime, upsert: false });

    if (upErr) {
      setPhotoError("Error al subir. Inténtalo de nuevo.");
    } else {
      const { data: urlData } = supabase.storage.from("checkin-photos").getPublicUrl(path);
      await supabase.from("checkin_photos").insert({
        client_id: profile.id,
        url: urlData.publicUrl,
        taken_at: today(),
      });
      await loadAll();
    }

    setUploading(false);
    e.target.value = "";
  };

  const handleDeletePhoto = async (photo: any) => {
    if (!confirm("¿Eliminar esta foto?")) return;
    // El path es la parte tras el nombre del bucket en la URL pública
    const marker = "/checkin-photos/";
    const path = photo.url.includes(marker) ? photo.url.split(marker)[1] : null;
    if (path) await supabase.storage.from("checkin-photos").remove([path]);
    await supabase.from("checkin_photos").delete().eq("id", photo.id);
    setPhotoLogs(prev => prev.filter(p => p.id !== photo.id));
  };

  // ── Saves ─────────────────────────────────────────────────────
  const saveWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wf.fasting && !wf.evening) return;
    setSavingW(true);
    await supabase.from("weight_logs").insert({
      client_id: profile.id, date: wf.date,
      weight_fasting: wf.fasting ? parseFloat(wf.fasting) : null,
      weight_evening: wf.evening ? parseFloat(wf.evening) : null,
      notes: wf.notes || null,
    });
    setWf({ date: today(), fasting: "", evening: "", notes: "" });
    await loadAll();
    setSavingW(false);
  };

  const savePerim = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingP(true);
    const row: Record<string, any> = { client_id: profile.id, date: pf.date };
    Object.keys(pf).filter(k => k !== "date").forEach(k => { row[k] = pf[k] ? parseFloat(pf[k]) : null; });
    await supabase.from("perimeter_logs").insert(row);
    setPf(emptyPerim());
    await loadAll();
    setSavingP(false);
  };

  const saveFold = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFl(true);
    const row: Record<string, any> = { client_id: profile.id, date: flf.date };
    ["calf", "quad", "navel", "abd_upper", "chest", "shoulder", "bicep",
      "tricep", "subscapular", "lumbar", "iliac_crest",
      "critical_abdomen", "critical_lumbar"].forEach(k => {
      row[k] = flf[k] ? parseFloat(flf[k]) : null;
    });
    row.fat_pct_real = flf.fat_pct_real ? parseFloat(flf.fat_pct_real) : null;
    await supabase.from("fold_logs").insert(row);
    setFlf(emptyFold());
    await loadAll();
    setSavingFl(false);
  };

  const saveFatigue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingF(true);
    await supabase.from("fatigue_logs").insert({
      client_id: profile.id, date: ff.date,
      microcycle: ff.microcycle ? parseInt(ff.microcycle) : null,
      session_type: ff.session_type || null,
      notes: ff.global_energy ? `energy:${ff.global_energy}` : null,
      shoulder: parseInt(ff.shoulder) || 0, chest: parseInt(ff.chest) || 0,
      bicep: parseInt(ff.bicep) || 0, tricep: parseInt(ff.tricep) || 0,
      back: parseInt(ff.back) || 0, upper_back: parseInt(ff.upper_back) || 0,
      quad: parseInt(ff.quad) || 0, adductor: parseInt(ff.adductor) || 0,
      hamstring: parseInt(ff.hamstring) || 0, glute: parseInt(ff.glute) || 0,
      calf: parseInt(ff.calf) || 0,
    });
    setFf(emptyFatigue());
    await loadAll();
    setSavingF(false);
  };

  // ── Borrado de registros ──────────────────────────────────────
  const deleteWeight = async (id: number) => {
    if (!confirm("¿Eliminar este registro de peso?")) return;
    setDeletingId(id);
    await supabase.from("weight_logs").delete().eq("id", id);
    setWeightLogs(prev => prev.filter(r => r.id !== id));
    setDeletingId(null);
  };

  const deletePerim = async (id: number) => {
    if (!confirm("¿Eliminar este registro de perímetros?")) return;
    setDeletingId(id);
    await supabase.from("perimeter_logs").delete().eq("id", id);
    setPerimLogs(prev => prev.filter(r => r.id !== id));
    setDeletingId(null);
  };

  const deleteFold = async (id: number) => {
    if (!confirm("¿Eliminar este registro de pliegues?")) return;
    setDeletingId(id);
    await supabase.from("fold_logs").delete().eq("id", id);
    setFoldLogs(prev => prev.filter(r => r.id !== id));
    setDeletingId(null);
  };

  const deleteFatigue = async (id: number) => {
    if (!confirm("¿Eliminar este registro de fatiga?")) return;
    setDeletingId(id);
    await supabase.from("fatigue_logs").delete().eq("id", id);
    setFatigueLogs(prev => prev.filter(r => r.id !== id));
    setDeletingId(null);
  };

  // ── Render helpers ────────────────────────────────────────────
  const dateInput = (val: string, set: (v: string) => void) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-wider text-neutral-500">Fecha</label>
      <input type="date" value={val} onChange={e => set(e.target.value)}
        className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500" />
    </div>
  );

  const saveBtn = (saving: boolean, label = "Guardar registro") => (
    <button type="submit" disabled={saving}
      className="w-full py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-neutral-200 disabled:opacity-40 transition-colors">
      {saving ? "Guardando..." : label}
    </button>
  );

  const muscleGroups = [
    ["shoulder", "Hombro"], ["chest", "Pecho"], ["bicep", "Bíceps"], ["tricep", "Tríceps"],
    ["back", "Dorsal"], ["upper_back", "Espalda Alta"], ["quad", "Cuádriceps"],
    ["adductor", "Aductor"], ["hamstring", "Femoral"], ["glute", "Glúteo"], ["calf", "Gemelo"],
  ] as const;

  const TABS: [Tab, string][] = [
    ["hoy",      "⚡ Hoy"],
    ["progreso", "📈 Progreso"],
    ["registro", "📋 Registro"],
  ];

  const REG_TABS: [RegTab, string][] = [
    ["peso",         "⚖️ Peso"],
    ["perimetros",   "📏 Perímetros"],
    ["pliegues",     "📌 Pliegues"],
    ["fatiga",       "🔥 Fatiga"],
    ["antropometria","📊 Antrop."],
    ["fotos",        "📷 Fotos"],
  ];

  // Los 10 sitios de la fórmula Excel (Σ/1000 = % grasa)
  const FOLD_KEYS = ["calf","quad","navel","abd_upper","chest","shoulder","bicep","tricep","subscapular","lumbar"];
  const FOLD_LABELS: Record<string, string> = {
    calf: "Gemelo", quad: "Cuádr.", navel: "Abd. Baja", abd_upper: "Abd. Alta",
    chest: "Pecho", shoulder: "Hombro", bicep: "Bíceps", tricep: "Tríceps",
    subscapular: "Subesc.", lumbar: "Lumbar", iliac_crest: "Cresta Il.",
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950">

      {/* ── Cabecera (fuera del scroll) ── */}
      <header className="header-safe shrink-0 bg-neutral-900 border-b border-neutral-800 px-4 pb-3 flex items-center gap-3">
        <button onClick={onBack}
          className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-300 active:bg-neutral-700 flex items-center justify-center text-xl shrink-0">←</button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-bold text-base">Punto de Control</h1>
          <p className="text-neutral-500 text-xs truncate">{profile.full_name}</p>
        </div>
      </header>

      {/* ── Tabs (fuera del scroll) ── */}
      <div className="tabs-fade-right shrink-0 max-w-2xl mx-auto w-full"
        style={{ background: "#030712" }}>
        <div className="flex gap-1.5 px-3 py-2.5 overflow-x-auto scrollbar-hide">
          {TABS.map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={"shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all select-none " +
                (tab === t
                  ? "bg-white text-black shadow-sm"
                  : "text-neutral-400 active:bg-neutral-700")}
              style={tab !== t ? { background: "#1a1a1a", border: "1px solid #2a2a2a" } : {}}>
              {label}
            </button>
          ))}
        </div>

        {/* Sub-tabs de Registro semanal */}
        {tab === "registro" && (
          <div className="flex gap-1.5 px-3 pb-2.5 overflow-x-auto scrollbar-hide">
            {REG_TABS.map(([t, label]) => (
              <button key={t} onClick={() => setRegTab(t)}
                className={"shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all select-none " +
                  (regTab === t
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-500 active:bg-neutral-800")}
                style={regTab !== t ? { background: "#111", border: "1px solid #222" } : {}}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Área de contenido con scroll propio ── */}
      <div ref={contentScrollRef} className="flex-1 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="max-w-2xl mx-auto px-4 space-y-4 pt-4 pb-8">

        {/* ── HOY — Registro rápido ── */}
        {tab === "hoy" && (
          <div className="space-y-4 pt-2">

            {/* Streak */}
            {streak > 0 && (
              <div className="flex items-center gap-4 px-5 py-4 rounded-2xl"
                style={{ background: "linear-gradient(135deg,#1A0808,#2A1008)", border: "1px solid #3A1A0A" }}>
                <span className="text-4xl">🔥</span>
                <div>
                  <p className="text-white font-bold text-2xl leading-none">{streak}</p>
                  <p className="text-neutral-400 text-sm">
                    {streak === 1 ? "día registrado" : "días seguidos registrando"}
                  </p>
                </div>
                {streak >= 7 && (
                  <span className="ml-auto text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ background: "#8B1A2F20", color: "#C0394F" }}>
                    🏅 {streak >= 30 ? "Mes completo" : streak >= 14 ? "2 semanas" : "1 semana"}
                  </span>
                )}
              </div>
            )}

            {/* Formulario rápido */}
            <div className="rounded-2xl p-5 space-y-5"
              style={{ background: "#111", border: "1px solid #1E1E1E" }}>

              <p className="text-white font-semibold text-sm">⚡ Registro del día</p>

              {/* Fecha */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider text-neutral-500">Fecha</label>
                <input type="date" value={quickDate} onChange={e => setQuickDate(e.target.value)}
                  className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-neutral-500" />
              </div>

              {/* Peso */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider text-neutral-500">Peso en ayunas (kg)</label>
                <input type="number" step="0.1" value={quickWeight}
                  onChange={e => setQuickWeight(e.target.value)}
                  placeholder="ej. 74.5"
                  className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-700" />
              </div>

              {/* Energía */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-2">
                  ¿Cómo te encuentras hoy?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: "bajo"   as EnergyLevel, emoji: "😴", label: "Bajo",      bg: "#0E1020" },
                    { id: "normal" as EnergyLevel, emoji: "😐", label: "Normal",    bg: "#0E1A0E" },
                    { id: "alto"   as EnergyLevel, emoji: "🔥", label: "Con energía", bg: "#1A0E05" },
                  ]).map(({ id, emoji, label, bg }) => {
                    const active = quickEnergy === id;
                    return (
                      <button key={id} onClick={() => setQuickEnergy(active ? "" : id)}
                        className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl transition-all active:scale-95"
                        style={active
                          ? { background: bg, border: "2px solid #C0394F" }
                          : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-[11px] font-medium text-neutral-300 leading-tight text-center">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Foto */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-2">
                  Foto del día (opcional)
                </label>
                <label className="flex items-center justify-center gap-2 py-3.5 rounded-xl cursor-pointer active:opacity-70 transition-opacity"
                  style={{ background: "#1A1A1A", border: "1px dashed #333" }}>
                  <span className="text-lg">📷</span>
                  <span className="text-neutral-400 text-sm">
                    {quickPhotoReady ? "✅ Foto lista" : "Elegir foto del carrete"}
                  </span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={handleQuickPhoto} />
                </label>
              </div>

              {/* Guardar */}
              <button
                onClick={saveQuick}
                disabled={savingQuick || (!quickWeight && !quickPhotoFile)}
                className="w-full py-4 rounded-xl text-sm font-bold transition-all disabled:opacity-40 active:scale-[0.98]"
                style={quickSaved
                  ? { background: "#0A2A1A", border: "1px solid #1A4A2A", color: "#4ADE80" }
                  : { background: "#fff", color: "#000" }}>
                {savingQuick ? "Guardando…" : quickSaved ? "✅ ¡Registrado!" : "💾 Guardar registro de hoy"}
              </button>
            </div>

            {/* Últimos 5 registros */}
            {weightLogs.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 px-1">Últimos registros</p>
                {weightLogs.slice(0, 5).map((log: any) => {
                  const energy = log.notes?.match(/energy:(\w+)/)?.[1] as EnergyLevel | undefined;
                  const emojiMap: Record<string, string> = { bajo: "😴", normal: "😐", alto: "🔥" };
                  return (
                    <div key={log.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: "#0F0F0F", border: "1px solid #1A1A1A" }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-neutral-400 text-xs">{fmtDate(log.date)}</p>
                      </div>
                      {energy && <span className="text-lg">{emojiMap[energy]}</span>}
                      {log.weight_fasting && (
                        <p className="text-white font-bold text-sm tabular-nums">{log.weight_fasting} kg</p>
                      )}
                      <button
                        onClick={() => deleteWeight(log.id)}
                        disabled={deletingId === log.id}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-600 hover:text-red-400 disabled:opacity-40 shrink-0 transition-colors active:scale-90"
                        style={{ background: "#1A1A1A" }}>
                        {deletingId === log.id ? "…" : "✕"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PROGRESO ── */}
        {tab === "progreso" && <ProgresoTab
          weightLogs={weightLogs}
          foldLogs={foldLogs}
          perimLogs={perimLogs}
          foldKeys={FOLD_KEYS}
        />}

        {/* ── PESO ── */}
        {tab === "registro" && regTab === "peso" && (
          <>
            <form onSubmit={saveWeight} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
              <p className="text-white text-sm font-semibold">Nuevo registro</p>
              {dateInput(wf.date, d => setWf(p => ({ ...p, date: d })))}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Peso ayunas" unit="kg" value={wf.fasting} onChange={v => setWf(p => ({ ...p, fasting: v }))} />
                <Field label="Peso noche" unit="kg" value={wf.evening} onChange={v => setWf(p => ({ ...p, evening: v }))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider text-neutral-500">Observaciones</label>
                <input value={wf.notes} onChange={e => setWf(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Salto de comida, post-entreno…"
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-700" />
              </div>
              {saveBtn(savingW)}
            </form>
            {weightLogs.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Historial</p>
                <div className="space-y-1.5">
                  {weightLogs.map(log => (
                    <div key={log.id} className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="text-neutral-500 text-xs shrink-0 w-24">{fmtDate(log.date)}</span>
                      <div className="flex gap-4 flex-1">
                        {log.weight_fasting != null && <span className="text-white text-sm font-medium">{log.weight_fasting} <span className="text-neutral-500 text-xs font-normal">kg ayunas</span></span>}
                        {log.weight_evening != null && <span className="text-white text-sm font-medium">{log.weight_evening} <span className="text-neutral-500 text-xs font-normal">kg noche</span></span>}
                      </div>
                      {log.notes && <span className="text-neutral-500 text-xs truncate max-w-[80px]">{log.notes}</span>}
                      <button
                        onClick={() => deleteWeight(log.id)}
                        disabled={deletingId === log.id}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:text-red-300 disabled:opacity-40 shrink-0 transition-colors"
                        style={{ background: "#1A0808", border: "1px solid #3A1010" }}>
                        {deletingId === log.id ? "…" : "🗑️"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── PERÍMETROS ── */}
        {tab === "registro" && regTab === "perimetros" && (
          <>
            <form onSubmit={savePerim} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4">
              <p className="text-white text-sm font-semibold">Nuevo registro</p>
              {dateInput(pf.date, d => setPf(p => ({ ...p, date: d })))}
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">Contraído</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    ["bicep_r_c", "Bíceps Derecho"], ["bicep_l_c", "Bíceps Izquierdo"],
                    ["chest_c", "Pecho"], ["back_c", "Espalda"],
                    ["iliac_c", "Cresta Ilíaca"], ["abd_upper_c", "Abdomen (sup)"],
                    ["abd_navel_c", "Abdomen (ombligo)"], ["hip_c", "Cadera / Glúteo"],
                    ["quad_r_c", "Cuád. Derecho"], ["quad_l_c", "Cuád. Izquierdo"],
                    ["calf_r_c", "Gemelo Derecho"], ["calf_l_c", "Gemelo Izquierdo"],
                  ] as [string, string][]).map(([k, label]) => (
                    <Field key={k} label={label} unit="cm" value={pf[k]} onChange={v => setPf(p => ({ ...p, [k]: v }))} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">Relajado</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    ["bicep_r_r", "Bíceps Derecho"], ["bicep_l_r", "Bíceps Izquierdo"],
                    ["chest_r", "Pecho"], ["back_r", "Espalda"],
                    ["iliac_r", "Cresta Ilíaca"], ["abd_upper_r", "Abdomen (sup)"],
                    ["abd_navel_r", "Abdomen (ombligo)"], ["hip_r", "Cadera / Glúteo"],
                    ["quad_r_r", "Cuád. Derecho"], ["quad_l_r", "Cuád. Izquierdo"],
                    ["calf_r_r", "Gemelo Derecho"], ["calf_l_r", "Gemelo Izquierdo"],
                  ] as [string, string][]).map(([k, label]) => (
                    <Field key={k} label={label} unit="cm" value={pf[k]} onChange={v => setPf(p => ({ ...p, [k]: v }))} />
                  ))}
                </div>
              </div>
              {saveBtn(savingP)}
            </form>
            {perimLogs.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Historial</p>
                <div className="space-y-2">
                  {perimLogs.map(log => (
                    <div key={log.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-neutral-400 text-xs">{fmtDate(log.date)}</p>
                        <button
                          onClick={() => deletePerim(log.id)}
                          disabled={deletingId === log.id}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:text-red-300 disabled:opacity-40 transition-colors"
                          style={{ background: "#1A0808", border: "1px solid #3A1010" }}>
                          {deletingId === log.id ? "…" : "🗑️"}
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
                        {[
                          ["Bíceps D (C/R)", log.bicep_r_c, log.bicep_r_r],
                          ["Bíceps I (C/R)", log.bicep_l_c, log.bicep_l_r],
                          ["Pecho (C/R)", log.chest_c, log.chest_r],
                          ["Espalda (C/R)", log.back_c, log.back_r],
                          ["Cresta Il. (C/R)", log.iliac_c, log.iliac_r],
                          ["Abd. Omb. (C/R)", log.abd_navel_c, log.abd_navel_r],
                          ["Cadera (C/R)", log.hip_c, log.hip_r],
                          ["Cuád. D (C/R)", log.quad_r_c, log.quad_r_r],
                          ["Gemelo D (C/R)", log.calf_r_c, log.calf_r_r],
                        ].filter(([, a, b]) => a != null || b != null).map(([label, a, b]) => (
                          <div key={label as string}>
                            <span className="text-neutral-600">{label as string}</span><br />
                            <span className="text-white font-medium">{a ?? "—"} / {b ?? "—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── PLIEGUES ── */}
        {tab === "registro" && regTab === "pliegues" && (
          <>
            <form onSubmit={saveFold} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4">
              <p className="text-white text-sm font-semibold">Nuevo registro</p>
              {dateInput(flf.date, d => setFlf(p => ({ ...p, date: d })))}

              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Pliegues (mm)</p>
                <p className="text-[10px] text-neutral-600 mb-3">Los 10 sitios del Excel · % Grasa = Σ / 10</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    ["calf",       "1. Gemelo"],
                    ["quad",       "2. Cuádriceps"],
                    ["navel",      "3. Abd. Baja (ombligo)"],
                    ["abd_upper",  "4. Abd. Alta"],
                    ["chest",      "5. Pecho"],
                    ["shoulder",   "6. Hombro"],
                    ["bicep",      "7. Bíceps"],
                    ["tricep",     "8. Tríceps"],
                    ["subscapular","9. Subescapular"],
                    ["lumbar",     "10. Lumbar"],
                    ["iliac_crest","Cresta Ilíaca (extra)"],
                  ] as [string, string][]).map(([k, label]) => (
                    <Field key={k} label={label} unit="mm" value={flf[k]}
                      onChange={v => setFlf(p => ({ ...p, [k]: v }))} />
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-800 pt-4">
                <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">Pliegues críticos y composición</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Pleg. Crítico Abd." unit="mm" value={flf.critical_abdomen}
                    onChange={v => setFlf(p => ({ ...p, critical_abdomen: v }))} />
                  <Field label="Pleg. Crítico Lumb." unit="mm" value={flf.critical_lumbar}
                    onChange={v => setFlf(p => ({ ...p, critical_lumbar: v }))} />
                  <Field label="% Grasa Real" unit="%" step="0.01" value={flf.fat_pct_real}
                    onChange={v => setFlf(p => ({ ...p, fat_pct_real: v }))}
                    placeholder="7.31" />
                </div>
                <p className="text-[10px] text-neutral-600 mt-2">
                  % Grasa Real lo calcula el entrenador. % Grasa básico (Σpliegues / 10) se calcula solo.
                </p>
              </div>
              {saveBtn(savingFl)}
            </form>

            {foldLogs.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Historial</p>
                <div className="space-y-2">
                  {foldLogs.map(log => {
                    const sum = FOLD_KEYS.reduce((s, k) => s + (parseFloat(log[k]) || 0), 0);
                    return (
                      <div key={log.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <p className="text-neutral-400 text-xs shrink-0">{fmtDate(log.date)}</p>
                          {sum > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-neutral-500 text-xs">Σ {sum.toFixed(1)} mm</span>
                              <span className="text-white text-xs font-bold">{(sum / 10).toFixed(2)}% grasa</span>
                              {log.fat_pct_real != null && (
                                <span className="text-amber-400 text-xs font-bold">{log.fat_pct_real}% real</span>
                              )}
                            </div>
                          )}
                          <button
                            onClick={() => deleteFold(log.id)}
                            disabled={deletingId === log.id}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:text-red-300 disabled:opacity-40 shrink-0 transition-colors"
                            style={{ background: "#1A0808", border: "1px solid #3A1010" }}>
                            {deletingId === log.id ? "…" : "🗑️"}
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          {FOLD_KEYS.filter(k => log[k] != null).map(k => (
                            <div key={k} className="flex flex-col items-center gap-0.5 bg-neutral-800 rounded-lg p-2">
                              <span className="text-white font-bold">{log[k]}</span>
                              <span className="text-neutral-500 text-[9px]">{FOLD_LABELS[k]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── FATIGA ── */}
        {tab === "registro" && regTab === "fatiga" && (
          <>
            <form onSubmit={saveFatigue} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4">
              <p className="text-white text-sm font-semibold">Nuevo registro · escala 0–10</p>

              {/* ── Energía global (resumen rápido) ── */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-2">
                  ¿Cómo te encuentras hoy?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: "bajo",   emoji: "😴", label: "Bajo",       bg: "#0E1020" },
                    { id: "normal", emoji: "😐", label: "Normal",     bg: "#0E1A0E" },
                    { id: "alto",   emoji: "🔥", label: "Con energía", bg: "#1A0E05" },
                  ] as const).map(({ id, emoji, label, bg }) => {
                    const active = ff.global_energy === id;
                    return (
                      <button key={id} type="button"
                        onClick={() => setFf(p => ({ ...p, global_energy: active ? "" : id }))}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all active:scale-95"
                        style={active
                          ? { background: bg, border: "2px solid #C0394F" }
                          : { background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-[11px] font-medium text-neutral-300 leading-tight text-center">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {dateInput(ff.date, d => setFf(p => ({ ...p, date: d })))}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-500">Microciclo</label>
                  <input type="number" min="1" value={ff.microcycle}
                    onChange={e => setFf(p => ({ ...p, microcycle: e.target.value }))}
                    placeholder="1"
                    className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-700" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider text-neutral-500">Sesión</label>
                <div className="flex gap-2">
                  {["Empuje", "Tirón", "Pierna"].map(s => (
                    <button key={s} type="button"
                      onClick={() => setFf(p => ({ ...p, session_type: p.session_type === s ? "" : s }))}
                      className={"flex-1 py-2 rounded-lg text-sm font-medium transition-colors " +
                        (ff.session_type === s ? "bg-white text-black" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700")}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Separador visual antes de los sliders */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-3">Fatiga por grupo muscular (detalle)</p>
                <div className="space-y-3">
                  {muscleGroups.map(([key, label]) => (
                    <FatigueSlider key={key} label={label} value={ff[key]} onChange={v => setFf(p => ({ ...p, [key]: v }))} />
                  ))}
                </div>
              </div>
              {saveBtn(savingF)}
            </form>
            {fatigueLogs.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Historial</p>
                <div className="space-y-2">
                  {fatigueLogs.map(log => (
                    <div key={log.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-neutral-400 text-xs">{fmtDate(log.date)}</span>
                        {(() => {
                          const e = log.notes?.match(/energy:(\w+)/)?.[1];
                          const em: Record<string, string> = { bajo: "😴", normal: "😐", alto: "🔥" };
                          return e ? <span className="text-lg leading-none">{em[e]}</span> : null;
                        })()}
                        {log.session_type && <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">{log.session_type}</span>}
                        {log.microcycle && <span className="text-neutral-600 text-xs">Mc {log.microcycle}</span>}
                        <div className="flex-1" />
                        <button
                          onClick={() => deleteFatigue(log.id)}
                          disabled={deletingId === log.id}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:text-red-300 disabled:opacity-40 transition-colors"
                          style={{ background: "#1A0808", border: "1px solid #3A1010" }}>
                          {deletingId === log.id ? "…" : "🗑️"}
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {muscleGroups.map(([key, label]) => {
                          const val = log[key] ?? 0;
                          if (!val) return null;
                          const color = val >= 8 ? "bg-red-500" : val >= 5 ? "bg-amber-400" : "bg-emerald-500";
                          return (
                            <div key={key} className="flex flex-col items-center gap-0.5">
                              <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-xs font-bold text-white`}>{val}</div>
                              <span className="text-[9px] text-neutral-600 text-center leading-tight">{label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── ANTROPOMETRÍA ── */}
        {tab === "registro" && regTab === "antropometria" && (
          <AntroTable
            weightLogs={[...weightLogs].sort((a, b) => a.date.localeCompare(b.date))}
            perimLogs={[...perimLogs].sort((a, b) => a.date.localeCompare(b.date))}
            foldLogs={[...foldLogs].sort((a, b) => a.date.localeCompare(b.date))}
          />
        )}

        {/* ── FOTOS ── */}
        {tab === "registro" && regTab === "fotos" && (
          <div className="space-y-4">
            {/* Botón subir */}
            <label className={"w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed transition-colors cursor-pointer " +
              (uploading ? "border-neutral-700 text-neutral-600" : "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white")}>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleUploadPhoto}
              />
              {uploading ? (
                <>
                  <span className="text-sm">Subiendo...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">📷</span>
                  <div>
                    <p className="text-sm font-medium">Subir foto de progreso</p>
                    <p className="text-xs text-neutral-500">Cámara o galería</p>
                  </div>
                </>
              )}
            </label>

            {/* Error de subida */}
            {photoError && (
              <p className="text-red-400 text-sm text-center -mt-2">{photoError}</p>
            )}

            {/* Grid de fotos */}
            {photoLogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📷</p>
                <p className="text-neutral-400 text-sm">Aún no hay fotos.</p>
                <p className="text-neutral-600 text-xs mt-1">Sube tu primera foto de progreso.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {photoLogs.map(photo => (
                  <div key={photo.id} className="relative aspect-square bg-neutral-800 rounded-xl overflow-hidden flex items-center justify-center">
                    <span className="text-3xl text-neutral-600 select-none">📷</span>
                    <img
                      src={photo.url}
                      alt="foto progreso"
                      className="absolute inset-0 w-full h-full object-cover rounded-xl cursor-pointer"
                      onClick={() => setPreviewUrl(photo.url)}
                      onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                    />
                    <button
                      onClick={() => handleDeletePhoto(photo)}
                      className="absolute top-1 right-1 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm shadow-md"
                      style={{ background: "rgba(0,0,0,0.65)" }}>
                      🗑️
                    </button>
                    <p className="absolute bottom-0 left-0 right-0 text-[9px] text-center text-white/60 bg-black/40 rounded-b-xl py-0.5">
                      {fmtShort(photo.taken_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>{/* fin max-w-2xl content */}
      </div>{/* fin scroll container */}

      {/* Modal de preview de foto (fixed, fuera del scroll) */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setPreviewUrl(null)}>
          <img
            src={previewUrl}
            alt="preview"
            className="max-w-full max-h-full object-contain p-4"
          />
          <button
            className="absolute right-4 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center text-lg active:bg-white/30"
            style={{ top: "max(env(safe-area-inset-top), 16px)" }}
            onClick={e => { e.stopPropagation(); setPreviewUrl(null); }}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
