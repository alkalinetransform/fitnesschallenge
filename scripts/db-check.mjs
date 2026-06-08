/**
 * Diagnose Neon / Postgres connectivity (P1001).
 * Usage: npm run db:check
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";
import { loadEnvFile } from "./neon-sql.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function maskUrl(url) {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.username ? "***@" : ""}${u.host}${u.pathname}${u.search}`;
  } catch {
    return "(invalid URL)";
  }
}

function toDirectUrl(pooledUrl) {
  if (!pooledUrl.includes("-pooler")) return pooledUrl;
  return pooledUrl.replace("-pooler", "");
}

function testPrismaTcp(label, url) {
  console.log(`\n--- TCP test: ${label} ---`);
  console.log(maskUrl(url));
  try {
    execSync("npx prisma db execute --stdin --schema prisma/schema.prisma", {
      cwd: root,
      env: { ...process.env, DATABASE_URL: url },
      input: "SELECT 1;",
      stdio: "pipe",
    });
    console.log(`✓ ${label} TCP OK`);
    return true;
  } catch (e) {
    const err = e.stderr?.toString() || e.message || String(e);
    if (err.includes("P1001")) {
      console.log(`✗ ${label} TCP failed: P1001 — port 5432 blocked or server unreachable`);
    } else {
      console.log(`✗ ${label} TCP failed:`, err.slice(0, 300));
    }
    return false;
  }
}

async function testNeonServerless(url) {
  console.log("\n--- Neon serverless (HTTPS/WebSocket) ---");
  console.log(maskUrl(url));
  try {
    const sql = neon(url);
    const result = await sql`SELECT 1 AS ok`;
    console.log("✓ Neon serverless OK", result);
    return true;
  } catch (e) {
    console.log("✗ Neon serverless failed:", e.message);
    return false;
  }
}

loadEnvFile();

const pooled = process.env.DATABASE_URL;
const direct = process.env.DIRECT_URL || (pooled ? toDirectUrl(pooled) : null);

console.log("FitChallenge database connectivity check\n");

if (!pooled) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

const tcpPooled = testPrismaTcp("pooled", pooled);
const tcpDirect =
  direct && direct !== pooled ? testPrismaTcp("direct", direct) : tcpPooled;
const serverlessOk = await testNeonServerless(pooled);

console.log("\n--- Summary ---");
if (serverlessOk) {
  console.log("✓ Your app CAN connect via Neon serverless (npm run dev / Vercel).");
  console.log("  Run: npm run db:production-setup  (auto-uses serverless when TCP fails)");
}
if (!tcpPooled && !tcpDirect) {
  console.log("✗ Direct Postgres (port 5432) is blocked on your network.");
  console.log("  This is common on school/work Wi‑Fi. Options:");
  console.log("  • Use npm run db:production-setup (now uses serverless fallback)");
  console.log("  • Or try phone hotspot for prisma db push");
}
if (!serverlessOk) {
  console.log("✗ Neon serverless also failed — check DATABASE_URL in Neon console.");
  console.log("  Wake DB: console.neon.tech → SQL Editor → SELECT 1;");
}

process.exit(serverlessOk ? 0 : 1);
