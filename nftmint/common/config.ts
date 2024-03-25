import "$std/dotenv/load.ts";

export const SIGNER_PRIVATE_KEY = Deno.env.get("SIGNER_PRIVATE_KEY")
export const DATABASE_URI = Deno.env.get("DATABASE_URI")
export const GLACIER_SCAN_ENDPOINT = Deno.env.get("GLACIER_SCAN_ENDPOINT")