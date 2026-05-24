import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Profile = { id: string; full_name: string; role: string };
type Tab = "peso" | "perimetros" | "pliegues" | "fatiga" | "antropometria";

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
        <div className="flex bg-neutral-900 border-b border-neutral-700 sticky top-0 z-10">
          <div style={{ minWidth: LABEL_W }} className="px-2 py-2" />
          {allDates.map((date, i) => (
            <div key={date} style={{ minWidth: 80 }} className="text-center px-1 py-2">
              <p className="text-[10px] text-neutral-500 font-semibold uppercase">V{i + 1}</p>
              <p className="text-[10px] text-neutral-400">{fmtShort(date)}</p>
            </div>
          ))}
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
              if (!v.peso) return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-neutral-700 text-[10px]">—</div>
                  <p className="text-[10px] text-neutral-600">V{i + 1}</p>
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
                  <p className="text-[10px] text-neutral-500">V{i + 1}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────
export default function CheckInPage({ profile, onBack }: { profile: Profile; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("peso");

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
    date: today(), microcycle: "", session_type: "",
    shoulder: "0", chest: "0", bicep: "0", tricep: "0",
    back: "0", upper_back: "0", quad: "0", adductor: "0",
    hamstring: "0", glute: "0", calf: "0",
  });
  const [ff, setFf] = useState<Record<string, string>>(emptyFatigue());
  const [savingF, setSavingF] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const cid = profile.id;
    const [w, p, fl, f] = await Promise.all([
      supabase.from("weight_logs").select("*").eq("client_id", cid).order("date", { ascending: false }).limit(20),
      supabase.from("perimeter_logs").select("*").eq("client_id", cid).order("date", { ascending: false }).limit(20),
      supabase.from("fold_logs").select("*").eq("client_id", cid).order("date", { ascending: false }).limit(20),
      supabase.from("fatigue_logs").select("*").eq("client_id", cid).order("date", { ascending: false }).limit(20),
    ]);
    setWeightLogs(w.data ?? []);
    setPerimLogs(p.data ?? []);
    setFoldLogs(fl.data ?? []);
    setFatigueLogs(f.data ?? []);
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
    ["peso", "⚖️ Peso"],
    ["perimetros", "📏 Perímetros"],
    ["pliegues", "📌 Pliegues"],
    ["fatiga", "🔥 Fatiga"],
    ["antropometria", "📊 Antropometría"],
  ];

  // Los 10 sitios de la fórmula Excel (Σ/1000 = % grasa)
  const FOLD_KEYS = ["calf","quad","navel","abd_upper","chest","shoulder","bicep","tricep","subscapular","lumbar"];
  const FOLD_LABELS: Record<string, string> = {
    calf: "Gemelo", quad: "Cuádr.", navel: "Abd. Baja", abd_upper: "Abd. Alta",
    chest: "Pecho", shoulder: "Hombro", bicep: "Bíceps", tricep: "Tríceps",
    subscapular: "Subesc.", lumbar: "Lumbar", iliac_crest: "Cresta Il.",
  };

  return (
    <div className="min-h-screen bg-neutral-950 pb-10">
      {/* Cabecera */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack}
          className="w-9 h-9 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 flex items-center justify-center text-lg shrink-0">←</button>
        <div>
          <h1 className="text-white font-bold text-base">Punto de Control</h1>
          <p className="text-neutral-500 text-xs">{profile.full_name}</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 p-3 max-w-2xl mx-auto overflow-x-auto">
        {TABS.map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={"shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors " +
              (tab === t ? "bg-white text-black" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white")}>
            {label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 space-y-4">

        {/* ── PESO ── */}
        {tab === "peso" && (
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
                      {log.notes && <span className="text-neutral-500 text-xs truncate max-w-[100px]">{log.notes}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── PERÍMETROS ── */}
        {tab === "perimetros" && (
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
                      <p className="text-neutral-400 text-xs mb-2">{fmtDate(log.date)}</p>
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
        {tab === "pliegues" && (
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
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-neutral-400 text-xs">{fmtDate(log.date)}</p>
                          {sum > 0 && (
                            <div className="flex items-center gap-3">
                              <span className="text-neutral-500 text-xs">Σ {sum.toFixed(1)} mm</span>
                              <span className="text-white text-xs font-bold">{(sum / 10).toFixed(2)}% grasa</span>
                              {log.fat_pct_real != null && (
                                <span className="text-amber-400 text-xs font-bold">{log.fat_pct_real}% real</span>
                              )}
                            </div>
                          )}
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
        {tab === "fatiga" && (
          <>
            <form onSubmit={saveFatigue} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4">
              <p className="text-white text-sm font-semibold">Nuevo registro · escala 0–10</p>
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
              <div className="space-y-3 pt-1">
                {muscleGroups.map(([key, label]) => (
                  <FatigueSlider key={key} label={label} value={ff[key]} onChange={v => setFf(p => ({ ...p, [key]: v }))} />
                ))}
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
                        {log.session_type && <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">{log.session_type}</span>}
                        {log.microcycle && <span className="text-neutral-600 text-xs">Mc {log.microcycle}</span>}
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
        {tab === "antropometria" && (
          <AntroTable
            weightLogs={[...weightLogs].sort((a, b) => a.date.localeCompare(b.date))}
            perimLogs={[...perimLogs].sort((a, b) => a.date.localeCompare(b.date))}
            foldLogs={[...foldLogs].sort((a, b) => a.date.localeCompare(b.date))}
          />
        )}

      </div>
    </div>
  );
}
