import { NextResponse } from "next/server";
import db from "@/lib/db"; // ✅ Import MySQL connection

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity } = body;

    // 🔹 Validate input
    if (!productId || isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // 🔹 Check if product exists
    const [productRows]: any = await db.execute("SELECT * FROM product WHERE id = ?", [productId]);
    if (!productRows || productRows.length === 0) {  // ✅ Fix: Correct way to check if rows exist
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 🔹 Update product stock
    await db.execute("UPDATE product SET stock = stock + ? WHERE id = ?", [quantity, productId]);

    // 🔹 Log Stock Movement
    await db.execute("INSERT INTO migrations (productId, quantity, type, date) VALUES (?, ?, 'IN', NOW())", [
      productId,
      quantity,
    ]);

    return NextResponse.json({ message: "Stock updated successfully" }, { status: 201 });
  } catch (error) {
    console.error("❌ Error updating stock:", error);
    return NextResponse.json({ error: "Error updating stock" }, { status: 500 });
  }
}
