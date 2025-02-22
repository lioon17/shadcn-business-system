// sales-report/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

interface MonthlySales extends RowDataPacket {
  month: number;
  total_sales: number;
}

interface FormattedMonthlySales {
  month: string;
  total_sales: number;
}

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

    // 🔹 SQL Query to aggregate total sales per month
    const [salesData] = await db.execute<MonthlySales[]>(
      `
      SELECT
        MONTH(date) AS month,
        SUM(total) AS total_sales
      FROM sale
      WHERE YEAR(date) = ?
      GROUP BY MONTH(date)
      ORDER BY MONTH(date) ASC
      `,
      [year]
    );

    // 🔹 Convert month numbers into month names
    const formattedData: FormattedMonthlySales[] = salesData.map((item) => ({
      month: new Date(Number(year), item.month - 1).toLocaleString("en-US", { month: "long" }),
      total_sales: item.total_sales,
    }));

    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching sales report:", error);
    return NextResponse.json({ error: "Failed to fetch sales report" }, { status: 500 });
  }
}
