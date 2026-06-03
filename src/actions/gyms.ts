"use server";

import { prisma } from "@/lib/db";

export async function searchGyms(query: string) {
  const q = query.trim();
  if (q.length < 2) return [];

  return prisma.gym.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, location: true, slug: true },
    orderBy: { name: "asc" },
    take: 12,
  });
}
