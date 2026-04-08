import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";
import CryptoJS from "npm:crypto-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "Content-Disposition",
};

type AssignmentRow = {
  id: number;
  key: string;
  course: number;
};

type SubmissionRow = {
  id: string;
  created_at: string;
  student_info: {
    student_name?: string | null;
    student_number?: string | null;
  } | null;
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

function sanitizeFileName(value: string | null | undefined, fallback: string) {
  return (value || fallback)
    .replace(/[\\/:*?"<>|]/g, "_")
    .trim()
    .slice(0, 120) || fallback;
}

type DecryptedSubmissionRow = SubmissionRow & {
  decryptedStudentName: string;
  decryptedStudentNumber: string;
};

function deriveKey(key: string) {
  return CryptoJS.SHA256(key);
}

function decryptValue(value: string | null | undefined, key: string) {
  const normalizedValue = String(value ?? "").trim();
  if (!normalizedValue) {
    return "";
  }

  const [ivBase64, ciphertext] = normalizedValue.split(":");
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

function parseAssignmentId(body: { assignmentId?: number | string } | null) {
  const assignmentId = body?.assignmentId;
  const aid = typeof assignmentId === "string" ? Number(assignmentId) : assignmentId;
  return Number.isInteger(aid) && aid > 0 ? aid : null;
}

function getSubmissionExportId(submission: DecryptedSubmissionRow) {
  const studentName = String(submission.decryptedStudentName ?? "").trim();
  const studentNumber = String(submission.decryptedStudentNumber ?? "").trim();

  if (studentName && studentNumber) {
    return sanitizeFileName(`${studentName}_${studentNumber}`, submission.id);
  }

  return sanitizeFileName(studentName || studentNumber || submission.id, submission.id);
}

function getStudentIdentityKey(submission: DecryptedSubmissionRow) {
  if (submission.decryptedStudentNumber) {
    return `number:${submission.decryptedStudentNumber}`;
  }

  if (submission.decryptedStudentName) {
    return `name:${submission.decryptedStudentName}`;
  }

  return `submission:${submission.id}`;
}

function getLatestSubmissionsByStudent(submissions: DecryptedSubmissionRow[]) {
  const latestByStudent = new Map<string, DecryptedSubmissionRow>();

  for (const submission of submissions) {
    const studentKey = getStudentIdentityKey(submission);
    if (!latestByStudent.has(studentKey)) {
      latestByStudent.set(studentKey, submission);
    }
  }
  return Array.from(latestByStudent.values());
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

Deno.serve(async (req) => {
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

    const body = (await req.json().catch(() => null)) as { assignmentId?: number | string } | null;
    const aid = parseAssignmentId(body);
    if (!aid) {
      return json({ error: "Invalid assignmentId." }, 400);
    }

    const assignmentResult = await getAuthorizedAssignment(authResult.dbClient, aid, authResult.user.id);
    if ("error" in assignmentResult) {
      return assignmentResult.error;
    }

    const { data: submissions, error: submissionsError } = await authResult.dbClient
      .from("File_Submissions_New")
      .select("id, created_at, student_info")
      .eq("assignment_id", aid)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (submissionsError) {
      return json({ error: `Failed to load submissions: ${submissionsError.message}` }, 400);
    }

    const decryptedSubmissions = ((submissions ?? []) as SubmissionRow[]).map((submission) => ({
      ...submission,
      decryptedStudentName: decryptValue(submission.student_info?.student_name, assignmentResult.assignment.key),
      decryptedStudentNumber: decryptValue(submission.student_info?.student_number, assignmentResult.assignment.key),
    }));

    const latestSubmissions = getLatestSubmissionsByStudent(decryptedSubmissions);
    if (latestSubmissions.length === 0) {
      return json({ error: "No submissions found." }, 404);
    }

    const zip = new JSZip();
    const usedFileNames = new Set<string>();
    for (const submission of latestSubmissions) {
      const storedFileName = `${submission.id}.zip`;
      const exportBaseName = getSubmissionExportId(submission);
      let exportFileName = `${exportBaseName}.zip`;
      let duplicateCounter = 2;
      while (usedFileNames.has(exportFileName)) {
        exportFileName = `${exportBaseName}_${duplicateCounter}.zip`;
        duplicateCounter += 1;
      }
      usedFileNames.add(exportFileName);
      const filePath = `${aid}/${submission.id}/${storedFileName}`;
      const { data: fileBlob, error: downloadError } = await authResult.dbClient.storage
        .from("Submissions")
        .download(filePath);

      if (downloadError) {
        return json({ error: `Failed to download ${storedFileName}: ${downloadError.message}` }, 500);
      }

      const content = await fileBlob.arrayBuffer();
      zip.file(exportFileName, new Uint8Array(content));
    }

    const zipBytes = await zip.generateAsync({ type: "uint8array" });
    const zipName = `${sanitizeFileName(assignmentResult.assignment.key, `assignment-${aid}`)}.zip`;

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
