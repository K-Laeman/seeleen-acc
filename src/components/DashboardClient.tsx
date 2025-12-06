"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendChart,
  IncomeSourceChart,
  ExpensesCategoryChart,
} from "@/components/Charts";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  Receipt,
  Wallet,
  BarChart3,
} from "lucide-react";

interface DashboardData {
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

interface DashboardClientProps {
  data: DashboardData;
  currentPeriod: string;
}

export default function DashboardClient({
  data,
  currentPeriod,
}: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePeriodChange = (newPeriod: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", newPeriod);
    router.push(`/?${params.toString()}`);
  };

  const periodOptions = [
    { value: "day", label: "วันนี้" },
    { value: "week", label: "7 วัน" },
    { value: "month", label: "30 วัน" },
    { value: "year", label: "ปีนี้" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">แดชบอร์ด</h1>
          <p className="text-muted-foreground">ภาพรวมทางการเงินของ Fired Chicken</p>
        </div>
        <Tabs value={currentPeriod} onValueChange={handlePeriodChange} className="w-auto">
          <TabsList className="grid grid-cols-4 w-full lg:w-auto">
            {periodOptions.map((option) => (
              <TabsTrigger key={option.value} value={option.value} className="text-xs sm:text-sm">
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Grid - Matching reference design */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Net Income Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              รายรับสุทธิ
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.totalNetIncome)}</div>
            <div className="flex items-center gap-2 mt-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">
                รายรับรวม {formatCurrency(data.summary.totalGrossIncome)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.summary.transactionCount} รายการ
            </p>
          </CardContent>
        </Card>

        {/* Platform Fees Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ค่าธรรมเนียม
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              -{formatCurrency(data.summary.totalPlatformFees)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              <p className="text-xs text-muted-foreground">
                GrabFood + LINE MAN
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ค่าคอมมิชชั่น 30%
            </p>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              รายจ่ายรวม
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(data.summary.totalExpenses)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <p className="text-xs text-muted-foreground">
                ค่าใช้จ่ายทั้งหมด
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit Card */}
        <Card className={data.summary.netProfit < 0 ? "border-destructive/50" : "border-primary/50"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              กำไรสุทธิ
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.summary.netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(data.summary.netProfit)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {data.summary.netProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-primary" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <p className="text-xs text-muted-foreground">
                Margin {data.summary.profitMargin.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Two Column */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">รายรับตามช่องทาง</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeSourceChart data={data.incomeBySource} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">รายจ่ายตามหมวดหมู่</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesCategoryChart data={data.expensesByCategory} />
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">แนวโน้มรายรับ-รายจ่าย</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart data={data.dailyTrends} />
        </CardContent>
      </Card>
    </div>
  );
}
