import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { ResultSetHeader, FieldPacket } from "mysql2";

/**
 * 🔹 PUT: Update a product in the inventory
 */
export async function PUT(request: NextRequest) {
  try {
    // Extract ID from the request URL
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop(); // Get the last part of the URL

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Get request body
    const body = await request.json();

    console.log("📌 Updating product with ID:", productId, "New Data:", body); // ✅ Debugging

    // Ensure at least one field is provided for update
    if (!body.name && !body.category && !body.price && body.stock === undefined && !body.supplier) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // Update the product in the database
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
        body.name,
        body.category,
        body.price !== undefined ? parseFloat(body.price) : null,
        body.stock !== undefined ? parseInt(body.stock, 10) : null,
        body.supplier || "N/A",
        body.stock !== undefined ? parseInt(body.stock, 10) : null,
        productId,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Extract ID from the request URL
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop(); // Get the last part of the URL

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // ✅ Correctly type the response
    const [result]: [ResultSetHeader, FieldPacket[]] = await db.execute(
      "DELETE FROM inventory WHERE id = ?",
      [productId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "✅ Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

  