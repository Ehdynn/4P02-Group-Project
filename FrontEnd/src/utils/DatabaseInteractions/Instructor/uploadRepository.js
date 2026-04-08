import supabase from "../supabase";

function getZipBaseName(file) {
  const originalName = String(file?.name ?? "").trim();
  if (!originalName.toLowerCase().endsWith(".zip")) {
    return "";
  }

  return originalName.slice(0, -4).trim();
}

async function getAssignmentByKey(key) {
  const { data, error } = await supabase
    .from("Assignments")
    .select("id, key")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to validate assignment key: ${error.message}`);
  }

  return data ?? null;
}

async function resolveRepositoryAssignmentKey(file, aid) {
  const inferredKey = getZipBaseName(file);
  if (inferredKey) {
    const matchedAssignment = await getAssignmentByKey(inferredKey);
    if (matchedAssignment) {
      return inferredKey;
    }
  }

  const providedKey = window.prompt(
    "Repository zip name is not a valid assignment key for this assignment. Enter the assignment key:",
    "",
  );

  if (!providedKey?.trim()) {
    throw new Error("Assignment key is required to upload this repository.");
  }

  const matchedAssignment = await getAssignmentByKey(providedKey.trim());
  if (!matchedAssignment) {
    throw new Error("The provided assignment key does not exist.");
  }

  return providedKey.trim();
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

  const assignmentKey = await resolveRepositoryAssignmentKey(file, aid);
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

  return {
    id: repositoryRecord.id,
    created_at: repositoryRecord.created_at,
    repository_name: repositoryRecord.repository_name,
    path: data?.path ?? filePath,
    importSummary: importResult,
  };
}
