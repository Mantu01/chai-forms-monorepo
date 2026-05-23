import { z } from "zod";

export const submissionAnswerInputSchema = z.object({
  fieldId: z.uuid(),
  value: z.any(),
});

export type SubmissionAnswerInputSchema = z.infer<typeof submissionAnswerInputSchema>;

export const createSubmissionInputSchema = z.object({
  formId: z.uuid(),
  submittedBy: z.uuid().optional(),
  status: z.string().min(1).max(100).optional(),
  answers: z.array(submissionAnswerInputSchema).min(1),
});

export type CreateSubmissionInputSchema = z.infer<typeof createSubmissionInputSchema>;

export const updateSubmissionStatusInputSchema = z.object({
  submissionId: z.uuid(),
  status: z.string().min(1).max(100),
});

export type UpdateSubmissionStatusInputSchema = z.infer<typeof updateSubmissionStatusInputSchema>;

export const getSubmissionByIdInputSchema = z.object({
  submissionId: z.uuid(),
});

export type GetSubmissionByIdInputSchema = z.infer<typeof getSubmissionByIdInputSchema>;

export const getFormSubmissionsInputSchema = z.object({
  formId: z.uuid(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  status: z.string().optional(),
  submittedBy: z.uuid().optional(),
  search: z.string().optional(),
});

export type GetFormSubmissionsInputSchema = z.infer<typeof getFormSubmissionsInputSchema>;

export const deleteSubmissionInputSchema = z.object({
  submissionId: z.uuid(),
});

export type DeleteSubmissionInputSchema = z.infer<typeof deleteSubmissionInputSchema>;

export const replaceSubmissionAnswersInputSchema = z.object({
  submissionId: z.uuid(),
  answers: z.array(submissionAnswerInputSchema),
});

export type ReplaceSubmissionAnswersInputSchema = z.infer<typeof replaceSubmissionAnswersInputSchema>;

export const submissionAnswerResponseSchema = z.object({
  id: z.uuid(),
  submissionId: z.uuid(),
  fieldId: z.uuid(),
  value: z.any(),
});

export type SubmissionAnswerResponseSchema = z.infer<typeof submissionAnswerResponseSchema>;

export const submissionResponseSchema = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  submissionNumber: z.number().nullable(),
  submittedBy: z.uuid().nullable(),
  status: z.string().nullable(),
  submittedAt: z.date().nullable(),
  createdAt: z.date().nullable(),
});

export type SubmissionResponseSchema = z.infer<typeof submissionResponseSchema>;

export const submissionWithAnswersResponseSchema = z.object({
  submission: submissionResponseSchema,
  answers: z.array(submissionAnswerResponseSchema),
});

export type SubmissionWithAnswersResponseSchema = z.infer<typeof submissionWithAnswersResponseSchema>;

export const paginatedSubmissionResponseSchema = z.object({
  data: z.array(submissionResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type PaginatedSubmissionResponseSchema = z.infer<typeof paginatedSubmissionResponseSchema>;