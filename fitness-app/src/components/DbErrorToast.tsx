// Aviso global cuando una escritura en Supabase falla (ver lib/supabase.ts).
// Se muestra en cualquier pantalla. Agrupa errores repetidos y se cierra solo.

import { useEffect, useState } from "react";
import { DB_ERROR_EVENT, type DbErrorDetail } from "../lib/supabase";

export default function DbErrorToast() {
  const [err, setErr] = useState<(DbErrorDetail & { count: number }) | null>(null);

  useEffect(() => {
    const onError = (e: Event) => {
      const detail = (e as CustomEvent<DbErrorDetail>).detail;
      setErr(prev => prev && prev.message === detail.message
        ? { ...prev, count: prev.count + 1 }
        : { ...detail, count: 1 });
    };
    window.addEventListener(DB_ERROR_EVENT, onError);
    return () => window.removeEventListener(DB_ERROR_EVENT, onError);
  }, []);

  useEffect(() => {
    if (!err) return;
    const t = setTimeout(() => setErr(null), 9000);
    return () => clearTimeout(t);
  }, [err]);

  if (!err) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] px-3 pointer-events-none"
      style={{ paddingTop: "calc(max(env(safe-area-inset-top), 8px) + 8px)" }}>
      <div role="alert"
        className="pointer-events-auto max-w-lg mx-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-2xl"
        style={{ background: err.offline ? "#2a1a00" : "#3b0000", border: "1px solid rgba(255,255,255,0.12)" }}>
        <i className={`ti ti-${err.offline ? "wifi-off" : "alert-triangle"} shrink-0 mt-0.5`}
          style={{ fontSize: 18, color: err.offline ? "#fbbf24" : "#f87171" }} />
        <p className="flex-1 text-sm text-white leading-snug">
          {err.message}{err.count > 1 ? ` (×${err.count})` : ""}
        </p>
        <button onClick={() => setErr(null)} aria-label="Cerrar"
          className="shrink-0 text-neutral-300 text-lg leading-none" style={{ minHeight: 0 }}>✕</button>
      </div>
    </div>
  );
}
