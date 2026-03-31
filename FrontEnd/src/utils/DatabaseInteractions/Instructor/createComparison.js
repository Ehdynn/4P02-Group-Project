import supabase from "../supabase";

export async function createComparison(aid, boilerPlateFileId = null) {
    if(!aid) throw new Error("Failed to create comparison.");

    const { data, error } = await supabase.functions.invoke("createComparison", {
      body: {
        aid: Number(aid),
        boilerPlateFileId: boilerPlateFileId ?? null,
      },
    });
    
    if (error) {
      let detailedMessage = error.message ?? "Failed to create comparison.";

      if (error.context) {
        try {
          const responseBody = await error.context.json();
          if (responseBody?.error) {
            detailedMessage = responseBody.error;
          }
        } catch {
          // Keep the fallback message if response body is not JSON.
        }
      }

      throw new Error(detailedMessage);
    }
    
    return data;
}
