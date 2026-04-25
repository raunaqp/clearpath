import { randomInt } from "crypto";
import { getServiceClient } from "@/lib/supabase";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const TOKEN_LEN = 6;
const MAX_ATTEMPTS = 5;

function randomToken(): string {
  let out = "";
  for (let i = 0; i < TOKEN_LEN; i++) {
    out += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return out;
}

/**
 * Generate a unique 6-character base36 share token for the assessments table.
 * Retries up to 5 times if it collides with an existing token.
 * Throws after 5 collisions (≈1 in 36^6 → essentially impossible).
 */
export async function generateShareToken(): Promise<string> {
  const supabase = getServiceClient();
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const token = randomToken();
    const { data, error } = await supabase
      .from("assessments")
      .select("id")
      .eq("share_token", token)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(
        `share-token: supabase lookup failed: ${error.message ?? String(error)}`
      );
    }
    if (!data) {
      return token;
    }
  }
  throw new Error(
    `share-token: failed to generate a unique token after ${MAX_ATTEMPTS} attempts`
  );
}
