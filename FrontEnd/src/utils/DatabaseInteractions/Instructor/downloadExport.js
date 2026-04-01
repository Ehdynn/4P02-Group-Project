import supabase from "../supabase";

function getFileNameFromHeader(contentDisposition, fallbackName) {
  const match = /filename="([^"]+)"/i.exec(String(contentDisposition ?? ""));
  return match?.[1]?.trim() || fallbackName;
}

export async function downloadExport(aid) {
  if (!aid) {
    throw new Error("Missing assignment id.");
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw new Error(`Failed to get current session: ${sessionError.message}`);
  }

  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) {
    throw new Error("Missing authenticated session.");
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const response = await fetch(`${supabaseUrl}/functions/v1/exportRepository`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ assignmentId: Number(aid) }),
  });

  if (!response.ok) {
    let message = "Failed to export submissions.";

    try {
      const errorBody = await response.json();
      if (errorBody?.error) {
        message = errorBody.error;
      }
    } catch {
      // Ignore non-JSON error responses and keep fallback message.
    }

    throw new Error(message);
  }

  const blob = await response.blob();
  const downloadName = getFileNameFromHeader(
    response.headers.get("Content-Disposition"),
    `assignment-${aid}.zip`,
  );

  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = downloadName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}
