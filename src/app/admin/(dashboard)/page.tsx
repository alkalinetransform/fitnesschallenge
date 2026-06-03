import Link from "next/link";
import { requireApprovedAdminGym } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { EndChallengeButton } from "@/components/end-challenge-button";
import { CompetitionStatusBanner } from "@/components/competition-status-banner";
import { getTeamScoresTotal, getPlayerScoresTotal } from "@/lib/scores";
import { hasActiveCompetition } from "@/lib/site-gym";
import { WeekControl } from "@/components/week-control";
import { NewCompetitionButton } from "@/components/new-competition-button";
import { cn } from "@/lib/utils";

function AdminActionTile({
  href,
  title,
  subtitle,
  accent = "orange",
}: {
  href: string;
  title: string;
  subtitle: string;
  accent?: "orange" | "slate";
}) {
  return (
    <Link href={href} className="group block">
      <div
        className={cn(
          "glass-card p-8 text-center transition-all duration-300 hover:-translate-y-1",
          accent === "orange"
            ? "border-brand-500/20 bg-gradient-to-br from-brand-500/20 to-brand-600/5 hover:border-brand-500/40"
            : "border-white/15 bg-gradient-to-br from-slate-800/60 to-slate-900/40 hover:border-brand-500/25"
        )}
      >
        <p className="font-display text-2xl font-bold text-white">{title}</p>
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      </div>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const { gym } = await requireApprovedAdminGym();
  const active = hasActiveCompetition(gym);

  const playerCount = await prisma.user.count({
    where: { gymId: gym.id, role: "PLAYER", isFrozen: false },
  });

  const teams = gym.challengeEnded ? await getTeamScoresTotal(gym.id) : [];
  const allPlayers = gym.challengeEnded ? await getPlayerScoresTotal(gym.id) : [];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">
          Squeeze the day
        </p>
        <h1 className="font-display text-3xl font-bold text-white">{gym.name}</h1>
        <p className="text-slate-400">
          {active ? `Active competition · Week ${gym.activeWeek}` : "No active competition"}
        </p>
      </div>

      {gym.challengeEnded && (
        <CompetitionStatusBanner
          ended
          endedAt={gym.endedAt}
          winningTeam={teams[0] ?? null}
          topPlayer={allPlayers[0] ?? null}
        />
      )}

      {!active && <NewCompetitionButton />}

      {active && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminActionTile
              href="/admin/challenges"
              title="Manage challenges"
              subtitle="Tasks that award points in this competition"
              accent="orange"
            />
            <AdminActionTile
              href="/admin/teams"
              title="Teams"
              subtitle="Rosters and random team generation"
              accent="slate"
            />
          </div>

          <WeekControl defaultWeek={gym.activeWeek} />

          <Link href="/admin/players" className="block">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Players ({playerCount})
            </Button>
          </Link>

          <div className="space-y-2 border-t border-white/10 pt-6">
            <p className="text-sm text-slate-500">
              End the competition to lock all scores and show final standings on the leaderboard.
            </p>
            <EndChallengeButton />
          </div>
        </>
      )}
    </div>
  );
}
