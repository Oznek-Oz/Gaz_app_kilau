import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, orderStatusHistory, notifications, users, products, loyaltyTransactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { calculateLoyaltyPoints } from "@/lib/config";
import { APP_CONFIG } from "@/lib/config";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");

  if (orderNumber) {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    if (order.userId !== session.userId && session.role !== "admin" && session.role !== "delivery") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    const history = await db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, order.id));
    return NextResponse.json({ order, items, history });
  }

  const userOrders = await db.select().from(orders)
    .where(eq(orders.userId, session.userId))
    .orderBy(desc(orders.createdAt));

  return NextResponse.json({ orders: userOrders });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const body = await req.json();
    const { deliveryType, pickupPointId, deliveryAddress, deliveryQuarter, paymentMethod, items: cartItems, useLoyaltyPoints, notes } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    // Calculer les sous-totaux
    let subtotal = 0;
    for (const item of cartItems) {
      subtotal += item.price * item.quantity;
    }

    const deliveryFee = deliveryType === "home"
      ? APP_CONFIG.delivery.baseFee + APP_CONFIG.delivery.homeDeliveryFee
      : 0;

    // Vérifier les points fidélité
    let discountAmount = 0;
    let loyaltyPointsUsed = 0;
    if (useLoyaltyPoints) {
      const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
      const rewardSets = Math.floor((user?.loyaltyPoints || 0) / APP_CONFIG.loyalty.rewardThreshold);
      if (rewardSets > 0) {
        discountAmount = Math.min(rewardSets * APP_CONFIG.loyalty.rewardAmount, subtotal);
        loyaltyPointsUsed = Math.ceil(discountAmount / APP_CONFIG.loyalty.rewardAmount) * APP_CONFIG.loyalty.rewardThreshold;
      }
    }

    const total = subtotal + deliveryFee - discountAmount;
    const pointsEarned = calculateLoyaltyPoints(total);
    const orderNumber = generateOrderNumber();

    // Créer la commande
    const [order] = await db.insert(orders).values({
      orderNumber,
      userId: session.userId,
      deliveryType,
      pickupPointId,
      deliveryAddress,
      deliveryQuarter,
      subtotal,
      deliveryFee,
      discountAmount,
      total,
      paymentMethod,
      loyaltyPointsEarned: pointsEarned,
      loyaltyPointsUsed,
      notes,
      status: "pending",
    }).returning();

    // Créer les lignes de commande + mettre à jour le stock
    for (const item of cartItems) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: item.id,
        productName: item.name,
        productPrice: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      });
      // Décrémenter le stock
      const [prod] = await db.select().from(products).where(eq(products.id, item.id)).limit(1);
      if (prod) {
        await db.update(products).set({ stock: Math.max(0, prod.stock - item.quantity) }).where(eq(products.id, item.id));
      }
    }

    // Historique statut
    await db.insert(orderStatusHistory).values({
      orderId: order.id,
      status: "pending",
      note: "Commande créée",
      changedBy: session.userId,
    });

    // Mettre à jour les points fidélité
    if (loyaltyPointsUsed > 0 || pointsEarned > 0) {
      const netPoints = pointsEarned - loyaltyPointsUsed;
      await db.update(users).set({
        loyaltyPoints: Math.max(0, netPoints),
      }).where(eq(users.id, session.userId));

      if (loyaltyPointsUsed > 0) {
        await db.insert(loyaltyTransactions).values({
          userId: session.userId,
          orderId: order.id,
          type: "redeem",
          points: -loyaltyPointsUsed,
          description: `Réduction utilisée - Commande ${orderNumber}`,
        });
      }
      if (pointsEarned > 0) {
        await db.insert(loyaltyTransactions).values({
          userId: session.userId,
          orderId: order.id,
          type: "earn",
          points: pointsEarned,
          description: `Points gagnés - Commande ${orderNumber}`,
        });
      }
    }

    // Notification client
    await db.insert(notifications).values({
      userId: session.userId,
      title: "Commande reçue !",
      message: `Votre commande ${orderNumber} a été reçue. Nous la confirmons très bientôt.`,
      type: "order",
      relatedOrderId: order.id,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json({ error: "Erreur lors de la création de la commande" }, { status: 500 });
  }
}
