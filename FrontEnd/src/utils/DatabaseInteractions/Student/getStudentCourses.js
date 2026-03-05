import supabase from "../supabase";

export default async function getCourses(suid) {
  if (!suid) throw new Error("Missing user id.");

  const { data, error } = await supabase
    .from("Enrolled")
    .select("cid")
    .eq("suid", suid);

  if (error) {
    throw new Error(`Could not get students courses: ${error.message}`);
  }

  const cids = Array.from(
    new Set((data ?? []).map((row) => String(row?.cid ?? "").trim()).filter(Boolean))
  );

  if (cids.length === 0) {
    return [];
  }

  const { data: courses, error: courseError } = await supabase
    .from("Courses")
    .select("cid, name")
    .in("cid", cids)
    .order("start_date", { ascending: false });

  if (courseError) {
    return cids.map((cid) => ({ cid, name: undefined }));
  }

  return (courses ?? []).map((course) => ({
    cid: String(course?.cid ?? ""),
    name: course?.name,
  }));
}
