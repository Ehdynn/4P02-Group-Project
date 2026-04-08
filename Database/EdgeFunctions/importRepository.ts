import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";
import CryptoJS from "npm:crypto-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type AssignmentRow = {
  id: number;
  key: string;
  course: number;
};

type RepositoryRow = {
  id: string;
  aid: number;
  repository_name: string;
};

type ErrorResponse = {
  error: Response;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

function parseAssignmentId(value: number | string | undefined | null) {
  const aid = typeof value === "string" ? Number(value) : value;
  return Number.isInteger(aid) && aid > 0 ? aid : null;
}

function deriveKey(key: string) {
  return CryptoJS.SHA256(key);
}

function encryptValue(value: string, key: string) {
  const secretKey = deriveKey(key);
  const iv = CryptoJS.lib.WordArray.random(128 / 8);
  const encrypted = CryptoJS.AES.encrypt(value, secretKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return `${iv.toString(CryptoJS.enc.Base64)}:${encrypted.toString()}`;
}

async function createStudentIdentityKey(studentNumber: string, secret: string) {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(studentNumber));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function parseSubmissionIdentity(fileName: string) {
  const normalizedName = String(fileName ?? "").trim();
  if (!normalizedName.toLowerCase().endsWith(".zip")) {
    return null;
  }

  const baseName = normalizedName.slice(0, -4).trim();
  const separatorIndex = baseName.lastIndexOf("_");
  if (separatorIndex <= 0 || separatorIndex >= baseName.length - 1) {
    return null;
  }

  const studentName = baseName.slice(0, separatorIndex).trim();
  const studentNumber = baseName.slice(separatorIndex + 1).trim();
  if (!studentName || !studentNumber) {
    return null;
  }

  return { studentName, studentNumber };
}

async function getAuthorizedClient(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: json({ error: "Missing Supabase environment variables." }, 500) };
  }

  const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return { error: json({ error: "Missing authorization bearer token." }, 401) };
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(token);

  if (userError || !user) {
    return { error: json({ error: "Unauthorized." }, 401) };
  }

  const dbClient = supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      });

  return { dbClient, user };
}

async function getAuthorizedAssignment(
  dbClient: ReturnType<typeof createClient>,
  aid: number,
  userId: string,
): Promise<{ assignment: AssignmentRow } | ErrorResponse> {
  const { data: assignment, error: assignmentError } = await dbClient
    .from("Assignments")
    .select("id, key, course")
    .eq("id", aid)
    .single<AssignmentRow>();

  if (assignmentError || !assignment) {
    return { error: json({ error: "Assignment not found." }, 404) };
  }

  const { data: course, error: courseError } = await dbClient
    .from("Courses")
    .select("cid")
    .eq("cid", assignment.course)
    .eq("primary_instructor", userId)
    .maybeSingle();

  if (courseError) {
    return { error: json({ error: `Failed to verify instructor access: ${courseError.message}` }, 400) };
  }

  if (!course) {
    return { error: json({ error: "Unauthorized." }, 403) };
  }

  return { assignment };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    const authResult = await getAuthorizedClient(req);
    if ("error" in authResult) {
      return authResult.error;
    }

    const body = await req.json().catch(() => null) as {
      assignmentId?: number | string;
      repositoryId?: string | null;
    } | null;

    const aid = parseAssignmentId(body?.assignmentId);
    const repositoryId = String(body?.repositoryId ?? "").trim();
    if (!aid || !repositoryId) {
      return json({ error: "assignmentId and repositoryId are required." }, 400);
    }

    const assignmentResult = await getAuthorizedAssignment(authResult.dbClient, aid, authResult.user.id);
    if ("error" in assignmentResult) {
      return assignmentResult.error;
    }

    const { data: repository, error: repositoryError } = await authResult.dbClient
      .from("Repositories")
      .select("id, aid, repository_name")
      .eq("id", repositoryId)
      .eq("aid", aid)
      .single<RepositoryRow>();

    if (repositoryError || !repository) {
      return json({ error: "Repository not found for this assignment." }, 404);
    }

    const filePath = `${aid}/${repository.id}/${repository.repository_name}`;
    const { data: repositoryBlob, error: downloadError } = await authResult.dbClient.storage
      .from("Repositories")
      .download(filePath);

    if (downloadError || !repositoryBlob) {
      return json({ error: `Failed to download repository zip: ${downloadError?.message ?? "Unknown error"}` }, 500);
    }

    const identitySecret = Deno.env.get("STUDENT_IDENTITY_SECRET") ?? "";
    if (!identitySecret) {
      return json({ error: "Missing STUDENT_IDENTITY_SECRET." }, 500);
    }

    const repositoryZip = await JSZip.loadAsync(await repositoryBlob.arrayBuffer());
    const importResults: Array<{ fileName: string; status: "imported" | "skipped" | "failed"; reason?: string }> = [];

    const entries = Object.values(repositoryZip.files)
      .filter((entry) => !entry.dir);

    for (const entry of entries) {
      const entryName = entry.name.split("/").pop() ?? entry.name;
      if (!entryName.toLowerCase().endsWith(".zip")) {
        importResults.push({ fileName: entryName, status: "skipped", reason: "Not a zip submission." });
        continue;
      }

      const identity = parseSubmissionIdentity(entryName);
      if (!identity) {
        importResults.push({
          fileName: entryName,
          status: "failed",
          reason: "Expected repository entry names in the format name_number.zip.",
        });
        continue;
      }

      try {
        const submissionId = crypto.randomUUID();
        const encryptedStudentName = encryptValue(identity.studentName, assignmentResult.assignment.key);
        const encryptedStudentNumber = encryptValue(identity.studentNumber, assignmentResult.assignment.key);
        const studentIdentityKey = await createStudentIdentityKey(identity.studentNumber, identitySecret);
        const innerZipBytes = await entry.async("uint8array");

        const storedFileName = `${submissionId}.zip`;
        const submissionPath = `${aid}/${submissionId}/${storedFileName}`;
        const { error: uploadError } = await authResult.dbClient.storage
          .from("Submissions")
          .upload(submissionPath, innerZipBytes, { contentType: "application/zip", upsert: false });

        if (uploadError) {
          throw new Error(`Failed to upload unpacked submission: ${uploadError.message}`);
        }

        const { error: insertError } = await authResult.dbClient.rpc("create_file_submission", {
          p_submission_id: submissionId,
          p_assignment_id: aid,
          p_student_name: encryptedStudentName,
          p_student_number: encryptedStudentNumber,
          p_student_identity_key: studentIdentityKey,
          p_repository_id: repository.id,
        });

        if (insertError) {
          await authResult.dbClient.storage
            .from("Submissions")
            .remove([submissionPath])
            .catch(() => undefined);
          throw new Error(`Failed to create submission record: ${insertError.message}`);
        }

        importResults.push({ fileName: entryName, status: "imported" });
      } catch (error) {
        importResults.push({
          fileName: entryName,
          status: "failed",
          reason: error instanceof Error ? error.message : "Unexpected error.",
        });
      }
    }

    const imported = importResults.filter((result) => result.status === "imported").length;
    const failed = importResults.filter((result) => result.status === "failed").length;
    const skipped = importResults.filter((result) => result.status === "skipped").length;

    return json({
      repositoryId: repository.id,
      imported,
      failed,
      skipped,
      results: importResults,
    });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      500,
    );
  }
});
