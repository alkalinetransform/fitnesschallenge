"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { createVerifyToken, sendVerificationEmail } from "@/lib/email";
import { slugify } from "@/lib/slug";

const playerSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  gymId: z.string().min(1, "Select a gym location"),
});

const adminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  inviteCode: z.string().min(1, "Invite code is required"),
  gymName: z.string().min(2, "Gym name is required"),
  location: z.string().min(2, "Location is required"),
  slug: z.string().min(2, "Gym URL slug is required").regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens"),
});

async function validateInviteCode(code: string) {
  const invite = await prisma.inviteCode.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
  if (!invite || !invite.active) return { error: "Invalid invite code" };
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return { error: "Invite code has expired" };
  }
  if (invite.usedCount >= invite.maxUses) {
    return { error: "Invite code has reached its limit" };
  }
  return { invite };
}

export async function registerPlayer(formData: FormData) {
  const parsed = playerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    gymId: formData.get("gymId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { name, email, password, gymId } = parsed.data;

  const gym = await prisma.gym.findFirst({
    where: { id: gymId, status: "APPROVED" },
  });
  if (!gym) return { error: "Please select a valid approved gym location" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already registered" };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "PLAYER",
      gymId,
      emailVerified: true,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard?welcome=1",
    });
  } catch {
    return { error: "Account created but sign-in failed" };
  }
}

export async function registerAdmin(formData: FormData) {
  const parsed = adminSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    inviteCode: formData.get("inviteCode"),
    gymName: formData.get("gymName"),
    location: formData.get("location"),
    slug: slugify(formData.get("slug") as string),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { name, email, password, inviteCode, gymName, location, slug } = parsed.data;

  const inviteResult = await validateInviteCode(inviteCode);
  if ("error" in inviteResult) return { error: inviteResult.error };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already registered" };

  const slugTaken = await prisma.gym.findUnique({ where: { slug } });
  if (slugTaken) return { error: "That gym URL is already taken. Try a different slug." };

  const token = createVerifyToken();
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
        emailVerified: false,
        emailVerifyToken: token,
        emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await tx.gym.create({
      data: {
        name: gymName,
        slug,
        location,
        adminId: user.id,
        status: "PENDING",
        activeWeek: 1,
      },
    });

    await tx.inviteCode.update({
      where: { id: inviteResult.invite!.id },
      data: { usedCount: { increment: 1 } },
    });
  });

  await sendVerificationEmail(email, token);

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin/pending?reason=email",
    });
  } catch {
    return { error: "Account created. Check your email to verify, then log in." };
  }
}

export async function verifyEmail(token: string) {
  if (!token) return { error: "Invalid verification link" };

  const user = await prisma.user.findFirst({
    where: {
      emailVerifyToken: token,
      emailVerifyExpires: { gt: new Date() },
    },
    include: { ownedGym: true },
  });

  if (!user) return { error: "Link expired or invalid" };

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    if (user.ownedGym) {
      await tx.gym.update({
        where: { id: user.ownedGym.id },
        data: { status: "APPROVED" },
      });
    }
  });

  return { success: true };
}

export async function resendVerificationEmail() {
  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user || user.emailVerified) return { error: "Already verified" };

  const token = createVerifyToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifyToken: token,
      emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await sendVerificationEmail(user.email, token);
  return { success: true };
}

export async function resendVerificationEmailForm(): Promise<void> {
  await resendVerificationEmail();
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      isFrozen: true,
      welcomeSeenAt: true,
      emailVerified: true,
    },
  });
  if (!user) return { error: "Invalid email or password" };
  if (user.isFrozen) return { error: "Your account has been deactivated. Contact your gym admin." };

  let redirectTo =
    user.role === "PLAYER" && !user.welcomeSeenAt
      ? "/dashboard?welcome=1"
      : "/dashboard";
  if (user.role === "ADMIN") {
    if (!user.emailVerified) {
      redirectTo = "/admin/pending?reason=email";
    } else {
      const gym = await prisma.gym.findUnique({ where: { adminId: user.id } });
      if (!gym) redirectTo = "/login";
      else if (gym.status !== "APPROVED") redirectTo = "/admin/pending?reason=approval";
      else redirectTo = "/admin";
    }
  }

  try {
    await signOut({ redirect: false });
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw e;
  }
}

export async function loginUserForm(formData: FormData): Promise<void> {
  await loginUser(formData);
}

export async function logoutForm(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

/** @deprecated */
export async function registerUser(formData: FormData) {
  return registerPlayer(formData);
}
