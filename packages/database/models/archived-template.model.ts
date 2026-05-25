import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { forms } from "./form.model";
import { users } from "./user.model";

export const archivedTemplates = pgTable("archived_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  formId: uuid("form_id").references(() => forms.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SelectArchivedTemplate = typeof archivedTemplates.$inferSelect;
export type InsertArchivedTemplate = typeof archivedTemplates.$inferInsert;
