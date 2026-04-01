import supabase from "../supabase";

export async function downloadSubmission(submission) {
  const storedFileName = `${submission.id}.zip`;
  const expectedPath = `${submission.suid}/${submission.id}/${storedFileName}`;

  const { data: directData, error: directError } = await supabase.storage
    .from("student_submissions")
    .createSignedUrl(expectedPath, 60 * 60, { download: true });

  if (directData?.signedUrl) {
    return { signedUrl: directData.signedUrl };
  }

  const { data: folderFiles, error: listError } = await supabase.storage
    .from("student_submissions")
    .list(`${submission.suid}/${submission.id}`);

  if (listError) {
    throw directError || listError;
  }

  if (Array.isArray(folderFiles) && folderFiles.length > 0) {
    const exactMatch =
      folderFiles.find((item) => item?.name === storedFileName) ??
      folderFiles[0];
    const fallbackPath = `${submission.suid}/${submission.id}/${exactMatch.name}`;
    const { data: fallbackData, error: fallbackError } = await supabase.storage
      .from("student_submissions")
      .createSignedUrl(fallbackPath, 60 * 60, { download: true });

    if (fallbackError) {
      throw directError || fallbackError;
    }
    if (fallbackData?.signedUrl) {
      return { signedUrl: fallbackData.signedUrl };
    }
  }

  throw new Error("Could not locate submission file in storage.");
}
