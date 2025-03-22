import { NextResponse } from "next/server";
import db from "@/lib/db";
import { ResultSetHeader, PoolConnection, Pool } from "mysql2/promise";

/**
 * 🔹 DELETE: Delete a Perfume
 */
export async function DELETE(request: Request) {
  let conn: PoolConnection | null = null;

  try {
    // ✅ Parse Request Body
    const { id } = await request.json();
    console.log("📌 Received Delete Request for ID:", id);

    // ✅ Validate ID
    if (!id) {
      return NextResponse.json({ error: "Invalid input. Perfume ID is required." }, { status: 400 });
    }

    // ✅ Start Transaction
    conn = await (db as Pool).getConnection();
    await conn.beginTransaction();

    // ✅ Delete Perfume Record
    const [deleteResult] = await conn.execute<ResultSetHeader>(
      "DELETE FROM perfumes WHERE id = ?",
      [id]
    );

    await conn.commit();

    if (deleteResult.affectedRows === 0) {
      return NextResponse.json({ error: "Perfume not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Perfume deleted successfully" }, { status: 200 });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("❌ Error deleting perfume:", error);
    return NextResponse.json({ error: "Failed to delete perfume" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
