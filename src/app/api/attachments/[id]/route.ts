import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;

    const attachment = await prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "ไม่พบไฟล์แนบ" },
        { status: 404 }
      );
    }

    return NextResponse.json(attachment);
  } catch (err) {
    logger.error("Error fetching attachment", err instanceof Error ? err : undefined);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลไฟล์แนบ" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;

    const attachment = await prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "ไม่พบไฟล์แนบ" },
        { status: 404 }
      );
    }

    // Delete from Vercel Blob
    try {
      await del(attachment.blobUrl);
    } catch (blobError) {
      // Log but don't fail if blob deletion fails
      logger.warn("Failed to delete blob", {
        attachmentId: id,
        blobUrl: attachment.blobUrl,
        error: blobError,
      });
    }

    // Delete from database
    await prisma.attachment.delete({
      where: { id },
    });

    logger.info("Attachment deleted", {
      attachmentId: id,
      fileName: attachment.fileName,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Error deleting attachment", err instanceof Error ? err : undefined);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบไฟล์แนบ" },
      { status: 500 }
    );
  }
}
