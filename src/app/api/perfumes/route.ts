import { NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

// ✅ Define PerfumeRow Interface
interface PerfumeRow extends RowDataPacket {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  supplier: string;
  status: string;
  stockMl: number;
  lastUpdated: string;
}

/**
 * 🔹 GET: Fetch All Perfumes
 */
export async function GET() {
  try {
    const [perfumes] = await db.execute<PerfumeRow[]>(`
      SELECT * FROM perfumes ORDER BY lastUpdated DESC
    `);

    return NextResponse.json(perfumes, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching perfumes:", error);
    return NextResponse.json({ error: "Failed to fetch perfumes" }, { status: 500 });
  }
}
