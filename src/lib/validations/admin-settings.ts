import { z } from "zod";

export const expenseCategoryKeys = [
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
] as const;

export const systemSettingsSchema = z.object({
  grabFoodFeeRate: z.number().min(0, "ต้องมากกว่าหรือเท่ากับ 0").max(100, "ต้องน้อยกว่าหรือเท่ากับ 100").optional(),
  lineManFeeRate: z.number().min(0, "ต้องมากกว่าหรือเท่ากับ 0").max(100, "ต้องน้อยกว่าหรือเท่ากับ 100").optional(),
  expenseCategoryLabels: z.record(
    z.enum(expenseCategoryKeys),
    z.string().min(1, "กรุณาระบุชื่อหมวดหมู่").max(50, "ชื่อหมวดหมู่ต้องไม่เกิน 50 ตัวอักษร")
  ).optional(),
});

export type SystemSettingsInput = z.infer<typeof systemSettingsSchema>;

export const defaultExpenseCategoryLabels: Record<string, string> = {
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
