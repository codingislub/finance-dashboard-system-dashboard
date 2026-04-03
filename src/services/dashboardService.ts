import { prisma } from "../prisma";

type TrendPeriod = "weekly" | "monthly";
type DashboardRecord = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: Date;
  notes: string | null;
};

export const getDashboardOverview = async (userId: string): Promise<{
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  categoryTotals: Array<{ category: string; income: number; expense: number }>;
  recentActivity: Array<{
    id: string;
    amount: number;
    type: string;
    category: string;
    date: Date;
    notes: string | null;
  }>;
}> => {
  const records: DashboardRecord[] = await prisma.financialRecord.findMany({
    where: { deletedAt: null, createdById: userId },
    orderBy: { date: "desc" },
  });

  const totalIncome = records
    .filter((record) => record.type === "INCOME")
    .reduce((sum, record) => sum + record.amount, 0);

  const totalExpenses = records
    .filter((record) => record.type === "EXPENSE")
    .reduce((sum, record) => sum + record.amount, 0);

  const categoryMap = new Map<string, { income: number; expense: number }>();
  for (const record of records) {
    const current = categoryMap.get(record.category) ?? { income: 0, expense: 0 };
    if (record.type === "INCOME") {
      current.income += record.amount;
    } else {
      current.expense += record.amount;
    }
    categoryMap.set(record.category, current);
  }

  const categoryTotals = Array.from(categoryMap.entries()).map(([category, totals]) => ({
    category,
    income: totals.income,
    expense: totals.expense,
  }));

  const recentActivity = records.slice(0, 10).map((record) => ({
    id: record.id,
    amount: record.amount,
    type: record.type,
    category: record.category,
    date: record.date,
    notes: record.notes,
  }));

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    categoryTotals,
    recentActivity,
  };
};

export const getTrendData = async (
  userId: string,
  period: TrendPeriod,
  months: number,
): Promise<Array<{ bucket: string; income: number; expense: number }>> => {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(now.getMonth() - months);

  const records: DashboardRecord[] = await prisma.financialRecord.findMany({
    where: { date: { gte: startDate }, deletedAt: null, createdById: userId },
    orderBy: { date: "asc" },
  });

  const bucketMap = new Map<string, { income: number; expense: number }>();

  for (const record of records) {
    const date = new Date(record.date);
    const bucket =
      period === "monthly"
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        : `${date.getFullYear()}-W${String(getWeekNumber(date)).padStart(2, "0")}`;

    const current = bucketMap.get(bucket) ?? { income: 0, expense: 0 };
    if (record.type === "INCOME") {
      current.income += record.amount;
    } else {
      current.expense += record.amount;
    }
    bucketMap.set(bucket, current);
  }

  return Array.from(bucketMap.entries()).map(([bucket, value]) => ({
    bucket,
    income: value.income,
    expense: value.expense,
  }));
};

const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};
