import JSZip from "jszip";
import supabase from "../supabase";

function isZipFile(file) {
  return String(file?.name ?? "").toLowerCase().endsWith(".zip");
}

export function getStoredSubmissionFileName(file) {
  const originalName = String(file?.name ?? "").trim();
  if (!originalName) {
    return "submission.zip";
  }

  return isZipFile(file) ? originalName : `${originalName}.zip`;
}

async function getUploadPayload(file) {
  if (isZipFile(file)) {
    return {
      uploadBody: file,
      contentType: file.type || "application/zip",
      storedFileName: getStoredSubmissionFileName(file),
    };
  }

  const zip = new JSZip();
  zip.file(file.name, file);

  const zippedBlob = await zip.generateAsync({ type: "blob" });
  return {
    uploadBody: zippedBlob,
    contentType: "application/zip",
    storedFileName: getStoredSubmissionFileName(file),
  };
}

export default async function uploadSubmission(file, fid, aid) {
  const { uploadBody, contentType, storedFileName } = await getUploadPayload(file);
  const filePath = `${aid}/${fid}/${storedFileName}`;
  const { data, error } = await supabase.storage
    .from("Submissions")
    .upload(filePath, uploadBody, { contentType });

  if (error) {
    throw new Error(`Could not submit assignment: ${error.message}`);
  }

  return {
    path: data?.path ?? filePath,
    fileName: storedFileName,
    message: "Assignment submitted successfully.",
  };
}
