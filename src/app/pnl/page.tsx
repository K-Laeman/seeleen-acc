import { getPnLData, Period } from "@/lib/pnl";
import PnLClient from "@/components/PnLClient";

interface PageProps {
  searchParams: Promise<{
    period?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function PnLPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const validPeriods: Period[] = ["day", "week", "month", "year"];

  const hasCustomDates = params.startDate && params.endDate;

  const period: Period = validPeriods.includes(params.period as Period)
    ? (params.period as Period)
    : "month";

  const data = await getPnLData({
    period: hasCustomDates ? undefined : period,
    startDate: hasCustomDates ? params.startDate : undefined,
    endDate: hasCustomDates ? params.endDate : undefined,
  });

  return (
    <PnLClient
      data={data}
      currentPeriod={period}
      currentStartDate={params.startDate}
      currentEndDate={params.endDate}
      useCustom={!!hasCustomDates}
    />
  );
}
