import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/mascot";

const steps = [
  {
    title: "Join your gym",
    body: "Players sign up for your gym’s active competition. One location, one leaderboard.",
  },
  {
    title: "Compete on teams",
    body: "Admins generate teams. Complete challenges (tasks) to earn points for yourself and your squad.",
  },
  {
    title: "Climb the leaderboard",
    body: "Points stack across every challenge in the competition. When the season ends, scores lock and winners are crowned.",
  },
];

const adminFeatures = [
  "Run competitions made of point-earning challenges",
  "Auto-track weeks and archive past challenges",
  "Freeze players, edit teams, and lock final competition scores",
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-12 md:pt-20">
        <section className="text-center">
          <div className="animate-fade-in-up mx-auto mb-6 flex justify-center">
            <Mascot size={200} animation="wave" priority />
          </div>

          <p className="animate-fade-in-up stagger-1 mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">
            Squeeze the day
          </p>

          <h1 className="animate-fade-in-up stagger-2 font-display text-5xl font-extrabold leading-tight text-white md:text-6xl">
            Team fitness
            <br />
            <span className="gradient-text">made simple</span>
          </h1>

          <p className="animate-fade-in-up stagger-3 mx-auto mt-5 max-w-lg text-lg text-slate-400">
            Meet Squeeze — your gym buddy for competitions, weekly challenges, team standings, and one
            leaderboard built for members who show up.
          </p>

          <div className="animate-fade-in-up stagger-4 mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:flex-wrap">
            <Link href="/register" className="sm:flex-1 sm:min-w-[200px]">
              <Button size="lg" className="w-full">
                Join as player
              </Button>
            </Link>
            <Link href="/login" className="sm:flex-1 sm:min-w-[200px]">
              <Button variant="outline" size="lg" className="w-full">
                Log in
              </Button>
            </Link>
          </div>
        </section>

        <section className="animate-fade-in-up stagger-5 mt-20">
          <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
            How it works
          </h2>
          <p className="mt-2 max-w-2xl text-slate-400">
            A <strong className="font-medium text-slate-300">competition</strong> is the season your gym runs.
            <strong className="font-medium text-slate-300"> Challenges</strong> are the individual tasks inside it that award points.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className={`glass-card border bg-gradient-to-br from-brand-500/10 to-transparent p-6 animate-fade-in-up stagger-${i + 1}`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-500/15 font-display text-sm font-bold text-brand-400">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="animate-fade-in-up stagger-6 mt-16 glass-card border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Mascot size={100} animation="bounce" className="shrink-0" />
            <div className="min-w-0 text-center sm:text-left">
              <h2 className="font-display text-xl font-bold text-white">For gym staff</h2>
              <p className="mt-2 text-slate-400">
                Admins log in to manage the active competition, challenges, teams, and players.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {adminFeatures.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-emerald-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
