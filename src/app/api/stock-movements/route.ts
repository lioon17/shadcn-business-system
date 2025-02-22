import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const stockMovements = await prisma.stock_movement.findMany({  // ✅ Corrected
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(stockMovements, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error fetching stock movements:", error.message);
    return NextResponse.json({ error: "Failed to fetch stock movements" }, { status: 500 });
  }
}
