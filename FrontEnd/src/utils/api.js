import supabase from "./supabase";

export async function isProfessorAccount(userId) {
  if (!userId) {
    throw new Error("Logged in but no id found.");
  }
  const { data, error } = await supabase
    .from("Accounts")
    .select("is_prof")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data.is_prof;
}


export async function getInstructorsCourses(){
    const {data, error} = await supabase.functions.invoke("getInstructorsCourses", {
      method: "GET",
    });
    if (error){
        throw error;
    }
    return data.courses;
}