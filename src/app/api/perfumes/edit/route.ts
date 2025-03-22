import { NextResponse } from "next/server";
import db from "@/lib/db";
import { ResultSetHeader, PoolConnection, Pool } from "mysql2/promise";

// ✅ Define Input Type for Editing Perfume
interface EditPerfumeInput {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  stockMl: number;
  supplier: string;
  status: string;
}

/**
 * 🔹 PUT: Edit Perfume Details
 */
export async function PUT(request: Request) {
  let conn: PoolConnection | null = null;

  try {
    // ✅ Parse request body
    const body: EditPerfumeInput = await request.json();
    console.log("📌 Received Edit Payload:", body);

    const { id, name, category, brand, price, stockMl, supplier, status } = body;

    // ✅ Validate Required Fields
    if (!id || !name || !category || !brand || !price || !supplier || !status) {
      return NextResponse.json(
        { error: "Invalid input. Ensure all fields are provided correctly." },
        { status: 400 }
      );
    }

    // ✅ Start Transaction
    conn = await (db as Pool).getConnection();
    await conn.beginTransaction();

    // ✅ Update Perfume Record
    const [updateResult] = await conn.execute<ResultSetHeader>(
      `UPDATE perfumes 
       SET name = ?, 
           category = ?, 
           brand = ?, 
           price = ?, 
           stockMl = ?, 
           supplier = ?, 
           status = ?, 
           lastUpdated = NOW()
       WHERE id = ?`,
      [name, category, brand, price, stockMl, supplier, status, id]
    );

    await conn.commit();

    if (updateResult.affectedRows === 0) {
      return NextResponse.json({ error: "Perfume not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Perfume updated successfully" }, { status: 200 });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("❌ Error updating perfume:", error);
    return NextResponse.json({ error: "Failed to update perfume" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
