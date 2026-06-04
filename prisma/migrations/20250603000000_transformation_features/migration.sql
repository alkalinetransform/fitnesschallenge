-- CreateEnum
CREATE TYPE "GymEndPhase" AS ENUM ('NONE', 'AWAITING_METRICS', 'RESULTS_RELEASED');

-- AlterTable User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "welcomeSeenAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profileSetupComplete" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stepsPerDay" INTEGER;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "waterOzPerDay" INTEGER;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "startSkeletalMuscleMass" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "startWeightLbs" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "startBodyFatPercent" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "endSkeletalMuscleMass" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "endWeightLbs" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "endBodyFatPercent" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "endBoneMass" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "endMuscleMass" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "endMetricsSentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resultsWrapSeenAt" TIMESTAMP(3);

-- AlterTable Gym
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "competitionName" TEXT NOT NULL DEFAULT 'Transformation Challenge';
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "endPhase" "GymEndPhase" NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE IF NOT EXISTS "BroadcastMessage" (
    "id" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sendToEmail" BOOLEAN NOT NULL DEFAULT false,
    "sendToInApp" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BroadcastMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MessageDismissal" (
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "dismissedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageDismissal_pkey" PRIMARY KEY ("userId","messageId")
);

CREATE TABLE IF NOT EXISTS "CompetitionArchive" (
    "id" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "snapshotJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompetitionArchive_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PlayerEndMetricsDraft" (
    "userId" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "skeletalMuscleMass" DOUBLE PRECISION,
    "weightLbs" DOUBLE PRECISION,
    "bodyFatPercent" DOUBLE PRECISION,
    "boneMass" DOUBLE PRECISION,
    "muscleMass" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlayerEndMetricsDraft_pkey" PRIMARY KEY ("userId","gymId")
);

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "BroadcastMessage" ADD CONSTRAINT "BroadcastMessage_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "MessageDismissal" ADD CONSTRAINT "MessageDismissal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "MessageDismissal" ADD CONSTRAINT "MessageDismissal_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "BroadcastMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "CompetitionArchive" ADD CONSTRAINT "CompetitionArchive_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "PlayerEndMetricsDraft" ADD CONSTRAINT "PlayerEndMetricsDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "PlayerEndMetricsDraft" ADD CONSTRAINT "PlayerEndMetricsDraft_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
