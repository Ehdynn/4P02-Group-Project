import JSZip from "jszip";
import { downloadSubmission } from "./downloadSubmission";

const sanitizeFileName = (name) =>
  String(name || "file")
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim()
    .slice(0, 120) || "file";

export async function downloadAllSubmissions(selectedStudent) {
  if (!selectedStudent?.submissions?.length) {
    return;
  }

  const zip = new JSZip();
  const nameCounts = new Map();

  const tasks = selectedStudent.submissions.map(async (submission, index) => {
    const { signedUrl } = await downloadSubmission(submission);
    const response = await fetch(signedUrl);
    if (!response.ok) {
      throw new Error(`Could not fetch ${submission.id || "submission file"}.txt.`);
    }

    const blob = await response.blob();
    const baseName = sanitizeFileName(submission.id ? `${submission.id}.txt` : `submission-${index + 1}.txt`);
    const count = nameCounts.get(baseName) ?? 0;
    const finalName = count === 0 ? baseName : `${count + 1}-${baseName}`;
    nameCounts.set(baseName, count + 1);

    zip.file(finalName, blob);
  });

  await Promise.all(tasks);

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  const zipName = `${sanitizeFileName(selectedStudent.student_name || selectedStudent.suid || "student")}-submissions.zip`;
  const blobUrl = URL.createObjectURL(zipBlob);

  link.href = blobUrl;
  link.download = zipName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}
