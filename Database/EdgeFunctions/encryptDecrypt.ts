// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import CryptoJS from "npm:crypto-js";

interface ReqPayload {
  value: string;
  key: string;
  encrypt: boolean;
}

function deriveKey(key: string) {
  return CryptoJS.SHA256(key);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

console.info("server started");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { value, key, encrypt } = (await req.json()) as Partial<ReqPayload>;

    if (typeof value !== "string" || typeof key !== "string" || typeof encrypt !== "boolean") {
      return new Response(JSON.stringify({ error: "Invalid request body." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: string;

    if (encrypt) {
      const secretKey = deriveKey(key);
      const iv = CryptoJS.lib.WordArray.random(128 / 8);
      const encrypted = CryptoJS.AES.encrypt(value, secretKey, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      result = `${iv.toString(CryptoJS.enc.Base64)}:${encrypted.toString()}`;
    } else {
      const [ivBase64, ciphertext] = value.split(":");
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

      if (!result && ciphertext) {
        return new Response(JSON.stringify({ error: "Decryption failed. Check the key and ciphertext." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ message: result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
