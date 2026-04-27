import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

const databaseUrl =
  process.env.WILDLIFE_TRACKER_NEON_DATABASE_URL ||
  process.env.WILDFILM_TRACKER_NEON_DATABASE_URL ||
  process.env.WILDFILMS_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Database URL is missing. Set WILDLIFE_TRACKER_NEON_DATABASE_URL or DATABASE_URL.",
  );
}

const pool = new Pool({
  connectionString: databaseUrl,
});

export const db = drizzle(pool, { schema });
