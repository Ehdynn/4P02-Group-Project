import supabase from "../supabase";

export async function checkForComparison(aid) {
    if(!aid) throw new Error("`Failed to check for comparison: no aid provided");

    const {data, error} = await supabase
      .from("Comparisons")
      .select("status")
      .eq("aid", aid);
    
    if(error) throw new Error(`Failed to check for comparison: ${error.message}`);

    if (!Array.isArray(data) || data.length === 0) return false;

    return data.length > 0;
}
