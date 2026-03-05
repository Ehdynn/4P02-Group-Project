import supabase from "../supabase";

export async function getEnrolled(cid, uid){
  if (!cid) {
    throw new Error("Missing course id.");
  }

  const { data, error } = await supabase.rpc("get_enrolled_student_list", {
    p_cid: cid, uuid: uid
  });

  if (error) {
    const details = error.message || "Could not get student list.";
    throw new Error(`Could not get student list: ${details}`);
  }

  if (!Array.isArray(data)) {
    if (data && Array.isArray(data.students)) {
      return data.students;
    }
    return [];
  }

  return data.map((student) => ({
    student_name: student?.student_name ?? "Unknown Student",
    student_number: student?.student_number ?? null,
  }));
}
