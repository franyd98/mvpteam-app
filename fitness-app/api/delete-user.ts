// Vercel Edge Function — elimina un usuario de Supabase Auth + todos sus datos.
// Usa la SERVICE ROLE KEY (solo disponible server-side, nunca expuesta al cliente).
// El frontend la llama con el Bearer token del admin para verificar permisos.

import { createClient } from "@supabase/supabase-js";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: cors });

  const supabaseUrl = (process.env.VITE_SUPABASE_URL ?? "") as string;
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "") as string;

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Variables de entorno no configuradas." }),
      { status: 500, headers: cors }
    );
  }

  // ── Verificar que el llamante es admin ───────────────────────────────────
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401, headers: cors });
  }
  const callerToken = authHeader.slice(7);

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: { user: caller }, error: callerErr } = await supabase.auth.getUser(callerToken);
  if (callerErr || !caller) {
    return new Response(JSON.stringify({ error: "Token inválido" }), { status: 401, headers: cors });
  }

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", caller.id)
    .single();

  if (callerProfile?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Solo el admin puede eliminar usuarios" }), { status: 403, headers: cors });
  }

  // ── Parsear body ─────────────────────────────────────────────────────────
  let userId = "";
  try {
    const body = await req.json();
    userId = (body.userId ?? "").trim();
  } catch {
    return new Response(JSON.stringify({ error: "Body inválido" }), { status: 400, headers: cors });
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "userId es obligatorio" }), { status: 400, headers: cors });
  }

  // Protección: no permitir eliminar al propio admin
  if (userId === caller.id) {
    return new Response(JSON.stringify({ error: "No puedes eliminarte a ti mismo" }), { status: 400, headers: cors });
  }

  // Verificar que el usuario a eliminar no es admin
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", userId)
    .single();

  if (targetProfile?.role === "admin") {
    return new Response(JSON.stringify({ error: "No se puede eliminar a otro admin" }), { status: 403, headers: cors });
  }

  // ── Eliminar usuario de Auth (cascada borra profile por FK) ─────────────
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: cors });
  }

  return new Response(
    JSON.stringify({ success: true, deleted: targetProfile?.full_name ?? userId }),
    { status: 200, headers: cors }
  );
}
