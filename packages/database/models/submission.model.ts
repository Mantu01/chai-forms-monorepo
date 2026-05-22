import {pgTable,uuid,varchar,timestamp,text, jsonb, serial,} from "drizzle-orm/pg-core"
import { users } from "./user.model";
import { formFields, forms } from "./form.model";

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  formId: uuid("form_id").references(() => forms.id, {onDelete: "cascade",}).notNull(),

  submissionNumber: serial("submission_number"),
  submittedBy: uuid("submitted_by").references(() => users.id),
  status: varchar("status", {length: 100,}).default("completed"),

  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});



export const submissionAnswers = pgTable("submission_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id").references(() => submissions.id, {onDelete: "cascade",}).notNull(),
  fieldId: uuid("field_id").references(() => formFields.id).notNull(),

  value: jsonb("value").notNull(),
});

export type SelectSubmission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;
export type SelectSubmissionAnswer = typeof submissionAnswers.$inferSelect;
export type InsertSubmissionAnswer = typeof submissionAnswers.$inferInsert;
