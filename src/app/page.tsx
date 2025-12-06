import { getDashboardData, Period } from "@/lib/dashboard";
import DashboardClient from "@/components/DashboardClient";

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function Dashboard({ searchParams }: PageProps) {
  const params = await searchParams;
  const validPeriods: Period[] = ["day", "week", "month", "year"];
  const period: Period = validPeriods.includes(params.period as Period)
    ? (params.period as Period)
    : "month";

  const data = await getDashboardData(period);

  return <DashboardClient data={data} currentPeriod={period} />;
}
