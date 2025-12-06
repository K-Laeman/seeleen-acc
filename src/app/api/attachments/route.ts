import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth } from "@/lib/api-auth";
import { logger } from "@/lib/logger";

const querySchema = z.object({
  recordType: z.enum(["income", "expense"]),
  recordId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  // Check authentication
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const params = {
      recordType: searchParams.get("recordType"),
      recordId: searchParams.get("recordId"),
    };

    const validated = querySchema.parse(params);

    const attachments = await prisma.attachment.findMany({
      where:
        validated.recordType === "income"
          ? { incomeId: validated.recordId }
          : { expenseId: validated.recordId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        blobUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json(attachments);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "พารามิเตอร์ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    logger.error("Error fetching attachments", err instanceof Error ? err : undefined);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลไฟล์แนบ" },
      { status: 500 }
    );
  }
}
