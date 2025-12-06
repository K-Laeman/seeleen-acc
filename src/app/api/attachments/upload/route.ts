import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth } from "@/lib/api-auth";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_PER_RECORD,
  isValidMimeType,
} from "@/lib/blob-config";
import { logger } from "@/lib/logger";

const uploadSchema = z.object({
  recordType: z.enum(["income", "expense"]),
  recordId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  // Check authentication
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const recordType = formData.get("recordType") as string;
    const recordId = formData.get("recordId") as string;

    // Validate inputs
    const validated = uploadSchema.parse({ recordType, recordId });

    if (!file) {
      return NextResponse.json(
        { error: "ไม่พบไฟล์ที่อัพโหลด" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidMimeType(file.type)) {
      return NextResponse.json(
        { error: "ประเภทไฟล์ไม่รองรับ (รองรับ: JPG, PNG, GIF, WebP, PDF)" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)" },
        { status: 400 }
      );
    }

    // Verify the record exists
    if (validated.recordType === "income") {
      const income = await prisma.income.findUnique({
        where: { id: validated.recordId },
      });
      if (!income) {
        return NextResponse.json(
          { error: "ไม่พบรายการรายรับ" },
          { status: 404 }
        );
      }
    } else {
      const expense = await prisma.expense.findUnique({
        where: { id: validated.recordId },
      });
      if (!expense) {
        return NextResponse.json(
          { error: "ไม่พบรายการรายจ่าย" },
          { status: 404 }
        );
      }
    }

    // Check existing attachment count
    const existingCount = await prisma.attachment.count({
      where:
        validated.recordType === "income"
          ? { incomeId: validated.recordId }
          : { expenseId: validated.recordId },
    });

    if (existingCount >= MAX_FILES_PER_RECORD) {
      return NextResponse.json(
        { error: `สามารถแนบไฟล์ได้สูงสุด ${MAX_FILES_PER_RECORD} ไฟล์` },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(
      `attachments/${validated.recordType}/${validated.recordId}/${Date.now()}-${file.name}`,
      file,
      { access: "public" }
    );

    // Save to database
    const attachment = await prisma.attachment.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        blobUrl: blob.url,
        blobPathname: blob.pathname,
        ...(validated.recordType === "income"
          ? { incomeId: validated.recordId }
          : { expenseId: validated.recordId }),
      },
    });

    logger.info("Attachment uploaded", {
      attachmentId: attachment.id,
      recordType: validated.recordType,
      recordId: validated.recordId,
      fileName: file.name,
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง", details: err.errors },
        { status: 400 }
      );
    }

    logger.error("Error uploading attachment", err instanceof Error ? err : undefined);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัพโหลดไฟล์" },
      { status: 500 }
    );
  }
}
