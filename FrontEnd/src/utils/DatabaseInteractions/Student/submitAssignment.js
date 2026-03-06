import supabase from "../supabase";
import uploadSubmission from "./uploadSubmission";

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

  const { data: dueDateRow, error: dueDateError } = await supabase
    .from("Assignments")
    .select("due_date")
    .eq("id", aid)
    .single();

  if(dueDateError){
    throw new Error(`Failed to submit, could not confirm due date: ${dueDateError.message}`);
  }

  const dueDate = new Date(dueDateRow?.due_date ?? "");
  if (Number.isNaN(dueDate.getTime())) {
    throw new Error("Failed to submit, invalid assignment due date.");
  }

  if (dueDate.getTime() < Date.now()) {
    throw new Error(`Failed to submit, due date has already passed.`);
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
