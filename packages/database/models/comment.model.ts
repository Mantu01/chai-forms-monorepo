import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { forms } from "./form.model";
import { users } from "./user.model";

export const formComments = pgTable("form_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  formId: uuid("form_id").references(() => forms.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  guestName: varchar("guest_name", { length: 255 }),
  content: text("content").notNull(),
  parentId: uuid("parent_id").references(() => formComments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SelectFormComment = typeof formComments.$inferSelect;
export type InsertFormComment = typeof formComments.$inferInsert;
