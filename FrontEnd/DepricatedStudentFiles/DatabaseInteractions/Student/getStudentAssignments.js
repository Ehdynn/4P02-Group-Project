import supabase from "../supabase";

export default async function getStudentAssignments(cid) {
    if (!cid) throw new Error("Missing course id.");
    const {data, error} = await supabase
      .from("Assignments")
      .select("*")
      .eq("course", cid);
      if (error) {
      throw new Error(`Failed to get assingments: ${error.message}`);
    }
    return data;
}