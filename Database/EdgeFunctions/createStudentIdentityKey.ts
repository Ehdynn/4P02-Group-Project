import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// CORS headers to allow requests from any origin and specify allowed headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// This function generates a unique identity key for a student based on their student number.
async function createHmacHex(value: string, secret: string) {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(value));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST requests to this endpoint
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Parse the request body to get the student number and validate it
    const { studentNumber } = await req.json();
    const normalizedStudentNumber = String(studentNumber ?? "").trim();

    // Get the secret key from environment variables to use for HMAC generation
    const secret = Deno.env.get("STUDENT_IDENTITY_SECRET") ?? "";

    // Handle missing student number
    if (!normalizedStudentNumber) {
      return new Response(JSON.stringify({ error: "Missing student number." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle missing secret key in environment variables
    if (!secret) {
      return new Response(JSON.stringify({ error: "Missing STUDENT_IDENTITY_SECRET." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Actually generate the unique identity key for the student
    const key = await createHmacHex(normalizedStudentNumber, secret);

    // Return the generated key in the response
    return new Response(JSON.stringify({ key }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle any unexpected errors that may occur during the process
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
