import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/frozen",
  "/check-in",
];

function authedHome(session: Session) {
  if (session.user.role === "PLAYER") return "/dashboard";
  if (!session.user.emailVerified) return "/admin/pending?reason=email";
  return "/admin";
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session?.user;

  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (isLoggedIn && pathname.startsWith("/register")) {
      return NextResponse.redirect(new URL(authedHome(session), req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session.user.isFrozen && pathname !== "/frozen") {
    return NextResponse.redirect(new URL("/frozen", req.url));
  }

  if (pathname.startsWith("/admin")) {
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    const allowedPending = pathname.startsWith("/admin/pending");
    if (!session.user.emailVerified && !allowedPending) {
      return NextResponse.redirect(new URL("/admin/pending?reason=email", req.url));
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (session.user.role !== "PLAYER") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
