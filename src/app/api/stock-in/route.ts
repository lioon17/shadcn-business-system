import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || !quantity) {
      return NextResponse.json({ error: "Product ID and quantity are required" }, { status: 400 });
    }

    // 🔹 Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 🔹 Update product stock
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: quantity } }, // 🔹 Increase stock
    });

    // 🔹 Log Stock Movement in "migrations" table (previously stock_movement)
    await prisma.migrations.create({
      data: {
        productId,
        quantity,
        type: "IN",
      },
    });

    return NextResponse.json({ message: "Stock updated successfully" }, { status: 201 });
  } catch (error) {
    console.error("❌ Error adding stock:", error);
    return NextResponse.json({ error: "Error updating stock" }, { status: 500 });
  }
}
