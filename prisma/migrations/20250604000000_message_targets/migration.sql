-- AlterTable
ALTER TABLE "BroadcastMessage" ADD COLUMN IF NOT EXISTS "isBroadcastAll" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE IF NOT EXISTS "BroadcastMessageTarget" (
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "BroadcastMessageTarget_pkey" PRIMARY KEY ("messageId","userId")
);

DO $$ BEGIN
 ALTER TABLE "BroadcastMessageTarget" ADD CONSTRAINT "BroadcastMessageTarget_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "BroadcastMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "BroadcastMessageTarget" ADD CONSTRAINT "BroadcastMessageTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
