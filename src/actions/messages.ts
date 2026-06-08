"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApprovedAdminGym, requirePlayerGym } from "@/lib/session";
import { sendBroadcastEmail } from "@/lib/email";

const broadcastSchema = z.object({
  body: z.string().min(1, "Message is required").max(5000),
  sendToEmail: z.boolean(),
  sendToInApp: z.boolean(),
});

export async function sendBroadcastMessage(formData: FormData) {
  const { gym } = await requireApprovedAdminGym();
  const sendToEmail = formData.get("sendToEmail") === "on";
  const sendToInApp = formData.get("sendToInApp") === "on";
  const recipientIds = formData.getAll("recipientIds") as string[];

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

  const isBroadcastAll = recipientIds.length === 0;

  if (!isBroadcastAll) {
    const validPlayers = await prisma.user.findMany({
      where: { gymId: gym.id, role: "PLAYER", id: { in: recipientIds } },
      select: { id: true },
    });
    if (validPlayers.length === 0) {
      return { error: "Select at least one valid player" };
    }
  }

  const message = await prisma.broadcastMessage.create({
    data: {
      gymId: gym.id,
      body: parsed.data.body,
      sendToEmail,
      sendToInApp,
      isBroadcastAll,
      ...(isBroadcastAll
        ? {}
        : {
            targets: {
              create: recipientIds.map((userId) => ({ userId })),
            },
          }),
    },
  });

  if (sendToEmail) {
    const players = await prisma.user.findMany({
      where: {
        gymId: gym.id,
        role: "PLAYER",
        isFrozen: false,
        ...(isBroadcastAll ? {} : { id: { in: recipientIds } }),
      },
      select: { email: true, name: true },
    });
    const subject = `${gym.competitionName} — message from your gym`;
    for (const p of players) {
      await sendBroadcastEmail({
        to: p.email,
        subject,
        body: parsed.data.body,
      });
    }
  }

  revalidatePath("/admin");
  return { success: true, messageId: message.id };
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
