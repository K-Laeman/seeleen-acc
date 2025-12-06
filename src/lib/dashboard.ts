import { prisma } from "@/lib/prisma";

export interface DashboardData {
  summary: {
    totalGrossIncome: number;
    totalPlatformFees: number;
    totalNetIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    transactionCount: number;
  };
  incomeBySource: Record<
    string,
    { gross: number; fees: number; net: number; count: number }
  >;
  expensesByCategory: Record<string, { total: number; count: number }>;
  dailyTrends: Array<{
    date: string;
    income: number;
    expenses: number;
    profit: number;
  }>;
}

export type Period = "day" | "week" | "month" | "year";

export async function getDashboardData(period: Period = "month"): Promise<DashboardData> {
  let startDate: Date;
  const endDate: Date = new Date();

  // Calculate dates based on period
  startDate = new Date();
  switch (period) {
    case "day":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "year":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  // Fetch all income and expenses for the period
  const [incomes, expenses] = await Promise.all([
    prisma.income.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
  ]);

  // Calculate totals
  const totalGrossIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalPlatformFees = incomes.reduce(
    (sum, inc) => sum + (inc.platformFee || 0),
    0
  );
  const totalNetIncome = incomes.reduce(
    (sum, inc) => sum + (inc.netAmount || inc.amount),
    0
  );
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalNetIncome - totalExpenses;
  const profitMargin =
    totalNetIncome > 0 ? (netProfit / totalNetIncome) * 100 : 0;

  // Income by source
  const incomeBySource = incomes.reduce(
    (acc, inc) => {
      const source = inc.source;
      if (!acc[source]) {
        acc[source] = { gross: 0, fees: 0, net: 0, count: 0 };
      }
      acc[source].gross += inc.amount;
      acc[source].fees += inc.platformFee || 0;
      acc[source].net += inc.netAmount || inc.amount;
      acc[source].count += 1;
      return acc;
    },
    {} as Record<string, { gross: number; fees: number; net: number; count: number }>
  );

  // Expenses by category
  const expensesByCategory = expenses.reduce(
    (acc, exp) => {
      const category = exp.category;
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0 };
      }
      acc[category].total += exp.amount;
      acc[category].count += 1;
      return acc;
    },
    {} as Record<string, { total: number; count: number }>
  );

  // Daily trends (for charts)
  const dailyData: Record<
    string,
    { date: string; income: number; expenses: number; profit: number }
  > = {};

  incomes.forEach((inc) => {
    const dateKey = inc.date.toISOString().split("T")[0];
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = { date: dateKey, income: 0, expenses: 0, profit: 0 };
    }
    dailyData[dateKey].income += inc.netAmount || inc.amount;
  });

  expenses.forEach((exp) => {
    const dateKey = exp.date.toISOString().split("T")[0];
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = { date: dateKey, income: 0, expenses: 0, profit: 0 };
    }
    dailyData[dateKey].expenses += exp.amount;
  });

  // Calculate profit for each day
  Object.values(dailyData).forEach((day) => {
    day.profit = day.income - day.expenses;
  });

  const dailyTrends = Object.values(dailyData).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    summary: {
      totalGrossIncome,
      totalPlatformFees,
      totalNetIncome,
      totalExpenses,
      netProfit,
      profitMargin: Math.round(profitMargin * 100) / 100,
      transactionCount: incomes.length + expenses.length,
    },
    incomeBySource,
    expensesByCategory,
    dailyTrends,
  };
}
