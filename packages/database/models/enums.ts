import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "owner",
  "admin",
  "member",
]);

export const formStatusEnum = pgEnum("form_status", [
  "draft",
  "published",
  "archived",
]);

export const fieldTypeEnum = pgEnum("field_type", [
  "text",
  "textarea",
  "email",
  "phone",
  "number",
  "select",
  "multi_select",
  "radio",
  "checkbox",
  "date",
  "time",
  "file",
  "rating",
  "matrix",
]);
export const workflowStatusEnum = pgEnum("workflow_status", [
  "pending",
  "running",
  "completed",
  "failed",
]);