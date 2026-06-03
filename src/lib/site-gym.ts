import { prisma } from "@/lib/db";

/** Single-gym deployment: one approved gym for the whole app. */
export async function getSiteGym() {
  const slug = process.env.SITE_GYM_SLUG?.trim();
  if (slug) {
    return prisma.gym.findFirst({
      where: { slug, status: "APPROVED" },
    });
  }
  return prisma.gym.findFirst({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "asc" },
  });
}

export function hasActiveCompetition(gym: {
  challengeEnded: boolean;
}): boolean {
  return !gym.challengeEnded;
}
