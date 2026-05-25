import {pgTable,uuid,varchar,timestamp,text, boolean, integer, jsonb,} from "drizzle-orm/pg-core"
import { workspaces } from "./workspace.model";
import { fieldTypeEnum, formStatusEnum } from "./enums";
import { users } from "./user.model";

export const forms = pgTable("forms", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, {onDelete: "cascade",}).notNull(),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  slug: varchar("slug", { length: 255 }).notNull().unique(),
  status: formStatusEnum("status").default("draft").notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  accessLevel: varchar("access_level", { length: 50 }).default("public").notNull(),
  createdBy: uuid("created_by").references(() => users.id).notNull(),

  allowMultipleSubmissions: boolean("allow_multiple_submissions").default(true),
  requireAuth: boolean("require_auth").default(false),
  maxSubmissions: integer("max_submissions"),
  redirectUrl: text("redirect_url"),
  themeConfig: jsonb("theme_config").notNull(),
  isTemplate: boolean("is_template").default(false).notNull(),
  
  closeAt: timestamp("close_at"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});


export const formPages = pgTable("form_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  formId: uuid("form_id").references(() => forms.id, {onDelete: "cascade",}).notNull(),

  title: varchar("title", { length: 255 }),
  description: text("description"),
  order: integer("order").notNull(),
});


export const formFields = pgTable("form_fields", {
  id: uuid("id").defaultRandom().primaryKey(),
  formId: uuid("form_id").references(() => forms.id, {onDelete: "cascade",}).notNull(),
  pageId: uuid("page_id").references(() => formPages.id),

  label: varchar("label", { length: 255 }).notNull(),
  placeholder: text("placeholder"),
  helperText: text("helper_text"),
  type: fieldTypeEnum("type").notNull(),
  fieldKey: varchar("field_key", { length: 255 }).notNull(),
  defaultValue: text("default_value"),
  isRequired: boolean("is_required").default(false).notNull(),
  order: integer("order").notNull(),
  config: jsonb("config"),
});

export type SelectForm = typeof forms.$inferSelect;
export type InsertForm = typeof forms.$inferInsert;
export type SelectFormPage = typeof formPages.$inferSelect;
export type InsertFormPage = typeof formPages.$inferInsert;
export type SelectFormField = typeof formFields.$inferSelect;
export type InsertFormField = typeof formFields.$inferInsert;
