import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";

const updateExpenseSchema = z.object({
  amount: z.number().positive().optional(),
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
  description: z.string().optional(),
  date: z.string().optional(),
});

// GET - Get single expense
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const expense = await prisma.expense.findUnique({
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

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    logger.error("Error fetching expense", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: "Failed to fetch expense" },
      { status: 500 }
    );
  }
}

// PUT - Update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateExpenseSchema.parse(body);

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...validated,
        date: validated.date ? new Date(validated.date) : undefined,
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    logger.error("Error updating expense", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

// DELETE - Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get expense with attachments to clean up blob storage
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { attachments: true },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Delete blobs from Vercel Blob storage
    for (const attachment of expense.attachments) {
      try {
        await del(attachment.blobUrl);
      } catch (blobError) {
        logger.warn("Failed to delete blob during expense deletion", {
          expenseId: id,
          attachmentId: attachment.id,
          error: blobError,
        });
      }
    }

    // Delete expense (cascades to attachments in DB)
    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting expense", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
