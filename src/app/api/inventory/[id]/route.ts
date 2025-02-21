import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 🔹 PUT: Update a product
 */
export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const body = await req.json();

    console.log("📌 Updating product with ID:", productId, "New Data:", body); // ✅ Debugging

    const updatedProduct = await prisma.inventory.update({
      where: { id: productId },
      data: {
        name: body.name,
        category: body.category,
        price: parseFloat(body.price),
        stock: parseInt(body.stock),
        supplier: body.supplier || "N/A",
        status: body.stock > 0 ? "In Stock" : "Out of Stock",
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

/**
 * 🔹 DELETE: Remove a product
 */
export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    await prisma.inventory.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: "✅ Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
