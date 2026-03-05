import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Payload = {
  cid: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Payload | null = null;
  if (req.method === "POST") {
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }
  }

  const url = new URL(req.url);
  const queryCid = url.searchParams.get("cid");
  const requestedCid = body?.cid || queryCid;

  if (!requestedCid) {
    return json({ error: "Course id is required." }, 400);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase environment variables." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing or invalid Authorization bearer token." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClientForUser = createClient(supabaseUrl, supabaseAnonKey);
    const {
      data: { user },
      error: userError,
    } = await authClientForUser.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dbClient = supabaseServiceRoleKey
      ? createClient(supabaseUrl, supabaseServiceRoleKey)
      : createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });
    
    const { data: courseOwnership, error: ownershipError } = await dbClient
      .from("Courses")
      .select("primary_instructor")
      .eq("cid", requestedCid)
      .maybeSingle();

    if (ownershipError) {
      return new Response(JSON.stringify({ error: ownershipError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!courseOwnership || courseOwnership.primary_instructor !== user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: you are not the primary instructor for this course." }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: enrolled, error: enrolledError } = await dbClient
      .from("Enrolled")
      .select("suid")
      .eq("cid", requestedCid);

    if (enrolledError) {
      return new Response(JSON.stringify({ error: enrolledError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const uniqueSuids = [...new Set((enrolled ?? []).map((row) => row.suid).filter(Boolean))];

    if (uniqueSuids.length === 0) {
      return new Response(JSON.stringify({ students: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: accounts, error: accountsError } = await dbClient
      .from("Accounts")
      .select("id, sid")
      .in("id", uniqueSuids);

    if (accountsError) {
      return new Response(JSON.stringify({ error: accountsError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sidByUser = new Map(
      (accounts ?? []).map((account) => [account.id, account.sid])
    );

    const adminClient =
      supabaseServiceRoleKey && supabaseServiceRoleKey.length > 0
        ? createClient(supabaseUrl, supabaseServiceRoleKey)
        : null;

    if (!adminClient) {
      const students = uniqueSuids.map((suid) => ({
        student_name: "Unknown Student",
        student_number: sidByUser.get(suid) ?? null,
      }));

      return new Response(JSON.stringify({ students }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const students = await Promise.all(
      uniqueSuids.map(async (suid) => {
        let studentName = "Unknown Student";

        try {
          const { data: userData, error: userErr } = await adminClient.auth.admin.getUserById(suid);
          const fullName =
            userData?.user?.user_metadata?.full_name ||
            userData?.user?.user_metadata?.name;
          if (fullName?.trim()) {
            studentName = fullName;
          }
        } catch {
          // Keep default label if user lookup fails.
        }

        return {
          student_name: studentName,
          student_number: sidByUser.get(suid) ?? null,
        };
      })
    );

    return new Response(JSON.stringify({ students }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
