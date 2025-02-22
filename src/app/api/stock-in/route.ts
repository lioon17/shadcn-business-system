
// stock-in/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

interface ProductRow extends RowDataPacket {
  id: number;
  name: string;
  stock: number;
}

interface StockInInput {
  productId: number;
  quantity: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity }: StockInInput = body;

    // 🔹 Validate input
    if (!productId || isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // 🔹 Check if product exists
    const [productRows] = await db.execute<ProductRow[]>(
      "SELECT * FROM product WHERE id = ?",
      [productId]
    );
    
    if (!productRows || productRows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 🔹 Update product stock
    await db.execute<ResultSetHeader>(
      "UPDATE product SET stock = stock + ? WHERE id = ?",
      [quantity, productId]
    );

    // 🔹 Log Stock Movement
    await db.execute<ResultSetHeader>(
      "INSERT INTO migrations (productId, quantity, type, date) VALUES (?, ?, 'IN', NOW())",
      [productId, quantity]
    );

    return NextResponse.json({ message: "Stock updated successfully" }, { status: 201 });
  } catch (error) {
    console.error("❌ Error updating stock:", error);
    return NextResponse.json({ error: "Error updating stock" }, { status: 500 });
  }
}