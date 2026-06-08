import { Role, GymStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.inviteCode.upsert({
    where: { code: "SQUEEZE-DEMO" },
    update: { active: true, maxUses: 100 },
    create: {
      code: "SQUEEZE-DEMO",
      maxUses: 100,
      active: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {
      emailVerified: true,
      isFrozen: false,
    },
    create: {
      email: "admin@demo.com",
      name: "Demo Admin",
      passwordHash,
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  const start = new Date();
  const gym = await prisma.gym.upsert({
    where: { adminId: admin.id },
    update: {
      status: GymStatus.APPROVED,
      slug: "orangetheory-demo",
      location: "Austin, TX",
    },
    create: {
      name: "OrangeTheory Gym",
      slug: "orangetheory-demo",
      location: "Austin, TX",
      adminId: admin.id,
      status: GymStatus.APPROVED,
      activeWeek: 1,
      seasonStartDate: start,
    },
  });

  const playerNames = [
    "Alex", "Blake", "Casey", "Dana", "Ellis", "Finley", "Gray", "Harper",
  ];

  const players = [];
  for (let i = 0; i < playerNames.length; i++) {
    const email = `player${i + 1}@demo.com`;
    const p = await prisma.user.upsert({
      where: { email },
      update: { gymId: gym.id, emailVerified: true, isFrozen: false },
      create: {
        email,
        name: playerNames[i],
        passwordHash,
        role: Role.PLAYER,
        gymId: gym.id,
        emailVerified: true,
      },
    });
    players.push(p);
  }

  await prisma.challenge.deleteMany({ where: { gymId: gym.id } });
  const c1Start = new Date();
  const expDays = (days: number) =>
    new Date(c1Start.getTime() + days * 24 * 60 * 60 * 1000);

  await prisma.challenge.createMany({
    data: [
      {
        gymId: gym.id,
        weekNumber: 1,
        name: "10K steps",
        description: "Walk at least 10,000 steps daily.",
        points: 10,
        durationDays: 14,
        startDate: c1Start,
        expiresAt: expDays(14),
      },
      {
        gymId: gym.id,
        weekNumber: 1,
        name: "128 fl oz water",
        description: "Drink 128 fl oz of water each day.",
        points: 15,
        durationDays: 21,
        startDate: c1Start,
        expiresAt: expDays(21),
      },
      {
        gymId: gym.id,
        weekNumber: 1,
        name: "30 min cardio",
        description: "Complete 30 minutes of cardio.",
        points: 20,
        durationDays: 7,
        startDate: c1Start,
        expiresAt: expDays(7),
      },
    ],
  });

  await prisma.team.deleteMany({ where: { gymId: gym.id } });
  const team1 = await prisma.team.create({
    data: { gymId: gym.id, name: "Team 1", icon: "🍊" },
  });
  const team2 = await prisma.team.create({
    data: { gymId: gym.id, name: "Team 2", icon: "🔥" },
  });

  const half = Math.ceil(players.length / 2);
  await prisma.teamMember.createMany({
    data: [
      ...players.slice(0, half).map((p) => ({ teamId: team1.id, userId: p.id })),
      ...players.slice(half).map((p) => ({ teamId: team2.id, userId: p.id })),
    ],
  });

  console.log("Seed complete.");
  console.log("Invite code for new gyms: SQUEEZE-DEMO");
  console.log("Admin: admin@demo.com / password123");
  console.log("Players: player1@demo.com … player8@demo.com / password123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
