"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireApprovedAdminGym, requirePlayerGym } from "@/lib/session";
import { habitLabelsFromCompletions } from "@/lib/player-utils";

function parseMetrics(formData: FormData) {
  const num = (key: string) => {
    const v = formData.get(key);
    if (v === null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  return {
    skeletalMuscleMass: num("skeletalMuscleMass"),
    weightLbs: num("weightLbs"),
    bodyFatPercent: num("bodyFatPercent"),
  };
}

export async function submitPlayerEndMetrics(formData: FormData) {
  const { session, gym } = await requirePlayerGym();

  if (!gym.challengeEnded || gym.endPhase !== "AWAITING_METRICS") {
    return { error: "End metrics are not open right now." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { endMetricsSentAt: true },
  });
  if (user?.endMetricsSentAt) {
    return { error: "You already submitted your final metrics." };
  }

  const metrics = parseMetrics(formData);
  if (
    metrics.skeletalMuscleMass == null &&
    metrics.weightLbs == null &&
    metrics.bodyFatPercent == null
  ) {
    return { error: "Enter at least skeletal muscle mass, weight, or body fat %" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      endSkeletalMuscleMass: metrics.skeletalMuscleMass,
      endWeightLbs: metrics.weightLbs,
      endBodyFatPercent: metrics.bodyFatPercent,
      endMetricsSentAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/me");
  revalidatePath("/admin");
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
    },
    habits: habitLabelsFromCompletions(p.completions),
  }));
}

/** Admin archives competition after all players submit their own end metrics. */
export async function archiveCompetitionResults() {
  const { gym } = await requireApprovedAdminGym();

  if (gym.endPhase !== "AWAITING_METRICS") {
    return { error: "Competition is not awaiting final metrics." };
  }

  const players = await prisma.user.findMany({
    where: { gymId: gym.id, role: "PLAYER" },
    select: {
      id: true,
      endMetricsSentAt: true,
      endSkeletalMuscleMass: true,
      endWeightLbs: true,
      endBodyFatPercent: true,
    },
  });

  if (players.length === 0) {
    return { error: "No players to archive." };
  }

  for (const p of players) {
    if (!p.endMetricsSentAt) {
      return { error: "Wait until every player submits their final metrics on the Me tab." };
    }
    if (
      p.endSkeletalMuscleMass == null &&
      p.endWeightLbs == null &&
      p.endBodyFatPercent == null
    ) {
      return { error: "A player submitted without any metrics — ask them to update on Me tab." };
    }
  }

  await prisma.$transaction(async (tx) => {
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

/** @deprecated admin draft flow removed */
export async function saveEndMetricsDraft() {
  return { error: "Players enter their own final metrics now." };
}

/** @deprecated */
export async function sendPlayerEndMetrics() {
  return { error: "Players enter their own final metrics now." };
}

/** @deprecated */
export async function sendAllPlayerData() {
  return { error: "Players enter their own final metrics now." };
}

/** @deprecated use archiveCompetitionResults */
export async function sendAllEndMetrics() {
  return archiveCompetitionResults();
}
