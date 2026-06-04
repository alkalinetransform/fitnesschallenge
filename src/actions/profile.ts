"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePlayerGym } from "@/lib/session";

const profileSchema = z.object({
  stepsPerDay: z.coerce.number().int().min(0).max(50000),
  waterOzPerDay: z.coerce.number().int().min(0).max(200),
  startSkeletalMuscleMass: z.coerce.number().min(0).max(500),
  startWeightLbs: z.coerce.number().min(50).max(600),
  startBodyFatPercent: z.coerce.number().min(0).max(80),
});

export async function markWelcomeSeen() {
  const { session } = await requirePlayerGym();
  await prisma.user.update({
    where: { id: session.user.id },
    data: { welcomeSeenAt: new Date() },
  });
}

export async function saveProfileSetup(formData: FormData) {
  const { session } = await requirePlayerGym();
  const parsed = profileSchema.safeParse({
    stepsPerDay: formData.get("stepsPerDay"),
    waterOzPerDay: formData.get("waterOzPerDay"),
    startSkeletalMuscleMass: formData.get("startSkeletalMuscleMass"),
    startWeightLbs: formData.get("startWeightLbs"),
    startBodyFatPercent: formData.get("startBodyFatPercent"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...parsed.data,
      profileSetupComplete: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/me");
  return { success: true };
}

export async function markResultsWrapSeen() {
  const { session } = await requirePlayerGym();
  await prisma.user.update({
    where: { id: session.user.id },
    data: { resultsWrapSeenAt: new Date() },
  });
  revalidatePath("/dashboard/me");
  return { success: true };
}
