import supabase from "../supabase";

export default async function getAssignmentDetails(aid){
    if (!aid) throw new Error("Missing assignment id.");
    const {data, error} = await supabase
      .from("Assignments")
      .select("*")
      .eq("id", aid)
      .single();
    if (error) {
      throw new Error(`Failed to get assingment details: ${error.message}`);
    }
    return data;
}