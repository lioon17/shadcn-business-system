import { NextResponse } from "next/server";
import db from "@/lib/db";
import { Inventory } from "@/types/inventory";
import { ResultSetHeader } from "mysql2";

/**
 * 🔹 GET: Fetch all products in inventory
 */
export async function GET() {
    try {
      const [rows] = await db.execute("SELECT * FROM inventory"); // ✅ Extract only the rows
      const products = rows as Inventory[]; // ✅ Explicitly cast rows to Inventory[]
  
      // 🔹 Convert price to a number before sending the response
      const formattedProducts = products.map((product) => ({
        ...product,
        price: parseFloat(product.price.toString()), // ✅ Ensure `price` is a number
      }));
  
      return NextResponse.json(formattedProducts, { status: 200 });
    } catch (error) {
      console.error("❌ Error fetching inventory:", error);
      return NextResponse.json({ error: "Error fetching inventory" }, { status: 500 });
    }
  }
  


export async function POST(req: Request) {
  try {
    const body: Partial<Inventory> = await req.json();

    // ✅ Validation: Ensure required fields exist
    if (!body.name || !body.category || body.price === undefined || body.stock === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ Correctly extract the `ResultSetHeader` from `db.execute()`
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO inventory (name, category, price, stock, supplier, status, lastUpdated) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [
        body.name,
        body.category,
        parseFloat(body.price.toString()),
        parseInt(body.stock.toString()),
        body.supplier || "N/A",
        body.stock > 0 ? "In Stock" : "Out of Stock",
      ]
    );

    return NextResponse.json({ id: result.insertId, message: "Product added successfully" }, { status: 201 });
  } catch (error) {
    console.error("❌ Error adding product:", error);
    return NextResponse.json({ error: "Error adding product" }, { status: 500 });
  }
}

  


export async function PUT(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
  
      if (!id) {
        return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
      }
  
      const body: Partial<Inventory> = await req.json(); // ✅ Ensure proper typing
  
      // ✅ Validate at least one field for update
      if (!body.name && !body.category && body.price === undefined && body.stock === undefined && !body.supplier) {
        return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
      }
      const [result] = await db.execute<ResultSetHeader>(
        `UPDATE inventory 
         SET 
           name = COALESCE(?, name), 
           category = COALESCE(?, category), 
           price = COALESCE(?, price), 
           stock = COALESCE(?, stock), 
           supplier = COALESCE(?, supplier), 
           status = CASE WHEN COALESCE(?, stock) > 0 THEN 'In Stock' ELSE 'Out of Stock' END, 
           lastUpdated = NOW()
         WHERE id = ?`,
        [
          body.name || null,
          body.category || null,
          body.price !== undefined ? parseFloat(body.price.toString()) : null,
          body.stock !== undefined ? parseInt(body.stock.toString()) : null,
          body.supplier || "N/A",
          body.stock !== undefined ? parseInt(body.stock.toString()) : null,
          id,
        ]
      );
  
      if (result.affectedRows === 0) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
  
      return NextResponse.json({ message: "Product updated successfully" }, { status: 200 });
    } catch (error) {
      console.error("❌ Error updating product:", error);
      return NextResponse.json({ error: "Error updating product" }, { status: 500 });
    }
  }
  
  