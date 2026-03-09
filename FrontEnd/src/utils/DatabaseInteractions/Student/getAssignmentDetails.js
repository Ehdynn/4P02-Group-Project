import supabase from "../supabase";

export default async function getAssignmentDetails(aid){
    if (!aid) throw new Error("Missing assignment id.");
    const {data, error} = await supabase
      .from("Assignments")
      .select("*")
      .eq("id", aid)
      .single();
    if (error) {
      if(error.message === "Cannot coerce the result to a single JSON object"){
        return null;
      }
      throw new Error(`Failed to get assingment details: ${error.message}`);
    }
    return data;
}