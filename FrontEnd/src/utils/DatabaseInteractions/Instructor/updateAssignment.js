import supabase from "../supabase";

export async function updateAssignment(aid, name, dueDate, desc) {
    if(!aid) throw new Error("Can not update: Missing assignment id");
    
    const {data, error} = await supabase
      .from("Assignments")
      .update({name: name, due_date: dueDate, description: desc})
      .eq("id", aid)
      .select()
      .single();
    
    if(error){
        throw new Error(`Failed to update assignment: ${error}`);
    }
    
    return data;
}