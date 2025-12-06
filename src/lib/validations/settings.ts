import { z } from "zod";

export const profileUpdateSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อ").max(100, "ชื่อต้องไม่เกิน 100 ตัวอักษร").optional(),
  email: z.string().email("อีเมลไม่ถูกต้อง").optional(),
  image: z.string().url("URL รูปภาพไม่ถูกต้อง").optional().nullable(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "กรุณาระบุรหัสผ่านปัจจุบัน"),
  newPassword: z.string().min(6, "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

export const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.enum(["th", "en"]).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;
