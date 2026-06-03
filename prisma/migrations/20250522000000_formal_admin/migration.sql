-- Safe migration for existing dev data
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifyToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifyExpires" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isFrozen" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS "User_emailVerifyToken_key" ON "User"("emailVerifyToken");

DO $$ BEGIN
  CREATE TYPE "GymStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "InviteCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 10,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InviteCode_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "InviteCode_code_key" ON "InviteCode"("code");

ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "status" "GymStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "seasonStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Gym" SET "slug" = LOWER(REGEXP_REPLACE("name", '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING("id", 1, 6) WHERE "slug" IS NULL;
UPDATE "Gym" SET "location" = 'Unknown location' WHERE "location" IS NULL;
UPDATE "Gym" SET "status" = 'APPROVED' WHERE "status" IS NULL OR "status" = 'PENDING';

ALTER TABLE "Gym" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "Gym" ALTER COLUMN "location" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Gym_slug_key" ON "Gym"("slug");

ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "durationWeeks" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);
UPDATE "Challenge" SET "expiresAt" = "createdAt" + INTERVAL '7 days' WHERE "expiresAt" IS NULL;
ALTER TABLE "Challenge" ALTER COLUMN "expiresAt" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "Challenge_gymId_expiresAt_idx" ON "Challenge"("gymId", "expiresAt");

UPDATE "User" SET "emailVerified" = true WHERE "role" = 'ADMIN';

INSERT INTO "InviteCode" ("id", "code", "maxUses", "usedCount", "active", "createdAt")
SELECT 'seed-invite', 'SQUEEZE-DEMO', 100, 0, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "InviteCode" WHERE "code" = 'SQUEEZE-DEMO');
