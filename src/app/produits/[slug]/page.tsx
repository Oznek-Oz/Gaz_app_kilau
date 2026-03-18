import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./ProductDetailClient";

async function getProduct(slug: string) {
  const [product] = await db
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
      category: { id: categories.id, name: categories.name, slug: categories.slug },
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);
  return product;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
