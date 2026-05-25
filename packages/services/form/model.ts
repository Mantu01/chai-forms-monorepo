import { z } from "zod";

export const FormResponseSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  isPublic: z.boolean(),
  accessLevel: z.string(),
  createdBy: z.string().uuid(),
  allowMultipleSubmissions: z.boolean().nullable(),
  requireAuth: z.boolean().nullable(),
  maxSubmissions: z.number().nullable(),
  redirectUrl: z.string().nullable(),
  themeConfig: z.any(),
  isTemplate: z.boolean(),
  closeAt: z.any().nullable(),
  publishedAt: z.any().nullable(),
  createdAt: z.any(),
  updatedAt: z.any().nullable(),
});

export const FormWithStatsResponseSchema = FormResponseSchema.extend({
  submissionCount: z.number(),
});

export const FormThemeSchema = z.object({
  id: z.string().uuid(),
  formId: z.string().uuid(),
  backgroundColor: z.string(),
  formBackgroundColor: z.string(),
  headerBackgroundColor: z.string(),
  primaryColor: z.string(),
  buttonTextColor: z.string(),
  textColor: z.string(),
  mutedTextColor: z.string(),
  borderColor: z.string(),
  inputBackgroundColor: z.string(),
  inputTextColor: z.string(),
  bannerUrl: z.string().nullable(),
});

export const CommentResponseSchema = z.object({
  id: z.string().uuid(),
  formId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  userFullName: z.string().nullable().optional(),
  userProfileImageUrl: z.string().nullable().optional(),
  guestName: z.string().nullable(),
  content: z.string(),
  parentId: z.string().uuid().nullable(),
  createdAt: z.any(),
});

export const CreateCommentInputSchema = z.object({
  formId: z.string().uuid(),
  content: z.string().min(1),
  parentId: z.string().uuid().optional(),
  guestName: z.string().optional(),
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
  isTemplate: z.boolean().optional(),
  accessLevel: z.string().optional(),
  allowMultipleSubmissions: z.boolean().optional(),
  requireAuth: z.boolean().optional(),
  maxSubmissions: z.number().optional(),
  redirectUrl: z.string().optional(),
  themeConfig: z.any().optional(),
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