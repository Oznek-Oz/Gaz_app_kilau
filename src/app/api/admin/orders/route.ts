import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, orderStatusHistory, notifications, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { APP_CONFIG } from "@/lib/config";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "delivery")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const allOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      deliveryType: orders.deliveryType,
      total: orders.total,
      paymentMethod: orders.paymentMethod,
      paymentStatus: orders.paymentStatus,
      createdAt: orders.createdAt,
      customerName: users.name,
      customerPhone: users.phone,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));

  return NextResponse.json({ orders: allOrders });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "delivery")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { orderId, status, note, deliveryPersonId, paymentStatus } = await req.json();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const updateData: Partial<typeof orders.$inferInsert> = {};
  if (status) updateData.status = status;
  if (paymentStatus) updateData.paymentStatus = paymentStatus;
  if (deliveryPersonId) updateData.deliveryPersonId = deliveryPersonId;

  await db.update(orders).set(updateData).where(eq(orders.id, orderId));

  if (status) {
    await db.insert(orderStatusHistory).values({
      orderId,
      status,
      note: note || null,
      changedBy: session.userId,
    });

    // Notifier le client
    const statusInfo = (APP_CONFIG.orderStatuses as Record<string, { label: string; description: string }>)[status];
    if (statusInfo) {
      await db.insert(notifications).values({
        userId: order.userId,
        title: `Commande ${order.orderNumber} - ${statusInfo.label}`,
        message: statusInfo.description,
        type: "order",
        relatedOrderId: orderId,
      });
    }
  }

  return NextResponse.json({ success: true });
}
