import { setPlayerFrozenForm } from "@/actions/players";
import { requireApprovedAdminGym } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getPlayerScoresTotal } from "@/lib/scores";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export default async function AdminPlayersPage() {
  const { gym } = await requireApprovedAdminGym();

  const players = await prisma.user.findMany({
    where: { gymId: gym.id, role: "PLAYER" },
    orderBy: { name: "asc" },
  });

  const scores = await getPlayerScoresTotal(gym.id);
  const scoreMap = new Map(scores.map((s) => [s.userId, s.points]));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Players</h1>
        <p className="text-sm text-slate-400">Manage rosters for the active competition</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {players.map((p, i) => (
          <Card key={p.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)} ${p.isFrozen ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{p.name}</CardTitle>
                <p className="text-xs text-slate-500">{p.email}</p>
              </div>
              <span className="font-bold text-brand-400">{scoreMap.get(p.id) ?? 0} pts</span>
            </div>
            <form action={setPlayerFrozenForm} className="mt-3">
              <input type="hidden" name="userId" value={p.id} />
              <input type="hidden" name="frozen" value={p.isFrozen ? "false" : "true"} />
              <Button
                type="submit"
                variant={p.isFrozen ? "secondary" : "destructive"}
                size="md"
                className="w-full"
              >
                {p.isFrozen ? "Reactivate account" : "Freeze account"}
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
