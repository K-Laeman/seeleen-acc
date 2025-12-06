import { prisma } from "@/lib/prisma";
import { ExpenseCategory } from "@prisma/client";

export interface ExpenseRecord {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
}

export async function getExpenses(category?: string): Promise<ExpenseRecord[]> {
  const whereClause = category
    ? { category: category as ExpenseCategory }
    : {};

  const expenses = await prisma.expense.findMany({
    where: whereClause,
    orderBy: { date: "desc" },
    take: 100,
  });

  return expenses.map((expense) => ({
    id: expense.id,
    amount: expense.amount,
    category: expense.category,
    description: expense.description,
    date: expense.date.toISOString(),
  }));
}
