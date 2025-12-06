import { getExpenses } from "@/lib/expenses";
import ExpensesClient from "@/components/ExpensesClient";

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

const validCategories = [
  "INGREDIENTS",
  "RENT",
  "UTILITIES",
  "STAFF_WAGES",
  "PACKAGING",
  "DELIVERY_FEES",
  "MARKETING",
  "EQUIPMENT",
  "MAINTENANCE",
  "OTHER",
];

export default async function ExpensesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = validCategories.includes(params.category || "")
    ? params.category
    : undefined;

  const expenses = await getExpenses(category);

  return <ExpensesClient initialExpenses={expenses} currentCategory={category || ""} />;
}
