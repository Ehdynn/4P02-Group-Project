import supabase from "../supabase";

export async function removeStudent(cid, sid, uid){
  if (!cid) {
    throw new Error("Missing course id.");
  }
  if (!sid) {
    throw new Error("Missing student number.");
  }
  if (!uid) {
    throw new Error("Missing instructor uuid.");
  }

  const {error } = await supabase.rpc("remove_student_from_course", {
    p_cid: cid, p_sid: sid, p_uid: uid
  });

  if (error) {
    const details = error.message || "Could not remove student from course.";
    throw new Error(`Failed to remove student: ${details}`);
  }

  return;
}
