import {pgTable,uuid,varchar,timestamp,text, integer, } from "drizzle-orm/pg-core"
import { forms } from "./form.model";

export const formViews = pgTable("form_views", {
  id: uuid("id").defaultRandom().primaryKey(),

  formId: uuid("form_id")
    .references(() => forms.id)
    .notNull(),

  visitorId: text("visitor_id"),

  country: varchar("country", {
    length: 100,
  }),

  device: varchar("device", {
    length: 100,
  }),

  viewedAt: timestamp("viewed_at").defaultNow(),
});



export const formAnalyticsDaily = pgTable("form_analytics_daily", {
  id: uuid("id").defaultRandom().primaryKey(),

  formId: uuid("form_id")
    .references(() => forms.id)
    .notNull(),

  date: timestamp("date").notNull(),

  totalViews: integer("total_views").default(0),

  totalSubmissions: integer("total_submissions").default(0),

  conversionRate: integer("conversion_rate").default(0),
});

export type SelectFormView = typeof formViews.$inferSelect;
export type InsertFormView = typeof formViews.$inferInsert;
export type SelectFormAnalyticsDaily = typeof formAnalyticsDaily.$inferSelect;
export type InsertFormAnalyticsDaily = typeof formAnalyticsDaily.$inferInsert;
