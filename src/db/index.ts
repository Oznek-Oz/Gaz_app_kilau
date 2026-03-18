import { createDatabase } from "@kilocode/app-builder-db";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

const dbUrl = process.env.DB_URL;
const dbToken = process.env.DB_TOKEN;

const isDbConfigured = !!(dbUrl && dbToken);

const dbInstance = isDbConfigured ? createDatabase(schema) : null;

export const db = dbInstance as SqliteRemoteDatabase<typeof schema>;

export function getDb() {
  if (!dbInstance) {
    throw new Error("Database not configured");
  }
  return dbInstance;
}

let seeded = false;
export async function ensureSeeded() {
  if (seeded || !dbInstance) return;
  const { seed } = await import("./seed");
  await seed();
  seeded = true;
}
