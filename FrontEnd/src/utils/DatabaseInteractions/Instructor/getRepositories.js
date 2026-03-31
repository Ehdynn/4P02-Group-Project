import supabase from "../supabase";

export async function getRepositories(aid) {
  if (!aid) {
    throw new Error("Failed to get repositories: no assignment id provided.");
  }

  const { data, error } = await supabase
    .from("Repositories")
    .select("id, created_at, repository_name")
    .eq("aid", Number(aid))
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get repositories: ${error.message}`);
  }

  return data ?? [];
}
