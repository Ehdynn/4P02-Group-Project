import JSZip from "jszip";
import supabase from "../supabase";

const supportedSourceExtensions = [".java", ".cpp", ".c", ".py"];
const uploadBucket = "Submissions";

function isZipFile(file) {
  return String(file?.name ?? "").toLowerCase().endsWith(".zip");
}

function getStoredSubmissionFileName(fid) {
  const submissionId = String(fid ?? "").trim();
  if (!submissionId) {
    throw new Error("Missing submission id.");
  }

  return `${submissionId}.zip`;
}

function isSupportedSourceFile(fileName) {
  const normalizedName = String(fileName ?? "").toLowerCase();
  return supportedSourceExtensions.some((extension) => normalizedName.endsWith(extension));
}

function getSourceExtension(fileName) {
  const normalizedName = String(fileName ?? "").toLowerCase();

  for (const extension of supportedSourceExtensions) {
    if (normalizedName.endsWith(extension)) {
      return extension;
    }
  }

  return "";
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

async function getMergedSubmissionBlob(file, fid) {
  if (!isZipFile(file)) {
    throw new Error("Submission must be a zip file.");
  }

  const inputZip = await JSZip.loadAsync(file);
  const supportedFiles = Object.values(inputZip.files)
    .filter((entry) => !entry.dir && isSupportedSourceFile(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));

  if (supportedFiles.length === 0) {
    throw new Error("Zip file must contain at least one .java, .cpp, .c, or .py file.");
  }

  const submissionId = String(fid ?? "").trim();
  if (!submissionId) {
    throw new Error("Missing submission id.");
  }

  const groupedSourceByExtension = new Map();

  for (const entry of supportedFiles) {
    const extension = getSourceExtension(entry.name);
    if (!extension) {
      continue;
    }

    const existingSources = groupedSourceByExtension.get(extension) ?? [];
    existingSources.push(stripComments(await entry.async("string")));
    groupedSourceByExtension.set(extension, existingSources);
  }

  const outputZip = new JSZip();

  for (const extension of supportedSourceExtensions) {
    const groupedSources = groupedSourceByExtension.get(extension);
    if (!groupedSources?.length) {
      continue;
    }

    outputZip.file(`${submissionId}${extension}`, groupedSources.join("\n\n"));
  }

  return outputZip.generateAsync({ type: "blob" });
}

export default async function uploadSubmission(file, fid, aid) {
  const storedFileName = getStoredSubmissionFileName(fid);
  const uploadBody = await getMergedSubmissionBlob(file, fid);
  const filePath = `${aid}/${fid}/${storedFileName}`;
  const { data, error } = await supabase.storage
    .from(uploadBucket)
    .upload(filePath, uploadBody, { contentType: "application/zip" });

  if (error) {
    throw new Error(`Could not submit assignment: ${error.message}`);
  }

  return {
    path: data?.path ?? filePath,
    fileName: storedFileName,
    message: "Assignment submitted successfully.",
  };
}
