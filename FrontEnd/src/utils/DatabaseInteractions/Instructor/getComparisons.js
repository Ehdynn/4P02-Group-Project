import supabase from "../supabase";

export async function getComparisons(aid) {
  if (!aid) throw new Error("Missing assignment id.");

  const { data, error } = await supabase
    .from("Comparisons")
    .select("id, created_at, updated_at, aid, status, error_message, submissions_compared")
    .eq("aid", Number(aid))
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get comparisons: ${error.message}`);
  }

  return data ?? [];
}
