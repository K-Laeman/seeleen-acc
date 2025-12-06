import { prisma } from "@/lib/prisma";
import { IncomeSource } from "@prisma/client";

export interface IncomeRecord {
  id: string;
  amount: number;
  source: string;
  description: string | null;
  date: string;
  platformFee: number | null;
  platformFeeRate: number | null;
  netAmount: number | null;
}

export async function getIncomes(source?: string): Promise<IncomeRecord[]> {
  const whereClause = source
    ? { source: source as IncomeSource }
    : {};

  const incomes = await prisma.income.findMany({
    where: whereClause,
    orderBy: { date: "desc" },
    take: 100,
  });

  return incomes.map((income) => ({
    id: income.id,
    amount: income.amount,
    source: income.source,
    description: income.description,
    date: income.date.toISOString(),
    platformFee: income.platformFee,
    platformFeeRate: income.platformFeeRate,
    netAmount: income.netAmount,
  }));
}
