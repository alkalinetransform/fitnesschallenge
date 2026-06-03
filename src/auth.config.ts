import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Edge-safe Auth.js config (no Prisma/bcrypt).
 * Used by middleware only. Full providers live in auth.ts.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        const user = session.user as {
          id: string;
          email?: string | null;
          name?: string | null;
          image?: string | null;
          role: Role;
          gymId: string | null;
          emailVerified: boolean;
          isFrozen: boolean;
        };
        user.id = token.id as string;
        user.role = token.role as Role;
        user.gymId = (token.gymId as string | null) ?? null;
        user.emailVerified = Boolean(token.emailVerified);
        user.isFrozen = Boolean(token.isFrozen);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
