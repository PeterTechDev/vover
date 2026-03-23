import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const mediaTypeEnum = pgEnum("media_type", ["movie", "tv"]);
export const friendshipStatusEnum = pgEnum("friendship_status", ["pending", "accepted", "rejected"]);
export const recommendationStatusEnum = pgEnum("recommendation_status", ["pending", "watched", "dismissed"]);

// ─── NextAuth required tables ─────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  // snake_case names required by @auth/drizzle-adapter DefaultPostgresAccountsTable
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (t) => ({
  pk: unique().on(t.provider, t.providerAccountId),
}));

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (t) => ({
  pk: unique().on(t.identifier, t.token),
}));

// ─── App Tables ───────────────────────────────────────────────────────────────

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  email: text("email"),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const watchlist = pgTable("watchlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  tmdbId: integer("tmdb_id").notNull(),
  mediaType: text("media_type", { enum: ["movie", "tv"] }).notNull(),
  title: text("title").notNull(),
  posterPath: text("poster_path"),
  addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
  recommendedBy: text("recommended_by").references(() => profiles.id),
}, (t) => ({
  unq: unique().on(t.userId, t.tmdbId, t.mediaType),
}));

export const watched = pgTable("watched", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  tmdbId: integer("tmdb_id").notNull(),
  mediaType: text("media_type", { enum: ["movie", "tv"] }).notNull(),
  title: text("title").notNull(),
  posterPath: text("poster_path"),
  rating: integer("rating"),
  note: text("note"),
  watchedAt: timestamp("watched_at", { withTimezone: true }).defaultNow().notNull(),
});

export const friendships = pgTable("friendships", {
  id: uuid("id").primaryKey().defaultRandom(),
  requesterId: text("requester_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  addresseeId: text("addressee_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["pending", "accepted", "rejected"] }).default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.requesterId, t.addresseeId),
}));

export const recommendations = pgTable("recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromUserId: text("from_user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  toUserId: text("to_user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  tmdbId: integer("tmdb_id").notNull(),
  mediaType: text("media_type", { enum: ["movie", "tv"] }).notNull(),
  title: text("title").notNull(),
  posterPath: text("poster_path"),
  note: text("note"),
  status: text("status", { enum: ["pending", "watched", "dismissed"] }).default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const inviteCodes = pgTable("invite_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }).unique(),
  code: text("code").notNull().unique(),
  uses: integer("uses").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sharedLists = pgTable("shared_lists", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdBy: text("created_by").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sharedListMembers = pgTable("shared_list_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  listId: uuid("list_id").notNull().references(() => sharedLists.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  invitedBy: text("invited_by").references(() => profiles.id, { onDelete: "set null" }),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.listId, t.userId),
}));

export const sharedListItems = pgTable("shared_list_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  listId: uuid("list_id").notNull().references(() => sharedLists.id, { onDelete: "cascade" }),
  addedBy: text("added_by").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  tmdbId: integer("tmdb_id").notNull(),
  mediaType: text("media_type", { enum: ["movie", "tv"] }).notNull(),
  title: text("title").notNull(),
  posterPath: text("poster_path"),
  addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.listId, t.tmdbId, t.mediaType),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type WatchlistItem = typeof watchlist.$inferSelect;
export type WatchedItem = typeof watched.$inferSelect;
export type Friendship = typeof friendships.$inferSelect;
export type Recommendation = typeof recommendations.$inferSelect;
export type InviteCode = typeof inviteCodes.$inferSelect;
export type SharedList = typeof sharedLists.$inferSelect;
export type SharedListMember = typeof sharedListMembers.$inferSelect;
export type SharedListItem = typeof sharedListItems.$inferSelect;
