import supabase from "../supabase";

export async function getInstructorsCourses(){
    const {data, error} = await supabase.functions.invoke("getInstructorsCourses", {
      method: "GET",
    });
    if (error){
        throw error;
    }
    return data.courses;
}