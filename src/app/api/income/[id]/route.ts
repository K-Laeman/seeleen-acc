import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calculatePlatformFee } from "@/lib/utils";
import { logger } from "@/lib/logger";

const updateIncomeSchema = z.object({
  amount: z.number().positive().optional(),
  source: z.enum(["OFFLINE_STORE", "GRAB_FOOD", "LINE_MAN"]).optional(),
  description: z.string().optional(),
  date: z.string().optional(),
});

// GET - Get single income
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const income = await prisma.income.findUnique({
      where: { id },
      include: {
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            blobUrl: true,
          },
        },
      },
    });

    if (!income) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 });
    }

    return NextResponse.json(income);
  } catch (error) {
    console.error("Error fetching income:", error);
    return NextResponse.json(
      { error: "Failed to fetch income" },
      { status: 500 }
    );
  }
}

// PUT - Update income
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateIncomeSchema.parse(body);

    const existing = await prisma.income.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 });
    }

    const amount = validated.amount ?? existing.amount;
    const source = validated.source ?? existing.source;

    let platformFee = null;
    let platformFeeRate = null;
    let netAmount = amount;

    if (source === "GRAB_FOOD" || source === "LINE_MAN") {
      const feeInfo = calculatePlatformFee(amount, source);
      platformFee = feeInfo.fee;
      platformFeeRate = feeInfo.rate;
      netAmount = feeInfo.netAmount;
    }

    const income = await prisma.income.update({
      where: { id },
      data: {
        ...validated,
        date: validated.date ? new Date(validated.date) : undefined,
        platformFee,
        platformFeeRate,
        netAmount,
      },
    });

    return NextResponse.json(income);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error updating income:", error);
    return NextResponse.json(
      { error: "Failed to update income" },
      { status: 500 }
    );
  }
}

// DELETE - Delete income
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get income with attachments to clean up blob storage
    const income = await prisma.income.findUnique({
      where: { id },
      include: { attachments: true },
    });

    if (!income) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 });
    }

    // Delete blobs from Vercel Blob storage
    for (const attachment of income.attachments) {
      try {
        await del(attachment.blobUrl);
      } catch (blobError) {
        logger.warn("Failed to delete blob during income deletion", {
          incomeId: id,
          attachmentId: attachment.id,
          error: blobError,
        });
      }
    }

    // Delete income (cascades to attachments in DB)
    await prisma.income.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting income:", error);
    return NextResponse.json(
      { error: "Failed to delete income" },
      { status: 500 }
    );
  }
}
