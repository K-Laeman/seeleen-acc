"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { formatCurrency, incomeSourceColors, expenseCategoryColors } from "@/lib/utils";

interface DailyTrend {
  date: string;
  income: number;
  expenses: number;
  profit: number;
}

interface TrendChartProps {
  data: DailyTrend[];
}

export function TrendChart({ data }: TrendChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        รายรับ-รายจ่าย รายวัน
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `วันที่: ${formatDate(label)}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              name="รายรับ"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="รายจ่าย"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="profit"
              name="กำไร"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface IncomeSourceData {
  [key: string]: { gross: number; fees: number; net: number; count: number };
}

interface IncomeSourceChartProps {
  data: IncomeSourceData;
}

const sourceLabels: Record<string, string> = {
  OFFLINE_STORE: "หน้าร้าน",
  GRAB_FOOD: "GrabFood",
  LINE_MAN: "LINE MAN",
};

export function IncomeSourceChart({ data }: IncomeSourceChartProps) {
  const chartData = Object.entries(data).map(([source, values]) => ({
    name: sourceLabels[source] || source,
    value: values.net,
    color: incomeSourceColors[source] || "#6b7280",
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        รายรับตามช่องทาง
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface ExpensesCategoryData {
  [key: string]: { total: number; count: number };
}

interface ExpensesCategoryChartProps {
  data: ExpensesCategoryData;
}

const categoryLabels: Record<string, string> = {
  INGREDIENTS: "วัตถุดิบ",
  RENT: "ค่าเช่า",
  UTILITIES: "ค่าน้ำ/ไฟ",
  STAFF_WAGES: "ค่าแรง",
  PACKAGING: "บรรจุภัณฑ์",
  DELIVERY_FEES: "ค่าจัดส่ง",
  MARKETING: "การตลาด",
  EQUIPMENT: "อุปกรณ์",
  MAINTENANCE: "ซ่อมบำรุง",
  OTHER: "อื่นๆ",
};

export function ExpensesCategoryChart({ data }: ExpensesCategoryChartProps) {
  const chartData = Object.entries(data)
    .map(([category, values]) => ({
      name: categoryLabels[category] || category,
      value: values.total,
      color: expenseCategoryColors[category] || "#6b7280",
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        รายจ่ายตามหมวดหมู่
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="value" name="จำนวนเงิน">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
