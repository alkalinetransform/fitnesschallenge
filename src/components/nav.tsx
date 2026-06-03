import Link from "next/link";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Nav({
  role,
  homeHref,
}: {
  role: "ADMIN" | "PLAYER";
  homeHref: string;
}) {
  const links = [
    { href: homeHref, label: role === "ADMIN" ? "Admin" : "Dashboard" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <nav className="flex items-center gap-5">
          <Link href="/" className="group">
            <span className="font-display text-lg font-bold tracking-tight">
              <span className="gradient-text">Fit</span>
              <span className="text-white">Challenge</span>
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-widest text-brand-400/80 transition group-hover:text-brand-400">
              Squeeze the day
            </span>
          </Link>
          <div className="flex gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-all duration-200",
                  "hover:bg-white/5 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" variant="outline" size="md">
            Log out
          </Button>
        </form>
      </div>
    </header>
  );
}
