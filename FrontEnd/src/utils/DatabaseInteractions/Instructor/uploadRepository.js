import supabase from "../supabase";

function getRepositoryFileName(file) {
  const originalName = String(file?.name ?? "").trim();
  if (!originalName) {
    return "repository.zip";
  }

  return originalName;
}

export async function uploadRepository(aid, file) {
  if (!aid) {
    throw new Error("Missing assignment id.");
  }

  if (!file) {
    throw new Error("Please choose a repository file to upload.");
  }

  if (!String(file?.name ?? "").toLowerCase().endsWith(".zip")) {
    throw new Error("Repository uploads must be .zip files.");
  }

  const { data: repositoryRecord, error: insertError } = await supabase
    .from("Repositories")
    .insert({
      aid: Number(aid),
      repository_name: getRepositoryFileName(file),
    })
    .select("id, created_at, repository_name")
    .single();

  if (insertError) {
    throw new Error(`Failed to create repository record: ${insertError.message}`);
  }

  const repositoryName = repositoryRecord.repository_name || getRepositoryFileName(file);
  const filePath = `${aid}/${repositoryRecord.id}/${repositoryName}`;

  const { data, error: uploadError } = await supabase.storage
    .from("Repositories")
    .upload(filePath, file, { contentType: file.type || "application/zip" });

  if (uploadError) {
    await supabase
      .from("Repositories")
      .delete()
      .eq("id", repositoryRecord.id);

    throw new Error(`Failed to upload repository file: ${uploadError.message}`);
  }

  return {
    id: repositoryRecord.id,
    created_at: repositoryRecord.created_at,
    repository_name: repositoryRecord.repository_name,
    path: data?.path ?? filePath,
  };
}
