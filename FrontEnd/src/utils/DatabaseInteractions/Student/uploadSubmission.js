import supabase from "../supabase";

export default async function uploadSubmission(file, suid, fid) {
  const filePath = (suid + '/' + fid + '/' + file.name);
  const { data, error } = await supabase.storage.from('student_submissions').upload(filePath, file)
  if (error) {
    throw new Error(`Could not submit assignment: ${error.message}`);
  }

  return {
    path: data?.path ?? filePath,
    message: "Assignment submitted successfully.",
  };
}
