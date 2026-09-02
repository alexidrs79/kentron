import { mkdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

const dataDir = path.join(process.cwd(), ".data", "kentron");

const globalForDb = globalThis as unknown as {
  kentronPglite?: PGlite;
};

function getClient() {
  if (!globalForDb.kentronPglite) {
    mkdirSync(dataDir, { recursive: true });
    globalForDb.kentronPglite = new PGlite(dataDir);
  }
  return globalForDb.kentronPglite;
}

export const db = drizzle(getClient(), { schema });
export type Database = typeof db;
