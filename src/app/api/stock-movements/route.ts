import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
      const migrations = await prisma.migrations.findMany({  // ✅ Use `migrations`
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
      });
  
      return NextResponse.json(migrations, { status: 200 });
    } catch (error) {
      console.error("❌ Error fetching migrations:", error);
      return NextResponse.json({ error: "Failed to fetch migrations" }, { status: 500 });
    }
  }
  