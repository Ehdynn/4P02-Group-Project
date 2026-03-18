import supabase from "../supabase";

async function decryptValue(value, key) {
  if (!value || !key) {
    return "";
  }

  const { data, error } = await supabase.functions.invoke("encryptDecrypt", {
    body: {
      value,
      key,
      encrypt: false,
    },
  });

  if (error) {
    throw new Error(`Failed to decrypt value: ${error.message}`);
  }

  return String(data?.message ?? "").trim();
}

async function getLatestSubmissions(aid, assignmentKey) {
  if (!aid) {
    return [];
  }

  const { data, error } = await supabase
    .from("File_Submissions_New")
    .select("id, student_info")
    .eq("assignment_id", Number(aid))
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get submissions: ${error.message}`);
  }

  const submissions = await Promise.all(
    (data ?? []).map(async (row) => {
      const id = String(row?.id ?? "").trim();
      const encryptedStudentName = String(row?.student_info?.student_name ?? "").trim();
      const encryptedStudentNumber = String(row?.student_info?.student_number ?? "").trim();

      return {
        id,
        fileName: `${id}.json`,
        studentName: assignmentKey
          ? await decryptValue(encryptedStudentName, assignmentKey)
          : encryptedStudentName,
        studentNumber: assignmentKey
          ? await decryptValue(encryptedStudentNumber, assignmentKey)
          : encryptedStudentNumber,
      };
    }),
  );

  return submissions.filter((row) => row.id);
}

export async function getComparisonOutputs(comparisonId, aid, assignmentKey) {
  if (!comparisonId || !aid) {
    return [];
  }

  const folderPath = String(comparisonId).trim();
  const submissions = await getLatestSubmissions(aid, assignmentKey);

  if (submissions.length === 0) {
    return [];
  }

  const downloads = await Promise.allSettled(
    submissions.map(async (submission) => {
      const filePath = `${folderPath}/${submission.fileName}`;
      const { data: blob, error: downloadError } = await supabase.storage
        .from("Comparisons")
        .download(filePath);

      if (downloadError) {
        throw new Error(`Failed to download ${filePath}: ${downloadError.message ?? "{}"}`);
      }

      const rawText = await blob.text();

      try {
        return {
          name: submission.fileName,
          path: filePath,
          submissionId: submission.id,
          studentName: submission.studentName || "Unknown Student",
          studentNumber: submission.studentNumber || "N/A",
          data: JSON.parse(rawText),
        };
      } catch {
        throw new Error(`Failed to parse ${filePath}: invalid JSON.`);
      }
    }),
  );

  const outputs = downloads
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value)
    .sort((left, right) => left.studentName.localeCompare(right.studentName));

  if (outputs.length > 0) {
    return outputs;
  }

  const failureMessages = downloads
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason?.message)
    .filter(Boolean);

  if (failureMessages.length > 0) {
    throw new Error(failureMessages.join(" "));
  }

  return outputs;
}
