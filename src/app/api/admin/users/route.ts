import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    phone: users.phone,
    role: users.role,
    loyaltyPoints: users.loyaltyPoints,
    isActive: users.isActive,
    createdAt: users.createdAt,
  }).from(users).orderBy(desc(users.createdAt));

  return NextResponse.json({ users: allUsers });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id, role, isActive } = await req.json();
  const updateData: Partial<typeof users.$inferInsert> = {};
  if (role !== undefined) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;

  await db.update(users).set(updateData).where(eq(users.id, id));
  return NextResponse.json({ success: true });
}
