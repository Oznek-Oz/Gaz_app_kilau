import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { users, products, categories, orders, orderItems, orderStatusHistory, notifications, loyaltyTransactions, promotions } from "@/db/schema";

export async function POST() {
  try {
    const db = getDb();
    
    await db.delete(loyaltyTransactions);
    await db.delete(notifications);
    await db.delete(orderStatusHistory);
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(products);
    await db.delete(categories);
    await db.delete(users);

    return NextResponse.json({ success: true, message: "Toutes les données ont été supprimées" });
  } catch (error) {
    console.error("Clear DB error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
