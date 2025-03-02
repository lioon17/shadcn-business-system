import { NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

/**
 * 🔹 GET: Fetch total worth of available stock
 */
export async function GET() {
  try {
    // 🔹 Calculate total worth by multiplying price * stock
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT SUM(price * stock) AS total_stock_worth FROM product`
    );

    // 🔹 Ensure a valid response
    const totalWorth = rows[0]?.total_stock_worth ?? 0; // ✅ Default to 0 if null

    return NextResponse.json({ total_stock_worth: Number(totalWorth) }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching total stock worth:", error);
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
  }
}
