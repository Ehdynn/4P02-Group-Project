import supabase from "../supabase";

export async function getBoilerPlateUploads(aid) {
  if (!aid) {
    throw new Error("Failed to get boiler plate uploads: no assignment id provided.");
  }

  const { data, error } = await supabase
    .from("Boiler_Plate_Uploads")
    .select("id, created_at, file_name")
    .eq("aid", Number(aid))
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get boiler plate uploads: ${error.message}`);
  }

  return data ?? [];
}
