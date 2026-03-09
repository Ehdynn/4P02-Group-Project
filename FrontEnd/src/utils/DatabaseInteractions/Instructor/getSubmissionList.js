import supabase from "../supabase";

export async function getSubmissionList(aid) {
  if (!aid) throw new Error("No assignment id provided.");

  const { data, error } = await supabase
    .from("File_Submissions")
    .select("id, suid, created_at, file_name")
    .eq("assignment_id", Number(aid));

  if (error) {
    throw new Error(`Failed to get submission list: ${error.message}`);
  }

  return data ?? [];
}
