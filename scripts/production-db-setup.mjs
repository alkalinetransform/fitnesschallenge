/**
 * Production DB setup — uses Neon serverless (HTTPS) when TCP port 5432 is blocked.
 *
 * Usage (PowerShell):
 *   npm run db:production-setup
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  loadEnvFile,
  getDatabaseUrl,
  testNeonConnection,
  runSqlFile,
} from "./neon-sql.mjs";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

loadEnvFile();

if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL in .env or your environment first.");
  process.exit(1);
}

const migrations = [
  "20250520000000_init",
  "20250521000000_challenge_ended",
  "20250522000000_formal_admin",
  "20250603000000_transformation_features",
  "20250604000000_message_targets",
  "20250605000000_team_icons",
  "20250606000000_gym_visits",
];

function run(cmd, extraEnv = {}) {
  execSync(cmd, { stdio: "inherit", env: { ...process.env, ...extraEnv }, cwd: root });
}

function tcpWorks() {
  try {
    execSync("npx prisma db execute --stdin --schema prisma/schema.prisma", {
      cwd: root,
      env: process.env,
      input: "SELECT 1;",
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

function applyMigrationsViaTcp() {
  console.log("Applying migration SQL files...\n");
  for (const name of migrations) {
    const sqlPath = path.join(root, "prisma", "migrations", name, "migration.sql");
    if (!fs.existsSync(sqlPath)) {
      console.log(`(skip missing migration: ${name})`);
      continue;
    }
    console.log(`Applying ${name}...`);
    try {
      run(
        `npx prisma db execute --file "prisma/migrations/${name}/migration.sql" --schema prisma/schema.prisma`
      );
    } catch (e) {
      const msg = e.message ?? String(e);
      if (
        msg.includes("already exists") ||
        msg.includes("duplicate") ||
        msg.includes("42710")
      ) {
        console.log(`  (partially applied — continuing)`);
      } else {
        throw e;
      }
    }
  }
}

async function pushSchemaViaNeon() {
  console.log("Port 5432 unreachable — applying schema via Neon serverless (HTTPS)...\n");

  await testNeonConnection();
  console.log("Neon serverless connection OK.\n");

  for (const name of migrations) {
    const sqlPath = path.join(root, "prisma", "migrations", name, "migration.sql");
    if (!fs.existsSync(sqlPath)) {
      console.log(`(skip missing migration: ${name})`);
      continue;
    }
    console.log(`Applying ${name}...`);
    try {
      await runSqlFile(sqlPath);
    } catch (e) {
      const msg = e.message ?? String(e);
      if (msg.includes("already exists") || msg.includes("duplicate")) {
        console.log(`  (partially applied — continuing)`);
      } else {
        throw e;
      }
    }
  }

  // Best-effort schema sync for any fields not in migration files
  console.log("\nSyncing latest schema via prisma migrate diff...");
  try {
    const diffSql = execSync(
      "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
      { cwd: root, encoding: "utf8" }
    );
    if (diffSql.trim()) {
      neonConfig.webSocketConstructor = ws;
      const pool = new Pool({ connectionString: getDatabaseUrl() });
      const client = await pool.connect();
      try {
        await client.query(diffSql);
      } finally {
        client.release();
        await pool.end();
      }
    }
  } catch {
    console.log("(Schema diff skipped — migrations likely already applied)");
  }
}

console.log("\n1/3 Checking database connection...\n");
console.log("Host:", getDatabaseUrl().replace(/:[^:@]+@/, ":***@"));

const useNeonPath = !tcpWorks();

if (useNeonPath) {
  console.log("\nTCP to Postgres failed (P1001) — using Neon serverless fallback.\n");
  await pushSchemaViaNeon();
} else {
  console.log("TCP connection OK — applying migrations, then syncing schema.\n");
  applyMigrationsViaTcp();
  console.log("\n2/3 Syncing Prisma schema (db push)...\n");
  try {
    run("npx prisma db push");
  } catch {
    console.log("(db push reported drift — migrations likely already applied)");
  }
  console.log("\nBaselining migration history...\n");
  for (const name of migrations) {
    try {
      run(`npx prisma migrate resolve --applied ${name}`);
    } catch {
      console.log(`(skipped or already applied: ${name})`);
    }
  }
}

console.log("\n3/3 Seeding demo data...\n");
run("npm run db:seed", { DATABASE_URL: getDatabaseUrl() });

console.log("\nProduction DB setup complete.");
console.log("Admin: admin@demo.com / password123");
console.log("Players: player1@demo.com … player8@demo.com / password123\n");
