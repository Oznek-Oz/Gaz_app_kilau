import { createDatabase } from "@kilocode/app-builder-db";
import * as schema from "./schema";

export const db = createDatabase(schema);

let seeded = false;
export async function ensureSeeded() {
  if (seeded) return;
  const { seed } = await import("./seed");
  await seed();
  seeded = true;
}
