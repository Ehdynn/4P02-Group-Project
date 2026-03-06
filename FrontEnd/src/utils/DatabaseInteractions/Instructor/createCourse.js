import supabase from '../supabase';

export async function createCourse(uuid, name, joinCode, startDate, endDate) {
    if (!uuid) throw new Error("Missing primary instructor uuid.");
    if (!name) throw new Error("Missing course name.");
    if (!startDate) throw new Error("Missing course start date.");
    if(joinCode && joinCode.length > 15) throw new Error("Join code is too long.");
    if(endDate && new Date(endDate) < new Date(startDate)){
        throw new Error("endDate must be on or after startDate.");
    }

    if(joinCode === ""){joinCode = null}
    if(endDate === ""){endDate = null}

    const { data, error } = await supabase
      .from("Courses")
      .insert({
        name: name.trim(),
        join_code: joinCode?.trim() ?? null,
        start_date: startDate,
        end_date: endDate,
        primary_instructor: uuid,
      })
      .select()
      .single();

    if (error) {
    throw new Error(`Failed to create course: ${error.message}`);
    }
    return data;
}