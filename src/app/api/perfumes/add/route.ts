import { NextResponse } from "next/server";
import db from "@/lib/db";
import { ResultSetHeader, PoolConnection, Pool } from "mysql2/promise";

// ✅ Define Input Type for Adding Perfume
interface AddPerfumeInput {
  name: string;
  category: string;
  brand: string;
  price: number;
  stockMl: number;
  supplier: string;
  status?: string; // Optional (defaults to "In Stock")
}

/**
 * 🔹 POST: Add a New Perfume
 */
export async function POST(request: Request) {
  let conn: PoolConnection | null = null;

  try {
    // ✅ Parse request body
    const body: AddPerfumeInput = await request.json();
    console.log("📌 Received Add Perfume Payload:", body);

    const { name, category, brand, price, stockMl, supplier, status = "In Stock" } = body;

    // ✅ Validate Required Fields
    if (!name || !category || !brand || !price || !stockMl || !supplier) {
      return NextResponse.json(
        { error: "Invalid input. Ensure all fields are provided correctly." },
        { status: 400 }
      );
    }

    // ✅ Start Transaction
    conn = await (db as Pool).getConnection();
    await conn.beginTransaction();

    // ✅ Insert Perfume Record
    const [insertResult] = await conn.execute<ResultSetHeader>(
      `INSERT INTO perfumes (name, category, brand, price, stockMl, stock, supplier, status, lastUpdated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, category, brand, price, stockMl, stockMl, supplier, status]
    );

    await conn.commit();

    return NextResponse.json(
      { message: "Perfume added successfully", perfumeId: insertResult.insertId },
      { status: 201 }
    );
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("❌ Error adding perfume:", error);
    return NextResponse.json({ error: "Failed to add perfume" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
