import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Film submissions from filmmakers
export const filmSubmissions = pgTable("film_submissions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  // Film details
  title: text("title").notNull(),
  year: text("year").notNull(),
  synopsis: text("synopsis").notNull(),
  runtime: text("runtime"),
  // Categories and regions
  category: text("category").notNull(),
  regions: text("regions").notNull(), // Comma-separated regions
  species: text("species"), // Comma-separated species featured
  // Media
  posterUrl: text("poster_url"),
  trailerUrl: text("trailer_url"),
  watchUrl: text("watch_url").notNull(), // Where to watch (YouTube, Vimeo, etc.)
  // Availability/Revenue
  availabilityTypes: text("availability_types"), // Comma-separated: free, rent, buy, stream
  streamingService: text("streaming_service"), // Name of streaming service if available
  // Filmmaker info
  filmmakerName: text("filmmaker_name").notNull(),
  filmmakerEmail: text("filmmaker_email").notNull(),
  organization: text("organization"),
  // Rights and licensing
  hasRights: boolean("has_rights").notNull().default(false),
  licenseType: text("license_type"), // e.g., "Creative Commons", "Full Rights", etc.
  // Status
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
});

export const insertFilmSubmissionSchema = createInsertSchema(filmSubmissions).omit({
  id: true,
  status: true,
  submittedAt: true,
  reviewedAt: true,
  reviewNotes: true,
});

export type InsertFilmSubmission = z.infer<typeof insertFilmSubmissionSchema>;
export type FilmSubmission = typeof filmSubmissions.$inferSelect;
