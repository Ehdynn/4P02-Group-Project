import JSZip from "jszip";
import supabase from "../supabase";

const supportedSourceExtensions = [".java", ".cpp", ".c"];
const uploadBucket = "Submissions";

function isZipFile(file) {
  return String(file?.name ?? "").toLowerCase().endsWith(".zip");
}

function getStoredSubmissionFileName(fid) {
  const submissionId = String(fid ?? "").trim();
  if (!submissionId) {
    throw new Error("Missing submission id.");
  }

  return `${submissionId}.txt`;
}

function isSupportedSourceFile(fileName) {
  const normalizedName = String(fileName ?? "").toLowerCase();
  return supportedSourceExtensions.some((extension) => normalizedName.endsWith(extension));
}

function stripComments(source) {
  let result = "";
  let index = 0;
  let inLineComment = false;
  let inBlockComment = false;
  let inString = false;
  let inChar = false;
  let escapeNext = false;

  while (index < source.length) {
    const current = source[index];
    const next = source[index + 1];

    if (inLineComment) {
      if (current === "\n") {
        inLineComment = false;
        result += current;
      }
      index += 1;
      continue;
    }

    if (inBlockComment) {
      if (current === "*" && next === "/") {
        inBlockComment = false;
        index += 2;
        continue;
      }

      if (current === "\n") {
        result += "\n";
      }
      index += 1;
      continue;
    }

    if (inString) {
      result += current;
      if (escapeNext) {
        escapeNext = false;
      } else if (current === "\\") {
        escapeNext = true;
      } else if (current === "\"") {
        inString = false;
      }
      index += 1;
      continue;
    }

    if (inChar) {
      result += current;
      if (escapeNext) {
        escapeNext = false;
      } else if (current === "\\") {
        escapeNext = true;
      } else if (current === "'") {
        inChar = false;
      }
      index += 1;
      continue;
    }

    if (current === "/" && next === "/") {
      inLineComment = true;
      index += 2;
      continue;
    }

    if (current === "/" && next === "*") {
      inBlockComment = true;
      index += 2;
      continue;
    }

    if (current === "\"") {
      inString = true;
      result += current;
      index += 1;
      continue;
    }

    if (current === "'") {
      inChar = true;
      result += current;
      index += 1;
      continue;
    }

    result += current;
    index += 1;
  }

  return result;
}

async function getMergedSubmissionBlob(file) {
  if (!isZipFile(file)) {
    throw new Error("Submission must be a zip file.");
  }

  const zip = await JSZip.loadAsync(file);
  const supportedFiles = Object.values(zip.files)
    .filter((entry) => !entry.dir && isSupportedSourceFile(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));

  if (supportedFiles.length === 0) {
    throw new Error("Zip file must contain at least one .java, .cpp, or .c file.");
  }

  const fileContents = await Promise.all(
    supportedFiles.map(async (entry) => stripComments(await entry.async("string"))),
  );

  const mergedSubmission = fileContents.join("\n\n");
  return new Blob([mergedSubmission], { type: "text/plain" });
}

export default async function uploadSubmission(file, fid, aid) {
  const uploadBody = await getMergedSubmissionBlob(file);
  const storedFileName = getStoredSubmissionFileName(fid);
  const filePath = `${aid}/${fid}/${storedFileName}`;
  const { data, error } = await supabase.storage
    .from(uploadBucket)
    .upload(filePath, uploadBody, { contentType: "text/plain" });

  if (error) {
    throw new Error(`Could not submit assignment: ${error.message}`);
  }

  return {
    path: data?.path ?? filePath,
    fileName: storedFileName,
    message: "Assignment submitted successfully.",
  };
}
