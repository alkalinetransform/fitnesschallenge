import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role: Role;
      gymId: string | null;
      emailVerified: boolean;
      isFrozen: boolean;
    };
  }

  interface User {
    role: Role;
    gymId: string | null;
    emailVerified: boolean;
    isFrozen: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        if (user.isFrozen) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          gymId: user.gymId,
          emailVerified: user.emailVerified,
          isFrozen: user.isFrozen,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.gymId = user.gymId;
        token.emailVerified = user.emailVerified;
        token.isFrozen = user.isFrozen;
      }
      if (trigger === "update" && token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { emailVerified: true, isFrozen: true, gymId: true },
        });
        if (fresh) {
          token.emailVerified = fresh.emailVerified;
          token.isFrozen = fresh.isFrozen;
          token.gymId = fresh.gymId;
        }
      }
      return token;
    },
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
});
