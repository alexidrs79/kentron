import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const eventCategory = pgEnum("event_category", [
  "tech",
  "creative",
  "market",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  avatarId: text("avatar_id"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  organizerId: text("organizer_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: eventCategory("category").notNull(),
  imageUrl: text("image_url"),
  venueName: text("venue_name").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  isRecurringTemplate: boolean("is_recurring_template").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});

export const eventSaves = pgTable(
  "event_saves",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [unique("event_saves_user_event").on(table.userId, table.eventId)],
);

export const pulses = pgTable("pulses", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  avatarId: text("avatar_id"),
  caption: text("caption").notNull(),
  category: eventCategory("category").notNull(),
  imageUrl: text("image_url"),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  postedAt: timestamp("posted_at", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  confirmCount: integer("confirm_count").default(0).notNull(),
  lastConfirmedAt: timestamp("last_confirmed_at", { withTimezone: true }),
});

export const pulseConfirms = pgTable(
  "pulse_confirms",
  {
    id: text("id").primaryKey(),
    pulseId: text("pulse_id")
      .notNull()
      .references(() => pulses.id),
    sessionId: text("session_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [
    unique("pulse_confirms_pulse_session").on(table.pulseId, table.sessionId),
  ],
);
