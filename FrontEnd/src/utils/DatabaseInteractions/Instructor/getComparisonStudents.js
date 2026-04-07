import supabase from "../supabase";

export async function getComparisonStudents(aid) {
  if (!aid) throw new Error("Missing assignment id.");

  const { data, error } = await supabase
    .from("Comparisons")
    .select("submissions_compared")
    .eq("aid", Number(aid));

  if (error) {
    throw new Error(`Failed to get comparison students: ${error.message}`);
  }

  const students = (data ?? []).flatMap((row) =>
    Array.isArray(row?.submissions_compared) ? row.submissions_compared : [],
  );

  return [...new Set(students.map((student) => String(student)).filter(Boolean))];
}
