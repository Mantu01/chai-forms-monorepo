import { TRPCError } from "@trpc/server";
import {
  createSubmissionInputSchema,
  updateSubmissionStatusInputSchema,
  getSubmissionByIdInputSchema,
  getFormSubmissionsInputSchema,
  deleteSubmissionInputSchema,
  replaceSubmissionAnswersInputSchema,
  getSubmissionStatsInputSchema,
  getUserSubmissionsInputSchema,
  getRecentSubmissionsInputSchema,
  submissionWithAnswersResponseSchema,
  submissionResponseSchema,
  paginatedSubmissionResponseSchema,
  submissionStatsResponseSchema,
  userSubmissionsResponseSchema,
  recentSubmissionsResponseSchema,
} from "@repo/services/submission/modal";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { submissionService } from "@repo/services";
import z from "zod";

const TAGS = ["Submission"];
const getPath = generatePath("/submission");

export const submissionRouter = router({
  createSubmission: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/create"), tags: TAGS } })
    .input(createSubmissionInputSchema)
    .output(submissionWithAnswersResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await submissionService.createSubmission({
          ...input,
          submittedBy: ctx.userId || undefined,
        });
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),

  getSubmissionById: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/get"), tags: TAGS } })
    .input(getSubmissionByIdInputSchema)
    .output(submissionWithAnswersResponseSchema)
    .query(async ({ input }) => {
      try {
        return await submissionService.getSubmissionById(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: error.message,
        });
      }
    }),

  getFormSubmissions: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/list"), tags: TAGS } })
    .input(getFormSubmissionsInputSchema)
    .output(paginatedSubmissionResponseSchema)
    .query(async ({ input }) => {
      try {
        return await submissionService.getFormSubmissions(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),

  updateSubmissionStatus: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/status"), tags: TAGS } })
    .input(updateSubmissionStatusInputSchema)
    .output(submissionResponseSchema)
    .mutation(async ({ input }) => {
      try {
        return await submissionService.updateSubmissionStatus(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),

  replaceSubmissionAnswers: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/answers/replace"), tags: TAGS } })
    .input(replaceSubmissionAnswersInputSchema)
    .output(submissionWithAnswersResponseSchema)
    .mutation(async ({ input }) => {
      try {
        return await submissionService.replaceSubmissionAnswers(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),

  deleteSubmission: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/delete"), tags: TAGS } })
    .input(deleteSubmissionInputSchema)
    .output(submissionResponseSchema)
    .mutation(async ({ input }) => {
      try {
        return await submissionService.deleteSubmission(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),

  getSubmissionStats: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/stats"), tags: TAGS } })
    .input(getSubmissionStatsInputSchema)
    .output(submissionStatsResponseSchema)
    .query(async ({ input }) => {
      try {
        return await submissionService.getSubmissionStats(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),

  getUserSubmissions: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/user"), tags: TAGS } })
    .input(getUserSubmissionsInputSchema)
    .output(userSubmissionsResponseSchema)
    .query(async ({ ctx }) => {
      try {
        return await submissionService.getUserSubmissions(ctx.userId);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),

  getRecentSubmissions: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/recent"), tags: TAGS } })
    .input(getRecentSubmissionsInputSchema)
    .output(recentSubmissionsResponseSchema)
    .query(async ({ input }) => {
      try {
        return await submissionService.getRecentSubmissions(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),

  getExportSubmissions: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.array(z.any()))
    .query(async ({ input }) => {
      try {
        return await submissionService.getExportSubmissions(input.formId);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),
});
