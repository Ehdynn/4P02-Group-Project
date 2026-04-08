import supabase from "../supabase";

async function getAssignmentById(aid) {
  const { data, error } = await supabase
    .from("Assignments")
    .select("id, key")
    .eq("id", Number(aid))
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load assignment details: ${error.message}`);
  }

  return data ?? null;
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

  const assignment = await getAssignmentById(aid);
  const assignmentKey = String(assignment?.key ?? "").trim();
  if (!assignmentKey) {
    throw new Error("Assignment key could not be loaded for this assignment.");
  }

  const repositoryFileName = `${assignmentKey}.zip`;

  const { data: repositoryRecord, error: insertError } = await supabase
    .from("Repositories")
    .insert({
      aid: Number(aid),
      repository_name: repositoryFileName,
    })
    .select("id, created_at, repository_name")
    .single();

  if (insertError) {
    throw new Error(`Failed to create repository record: ${insertError.message}`);
  }

  const repositoryName = repositoryRecord.repository_name || repositoryFileName;
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

  const { data: importResult, error: importError } = await supabase.functions.invoke("importRepository", {
    body: {
      assignmentId: Number(aid),
      repositoryId: repositoryRecord.id,
    },
  });

  if (importError || importResult?.error) {
    await supabase.storage
      .from("Repositories")
      .remove([filePath])
      .catch(() => undefined);
    await supabase
      .from("Repositories")
      .delete()
      .eq("id", repositoryRecord.id);

    throw new Error(
      importError?.message
        ?? importResult?.error
        ?? "Failed to unpack repository into submissions.",
    );
  }

  if (Number(importResult?.imported ?? 0) <= 0) {
    await supabase.storage
      .from("Repositories")
      .remove([filePath])
      .catch(() => undefined);
    await supabase
      .from("Repositories")
      .delete()
      .eq("id", repositoryRecord.id);

    throw new Error("Repository upload completed, but no submissions were imported from the archive.");
  }

  return {
    id: repositoryRecord.id,
    created_at: repositoryRecord.created_at,
    repository_name: repositoryRecord.repository_name,
    path: data?.path ?? filePath,
    importSummary: importResult,
  };
}
