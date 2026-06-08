import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envText = fs.readFileSync(path.join(root, ".env"), "utf8");
const match = envText.match(/DATABASE_URL=(?:"|')?([^"'\r\n]+)/);
if (!match) {
  console.error("No DATABASE_URL");
  process.exit(1);
}
const url = match[1].trim();
console.log("Testing @neondatabase/serverless (HTTPS/WebSocket)...");
try {
  const sql = neon(url);
  const result = await sql`SELECT 1 AS ok`;
  console.log("Success:", result);
} catch (e) {
  console.error("Failed:", e.message);
  process.exit(1);
}
