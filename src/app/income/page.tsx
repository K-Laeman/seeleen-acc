import { getIncomes } from "@/lib/income";
import IncomeClient from "@/components/IncomeClient";

interface PageProps {
  searchParams: Promise<{ source?: string }>;
}

export default async function IncomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const validSources = ["OFFLINE_STORE", "GRAB_FOOD", "LINE_MAN"];
  const source = validSources.includes(params.source || "")
    ? params.source
    : undefined;

  const incomes = await getIncomes(source);

  return <IncomeClient initialIncomes={incomes} currentSource={source || ""} />;
}
