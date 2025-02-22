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
   } catch (error: unknown) {  // ✅ Use 'unknown' instead of 'any'
    if (error instanceof Error) {
        console.error("❌ Error fetching stock movements:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
}
}