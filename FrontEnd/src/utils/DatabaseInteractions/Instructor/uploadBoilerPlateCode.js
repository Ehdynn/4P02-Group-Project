import supabase from "../supabase";

const supportedExtensions = [".txt", ".py", ".cpp", ".java", ".c"];

function hasSupportedExtension(file) {
  const fileName = String(file?.name ?? "").toLowerCase();
  return supportedExtensions.some((extension) => fileName.endsWith(extension));
}

function getStoredFileName(file) {
  const originalName = String(file?.name ?? "").trim();
  if (!originalName) {
    return "boiler-plate.txt";
  }

  return originalName;
}

export async function uploadBoilerPlateCode(aid, file) {
  if (!aid) {
    throw new Error("Missing assignment id.");
  }

  if (!file) {
    throw new Error("Please choose a boiler plate file to upload.");
  }

  if (!hasSupportedExtension(file)) {
    throw new Error("Invalid boiler plate file format.");
  }

  const { data: uploadRecord, error: insertError } = await supabase
    .from("Boiler_Plate_Uploads")
    .insert({
      aid: Number(aid),
      file_name: getStoredFileName(file),
    })
    .select("id, created_at, file_name")
    .single();

  if (insertError) {
    throw new Error(`Failed to create boiler plate upload record: ${insertError.message}`);
  }

  const storedFileName = uploadRecord.file_name || getStoredFileName(file);
  const filePath = `${aid}/${uploadRecord.id}/${storedFileName}`;

  const { data, error: uploadError } = await supabase.storage
    .from("Boiler_Plate")
    .upload(filePath, file, { contentType: file.type || "text/plain" });

  if (uploadError) {
    await supabase
      .from("Boiler_Plate_Uploads")
      .delete()
      .eq("id", uploadRecord.id);

    throw new Error(`Failed to upload boiler plate file: ${uploadError.message}`);
  }

  return {
    id: uploadRecord.id,
    created_at: uploadRecord.created_at,
    file_name: uploadRecord.file_name,
    path: data?.path ?? filePath,
  };
}
