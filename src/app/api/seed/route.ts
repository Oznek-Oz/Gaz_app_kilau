import { NextResponse } from "next/server";
import { seed } from "@/db/seed";

export async function POST() {
  try {
    await seed();
    return NextResponse.json({ success: true, message: "Données initiales insérées" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors du seed" }, { status: 500 });
  }
}
