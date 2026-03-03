import supabase from "../supabase";

export async function getSubmissions(aid, suid) {
    if (!suid) throw new Error("Missing user id.");
    const {data, error} = await supabase
      .from("File_Submissions")
      .select("file_name")
      .eq("suid", suid)
      .eq("assignment_id", aid);

    if (error) {
      throw new Error(`Could not get students submissions: ${error.message}`);
    }
    return data.map((row) => row.fileName);
}