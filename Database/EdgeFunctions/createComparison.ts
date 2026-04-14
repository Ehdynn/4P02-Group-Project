import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers to allow requests from any origin and specify allowed headers
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Basic environment information.
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");

    // Validate environment variables and authentication token presence
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase environment variables." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract the token from the Authorization header
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing or invalid Authorization bearer token." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the supabase client
    const authClient = createClient(supabaseUrl, supabaseAnonKey);

    // Authenticate the user using the token and retrieve user information
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(token);

    // Handle any errors during authentication or if the user is not found
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use the service role key if available, otherwise use users authentication
    const dbClient = supabaseServiceRoleKey
      ? createClient(supabaseUrl, supabaseServiceRoleKey)
      : createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });

    // Parse the request body as JSON and validate required fields
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

    // Ensure the boilerPlate id exists in the system and belongs to the assignment
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

    // ensure the repository id exists in the system and belongs to the assignment
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

    // Retrieve all submissions made to this assignment, ordered by creation date
    const { data: submissions, error: submissionError } = await dbClient
      .from("File_Submissions_New")
      .select("id, created_at, student_identity_key, repository_id")
      .eq("assignment_id", aid)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (submissionError) {
      return new Response(JSON.stringify({ error: submissionError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Get only the latest submission for each student, 
    // and all submissions from the selected repository if one was selected
    const latestSubmissionIdsByStudent = new Map<string, string>();
    const repositorySubmissionIds: string[] = [];

    for (const row of submissions ?? []) {
      const submissionId = String(row?.id ?? "").trim();
      if (!submissionId) {
        continue;
      }

      const rowRepositoryId = String(row?.repository_id ?? "").trim();
      if (rowRepositoryId) {
        if (repositoryId && rowRepositoryId === repositoryId) {
          repositorySubmissionIds.push(submissionId);
        }
        continue;
      }

      const studentIdentityKey = String(row?.student_identity_key ?? "").trim();
      const studentKey = studentIdentityKey ? `identity:${studentIdentityKey}` : `submission:${submissionId}`;

      if (!latestSubmissionIdsByStudent.has(studentKey)) {
        latestSubmissionIdsByStudent.set(studentKey, submissionId);
      }
    }

    // Combine the latest submission ids by student with the repository submission ids
    const submissionsCompared = [
      ...latestSubmissionIdsByStudent.values(),
      ...repositorySubmissionIds,
    ];

    // Throw an error if a repository was selected but it has no submissions to compare
    if (repositoryId && repositorySubmissionIds.length === 0) {
      return new Response(JSON.stringify({ error: "The selected repository has no imported submissions for this assignment." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a new comparison record with the provided information and the list of submission ids to compare
    const { data: comparison, error: comparisonError } = await dbClient
      .from("Comparisons")
      .insert({
        aid: aid,
        status: "pending",
        submissions_compared: submissionsCompared,
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

    // Return the created comparison record in the response
    return new Response(JSON.stringify({ comparison: comparison }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle any unexpected errors that may occur during the process
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
