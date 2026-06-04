import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getTeamScoresTotal } from "@/lib/scores";
import { maintainGym } from "@/lib/gym-maintenance";
import { getSiteGym } from "@/lib/site-gym";
import { AllTeamsLeaderboard, TeamPodium, TeamRosterGrid } from "@/components/leaderboard-podium";
import { CompetitionStatusBanner } from "@/components/competition-status-banner";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let gymId: string;

  if (session.user.role === "ADMIN") {
    const owned = await prisma.gym.findUnique({
      where: { adminId: session.user.id },
    });
    const gym = owned ?? (await getSiteGym());
    if (!gym) redirect("/login");
    gymId = gym.id;
  } else {
    if (!session.user.gymId) redirect("/register");
    gymId = session.user.gymId;
  }

  await maintainGym(gymId);
  const gym = await prisma.gym.findUniqueOrThrow({ where: { id: gymId } });
  const teams = await getTeamScoresTotal(gymId);

  const subtitle = gym.challengeEnded
    ? "Final competition standings"
    : "All-time points (current competition)";
  const podiumSubtitle = gym.challengeEnded
    ? "Final totals — competition locked"
    : "Total points across all challenges in this competition";

  return (
    <main className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-400">Squeeze the day</p>
          <h1 className="font-display text-2xl font-bold text-white">Leaderboard</h1>
          <p className="text-sm text-slate-400">{gym.name} · {subtitle}</p>
        </div>

        {gym.challengeEnded && (
          <CompetitionStatusBanner
            ended
            endedAt={gym.endedAt}
            winningTeam={teams[0] ?? null}
            topPlayer={teams[0]?.players[0] ?? null}
          />
        )}

        {session.user.role === "ADMIN" ? (
          <AllTeamsLeaderboard teams={teams} podiumSubtitle={podiumSubtitle} />
        ) : (
          <div className="space-y-6">
            <TeamPodium teams={teams} subtitle={podiumSubtitle} />
            <TeamRosterGrid teams={teams} />
          </div>
        )}
      </main>
  );
}
