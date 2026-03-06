import supabase from "../supabase";

export async function updateCourse(cid, joinCode) {
    if(!cid) throw new Error("Can not update: Missing course id");
    if(!joinCode) throw new Error("Can not update: Missing new join code.");
    if(joinCode === "") joinCode = null;
    const {data, error} = await supabase
      .from("Courses")
      .update({join_code: joinCode})
      .eq("cid", cid)
      .select()
      .single();
    
    if(error){
        throw new Error(`Failed to update course: ${error}`);
    }
    
    return data;
}