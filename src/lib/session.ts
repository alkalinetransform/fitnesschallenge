import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";
import { maintainGym } from "@/lib/gym-maintenance";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRole(role: Role) {
  const session = await requireSession();
  if (session.user.role !== role) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/dashboard");
  }
  return session;
}

export async function getAdminGym(userId: string) {
  return prisma.gym.findUnique({ where: { adminId: userId } });
}

export async function requireApprovedAdminGym() {
  const session = await requireRole("ADMIN");
  const gym = await getAdminGym(session.user.id);

  if (!session.user.emailVerified) {
    redirect("/admin/pending?reason=email");
  }

  if (!gym) {
    redirect("/login");
  }

  if (gym.status !== "APPROVED") {
    redirect("/admin/pending?reason=approval");
  }

  const maintained = await maintainGym(gym.id);
  return { session, gym: maintained ?? gym };
}

/** @deprecated use requireApprovedAdminGym */
export async function requireAdminGym() {
  return requireApprovedAdminGym();
}

export async function requirePlayerGym() {
  const session = await requireRole("PLAYER");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { isFrozen: true, gymId: true },
  });

  if (user.isFrozen) redirect("/frozen");

  if (!user.gymId) redirect("/register");

  const gym = await prisma.gym.findUniqueOrThrow({
    where: { id: user.gymId },
  });

  await maintainGym(gym.id);
  const refreshed = await prisma.gym.findUniqueOrThrow({
    where: { id: user.gymId },
  });

  return { session, gym: refreshed };
}
