import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { asgn_id, plan_id, client_id, source } = await req.json();

    if (!asgn_id || !client_id) {
      return new Response(JSON.stringify({ error: "asgn_id y client_id son obligatorios" }), {
        status: 200, headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Verificar que la asignación pertenece a este cliente
    const { data: asgn, error: chkErr } = await supabase
      .from("diet_assignments")
      .select("id, plan_id, client_id")
      .eq("id", asgn_id)
      .eq("client_id", client_id)
      .single();

    if (chkErr || !asgn) {
      return new Response(JSON.stringify({ error: "Asignación no encontrada o no autorizada" }), {
        status: 200, headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // 2. Borrar la asignación
    await supabase.from("diet_assignments").delete().eq("id", asgn_id);

    // 3. Para dietas de IA (propiedad del cliente): borrar el plan completo en cascada
    //    Para dietas de coach: solo borramos la asignación, el plan sigue existiendo
    if (source === "ai" && plan_id) {
      // Borrar en orden para respetar FK si no hay CASCADE configurado
      const { data: meals } = await supabase
        .from("diet_meals")
        .select("id")
        .eq("plan_id", plan_id);

      if (meals?.length) {
        const mealIds = meals.map((m: any) => m.id);
        await supabase.from("diet_options").delete().in("meal_id", mealIds);
        await supabase.from("diet_meals").delete().eq("plan_id", plan_id);
      }

      await supabase.from("diet_plans").delete().eq("id", plan_id);
    }

    // 4. Si quedan asignaciones activas, devolver la lista actualizada
    const { data: remaining } = await supabase
      .from("diet_assignments")
      .select("id, plan_id, source, active, assigned_at")
      .eq("client_id", client_id)
      .order("assigned_at", { ascending: false });

    // 5. Si ninguna está activa pero quedan dietas, activar la más reciente
    if (remaining?.length && !remaining.some((r: any) => r.active)) {
      await supabase.from("diet_assignments").update({ active: true }).eq("id", remaining[0].id);
    }

    return new Response(JSON.stringify({ ok: true, remaining: remaining?.length ?? 0 }), {
      status: 200, headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 200, headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
