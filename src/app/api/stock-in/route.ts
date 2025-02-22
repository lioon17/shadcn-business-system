import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity } = body;

    // 🔹 Validate input
    if (!productId || typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
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
      data: { stock: { increment: quantity } }, // ✅ Increase stock
    });

    // 🔹 Log Stock Movement
    await prisma.migrations.create({  // ✅ Use "migration" (model name), NOT "migrations"
        data: {
          productId,
          quantity,
          type: "IN",
          date: new Date(),
        },
      });
      

    return NextResponse.json(
      { message: "Stock updated successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error adding stock:", error);
    return NextResponse.json({ error: "Error updating stock" }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // ✅ Prevents memory leaks
  }
}
