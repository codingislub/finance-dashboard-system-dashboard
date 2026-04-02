import bcrypt from "bcryptjs";
import { prisma } from "../src/prisma";

const runSeed = async (): Promise<void> => {
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const [admin, analyst, viewer] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
    }),
    prisma.user.create({
      data: {
        name: "Analyst User",
        email: "analyst@example.com",
        passwordHash,
        role: "ANALYST",
        status: "ACTIVE",
      },
    }),
    prisma.user.create({
      data: {
        name: "Viewer User",
        email: "viewer@example.com",
        passwordHash,
        role: "VIEWER",
        status: "ACTIVE",
      },
    }),
  ]);

  const today = new Date();
  const daysAgo = (n: number): Date => {//useful for dashboard analytics 
    const d = new Date(today);
    d.setDate(today.getDate() - n);
    return d;
  };

  await prisma.financialRecord.createMany({
    data: [
      {
        amount: 4000,
        type: "INCOME",
        category: "Salary",
        date: daysAgo(30),
        notes: "Monthly salary",
        createdById: admin.id,
      },
      {
        amount: 900,
        type: "EXPENSE",
        category: "Rent",
        date: daysAgo(27),
        notes: "House rent",
        createdById: admin.id,
      },
      {
        amount: 300,
        type: "EXPENSE",
        category: "Groceries",
        date: daysAgo(20),
        notes: "Weekly groceries",
        createdById: analyst.id,
      },
      {
        amount: 450,
        type: "INCOME",
        category: "Freelance",
        date: daysAgo(14),
        notes: "UI contract",
        createdById: analyst.id,
      },
      {
        amount: 120,
        type: "EXPENSE",
        category: "Transport",
        date: daysAgo(7),
        notes: "Commute card",
        createdById: viewer.id,
      },
    ],
  });

  console.log("Database seeded successfully");
};

runSeed()
  .catch((error) => {
    console.error("Seeding failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
