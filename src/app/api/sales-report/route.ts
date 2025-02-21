import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 🔹 GET: Fetch Monthly Sales Report for a Given Year (Aggregated)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");

    if (!year || isNaN(Number(year))) {
      return NextResponse.json({ error: "Valid year is required" }, { status: 400 });
    }

    const salesData = await prisma.sale.groupBy({
      by: ["date"],
      _sum: { total: true },
      where: {
        date: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lte: new Date(`${year}-12-31T23:59:59.999Z`),
        },
      },
      orderBy: { date: "asc" },
    });

    // Convert dates into month names
    const formattedData = salesData.map((sale) => ({
      month: new Date(sale.date).toLocaleString("en-US", { month: "long" }),
      total_sales: sale._sum.total || 0,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching sales report:", error);
    return NextResponse.json({ error: "Failed to fetch sales report" }, { status: 500 });
  }
}
