import supabase from "../supabase";
import { normalizeSeverityLevel } from "../../../Components/Comparison/severity";

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

async function getSubmissionsForComparison(aid, submissionIds, assignmentKey) {
  if (!aid || !Array.isArray(submissionIds) || submissionIds.length === 0) {
    return [];
  }

  const normalizedSubmissionIds = submissionIds
    .map((submissionId) => String(submissionId ?? "").trim())
    .filter(Boolean);

  if (normalizedSubmissionIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("File_Submissions_New")
    .select("id, student_info, repository_id")
    .eq("assignment_id", Number(aid))
    .in("id", normalizedSubmissionIds);

  if (error) {
    throw new Error(`Failed to get submissions: ${error.message}`);
  }

  const submissionsById = new Map(
    await Promise.all(
      (data ?? []).map(async (row) => {
        const id = String(row?.id ?? "").trim();
        const encryptedStudentName = String(row?.student_info?.student_name ?? "").trim();
        const encryptedStudentNumber = String(row?.student_info?.student_number ?? "").trim();

        return [
          id,
          {
            id,
            fileName: `${id}.json`,
            studentName: assignmentKey
              ? await decryptValue(encryptedStudentName, assignmentKey)
              : encryptedStudentName,
            studentNumber: assignmentKey
              ? await decryptValue(encryptedStudentNumber, assignmentKey)
              : encryptedStudentNumber,
            repositoryId: String(row?.repository_id ?? "").trim() || null,
          },
        ];
      }),
    ),
  );

  return normalizedSubmissionIds
    .map((submissionId) => submissionsById.get(submissionId))
    .filter((submission) => submission?.id);
}

export async function getComparisonOutputs(comparison, aid, assignmentKey) {
  const comparisonId = String(comparison?.id ?? "").trim();
  const submissionsCompared = Array.isArray(comparison?.submissions_compared)
    ? comparison.submissions_compared
    : [];

  if (!comparisonId || !aid || submissionsCompared.length === 0) {
    return [];
  }

  const folderPath = comparisonId;
  const submissions = await getSubmissionsForComparison(aid, submissionsCompared, assignmentKey);

  const downloads = await Promise.allSettled(
    submissions.map(async (submission) => {
      let blob;
      let downloadError;
      const filePath = `${folderPath}/${submission.fileName}`;
      try {
        const response = await supabase.storage
          .from("Comparisons")
          .download(filePath);
        blob = response.data;
        downloadError = response.error;
        if (downloadError || !blob) {
          throw new Error(downloadError?.message ?? "Unknown error");
        }
      } catch (error) {
        throw new Error(`Failed to download ${filePath}: ${error.message ?? "{}"}`);
      }
      

      const rawText = await blob.text();

      try {
        const parsedData = JSON.parse(rawText);
        const similaritySequences = Array.isArray(parsedData?.similarity_sequences)
          ? parsedData.similarity_sequences.map((sequence) => ({
            ...sequence,
            severity_level: normalizeSeverityLevel(sequence?.severity_level),
          }))
          : [];

        return {
          name: submission.fileName,
          path: filePath,
          submissionId: submission.id,
          studentName: submission.studentName || "Unknown Student",
          studentNumber: submission.studentNumber || "N/A",
          sourceLabel: submission.repositoryId ? "Repository" : "Submission",
          repositoryId: submission.repositoryId,
          data: {
            ...parsedData,
            similarity_sequences: similaritySequences,
          },
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
