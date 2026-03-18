import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, users, products } from "@/db/schema";
import { eq, count, sum, desc, gte } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Total commandes
  const [totalOrdersResult] = await db.select({ count: count() }).from(orders);
  const [todayOrdersResult] = await db.select({ count: count() }).from(orders).where(gte(orders.createdAt, today));

  // Revenue total
  const [revenueResult] = await db.select({ total: sum(orders.total) }).from(orders).where(eq(orders.status, "delivered"));

  // Commandes en attente
  const [pendingResult] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "pending"));
  const [confirmedResult] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "confirmed"));
  const [deliveringResult] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "out_for_delivery"));

  // Total clients
  const [clientsResult] = await db.select({ count: count() }).from(users).where(eq(users.role, "customer"));

  // Dernières commandes
  const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10);

  // Produits faibles en stock
  const lowStockProducts = await db.select().from(products).where(eq(products.isActive, true));
  const lowStock = lowStockProducts.filter((p) => p.stock <= 5);

  return NextResponse.json({
    stats: {
      totalOrders: totalOrdersResult.count,
      todayOrders: todayOrdersResult.count,
      revenue: revenueResult.total || 0,
      pendingOrders: pendingResult.count,
      confirmedOrders: confirmedResult.count,
      deliveringOrders: deliveringResult.count,
      totalClients: clientsResult.count,
    },
    recentOrders,
    lowStockProducts: lowStock,
  });
}
