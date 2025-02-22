import { NextResponse } from "next/server";
import db from "@/lib/db"; // ✅ Import MySQL connection

export async function GET() {
  try {
    const [stockMovements]: any = await db.execute(
      `SELECT sm.*, p.name AS product_name 
       FROM migrations sm
       LEFT JOIN product p ON sm.productId = p.id
       ORDER BY sm.date DESC`
    );

    const formattedStockMovements = stockMovements.map((movement: any) => ({
      id: movement.id,
      productId: movement.productId,
      product: { name: movement.product_name || "Unknown" }, // ✅ Ensure `product.name` is always defined
      quantity: movement.quantity,
      type: movement.type,
      date: movement.date,
    }));

    return NextResponse.json(formattedStockMovements, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching stock movements:", error);
    return NextResponse.json({ error: "Failed to fetch stock movements" }, { status: 500 });
  }
}

