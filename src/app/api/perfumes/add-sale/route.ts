/* eslint-disable */
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { ResultSetHeader, RowDataPacket, PoolConnection, Pool } from "mysql2/promise";

// ✅ Define Input Type for Sale
interface SaleInput {
  perfumeId: number;
  bottleSize: "3ml" | "6ml";
  quantity: number;
}

/**
 * 🔹 POST: Record a Perfume Sale
 */export async function POST(request: Request) {
  let conn: PoolConnection | null = null;

  try {
    const body: { perfumeId: number; bottleSize: "3ml" | "6ml"; quantity: number; date?: string } = await request.json();
    const { perfumeId, bottleSize, quantity, date } = body;

    if (!perfumeId || !bottleSize || quantity <= 0) {
      return NextResponse.json(
        { error: "Invalid input. Ensure all fields are provided correctly." },
        { status: 400 }
      );
    }

    const quantityMl = bottleSize === "3ml" ? 3 * quantity : 6 * quantity;

    // ✅ Fetch stock and price
    const [perfumeRows] = await db.execute<RowDataPacket[]>(
      "SELECT stock, price FROM perfumes WHERE id = ?",
      [perfumeId]
    );

    if (perfumeRows.length === 0) {
      return NextResponse.json({ error: "Perfume not found" }, { status: 404 });
    }

    const perfume = perfumeRows[0] as { stock: number; price: number };

    if (perfume.stock < quantityMl) {
      return NextResponse.json(
        { error: `Insufficient stock. Available: ${perfume.stock} ml` },
        { status: 400 }
      );
    }

    // ✅ Calculate total sale price
    const pricePerMl = perfume.price / 100;
    const unitPrice = bottleSize === "3ml" ? pricePerMl * 3 : pricePerMl * 6;
    const totalPrice = unitPrice * quantity;

    conn = await (db as Pool).getConnection();
    await conn.beginTransaction();

    // ✅ Insert sale with custom date (or use NOW() if not provided)
    const saleDate = date ? new Date(date) : new Date();
    const [saleResult] = await conn.execute<ResultSetHeader>(
      "INSERT INTO perfume_sales (perfumeId, quantityMl, bottleSize, totalPrice, date) VALUES (?, ?, ?, ?, ?)",
      [perfumeId, quantityMl, bottleSize, totalPrice, saleDate]
    );

    // ✅ Deduct stock
    await conn.execute<ResultSetHeader>(
      `UPDATE perfumes 
       SET stock = stock - ?, 
           status = CASE 
                      WHEN stock - ? > 50 THEN 'In Stock' 
                      WHEN stock - ? > 0 THEN 'Low Stock' 
                      ELSE 'Out of Stock' 
                    END, 
           lastUpdated = NOW() 
       WHERE id = ?`,
      [quantityMl, quantityMl, quantityMl, perfumeId]
    );

    // ✅ Log Stock Movement
    await conn.execute<ResultSetHeader>(
      "INSERT INTO perfume_migrations (perfumeId, quantityMl, type, date) VALUES (?, ?, 'OUT', ?)",
      [perfumeId, quantityMl, saleDate]
    );

    await conn.commit();

    return NextResponse.json(
      { message: "Sale recorded successfully", saleId: saleResult.insertId },
      { status: 201 }
    );
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("❌ Error creating sale:", error);
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}