import { NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Define interfaces for our data structures
interface Product extends RowDataPacket {
  id: number;
  name: string;
  price: number;
}

interface ProductInput {
  name: string;
  price: number;
}

/** * 🔹 GET: Fetch All Products */
export async function GET() {
  try {
    const [products] = await db.execute<Product[]>("SELECT * FROM product");
    return NextResponse.json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, price }: ProductInput = body;

    if (!name || isNaN(price)) {
      return NextResponse.json({ error: "Valid name and price are required" }, { status: 400 });
    }

    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO product (name, price) VALUES (?, ?)",
      [name, price]
    );

    return NextResponse.json({ id: result.insertId, name, price }, { status: 201 });
  } catch (error) {
    console.error("❌ Error adding product:", error);
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const { name, price } = body;

    // ✅ Convert `undefined` to `null` so MySQL accepts it
    const safeName = name !== undefined ? name : null;
    const safePrice = price !== undefined ? parseFloat(price) : null;

    // ✅ Ensure at least one field is being updated
    if (safeName === null && safePrice === null) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // 🔹 Update query
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE product SET name = COALESCE(?, name), price = COALESCE(?, price) WHERE id = ?",
      [safeName, safePrice, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Product not found or no changes made" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM product WHERE id = ?", 
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}