import { sha256 } from "https://denopkg.com/chiefbiiko/sha256@v1.0.0/mod.ts";

export function getSha256Hex(content: string) {
   return sha256(content, 'utf8', 'hex') 
}