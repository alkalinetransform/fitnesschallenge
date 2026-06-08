/**
 * Shared Neon serverless SQL helpers (works when port 5432 is blocked).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { neon, Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

export function loadEnvFile() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

export function getDatabaseUrl() {
  loadEnvFile();
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}

export function createNeonSql() {
  return neon(getDatabaseUrl());
}

/** Run a migration SQL file (multi-statement) via WebSocket pool. */
export async function runSqlFile(sqlPath) {
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: getDatabaseUrl() });
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(sqlPath, "utf8");
    await client.query(sql);
  } finally {
    client.release();
    await pool.end();
  }
}

export async function testNeonConnection() {
  const sql = createNeonSql();
  const result = await sql`SELECT 1 AS ok`;
  return result;
}
