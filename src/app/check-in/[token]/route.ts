import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  checkInResultToSearchParams,
  processGymCheckIn,
} from "@/lib/check-in-core";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const base = new URL(request.url).origin;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(`/check-in/${token}`)}`, base)
    );
  }

  if (session.user.role !== "PLAYER") {
    return NextResponse.redirect(new URL("/admin", base));
  }

  if (!session.user.gymId) {
    const params = new URLSearchParams({ error: "You are not registered with a gym." });
    return NextResponse.redirect(new URL(`/check-in/result?${params}`, base));
  }

  const result = await processGymCheckIn(session.user.id, session.user.gymId, token);

  if (result.success || result.pointsAwarded) {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/me");
    revalidatePath("/leaderboard");
  }

  const qs = checkInResultToSearchParams(result);
  return NextResponse.redirect(new URL(`/check-in/result?${qs}`, base));
}
