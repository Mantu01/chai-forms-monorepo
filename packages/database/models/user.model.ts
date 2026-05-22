import {pgTable,uuid,varchar,timestamp,boolean,text,} from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  fullName: varchar("full_name", { length: 80 }).notNull(),
  profileImageUrl: text("profile_image_url"),
  isSubscribed:boolean('is_subscribed').default(false),

  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  
  emailVerificationToken: text("email_verification_token").notNull(),
  emailVerificationTokenExpiry: timestamp("email_verification_token_expiry").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const oauthAccounts = pgTable("oauth_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),

  provider: varchar("provider", { length: 100 }).notNull(),
  providerAccountId: varchar("provider_account_id", {length: 255,}).notNull(),

  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),

  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SelectOauthAccount = typeof oauthAccounts.$inferSelect;
export type InsertOauthAccount = typeof oauthAccounts.$inferInsert;