import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_ORIGIN") || "https://hhkskkkdjwbf.github.io",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "METHOD_NOT_ALLOWED" }, { status: 405, headers: corsHeaders });

  try {
    const authorization = request.headers.get("Authorization") || "";
    if (!authorization.startsWith("Bearer ")) {
      return Response.json({ error: "UNAUTHORIZED" }, { status: 401, headers: corsHeaders });
    }
    const body = await request.json().catch(() => null);
    if (body?.confirm !== true) return Response.json({ error: "CONFIRMATION_REQUIRED" }, { status: 400, headers: corsHeaders });

    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceRoleKey) {
      return Response.json({ error: "SERVER_CONFIGURATION_ERROR" }, { status: 500, headers: corsHeaders });
    }

    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser(authorization.slice("Bearer ".length));
    if (userError || !user) return Response.json({ error: "UNAUTHORIZED" }, { status: 401, headers: corsHeaders });

    const adminClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) return Response.json({ error: "ACCOUNT_DELETION_FAILED" }, { status: 500, headers: corsHeaders });

    return Response.json({ success: true }, { status: 200, headers: corsHeaders });
  } catch {
    return Response.json({ error: "REQUEST_FAILED" }, { status: 400, headers: corsHeaders });
  }
});
