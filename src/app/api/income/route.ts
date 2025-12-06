import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  calculatePlatformFee,
  incomeQuerySchema,
  validateQueryParams,
} from "@/lib/utils";

const incomeSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  source: z.enum(["OFFLINE_STORE", "GRAB_FOOD", "LINE_MAN"]),
  description: z.string().max(500, "Description too long").optional(),
  date: z.string().optional(),
});

// GET - List all income with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const validation = validateQueryParams(searchParams, incomeQuerySchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { source, startDate, endDate, page, limit } = validation.data;

    // Pagination
    const pageNum = Math.max(1, parseInt(page || "1"));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || "50")));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};

    if (source) {
      where.source = source;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        (where.date as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.date as Record<string, Date>).lte = new Date(endDate);
      }
    }

    const [incomes, total] = await Promise.all([
      prisma.income.findMany({
        where,
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
        orderBy: { date: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.income.count({ where }),
    ]);

    return NextResponse.json({
      data: incomes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching income:", error);
    return NextResponse.json(
      { error: "Failed to fetch income" },
      { status: 500 }
    );
  }
}

// POST - Create new income
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = incomeSchema.parse(body);

    let platformFee = null;
    let platformFeeRate = null;
    let netAmount = validated.amount;

    // Calculate platform fees for delivery apps
    if (validated.source === "GRAB_FOOD" || validated.source === "LINE_MAN") {
      const feeInfo = calculatePlatformFee(validated.amount, validated.source);
      platformFee = feeInfo.fee;
      platformFeeRate = feeInfo.rate;
      netAmount = feeInfo.netAmount;
    }

    const income = await prisma.income.create({
      data: {
        amount: validated.amount,
        source: validated.source,
        description: validated.description,
        date: validated.date ? new Date(validated.date) : new Date(),
        platformFee,
        platformFeeRate,
        netAmount,
      },
    });

    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating income:", error);
    return NextResponse.json(
      { error: "Failed to create income" },
      { status: 500 }
    );
  }
}
