import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { forms } from "./form.model";

export const formThemes = pgTable("form_themes", {
  id: uuid("id").defaultRandom().primaryKey(),
  formId: uuid("form_id").references(() => forms.id, { onDelete: "cascade" }).notNull().unique(),
  themeName: varchar("theme_name", { length: 50 }).default("dark").notNull(),
  backgroundColor: varchar("background_color", { length: 50 }).default("#09090b").notNull(),
  formBackgroundColor: varchar("form_background_color", { length: 50 }).default("#18181b").notNull(),
  headerBackgroundColor: varchar("header_background_color", { length: 50 }).default("#27272a").notNull(),
  primaryColor: varchar("primary_color", { length: 50 }).default("#3f3f46").notNull(),
  buttonTextColor: varchar("button_text_color", { length: 50 }).default("#ffffff").notNull(),
  textColor: varchar("text_color", { length: 50 }).default("#ffffff").notNull(),
  mutedTextColor: varchar("muted_text_color", { length: 50 }).default("#a1a1aa").notNull(),
  borderColor: varchar("border_color", { length: 50 }).default("#27272a").notNull(),
  inputBackgroundColor: varchar("input_background_color", { length: 50 }).default("#27272a").notNull(),
  inputTextColor: varchar("input_text_color", { length: 50 }).default("#ffffff").notNull(),
  bannerUrl: text("banner_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectFormTheme = typeof formThemes.$inferSelect;
export type InsertFormTheme = typeof formThemes.$inferInsert;
