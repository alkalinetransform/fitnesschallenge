/**
 * Delete all admin broadcast messages (and related dismissals/targets via cascade).
 *
 * Usage:
 *   npm run db:clear-messages
 *
 * Production (PowerShell):
 *   $env:DATABASE_URL = "your-neon-connection-string"
 *   npm run db:clear-messages
 */
import { PrismaClient } from "@prisma/client";
import { loadEnvFile } from "./neon-sql.mjs";

loadEnvFile();

if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL in .env or your environment first.");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const count = await prisma.broadcastMessage.count();
  if (count === 0) {
    console.log("No broadcast messages to delete.");
    process.exit(0);
  }

  const result = await prisma.broadcastMessage.deleteMany();
  console.log(`Deleted ${result.count} broadcast message(s).`);
  console.log("Related dismissals and targets were removed automatically.");
} finally {
  await prisma.$disconnect();
}
