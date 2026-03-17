import supabase from "../supabase";

export default async function getAssignmentDetails(aid){
    if (!aid) throw new Error("Missing assignment id.");
    const {data, error} = await supabase
      .from("Assignments")
      .select("*")
      .eq("id", aid)
      .single();
    if (error) {
      const assignmentError = new Error(`Failed to get assignment details: ${error.message}`);
      assignmentError.code = error.code;
      assignmentError.details = error.details;
      assignmentError.hint = error.hint;
      throw assignmentError;
    }
    return data;
}
