"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApprovedAdminGym, requirePlayerGym } from "@/lib/session";

const broadcastSchema = z.object({
  body: z.string().min(1, "Message is required").max(5000),
  sendToEmail: z.boolean(),
  sendToInApp: z.boolean(),
});

export async function sendBroadcastMessage(formData: FormData) {
  const { gym } = await requireApprovedAdminGym();
  const sendToEmail = formData.get("sendToEmail") === "on";
  const sendToInApp = formData.get("sendToInApp") === "on";

  const parsed = broadcastSchema.safeParse({
    body: formData.get("body"),
    sendToEmail,
    sendToInApp,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  if (!sendToEmail && !sendToInApp) {
    return { error: "Select at least one delivery method" };
  }

  await prisma.broadcastMessage.create({
    data: {
      gymId: gym.id,
      body: parsed.data.body,
      sendToEmail,
      sendToInApp,
    },
  });

  if (sendToEmail) {
    const players = await prisma.user.findMany({
      where: { gymId: gym.id, role: "PLAYER", isFrozen: false },
      select: { email: true },
    });
    const base = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    console.log("\n--- Broadcast email (dev log) ---");
    for (const p of players) {
      console.log(`To: ${p.email} | ${parsed.data.body.slice(0, 80)}… | ${base}/dashboard`);
    }
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function dismissMessage(messageId: string) {
  const { session } = await requirePlayerGym();
  const msg = await prisma.broadcastMessage.findFirst({
    where: { id: messageId, gymId: session.user.gymId! },
  });
  if (!msg) return { error: "Message not found" };

  await prisma.messageDismissal.upsert({
    where: {
      userId_messageId: { userId: session.user.id, messageId },
    },
    create: { userId: session.user.id, messageId },
    update: { dismissedAt: new Date() },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
