import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import CryptoJS from "npm:crypto-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CreateComparisonBody = {
  aid: number;
  boilerPlateFileId?: string | null;
  repositoryId?: string | null;
};

function deriveKey(key: string) {
  return CryptoJS.SHA256(key);
}

function decryptValue(value: string, key: string) {
  if (!value || !key) {
    return "";
  }

  const [ivBase64, ciphertext] = value.split(":");
  if (!ivBase64 || !ciphertext) {
    return "";
  }

  const iv = CryptoJS.enc.Base64.parse(ivBase64);
  const secretKey = deriveKey(key);
  const decrypted = CryptoJS.AES.decrypt(ciphertext, secretKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8).trim();
}

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

    const { data: assignment, error: assignmentError } = await dbClient
      .from("Assignments")
      .select("key")
      .eq("id", aid)
      .single();

    if (assignmentError) {
      return new Response(JSON.stringify({ error: assignmentError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const assignmentKey = String(assignment?.key ?? "").trim();
    if (!assignmentKey) {
      return new Response(JSON.stringify({ error: "Assignment key is missing." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: submissions, error: submissionError } = await dbClient
      .from("File_Submissions_New")
      .select("id, created_at, student_info")
      .eq("assignment_id", aid)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (submissionError) {
      return new Response(JSON.stringify({ error: submissionError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const latestSubmissionIdsByStudent = new Map<string, string>();

    for (const row of submissions ?? []) {
      const submissionId = String(row?.id ?? "").trim();
      if (!submissionId) {
        continue;
      }

      const encryptedStudentNumber = String(row?.student_info?.student_number ?? "").trim();
      const studentNumber = decryptValue(encryptedStudentNumber, assignmentKey);
      const studentKey = studentNumber ? `number:${studentNumber}` : `submission:${submissionId}`;

      if (!latestSubmissionIdsByStudent.has(studentKey)) {
        latestSubmissionIdsByStudent.set(studentKey, submissionId);
      }
    }

    const submissionsCompared = [...latestSubmissionIdsByStudent.values()];

    const { data: comparison, error: comparisonError } = await dbClient
      .from("Comparisons")
      .insert({
        aid: aid,
        status: "pending",
        submissions_compared: submissionsCompared,
        number_of_students: submissionsCompared.length,
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
