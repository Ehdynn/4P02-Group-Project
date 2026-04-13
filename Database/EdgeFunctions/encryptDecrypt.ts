// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import CryptoJS from "npm:crypto-js";

// CORS headers to allow requests from any origin
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Expected request payload structure
interface ReqPayload {
  value: string;
  key: string;
  encrypt: boolean;
}
// Derive a consistent key from the provided string
function deriveKey(key: string) {
  return CryptoJS.SHA256(key);
}
// Main request handler for the edge function
Deno.serve(async (req: Request) => {

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST requests for encryption/decryption
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Parse and validate the request body
    const { value, key, encrypt } = (await req.json()) as Partial<ReqPayload>;
    
    // Ensure all required fields are present and of the correct type
    if (typeof value !== "string" || typeof key !== "string" || typeof encrypt !== "boolean") {
      return new Response(JSON.stringify({ error: "Invalid request body." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: string;

    // Perform encryption
    if (encrypt) {
      const secretKey = deriveKey(key);
      const iv = CryptoJS.lib.WordArray.random(128 / 8);
      const encrypted = CryptoJS.AES.encrypt(value, secretKey, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      result = `${iv.toString(CryptoJS.enc.Base64)}:${encrypted.toString()}`;
    } else { // Perform decryption
      const [ivBase64, ciphertext] = value.split(":");

      // Ensure the encrypted payload is in the correct format
      if (!ivBase64 || !ciphertext) {
        return new Response(JSON.stringify({ error: "Invalid encrypted payload format." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const iv = CryptoJS.enc.Base64.parse(ivBase64);
      const secretKey = deriveKey(key);
      const decrypted = CryptoJS.AES.decrypt(ciphertext, secretKey, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      result = decrypted.toString(CryptoJS.enc.Utf8);

      // If decryption fails, the result will be an empty string, return an error if this happens
      if (!result && ciphertext) {
        return new Response(JSON.stringify({ error: "Decryption failed. Check the key and ciphertext." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Return the result of encryption/decryption
    return new Response(JSON.stringify({ message: result }), {
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
