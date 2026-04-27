import { defineConfig } from "drizzle-kit";

const databaseUrl =
  process.env.WILDLIFE_TRACKER_NEON_DATABASE_URL ||
  process.env.WILDFILM_TRACKER_NEON_DATABASE_URL ||
  process.env.WILDFILMS_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Set WILDLIFE_TRACKER_NEON_DATABASE_URL or DATABASE_URL before running drizzle-kit",
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
