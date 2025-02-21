import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 🔹 GET: Fetch all products
 */
export async function GET() {
  try {
    const products = await prisma.inventory.findMany();
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 });
  }
}

/**
 * 🔹 POST: Add a new product
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Validation: Ensure required fields exist
    if (!body.name || !body.category || body.price === undefined || body.stock === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const product = await prisma.inventory.create({
      data: {
        name: body.name,
        category: body.category,
        price: parseFloat(body.price),
        stock: parseInt(body.stock),
        supplier: body.supplier || "N/A",
        status: body.stock > 0 ? "In Stock" : "Out of Stock",
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json({ error: "Error adding product" }, { status: 500 });
  }
}

/**
 * 🔹 PUT: Update a product
 * ✅ Requires `{ params: { id: string } }`
 */
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const body = await req.json();

    const updatedProduct = await prisma.inventory.update({
      where: { id: Number(id) },
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
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Error updating product" }, { status: 500 });
  }
}
