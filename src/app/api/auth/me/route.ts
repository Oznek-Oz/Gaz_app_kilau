import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
      address: user.address,
      quarter: user.quarter,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { name, phone, address, quarter } = await req.json();
  await db.update(users).set({
    ...(name && { name }),
    ...(phone && { phone }),
    address: address || null,
    quarter: quarter || null,
    updatedAt: new Date(),
  }).where(eq(users.id, session.userId));

  return NextResponse.json({ success: true });
}
