import supabase from '../supabase';

export async function createAssignment(courseId, name, dueDate, description, key){
    if (!courseId) throw new Error("Missing course id.");
    if (!name) throw new Error("Missing assignment name.");

    const { data, error } = await supabase
      .from("Assignments")
      .insert({
        course: courseId,
        name: name.trim(),
        due_date: dueDate,
        description: description?.trim() ?? "",
        key: key,
      })
      .select()
      .single();

      if (error) {
        throw new Error(`Failed to create assignment: ${error.message}`);
      }
      return data;
}