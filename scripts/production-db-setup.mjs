/**
 * Use when `prisma migrate deploy` fails with P3005 (database schema is not empty).
 * Syncs schema via db push, marks migrations as applied, then seeds.
 *
 * Usage (PowerShell):
 *   $env:DATABASE_URL = "your-neon-connection-string"
 *   npm run db:production-setup
 */
import { execSync } from "child_process";

if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL first (Neon direct or pooled URL).");
  process.exit(1);
}

const migrations = [
  "20250520000000_init",
  "20250521000000_challenge_ended",
  "20250522000000_formal_admin",
  "20250603000000_transformation_features",
  "20250604000000_message_targets",
];

function run(cmd) {
  execSync(cmd, { stdio: "inherit", env: process.env });
}

console.log("\n1/3 Pushing Prisma schema (db push)...\n");
run("npx prisma db push");

console.log("\n2/3 Baselining migration history...\n");
for (const name of migrations) {
  try {
    run(`npx prisma migrate resolve --applied ${name}`);
  } catch {
    console.log(`(skipped or already applied: ${name})`);
  }
}

console.log("\n3/3 Seeding demo data...\n");
run("npm run db:seed");

console.log("\nProduction DB setup complete.");
console.log("Admin: admin@demo.com / password123");
console.log("Players: player1@demo.com … player8@demo.com / password123\n");
