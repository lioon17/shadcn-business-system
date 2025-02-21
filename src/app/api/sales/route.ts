import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 🔹 GET: Fetch All Sales
 */
export async function GET() {
    try {
      const sales = await prisma.sale.findMany({
        include: { product: true }, // ✅ Ensure product data is included
        orderBy: { date: "desc" },
      });
  
      console.log("📌 Sales Data from DB:", sales); // Debugging
  
      return NextResponse.json(sales);
    } catch (error) {
      console.error("❌ Error fetching sales:", error);
      return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
    }
  }
  

/**
 * 🔹 DELETE: Remove a Sale by ID
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Sale ID is required" }, { status: 400 });
    }

    await prisma.sale.delete({ where: { id } });

    return NextResponse.json({ message: "Sale deleted successfully" });
  } catch (error) {
    console.error("Error deleting sale:", error);
    return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 });
  }
}




export async function POST(request: Request) {
  try {
    // 🔹 Parse the request body
    const body = await request.json();
    console.log("📌 Received Payload:", body); // Debugging

    const { date, productId, quantity, price } = body;

    // 🔹 Validate required fields
    if (!date || !productId || quantity <= 0 || price <= 0) {
      return NextResponse.json(
        { error: "Invalid input. Ensure all fields are provided correctly." },
        { status: 400 }
      );
    }

    // 🔹 Validate if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 🔹 Check if there is enough stock
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock available" },
        { status: 400 }
      );
    }

    // 🔹 Calculate total price
    const total = quantity * price;

    // 🔹 Begin database transaction
    const transaction = await prisma.$transaction([
      // 🔹 Create a new sale record
      prisma.sale.create({
        data: {
          date: new Date(date), // Ensure date is stored correctly
          productId,
          quantity,
          price,
          total,
        },
      }),
      
      // 🔹 Reduce stock from the product
      prisma.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } }, // Deduct stock
      }),

      // 🔹 Create a stock movement record
      prisma.stockMovement.create({
        data: {
          productId,
          quantity,
          type: "OUT", // Indicates stock reduction
          date: new Date(date),
        },
      }),
    ]);

    console.log("✅ Sale Created and Stock Updated:", transaction);

    return NextResponse.json(transaction[0], { status: 201 });
  } catch (error: unknown) {
    console.error("❌ Error creating sale:", error);
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 });
  }
}



