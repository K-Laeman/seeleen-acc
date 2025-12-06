import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { systemSettingsSchema, defaultExpenseCategoryLabels } from "@/lib/validations/admin-settings";
import type { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    // Check admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    const settings = await prisma.systemSettings.findUnique({
      where: { id: "system-settings" },
    });

    if (!settings) {
      // Return defaults if no settings exist
      return NextResponse.json({
        grabFoodFeeRate: 30,
        lineManFeeRate: 30,
        expenseCategoryLabels: defaultExpenseCategoryLabels,
      });
    }

    return NextResponse.json({
      grabFoodFeeRate: settings.grabFoodFeeRate,
      lineManFeeRate: settings.lineManFeeRate,
      expenseCategoryLabels: {
        ...defaultExpenseCategoryLabels,
        ...(settings.expenseCategoryLabels as Record<string, string>),
      },
    });
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    // Check admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = systemSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { grabFoodFeeRate, lineManFeeRate, expenseCategoryLabels } = parsed.data;

    // Build update data
    const updateData: Prisma.SystemSettingsUpdateInput = {};
    if (grabFoodFeeRate !== undefined) {
      updateData.grabFoodFeeRate = grabFoodFeeRate;
    }
    if (lineManFeeRate !== undefined) {
      updateData.lineManFeeRate = lineManFeeRate;
    }
    if (expenseCategoryLabels !== undefined) {
      updateData.expenseCategoryLabels = expenseCategoryLabels as unknown as Prisma.InputJsonValue;
    }

    // Upsert settings
    const settings = await prisma.systemSettings.upsert({
      where: { id: "system-settings" },
      update: updateData,
      create: {
        id: "system-settings",
        grabFoodFeeRate: grabFoodFeeRate ?? 30,
        lineManFeeRate: lineManFeeRate ?? 30,
        expenseCategoryLabels: (expenseCategoryLabels ?? defaultExpenseCategoryLabels) as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      success: true,
      settings: {
        grabFoodFeeRate: settings.grabFoodFeeRate,
        lineManFeeRate: settings.lineManFeeRate,
        expenseCategoryLabels: settings.expenseCategoryLabels,
      },
    });
  } catch (error) {
    console.error("Error updating system settings:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" },
      { status: 500 }
    );
  }
}
