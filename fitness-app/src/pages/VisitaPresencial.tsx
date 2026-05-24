// Formulario de visita presencial: el admin rellena todos los campos
// en nombre del cliente y guarda en weight_logs, perimeter_logs y fold_logs.

import { useState } from "react";
import { supabase } from "../lib/supabase";

type Profile = { id: string; full_name: string; role: string };

const todayStr = () => new Date().toISOString().split("T")[0];

// ── Input helpers ────────────────────────────────────────────────
function Field({ label, value, onChange, unit = "", step = "0.1", placeholder = "—" }: {
  label: string; value: string; onChange: (v: string) => void;
  unit?: string; step?: string; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number" step={step} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-700"
        />
        {unit && <span className="text-neutral-500 text-xs shrink-0">{unit}</span>}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-white text-sm font-semibold">{title}</span>
        <span className="text-neutral-500 text-lg">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="px-4 pb-4 space-y-3 border-t border-neutral-800 pt-3">{children}</div>}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────
export default function VisitaPresencial({ client, onBack }: { client: Profile; onBack: () => void }) {
  const [date, setDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<"ok" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Peso ──────────────────────────────────────────────────────
  const [wFasting, setWFasting] = useState("");
  const [wEvening, setWEvening] = useState("");
  const [wNotes, setWNotes] = useState("");

  // ── Perímetros ────────────────────────────────────────────────
  const perimInit = () => ({
    bicep_r_c: "", bicep_l_c: "", chest_c: "", back_c: "",
    iliac_c: "", abd_upper_c: "", abd_navel_c: "", hip_c: "",
    quad_r_c: "", quad_l_c: "", calf_r_c: "", calf_l_c: "",
    bicep_r_r: "", bicep_l_r: "", chest_r: "", back_r: "",
    iliac_r: "", abd_upper_r: "", abd_navel_r: "", hip_r: "",
    quad_r_r: "", quad_l_r: "", calf_r_r: "", calf_l_r: "",
  });
  const [perim, setPerim] = useState<Record<string, string>>(perimInit());
  const sp = (k: string) => (v: string) => setPerim(p => ({ ...p, [k]: v }));

  // ── Pliegues ──────────────────────────────────────────────────
  const foldInit = () => ({
    calf: "", quad: "", navel: "", abd_upper: "",
    chest: "", shoulder: "", bicep: "", tricep: "",
    subscapular: "", lumbar: "", iliac_crest: "",
    critical_abdomen: "", critical_lumbar: "", fat_pct_real: "",
  });
  const [folds, setFolds] = useState<Record<string, string>>(foldInit());
  const sf = (k: string) => (v: string) => setFolds(f => ({ ...f, [k]: v }));

  // ── Guardar ───────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setResult(null);
    setErrorMsg(null);
    const cid = client.id;
    const errs: string[] = [];

    // Peso
    if (wFasting || wEvening) {
      const { error } = await supabase.from("weight_logs").insert({
        client_id: cid, date, is_presencial: true,
        weight_fasting: wFasting ? parseFloat(wFasting) : null,
        weight_evening: wEvening ? parseFloat(wEvening) : null,
        notes: wNotes || null,
      });
      if (error) errs.push(`weight_logs: ${error.message}`);
    }

    // Perímetros (solo si hay algún valor)
    const hasPerim = Object.values(perim).some(v => v !== "");
    if (hasPerim) {
      const row: Record<string, any> = { client_id: cid, date, is_presencial: true };
      Object.keys(perim).forEach(k => { row[k] = perim[k] ? parseFloat(perim[k]) : null; });
      const { error } = await supabase.from("perimeter_logs").insert(row);
      if (error) errs.push(`perimeter_logs: ${error.message}`);
    }

    // Pliegues (solo si hay algún valor)
    const numFoldKeys = ["calf","quad","navel","abd_upper","chest","shoulder","bicep",
      "tricep","subscapular","lumbar","iliac_crest","critical_abdomen","critical_lumbar"];
    const hasFolds = Object.values(folds).some(v => v !== "");
    if (hasFolds) {
      const row: Record<string, any> = { client_id: cid, date, is_presencial: true };
      numFoldKeys.forEach(k => { row[k] = folds[k] ? parseFloat(folds[k]) : null; });
      row.fat_pct_real = folds.fat_pct_real ? parseFloat(folds.fat_pct_real) : null;
      const { error } = await supabase.from("fold_logs").insert(row);
      if (error) errs.push(`fold_logs: ${error.message}`);
    }

    setSaving(false);

    if (!wFasting && !wEvening && !hasPerim && !hasFolds) return; // nada rellenado

    if (errs.length > 0) {
      setErrorMsg(errs.join(" · "));
    } else {
      setResult("ok");
      setTimeout(() => onBack(), 1800);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 pb-28">
      {/* Cabecera */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={onBack}
          className="w-9 h-9 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 flex items-center justify-center text-lg shrink-0">
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-bold text-base">Visita Presencial</h1>
          <p className="text-neutral-500 text-xs truncate">{client.full_name}</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* Fecha global */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3">
          <label className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5 block">Fecha de la visita</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500 w-full" />
        </div>

        {/* ── PESO ── */}
        <Section title="⚖️ Peso">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ayunas" unit="kg" value={wFasting} onChange={setWFasting} />
            <Field label="Noche" unit="kg" value={wEvening} onChange={setWEvening} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-neutral-500">Observaciones</label>
            <input value={wNotes} onChange={e => setWNotes(e.target.value)}
              placeholder="Opcional…"
              className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-700" />
          </div>
        </Section>

        {/* ── PERÍMETROS ── */}
        <Section title="📏 Perímetros">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider -mb-1">Contraído</p>
          <div className="grid grid-cols-2 gap-3">
            {([
              ["bicep_r_c","Bíceps D"],["bicep_l_c","Bíceps I"],
              ["chest_c","Pecho"],["back_c","Espalda"],
              ["iliac_c","Cresta Ilíaca"],["abd_upper_c","Abd. Alta"],
              ["abd_navel_c","Abd. Ombligo"],["hip_c","Cadera"],
              ["quad_r_c","Cuád. D"],["quad_l_c","Cuád. I"],
              ["calf_r_c","Gemelo D"],["calf_l_c","Gemelo I"],
            ] as [string,string][]).map(([k,label]) => (
              <Field key={k} label={label} unit="cm" value={perim[k]} onChange={sp(k)} />
            ))}
          </div>
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-2 -mb-1">Relajado</p>
          <div className="grid grid-cols-2 gap-3">
            {([
              ["bicep_r_r","Bíceps D"],["bicep_l_r","Bíceps I"],
              ["chest_r","Pecho"],["back_r","Espalda"],
              ["iliac_r","Cresta Ilíaca"],["abd_upper_r","Abd. Alta"],
              ["abd_navel_r","Abd. Ombligo"],["hip_r","Cadera"],
              ["quad_r_r","Cuád. D"],["quad_l_r","Cuád. I"],
              ["calf_r_r","Gemelo D"],["calf_l_r","Gemelo I"],
            ] as [string,string][]).map(([k,label]) => (
              <Field key={k} label={label} unit="cm" value={perim[k]} onChange={sp(k)} />
            ))}
          </div>
        </Section>

        {/* ── PLIEGUES ── */}
        <Section title="📌 Pliegues y Composición">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider -mb-1">
            Pliegues (mm) · % Grasa = Σ / 10
          </p>
          <div className="grid grid-cols-2 gap-3">
            {([
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
              ["iliac_crest","Cresta Ilíaca (extra)"],
            ] as [string,string][]).map(([k,label]) => (
              <Field key={k} label={label} unit="mm" value={folds[k]} onChange={sf(k)} />
            ))}
          </div>

          <div className="border-t border-neutral-800 pt-3 mt-1 space-y-3">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Pliegues críticos</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pleg. Crítico Abd." unit="mm" value={folds.critical_abdomen} onChange={sf("critical_abdomen")} />
              <Field label="Pleg. Crítico Lumb." unit="mm" value={folds.critical_lumbar} onChange={sf("critical_lumbar")} />
            </div>

            <div className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-3 space-y-2">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider">% Grasa Real</p>
              <div className="flex items-center gap-3">
                <input
                  type="number" step="0.01" value={folds.fat_pct_real}
                  onChange={e => sf("fat_pct_real")(e.target.value)}
                  placeholder="ej. 7.31"
                  className="flex-1 bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2.5 text-white text-lg font-bold focus:outline-none focus:border-white placeholder-neutral-700 text-center"
                />
                <span className="text-neutral-400 text-lg font-bold">%</span>
              </div>
              {/* % Grasa básico calculado automáticamente */}
              {(() => {
                const foldKeys = ["calf","quad","navel","abd_upper","chest","shoulder","bicep","tricep","subscapular","lumbar"];
                const sum = foldKeys.reduce((s, k) => s + (parseFloat(folds[k]) || 0), 0);
                if (!sum) return null;
                return (
                  <p className="text-center text-xs text-neutral-500">
                    % Grasa básico (Σ/10): <span className="text-white font-semibold">{(sum / 10).toFixed(2)}%</span>
                  </p>
                );
              })()}
            </div>
          </div>
        </Section>

        {/* Resultado */}
        {result === "ok" && (
          <div className="bg-emerald-900/40 border border-emerald-700 rounded-xl px-4 py-3 text-center">
            <p className="text-emerald-400 text-sm font-semibold">✅ Visita guardada correctamente</p>
            <p className="text-emerald-600 text-xs mt-0.5">Volviendo al perfil del cliente…</p>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-900/40 border border-red-700 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm font-semibold mb-1">❌ Error al guardar</p>
            <p className="text-red-300 text-xs font-mono break-all">{errorMsg}</p>
          </div>
        )}

      </div>

      {/* Botón fijo abajo */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-950 border-t border-neutral-800 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSave}
            disabled={saving || result === "ok"}
            className="w-full py-4 rounded-xl bg-white text-black text-sm font-bold hover:bg-neutral-200 disabled:opacity-40 transition-colors"
          >
            {saving ? "Guardando visita…" : result === "ok" ? "✅ Guardado" : "💾 Guardar visita completa"}
          </button>
        </div>
      </div>
    </div>
  );
}
