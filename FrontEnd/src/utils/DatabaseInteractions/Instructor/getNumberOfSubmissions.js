import supabase from "../supabase";

export async function getNumberOfSubmissions(aid) {
  if (!aid) {
    throw new Error("Failed to get submission counts: no assignment id provided.");
  }

  const { count, error: countError } = await supabase
    .from("File_Submissions_New")
    .select("*", { count: "exact", head: true })
    .eq("assignment_id", Number(aid))
    .is("repository_id", null);

  if (countError) {
    throw new Error(`Failed to get submission count: ${countError.message}`);
  }

  const { data, error: uniqueError } = await supabase
    .from("File_Submissions_New")
    .select("student_identity_key")
    .eq("assignment_id", Number(aid))
    .is("repository_id", null);

  if (uniqueError) {
    throw new Error(`Failed to get unique student submission count: ${uniqueError.message}`);
  }

  const uniqueStudentNumbers = new Set(
    (data ?? [])
      .map((row) => String(row?.student_identity_key ?? "").trim())
      .filter(Boolean),
  );

  return {
    submissionCount: count ?? 0,
    uniqueStudentSubmissionCount: uniqueStudentNumbers.size,
  };
}
