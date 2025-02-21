import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const stockMovements = await prisma.stockmovement.findMany({
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(stockMovements)
  } catch (error) {
    console.error("Error fetching stock movements:", error)
    return NextResponse.json({ error: "Failed to fetch stock movements" }, { status: 500 })
  }
}

