/* eslint-disable */
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { ResultSetHeader, RowDataPacket, PoolConnection, Pool } from "mysql2/promise";

// ✅ Define Input Type for Adding Stock
interface StockInput {
  perfumeId: number;
  stockMl: number;
}

/**
 * 🔹 POST: Add Stock to a Perfume
 */
export async function POST(request: Request) {
  let conn: PoolConnection | null = null;

  try {
    // ✅ Parse request body
    const body: StockInput = await request.json();
    console.log("📌 Received Payload:", body);

    const { perfumeId, stockMl } = body;

    // ✅ Validate Required Fields
    if (!perfumeId || stockMl <= 0) {
      return NextResponse.json(
        { error: "Invalid input. Provide a valid perfumeId and stockMl." },
        { status: 400 }
      );
    }

    // ✅ Check if perfume exists (use correct typing)
    const [perfumeRows] = await db.execute<RowDataPacket[]>(
      "SELECT stockMl FROM perfumes WHERE id = ?",
      [perfumeId]
    );

    if (perfumeRows.length === 0) {
      return NextResponse.json({ error: "Perfume not found" }, { status: 404 });
    }

    // ✅ Extract stock value
    const currentStock = perfumeRows[0] as { stockMl: number };

    // ✅ Start Transaction
    conn = await (db as Pool).getConnection();
    await conn.beginTransaction();

    // ✅ Update Stock in `inventory`
    await conn.execute<ResultSetHeader>(
      `UPDATE perfumes 
       SET stockMl = stockMl + ?, 
           status = CASE 
                      WHEN stockMl + ? > 50 THEN 'In Stock' 
                      WHEN stockMl + ? > 0 THEN 'Low Stock' 
                      ELSE 'Out of Stock' 
                    END, 
           lastUpdated = NOW() 
       WHERE id = ?`,
      [stockMl, stockMl, stockMl, perfumeId]
    );

    // ✅ Log Stock Movement in `migrations`
    await conn.execute<ResultSetHeader>(
      "INSERT INTO perfume_migrations (perfumeId, quantityMl, type, date) VALUES (?, ?, 'IN', NOW())",
      [perfumeId, stockMl]
    );

    // ✅ Commit Transaction
    await conn.commit();

    return NextResponse.json({ message: "Stock updated successfully" }, { status: 200 });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("❌ Error updating stock:", error);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
