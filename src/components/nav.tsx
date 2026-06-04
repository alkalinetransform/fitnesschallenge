import Link from "next/link";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="group min-w-0">
          <span className="font-display text-lg font-bold tracking-tight">
            <span className="gradient-text">Fit</span>
            <span className="text-white">Challenge</span>
          </span>
          <span className="block text-[10px] font-medium uppercase tracking-widest text-brand-400/80 transition group-hover:text-brand-400">
            Squeeze the day
          </span>
        </Link>
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
