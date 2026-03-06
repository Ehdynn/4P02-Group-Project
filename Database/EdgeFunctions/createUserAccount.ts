import { createClient } from "npm:@supabase/supabase-js@2";

type Payload = {
  email: string;
  password: string;
  full_name: string;
  is_prof: boolean;
  student_number?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // or "http://localhost:5173"
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { email, password, full_name, is_prof, student_number } = body;

  if (!email || !password || !full_name) {
    return json({ error: "email, password, and full_name are required" }, 400);
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name },
    email_confirm: true,
    
  });

  if (createErr) {
    return json({ error: createErr.message }, 400);
  }

  const userId = created.user?.id;
  if (!userId) {
    return json({ error: "User was not created" }, 500);
  }

  const { error: profileErr } = await supabaseAdmin.from("Accounts").insert({
    id: userId,
    is_prof,
    sid: student_number ?? null,
  });

  if (profileErr) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return json({ error: profileErr.message }, 400);
  }

  return json({ user_id: userId }, 200);
});
