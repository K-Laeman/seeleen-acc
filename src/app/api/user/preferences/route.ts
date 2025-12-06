import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { preferencesSchema } from "@/lib/validations/settings";
import type { Prisma } from "@prisma/client";

interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: "th" | "en";
}

const defaultPreferences: UserPreferences = {
  theme: "system",
  language: "th",
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    });

    if (!user) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    const preferences = (user.preferences as unknown as UserPreferences) || defaultPreferences;

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching preferences:", error);
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

    const body = await request.json();
    const parsed = preferencesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Get current preferences
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    });

    const currentPreferences = (user?.preferences as unknown as UserPreferences) || defaultPreferences;

    // Merge with new preferences
    const newPreferences: UserPreferences = {
      ...currentPreferences,
      ...parsed.data,
    };

    // Update preferences
    await prisma.user.update({
      where: { id: session.user.id },
      data: { preferences: newPreferences as unknown as Prisma.InputJsonValue },
    });

    return NextResponse.json({
      success: true,
      preferences: newPreferences,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" },
      { status: 500 }
    );
  }
}
