import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type LatestSubmission = {
  submission_id: string;
  assignment_id: number;
  suid: string;
  student_name: string | null;
  student_number: string | null;
  file_name: string | null;
  storage_path: string | null;
  created_at: string | null;
};

const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });

const sanitizeZipName = (value: string | null | undefined, fallback: string) =>
  (value || fallback)
    .replace(/[\\/:*?"<>|]/g, "_")
    .trim()
    .slice(0, 120) || fallback;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      return json({ error: "Missing Supabase environment variables." }, 500);
    }

    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return json({ error: "Missing authorization bearer token." }, 401);
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(token);

    if (userError || !user) {
      return json({ error: "Unauthorized." }, 401);
    }

    const dbClient = supabaseServiceRoleKey
      ? createClient(supabaseUrl, supabaseServiceRoleKey)
      : createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: { Authorization: `Bearer ${token}` },
          },
        });

    const body = (await req.json().catch(() => null)) as { assignmentId?: number | string } | null;
    const assignmentId = body?.assignmentId;
    const aid = typeof assignmentId === "string" ? Number(assignmentId) : assignmentId;

    if (!Number.isInteger(aid) || aid <= 0) {
      return json({ error: "Invalid assignmentId." }, 400);
    }

    const { data: submissions, error: rpcError } = await dbClient.rpc(
      "get_latest_submissions_for_assignment",
      { p_aid: aid },
    );

    if (rpcError) {
      if ((rpcError as { code?: string }).code === "42501") {
        return json({ error: "Unauthorized or assignment not found." }, 403);
      }

      return json({ error: `Failed to get assignment submissions: ${rpcError.message}` }, 400);
    }

    if (!Array.isArray(submissions) || submissions.length === 0) {
      return json({ error: "No submissions found." }, 404);
    }

    const zip = new JSZip();
    for (const row of submissions as LatestSubmission[]) {
      const path =
        row.storage_path ??
        `${row.suid}/${row.submission_id}/${row.file_name || "submission"}`;
      const safeFileName = sanitizeZipName(
        row.file_name,
        `submission-${row.submission_id}`,
      );
      const folder = sanitizeZipName(
        row.student_name || row.student_number || row.suid,
        `student-${row.suid}`,
      );

      const { data: fileBlob, error: downloadError } = await dbClient.storage
        .from("student_submissions")
        .download(path);

      if (downloadError) {
        return json({ error: `Failed to download ${safeFileName}: ${downloadError.message}` }, 500);
      }

      const content = await fileBlob.arrayBuffer();
      zip.file(`${folder}/${safeFileName}`, new Uint8Array(content));
    }

    const zipBytes = await zip.generateAsync({ type: "uint8array" });
    const zipName = `${sanitizeZipName(`assignment-${aid}-latest-submissions`, "assignment-submissions")}.zip`;

    return new Response(zipBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipName}"`,
      },
    });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      500,
    );
  }
});
