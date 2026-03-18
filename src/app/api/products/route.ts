import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, and, like } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");

    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        stock: products.stock,
        unit: products.unit,
        weight: products.weight,
        imageUrl: products.imageUrl,
        isFeatured: products.isFeatured,
        isActive: products.isActive,
        categoryId: products.categoryId,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.isActive, true),
          eq(categories.isActive, true),
          categorySlug ? eq(categories.slug, categorySlug) : undefined,
          featured === "true" ? eq(products.isFeatured, true) : undefined,
          search ? like(products.name, `%${search}%`) : undefined,
        )
      );

    return NextResponse.json({ products: allProducts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
