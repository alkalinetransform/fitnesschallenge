"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireApprovedAdminGym } from "@/lib/session";
import { habitLabelsFromCompletions } from "@/lib/player-utils";

export async function saveEndMetricsDraft(formData: FormData) {
  const { gym } = await requireApprovedAdminGym();
  const userId = formData.get("userId") as string;

  const player = await prisma.user.findFirst({
    where: { id: userId, gymId: gym.id, role: "PLAYER" },
  });
  if (!player) return { error: "Player not found" };

  const num = (key: string) => {
    const v = formData.get(key);
    if (v === null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  await prisma.playerEndMetricsDraft.upsert({
    where: { userId_gymId: { userId, gymId: gym.id } },
    create: {
      userId,
      gymId: gym.id,
      skeletalMuscleMass: num("skeletalMuscleMass"),
      weightLbs: num("weightLbs"),
      bodyFatPercent: num("bodyFatPercent"),
      boneMass: num("boneMass"),
      muscleMass: num("muscleMass"),
    },
    update: {
      skeletalMuscleMass: num("skeletalMuscleMass"),
      weightLbs: num("weightLbs"),
      bodyFatPercent: num("bodyFatPercent"),
      boneMass: num("boneMass"),
      muscleMass: num("muscleMass"),
    },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function sendPlayerEndMetrics(userId: string) {
  const { gym } = await requireApprovedAdminGym();
  const draft = await prisma.playerEndMetricsDraft.findUnique({
    where: { userId_gymId: { userId, gymId: gym.id } },
  });
  if (!draft?.skeletalMuscleMass && !draft?.weightLbs && !draft?.bodyFatPercent) {
    return { error: "Enter at least skeletal muscle mass, weight, or body fat %" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      endSkeletalMuscleMass: draft.skeletalMuscleMass,
      endWeightLbs: draft.weightLbs,
      endBodyFatPercent: draft.bodyFatPercent,
      endBoneMass: draft.boneMass,
      endMuscleMass: draft.muscleMass,
      endMetricsSentAt: new Date(),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/me");
  return { success: true };
}

async function buildArchiveSnapshot(gymId: string) {
  const players = await prisma.user.findMany({
    where: { gymId, role: "PLAYER" },
    include: {
      completions: { include: { challenge: { select: { name: true } } } },
    },
  });
  return players.map((p) => ({
    userId: p.id,
    name: p.name,
    start: {
      skeletalMuscleMass: p.startSkeletalMuscleMass,
      weightLbs: p.startWeightLbs,
      bodyFatPercent: p.startBodyFatPercent,
      stepsPerDay: p.stepsPerDay,
      waterOzPerDay: p.waterOzPerDay,
    },
    end: {
      skeletalMuscleMass: p.endSkeletalMuscleMass,
      weightLbs: p.endWeightLbs,
      bodyFatPercent: p.endBodyFatPercent,
      boneMass: p.endBoneMass,
      muscleMass: p.endMuscleMass,
    },
    habits: habitLabelsFromCompletions(p.completions),
  }));
}

export async function sendAllEndMetrics() {
  const { gym } = await requireApprovedAdminGym();

  const players = await prisma.user.findMany({
    where: { gymId: gym.id, role: "PLAYER" },
    select: { id: true },
  });

  const drafts = await prisma.playerEndMetricsDraft.findMany({
    where: { gymId: gym.id },
  });
  const draftMap = new Map(drafts.map((d) => [d.userId, d]));

  for (const p of players) {
    const draft = draftMap.get(p.id);
    if (!draft) return { error: "Complete metrics for every player before sending all" };
    if (
      draft.skeletalMuscleMass == null &&
      draft.weightLbs == null &&
      draft.bodyFatPercent == null
    ) {
      return { error: "Each player needs skeletal muscle, weight, or body fat %" };
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const p of players) {
      const draft = draftMap.get(p.id)!;
      await tx.user.update({
        where: { id: p.id },
        data: {
          endSkeletalMuscleMass: draft.skeletalMuscleMass,
          endWeightLbs: draft.weightLbs,
          endBodyFatPercent: draft.bodyFatPercent,
          endBoneMass: draft.boneMass,
          endMuscleMass: draft.muscleMass,
          endMetricsSentAt: new Date(),
        },
      });
    }

    const snapshot = await buildArchiveSnapshot(gym.id);
    await tx.competitionArchive.create({
      data: {
        gymId: gym.id,
        name: gym.competitionName,
        endedAt: gym.endedAt ?? new Date(),
        snapshotJson: JSON.stringify(snapshot),
      },
    });

    await tx.gym.update({
      where: { id: gym.id },
      data: { endPhase: "RESULTS_RELEASED" },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/me");
  return { success: true };
}
