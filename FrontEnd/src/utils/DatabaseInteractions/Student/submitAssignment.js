import supabase from "../supabase";

export async function submitAssignment(file, suid, aid){
  if (!file) {
    throw new Error("Please choose a file before uploading.");
  }
  if (!suid) {
    throw new Error("You must be logged in to submit an assignment.");
  }
  if (!aid) {
    throw new Error("Missing assignment id.");
  }

  const {data, error} = await supabase
    .from("File_Submissions")
    .insert({
      assignment_id: aid,
      suid: suid,
      file_name: file.name,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Could not create submission record: ${error.message}`);
  }

  const uploadResult = await uploadSubmission(file, suid, data.id);
  return {
    submissionId: data.id,
    storagePath: uploadResult.path,
    message: "Submission uploaded successfully.",
  };
}