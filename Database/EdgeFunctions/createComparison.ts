import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CreateComparisonBody = {
  aid: number;
  boilerPlateFileId?: string | null;
  repositoryId?: string | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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

    const authClient = createClient(supabaseUrl, supabaseAnonKey);

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(token);

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

    const body = (await req.json()) as Partial<CreateComparisonBody>;
    const aid = body.aid;
    const boilerPlateFileId = body.boilerPlateFileId ?? null;
    const repositoryId = body.repositoryId ?? null;
    if (!aid || aid <= 0) {
      return new Response(JSON.stringify({ error: ("Assignment id required") }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (boilerPlateFileId) {
      const { data: boilerPlateFile, error: boilerPlateError } = await dbClient
        .from("Boiler_Plate_Uploads")
        .select("id")
        .eq("id", boilerPlateFileId)
        .eq("aid", aid)
        .maybeSingle();

      if (boilerPlateError) {
        return new Response(JSON.stringify({ error: boilerPlateError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!boilerPlateFile) {
        return new Response(JSON.stringify({ error: "Selected boiler plate file does not belong to this assignment." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (repositoryId) {
      const { data: repository, error: repositoryError } = await dbClient
        .from("Repositories")
        .select("id")
        .eq("id", repositoryId)
        .eq("aid", aid)
        .maybeSingle();

      if (repositoryError) {
        return new Response(JSON.stringify({ error: repositoryError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!repository) {
        return new Response(JSON.stringify({ error: "Selected repository does not belong to this assignment." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const{data: students, error: studentError} = await dbClient
      .from("File_Submissions")
      .select("suid")
      .eq("assignment_id", aid);

    if (studentError) {
      return new Response(JSON.stringify({ error: studentError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: comparison, error: comparisonError } = await dbClient
      .from("Comparisons")
      .insert({
        aid: aid,
        status: "pending",
        boiler_plate_file: boilerPlateFileId,
        repository: repositoryId,
      })
      .select()
      .single();

    if (comparisonError) {
      return new Response(JSON.stringify({ error: comparisonError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ comparison: comparison }), {
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
