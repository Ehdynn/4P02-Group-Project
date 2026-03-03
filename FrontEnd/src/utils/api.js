import supabase from "./supabase";

export async function isProfessorAccount(userId) {
  if (!userId) {
    throw new Error("Logged in but no id found.");
  }
  const { data, error } = await supabase
    .from("Accounts")
    .select("is_prof")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data.is_prof;
}


export async function getInstructorsCourses(){
    const {data, error} = await supabase.functions.invoke("getInstructorsCourses", {
      method: "GET",
    });
    if (error){
        throw error;
    }
    return data.courses;
}

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

export async function uploadSubmission(file, suid, fid) {
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
