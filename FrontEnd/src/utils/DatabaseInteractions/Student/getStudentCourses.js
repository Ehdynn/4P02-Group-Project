import supabase from "../supabase";

export async function getCourses(suid) {
    if (!suid) throw new Error("Missing user id.");
    const {data, error} = await supabase
      .from("Enrolled")
      .select("cid")
      .eq("suid", suid);

    if (error) {
      throw new Error(`Could not get students courses: ${error.message}`);
    }
    return data.map((row) => row.cid);
}