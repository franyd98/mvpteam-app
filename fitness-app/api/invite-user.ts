// Vercel Edge Function — crea/invita un usuario de Supabase.
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

  // ── Variables de entorno (configuradas en Vercel Dashboard) ──────────────
  const supabaseUrl = (process.env.VITE_SUPABASE_URL ?? "") as string;
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "") as string;

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Variables de entorno no configuradas. Añade SUPABASE_SERVICE_ROLE_KEY en Vercel." }),
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
    return new Response(JSON.stringify({ error: "Solo el admin puede invitar usuarios" }), { status: 403, headers: cors });
  }

  // ── Parsear body ─────────────────────────────────────────────────────────
  let email = "", full_name = "";
  try {
    const body = await req.json();
    email = (body.email ?? "").trim();
    full_name = (body.full_name ?? "").trim();
  } catch {
    return new Response(JSON.stringify({ error: "Body inválido" }), { status: 400, headers: cors });
  }

  if (!email) {
    return new Response(JSON.stringify({ error: "El email es obligatorio" }), { status: 400, headers: cors });
  }

  // ── Enviar invitación ────────────────────────────────────────────────────
  // redirectTo: al hacer clic en el email, el usuario llega a la app con ?set-password=1
  // El trigger handle_new_user (01_SQL_SEGURIDAD.sql) crea el perfil automáticamente.
  const origin = req.headers.get("origin") ?? "https://mvpteam-app.vercel.app";
  const redirectTo = `${origin}/?set-password=1`;

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: full_name || email.split("@")[0],
      role: "client",
    },
    redirectTo,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: cors });
  }

  return new Response(
    JSON.stringify({ success: true, userId: data.user?.id }),
    { status: 200, headers: cors }
  );
}
