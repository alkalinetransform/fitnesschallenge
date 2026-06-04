import { ButtonDots } from "@/components/ui/button-dots";

export default function LeaderboardLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 animate-fade-in">
      <ButtonDots />
      <p className="text-sm text-slate-500">Loading leaderboard…</p>
    </div>
  );
}
