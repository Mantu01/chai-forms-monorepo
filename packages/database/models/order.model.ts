import { pgTable, uuid, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user.model";

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }).notNull(),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
  razorpaySignature: varchar("razorpay_signature", { length: 255 }),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("INR").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectOrder = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
