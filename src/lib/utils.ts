import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GRAB_FOOD_FEE_RATE, LINE_MAN_FEE_RATE } from "./env";

// shadcn/ui utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format number as Thai Baht currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(amount);
}

// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("th-TH").format(num);
}

// Format date for display
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Format date for input fields
export function formatDateInput(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

// Get start and end of a period
export function getPeriodDates(period: "day" | "week" | "month" | "year") {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case "day":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "week":
      const dayOfWeek = now.getDay();
      start.setDate(now.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case "month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case "year":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

// Calculate platform fee
export function calculatePlatformFee(
  amount: number,
  source: "GRAB_FOOD" | "LINE_MAN"
): { fee: number; rate: number; netAmount: number } {
  // Commission rates from environment variables
  const rates: Record<string, number> = {
    GRAB_FOOD: GRAB_FOOD_FEE_RATE,
    LINE_MAN: LINE_MAN_FEE_RATE,
  };

  const rate = rates[source] || 0;
  const fee = (amount * rate) / 100;
  const netAmount = amount - fee;

  return { fee, rate, netAmount };
}

// Income source display names
export const incomeSourceLabels: Record<string, string> = {
  OFFLINE_STORE: "หน้าร้าน",
  GRAB_FOOD: "GrabFood",
  LINE_MAN: "LINE MAN",
};

// Expense category display names
export const expenseCategoryLabels: Record<string, string> = {
  INGREDIENTS: "วัตถุดิบ",
  RENT: "ค่าเช่า",
  UTILITIES: "ค่าน้ำ/ไฟ",
  STAFF_WAGES: "ค่าแรงพนักงาน",
  PACKAGING: "บรรจุภัณฑ์",
  DELIVERY_FEES: "ค่าจัดส่ง",
  MARKETING: "การตลาด",
  EQUIPMENT: "อุปกรณ์",
  MAINTENANCE: "ซ่อมบำรุง",
  OTHER: "อื่นๆ",
};

// Colors for charts
export const incomeSourceColors: Record<string, string> = {
  OFFLINE_STORE: "#f59e0b",
  GRAB_FOOD: "#00b14f",
  LINE_MAN: "#06c755",
};

export const expenseCategoryColors: Record<string, string> = {
  INGREDIENTS: "#ef4444",
  RENT: "#f97316",
  UTILITIES: "#eab308",
  STAFF_WAGES: "#22c55e",
  PACKAGING: "#14b8a6",
  DELIVERY_FEES: "#06b6d4",
  MARKETING: "#3b82f6",
  EQUIPMENT: "#8b5cf6",
  MAINTENANCE: "#d946ef",
  OTHER: "#6b7280",
};

// ================================
// Query Parameter Validation Schemas
// ================================

import { z } from "zod";

// Date string regex (YYYY-MM-DD format)
const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD");

// Income query parameters
export const incomeQuerySchema = z.object({
  source: z.enum(["OFFLINE_STORE", "GRAB_FOOD", "LINE_MAN"]).optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

// Expense query parameters
export const expenseQuerySchema = z.object({
  category: z
    .enum([
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
    ])
    .optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

// Dashboard query parameters
export const dashboardQuerySchema = z.object({
  period: z.enum(["day", "week", "month", "year"]).optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
});

// ID parameter validation
export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// Helper function to validate query parameters
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
