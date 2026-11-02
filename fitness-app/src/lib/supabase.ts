import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string

// ── Vigilancia global de escrituras ────────────────────────────────
// Muchas pantallas guardan en Supabase sin comprobar si ha fallado, así que
// un error de red o de permisos pasaba desapercibido ("parece guardado, pero no").
// Aquí interceptamos TODAS las peticiones: si una escritura falla, avisamos con
// un evento global que pinta <DbErrorToast/>. No cambia el comportamiento de
// ninguna llamada: la respuesta llega igual a quien la hizo.
//
// Excepción: set_logs (las series del entreno) ya tienen su propio sistema de
// aviso y cola sin conexión; no las duplicamos.

export const DB_ERROR_EVENT = "mvp:db-error";
export type DbErrorDetail = { message: string; offline: boolean };

const WRITE_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

function report(detail: DbErrorDetail) {
  window.dispatchEvent(new CustomEvent<DbErrorDetail>(DB_ERROR_EVENT, { detail }));
}

function describeTable(url: string): string {
  const m = url.match(/\/(rest|storage)\/v1\/(?:object\/)?([^/?]+)/);
  return m ? m[2] : "datos";
}

const watchedFetch: typeof fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  const isWrite = WRITE_METHODS.has(method)
    && (url.includes("/rest/v1/") || url.includes("/storage/v1/"))
    && !url.includes("/rest/v1/rpc/")
    && !url.includes("/rest/v1/set_logs");

  if (!isWrite) return fetch(input, init);

  try {
    const res = await fetch(input, init);
    if (!res.ok) {
      let msg = `${res.status}`;
      try {
        const body = await res.clone().json();
        msg = body?.message || body?.error || msg;
      } catch { /* respuesta sin JSON */ }
      console.error(`[DB] Error al guardar en ${describeTable(url)}:`, msg);
      report({ message: `No se ha podido guardar (${describeTable(url)}): ${msg}`, offline: false });
    }
    return res;
  } catch (err) {
    console.error(`[DB] Sin conexión al guardar en ${describeTable(url)}:`, err);
    report({ message: "Sin conexión: el último cambio NO se ha guardado. Vuelve a intentarlo cuando tengas red.", offline: true });
    throw err;
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: { fetch: watchedFetch },
})
