import { NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket, FieldPacket } from "mysql2";


interface StockMovement {
  id: string;
  productId: string;
  product_name: string;
  quantity: number;
  type: "IN" | "OUT";
  date: string;
}

export async function GET() {
  try {
    // ✅ Correctly cast `db.execute()` response to `StockMovement[]`
    const [rows]: [RowDataPacket[], FieldPacket[]] = await db.execute(
      `SELECT sm.*, p.name AS product_name 
       FROM migrations sm
       LEFT JOIN product p ON sm.productId = p.id
       ORDER BY sm.date DESC`
    );

    // ✅ Ensure TypeScript knows `rows` is `StockMovement[]`
    const stockMovements: StockMovement[] = rows as StockMovement[];

    // ✅ Format response
    const formattedStockMovements = stockMovements.map((movement) => ({
      id: movement.id,
      productId: movement.productId,
      product: { name: movement.product_name || "Unknown" },
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
