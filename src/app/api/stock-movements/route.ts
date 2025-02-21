import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const stockMovements = await prisma.StockMovement.findMany({
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
  } catch (error: unknown) {  // 👈 Fix applied: Use `unknown`
    if (error instanceof Error) {
      console.error("❌ Error fetching stock movements:", error.message);
    } else {
      console.error("❌ Unknown error occurred:", error);
    }
    return NextResponse.json({ error: "Failed to fetch stock movements" }, { status: 500 });
  }
}
