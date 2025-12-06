"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  formatCurrency,
  formatDateInput,
  incomeSourceLabels,
  expenseCategoryLabels,
} from "@/lib/utils";
import { Printer, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface PnLData {
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
  period: { start: string; end: string };
}

interface PnLClientProps {
  data: PnLData;
  currentPeriod: string;
  currentStartDate?: string;
  currentEndDate?: string;
  useCustom: boolean;
}

export default function PnLClient({
  data,
  currentPeriod,
  currentStartDate,
  currentEndDate,
  useCustom,
}: PnLClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [period, setPeriod] = useState(currentPeriod);
  const [customDates, setCustomDates] = useState({
    start:
      currentStartDate ||
      formatDateInput(new Date(new Date().setMonth(new Date().getMonth() - 1))),
    end: currentEndDate || formatDateInput(new Date()),
  });
  const [useCustomDates, setUseCustomDates] = useState(useCustom);

  const handlePeriodChange = (newPeriod: string) => {
    if (newPeriod === "custom") {
      setUseCustomDates(true);
      handleCustomDateChange(customDates.start, customDates.end);
    } else {
      setUseCustomDates(false);
      setPeriod(newPeriod);
      const params = new URLSearchParams();
      params.set("period", newPeriod);
      router.push(`/pnl?${params.toString()}`);
    }
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setCustomDates({ start, end });
    const params = new URLSearchParams();
    params.set("startDate", start);
    params.set("endDate", end);
    router.push(`/pnl?${params.toString()}`);
  };

  const formatPeriodDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">งบกำไรขาดทุน</h1>
          <p className="text-muted-foreground">Profit & Loss Statement</p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="print:hidden">
          <Printer className="mr-2 h-4 w-4" />
          พิมพ์
        </Button>
      </div>

      {/* Period Selector */}
      <Card className="print:hidden">
        <CardContent className="py-4">
          <div className="space-y-4">
            <Tabs
              value={useCustomDates ? "custom" : period}
              onValueChange={handlePeriodChange}
            >
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="day">วันนี้</TabsTrigger>
                <TabsTrigger value="week">7 วัน</TabsTrigger>
                <TabsTrigger value="month">30 วัน</TabsTrigger>
                <TabsTrigger value="year">ปีนี้</TabsTrigger>
                <TabsTrigger value="custom">กำหนดเอง</TabsTrigger>
              </TabsList>
            </Tabs>

            {useCustomDates && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="startDate" className="text-sm">
                    จาก:
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={customDates.start}
                    onChange={(e) =>
                      handleCustomDateChange(e.target.value, customDates.end)
                    }
                    className="w-auto"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="endDate" className="text-sm">
                    ถึง:
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={customDates.end}
                    onChange={(e) =>
                      handleCustomDateChange(customDates.start, e.target.value)
                    }
                    className="w-auto"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* P&L Statement */}
      <Card className="print:shadow-none print:border-2">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-6 text-center rounded-t-lg print:bg-white print:text-foreground print:border-b-2">
          <h2 className="text-xl font-bold">Fired Chicken</h2>
          <p className="text-primary-foreground/80 print:text-muted-foreground">
            งบกำไรขาดทุน (Profit & Loss Statement)
          </p>
          <p className="text-sm text-primary-foreground/60 mt-2 print:text-muted-foreground">
            สำหรับงวด {formatPeriodDate(data.period.start)} -{" "}
            {formatPeriodDate(data.period.end)}
          </p>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Revenue Section */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">
              รายได้ (Revenue)
            </h3>
            <div className="space-y-2">
              {Object.entries(data.incomeBySource).map(([source, values]) => (
                <div key={source} className="flex justify-between items-center">
                  <span className="text-muted-foreground pl-4">
                    {incomeSourceLabels[source] || source}
                    {values.fees > 0 && (
                      <span className="text-sm text-muted-foreground/60 ml-2">
                        (หักค่าธรรมเนียม {formatCurrency(values.fees)})
                      </span>
                    )}
                  </span>
                  <span>{formatCurrency(values.net)}</span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex justify-between items-center font-semibold">
                <span>รายได้รวม</span>
                <span className="text-primary">
                  {formatCurrency(data.summary.totalNetIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span className="pl-4">
                  (รายได้ก่อนหักค่าธรรมเนียม:{" "}
                  {formatCurrency(data.summary.totalGrossIncome)})
                </span>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">
              ค่าใช้จ่าย (Expenses)
            </h3>
            <div className="space-y-2">
              {Object.entries(data.expensesByCategory)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([category, values]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-muted-foreground pl-4">
                      {expenseCategoryLabels[category] || category}
                    </span>
                    <span>{formatCurrency(values.total)}</span>
                  </div>
                ))}
              <Separator className="my-2" />
              <div className="flex justify-between items-center font-semibold">
                <span>ค่าใช้จ่ายรวม</span>
                <span className="text-destructive">
                  ({formatCurrency(data.summary.totalExpenses)})
                </span>
              </div>
            </div>
          </div>

          {/* Net Profit Section */}
          <div className="bg-muted -mx-6 px-6 py-4 border-t-2 print:bg-muted">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">กำไร (ขาดทุน) สุทธิ</span>
              <span
                className={`text-2xl font-bold ${
                  data.summary.netProfit >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {formatCurrency(data.summary.netProfit)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-muted-foreground">
                อัตรากำไรสุทธิ (Profit Margin)
              </span>
              <span
                className={`font-medium ${
                  data.summary.profitMargin >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {data.summary.profitMargin.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t print:hidden">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{data.summary.transactionCount}</p>
              <p className="text-sm text-muted-foreground">รายการทั้งหมด</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(data.summary.totalPlatformFees)}
              </p>
              <p className="text-sm text-muted-foreground">ค่าธรรมเนียมแพลตฟอร์ม</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                {data.summary.profitMargin >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-primary" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
              </div>
              <p
                className={`text-2xl font-bold ${
                  data.summary.profitMargin >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {data.summary.profitMargin.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Margin</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .max-w-4xl,
          .max-w-4xl * {
            visibility: visible;
          }
          .max-w-4xl {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
