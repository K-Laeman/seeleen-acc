import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { expenseQuerySchema, validateQueryParams } from "@/lib/utils";

const expenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  category: z.enum([
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
  ]),
  description: z.string().max(500, "Description too long").optional(),
  date: z.string().optional(),
});

// GET - List all expenses with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const validation = validateQueryParams(searchParams, expenseQuerySchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { category, startDate, endDate, page, limit } = validation.data;

    // Pagination
    const pageNum = Math.max(1, parseInt(page || "1"));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || "50")));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
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

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
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
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json({
      data: expenses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// POST - Create new expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = expenseSchema.parse(body);

    const expense = await prisma.expense.create({
      data: {
        amount: validated.amount,
        category: validated.category,
        description: validated.description,
        date: validated.date ? new Date(validated.date) : new Date(),
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
