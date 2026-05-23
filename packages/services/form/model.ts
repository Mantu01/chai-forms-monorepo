import { z } from "zod";

export const FormResponseSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  isPublic: z.boolean(),
  createdBy: z.string().uuid(),
  allowMultipleSubmissions: z.boolean().nullable(),
  requireAuth: z.boolean().nullable(),
  maxSubmissions: z.number().nullable(),
  redirectUrl: z.string().nullable(),
  themeConfig: z.any(),
  closeAt: z.date().nullable(),
  publishedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export const PageResponseSchema = z.object({
  id: z.string().uuid(),
  formId: z.string().uuid(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  order: z.number(),
});

export const FieldResponseSchema = z.object({
  id: z.string().uuid(),
  formId: z.string().uuid(),
  pageId: z.string().uuid().nullable(),
  label: z.string(),
  placeholder: z.string().nullable(),
  helperText: z.string().nullable(),
  type: z.string(),
  fieldKey: z.string(),
  defaultValue: z.string().nullable(),
  isRequired: z.boolean(),
  order: z.number(),
  config: z.any().nullable(),
});

export const CreateFormInputSchema = z.object({
  workspaceId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  slug: z.string().min(1),
  isPublic: z.boolean().optional(),
  allowMultipleSubmissions: z.boolean().optional(),
  requireAuth: z.boolean().optional(),
  maxSubmissions: z.number().optional(),
  redirectUrl: z.string().optional(),
  themeConfig: z.any(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  closeAt: z.date().optional(),
});

export const UpdateFormInputSchema = CreateFormInputSchema.partial();

export const CreatePageInputSchema = z.object({
  formId: z.string().uuid(),
  title: z.string().optional(),
  description: z.string().optional(),
  order: z.number(),
});

export const UpdatePageInputSchema = CreatePageInputSchema.partial();

export const CreateFieldInputSchema = z.object({
  formId: z.string().uuid(),
  pageId: z.string().uuid().optional(),
  label: z.string().min(1),
  placeholder: z.string().optional(),
  helperText: z.string().optional(),
  type: z.enum([
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
    "url",
    "signature",
    "matrix",
  ]),
  fieldKey: z.string().min(1),
  defaultValue: z.string().optional(),
  isRequired: z.boolean().optional(),
  order: z.number(),
  config: z.any().optional(),
});

export const UpdateFieldInputSchema = CreateFieldInputSchema.partial();

export const ReorderInputSchema = z.object({
  ids: z.array(z.string().uuid()),
});