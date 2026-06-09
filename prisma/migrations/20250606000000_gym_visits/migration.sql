ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "checkInSecret" TEXT NOT NULL DEFAULT gen_random_uuid()::text;

UPDATE "Gym" SET "checkInSecret" = gen_random_uuid()::text WHERE "checkInSecret" IS NULL OR "checkInSecret" = '';

CREATE UNIQUE INDEX IF NOT EXISTS "Gym_checkInSecret_key" ON "Gym"("checkInSecret");

CREATE TABLE IF NOT EXISTS "GymVisit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "visitDate" DATE NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GymVisit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "GymVisit_userId_visitDate_key" ON "GymVisit"("userId", "visitDate");
CREATE INDEX IF NOT EXISTS "GymVisit_userId_gymId_weekNumber_idx" ON "GymVisit"("userId", "gymId", "weekNumber");

DO $$ BEGIN
  ALTER TABLE "GymVisit" ADD CONSTRAINT "GymVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "GymVisit" ADD CONSTRAINT "GymVisit_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
