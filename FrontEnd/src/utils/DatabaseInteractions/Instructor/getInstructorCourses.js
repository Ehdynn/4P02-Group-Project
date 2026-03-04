import supabase from "../supabase";

export async function getInstructorsCourses(uid){
    const { data, error } = await supabase
      .from("Courses")
      .select("*")
      .eq("primary_instructor", uid)
      .order("start_date", { ascending: false });

    if (error){
        throw error;
    }
    return data ?? [];
}