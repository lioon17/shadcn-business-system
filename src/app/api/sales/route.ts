import { NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket, ResultSetHeader, PoolConnection, Pool } from "mysql2/promise";

// Define interfaces for our data structures
interface SaleRow extends RowDataPacket {
  id: number;
  productId: number;
  product_name: string | null;
  quantity: number;
  price: number;
  total: number;
  date: Date;
}

interface FormattedSale {
  id: number;
  productId: number;
  product: { name: string };
  quantity: number;
  price: number;
  total: number;
  date: Date;
}

interface ProductRow extends RowDataPacket {
  stock: number;
}

// ✅ Define SaleInput Interface
interface SaleInput {
  date: string;
  productId: number;
  quantity: number;
  price: number;
  total: number; // ✅ Ensure total is included
}
/**
 * 🔹 GET: Fetch All Sales
 */
export async function GET() {
  try {
    const [sales] = await db.execute<SaleRow[]>(
      `SELECT s.*, p.name AS product_name 
       FROM sale s
       LEFT JOIN product p ON s.productId = p.id
       ORDER BY s.date DESC`
    );

    const formattedSales: FormattedSale[] = sales.map((sale) => ({
      id: sale.id,
      productId: sale.productId,
      product: { name: sale.product_name || "Unknown Product" },
      quantity: sale.quantity,
      price: parseFloat(sale.price.toString()),
      total: parseFloat(sale.total.toString()),
      date: new Date(new Date(sale.date + "Z").toLocaleString("en-US", { timeZone: "Africa/Nairobi" })), // ✅ Fix timezone shift
    }));
    

    return NextResponse.json(formattedSales, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching sales:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Sale ID is required" }, { status: 400 });
    }

    // 🔹 Delete sale by ID
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM sale WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Sale deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting sale:", error);
    return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 });
  }
}


export async function POST(request: Request) {
  let conn: PoolConnection | null = null;
  
  try {
    // ✅ Parse the request body
    const body = await request.json();
    console.log("📌 Received Payload:", body); // Debugging

    const { date, productId, quantity, price, total }: SaleInput = body;

    // ✅ Validate Required Fields
    if (!date || !productId || quantity <= 0 || price <= 0 || total <= 0) {
      return NextResponse.json(
        { error: "Invalid input. Ensure all fields are provided correctly." },
        { status: 400 }
      );
    }

    // ✅ Check if product exists and fetch stock
    const [productRows] = await db.execute<ProductRow[]>(
      "SELECT stock FROM product WHERE id = ?",
      [productId]
    );

    if (!productRows || productRows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productStock = productRows[0].stock;

    // ✅ Check if Stock is Sufficient
    if (productStock < quantity) {
      return NextResponse.json(
        { error: `Insufficient stock. Available: ${productStock}` },
        { status: 400 }
      );
    }

    // ✅ Start Database Transaction
    conn = await (db as Pool).getConnection();
    await conn.beginTransaction();

    // ✅ Insert Sale Record (Now Using the Discounted `total`)
    const [saleResult] = await conn.execute<ResultSetHeader>(
      "INSERT INTO sale (date, productId, quantity, price, total) VALUES (?, ?, ?, ?, ?)",
      [new Date(date), productId, quantity, price, total]  // ✅ Now stores the correct total
    );

    // ✅ Reduce Stock in Product Table
    await conn.execute<ResultSetHeader>(
      "UPDATE product SET stock = stock - ? WHERE id = ?",
      [quantity, productId]
    );

    // ✅ Insert Stock Movement Log
    await conn.execute<ResultSetHeader>(
      "INSERT INTO migrations (productId, quantity, type, date) VALUES (?, ?, 'OUT', ?)",
      [productId, quantity, new Date(date)]
    );

    // ✅ Commit Transaction
    await conn.commit();

    return NextResponse.json(
      { message: "Sale created successfully", saleId: saleResult.insertId },
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