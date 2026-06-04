"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireApprovedAdminGym } from "@/lib/session";

export async function setPlayerFrozen(formData: FormData) {
  const { gym } = await requireApprovedAdminGym();
  const userId = formData.get("userId") as string;
  const frozen = formData.get("frozen") === "true";

  const player = await prisma.user.findFirst({
    where: { id: userId, gymId: gym.id, role: "PLAYER" },
  });
  if (!player) return { error: "Player not found" };

  await prisma.user.update({
    where: { id: userId },
    data: { isFrozen: frozen },
  });

  if (frozen) {
    await prisma.teamMember.deleteMany({ where: { userId } });
  }

  revalidatePath("/admin/players");
  revalidatePath("/admin/teams");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function setPlayerFrozenForm(formData: FormData): Promise<void> {
  await setPlayerFrozen(formData);
}

export async function deletePlayer(formData: FormData) {
  const { gym } = await requireApprovedAdminGym();
  const userId = formData.get("userId") as string;

  const player = await prisma.user.findFirst({
    where: { id: userId, gymId: gym.id, role: "PLAYER" },
  });
  if (!player) return { error: "Player not found" };

  await prisma.$transaction(async (tx) => {
    await tx.completion.deleteMany({ where: { userId } });
    await tx.teamMember.deleteMany({ where: { userId } });
    await tx.messageDismissal.deleteMany({ where: { userId } });
    await tx.playerEndMetricsDraft.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });

  revalidatePath("/admin/players");
  revalidatePath("/admin/teams");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deletePlayerForm(formData: FormData): Promise<void> {
  await deletePlayer(formData);
}
