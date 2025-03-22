import { NextResponse } from "next/server";
import db from "@/lib/db"; // Make sure this path is correct
import { RowDataPacket } from "mysql2/promise";

// ✅ Define Sale Interface
interface PerfumeSaleRow extends RowDataPacket {
  id: number;
  perfumeId: number;
  perfume_name: string | null;
  quantityMl: number;
  bottleSize: "3ml" | "6ml";
  totalPrice: number;
  date: string;
}

// ✅ GET: Fetch all sales
export async function GET() {
  try {
    const [sales] = await db.execute<PerfumeSaleRow[]>(`
      SELECT ps.*, p.name AS perfume_name 
      FROM perfume_sales ps
      LEFT JOIN perfumes p ON ps.perfumeId = p.id
      ORDER BY ps.date DESC
    `);

    // ✅ Format sales data
    const formattedSales = sales.map((sale) => ({
      id: sale.id,
      perfumeId: sale.perfumeId,
      perfume: { name: sale.perfume_name || "Unknown" },
      quantityMl: sale.quantityMl,
      bottleSize: sale.bottleSize,
      totalPrice: parseFloat(sale.totalPrice.toString()),
      date: new Date(sale.date),
    }));

    return NextResponse.json(formattedSales, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching sales:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}
