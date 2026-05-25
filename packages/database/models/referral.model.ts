import { pgTable, varchar } from "drizzle-orm/pg-core";

export const referralCodes = pgTable("referral_codes", {
  code: varchar("code", { length: 255 }).primaryKey().notNull(),
});

export type SelectReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = typeof referralCodes.$inferInsert;
