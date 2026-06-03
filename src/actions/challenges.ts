"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApprovedAdminGym } from "@/lib/session";
import { challengeExpiresAt } from "@/lib/gym-maintenance";

const challengeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  points: z.coerce.number().int().min(1, "Points must be at least 1"),
  durationWeeks: z.coerce.number().int().min(1).max(52),
  startDate: z.coerce.date().optional(),
});

export async function createChallenge(formData: FormData) {
  const { gym } = await requireApprovedAdminGym();
  if (gym.challengeEnded) return { error: "Competition has ended. Scores are locked." };

  const startRaw = formData.get("startDate") as string;
  const parsed = challengeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    points: formData.get("points"),
    durationWeeks: formData.get("durationWeeks"),
    startDate: startRaw ? new Date(startRaw) : new Date(),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  const startDate = parsed.data.startDate ?? new Date();
  const expiresAt = challengeExpiresAt(startDate, parsed.data.durationWeeks);

  await prisma.challenge.create({
    data: {
      gymId: gym.id,
      weekNumber: gym.activeWeek,
      name: parsed.data.name,
      description: parsed.data.description,
      points: parsed.data.points,
      durationWeeks: parsed.data.durationWeeks,
      startDate,
      expiresAt,
    },
  });

  revalidatePath("/admin/challenges");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateChallenge(formData: FormData) {
  const { gym } = await requireApprovedAdminGym();
  if (gym.challengeEnded) return { error: "Competition has ended. Scores are locked." };

  const id = formData.get("id") as string;
  const parsed = challengeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    points: formData.get("points"),
    durationWeeks: formData.get("durationWeeks"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  const challenge = await prisma.challenge.findFirst({
    where: { id, gymId: gym.id },
  });
  if (!challenge) return { error: "Challenge not found" };

  const expiresAt = challengeExpiresAt(challenge.startDate, parsed.data.durationWeeks);

  await prisma.challenge.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      points: parsed.data.points,
      durationWeeks: parsed.data.durationWeeks,
      expiresAt,
    },
  });

  revalidatePath("/admin/challenges");
  return { success: true };
}

export async function deleteChallenge(formData: FormData) {
  const { gym } = await requireApprovedAdminGym();
  if (gym.challengeEnded) return { error: "Competition has ended. Scores are locked." };

  const id = formData.get("id") as string;
  const challenge = await prisma.challenge.findFirst({
    where: { id, gymId: gym.id },
  });
  if (!challenge) return { error: "Challenge not found" };

  await prisma.challenge.delete({ where: { id } });
  revalidatePath("/admin/challenges");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteChallengeForm(formData: FormData): Promise<void> {
  await deleteChallenge(formData);
}
