"use server";

import { revalidatePath } from "next/cache";
import { requirePlayerGym } from "@/lib/session";
import { processGymCheckIn } from "@/lib/check-in-core";

/** Manual check-in from client (e.g. retry button). QR scans use GET /check-in/[token] route. */
export async function recordGymCheckIn(token: string) {
  const { session, gym } = await requirePlayerGym();
  const result = await processGymCheckIn(session.user.id, gym.id, token);

  if (result.success || result.pointsAwarded) {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/me");
    revalidatePath("/leaderboard");
  }

  return result;
}
