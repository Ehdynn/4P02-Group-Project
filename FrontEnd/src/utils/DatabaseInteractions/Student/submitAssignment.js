import supabase from "../supabase";
import uploadSubmission from "./uploadSubmission";

const supportedExtensions = [".zip"];

function hasSupportedExtension(file) {
  const fileName = String(file?.name ?? "").toLowerCase();
  return supportedExtensions.some((extension) => fileName.endsWith(extension));
}

async function encryptValue(value, key) {
  if (!value || !key) {
    throw new Error("Missing value or assignment key for encryption.");
  }

  const { data, error } = await supabase.functions.invoke("encryptDecrypt", {
    body: {
      value: value,
      key: key,
      encrypt: true,
    },
  });

  if (error) {
    throw new Error(`Failed to encrypt value: ${error.message}`);
  }

  return String(data?.message ?? "").trim();
}

async function createStudentIdentityKey(studentNumber) {
  const normalizedStudentNumber = String(studentNumber ?? "").trim();
  if (!normalizedStudentNumber) {
    throw new Error("Missing student number for identity key generation.");
  }

  const { data, error } = await supabase.functions.invoke("createStudentIdentityKey", {
    body: {
      studentNumber: normalizedStudentNumber,
    },
  });

  if (error) {
    throw new Error(`Failed to create student identity key: ${error.message}`);
  }

  return String(data?.key ?? "").trim();
}

export async function submitAssignment(file, name, studentNumber, aid, assignmentKey){
  if (!file) {
    throw new Error("Please choose a file before uploading.");
  }
  if (!name.trim() || !studentNumber) {
    throw new Error("Student name and number are required to submit.");
  }
  if (!aid) {
    throw new Error("Missing assignment id.");
  }
  if (!assignmentKey?.trim()) {
    throw new Error("Missing assignment key.");
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

  if (dueDate.getTime() < Date.now()) {
    throw new Error(`Failed to submit, due date has already passed.`);
  }


  if (!hasSupportedExtension(file)){
    throw new Error('Invalid File Format.');
  }
  const normalizedStudentNumber = studentNumber.trim();
  const encryptedStudentName = await encryptValue(name, assignmentKey);
  const encryptedStudentNumber = await encryptValue(normalizedStudentNumber, assignmentKey);
  const studentIdentityKey = await createStudentIdentityKey(normalizedStudentNumber);

  const { data, error } = await supabase.rpc("create_file_submission", {
    p_assignment_id: aid,
    p_student_name: encryptedStudentName,
    p_student_number: encryptedStudentNumber,
    p_student_identity_key: studentIdentityKey,
  });

  if (error) {
    throw new Error(`Could not create submission record: ${error.message}`);
  }

  const uploadResult = await uploadSubmission(file, data, aid);
  return {
    submissionId: data,
    storagePath: uploadResult.path,
    message: "Submission uploaded successfully.",
  };
}
