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
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { submissionService } from "@repo/services";

const TAGS = ["Submission"];
const getPath = generatePath("/submission");

export const submissionRouter = router({
  createSubmission: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/create"), tags: TAGS } })
    .input(createSubmissionInputSchema)
    .output(submissionWithAnswersResponseSchema)
    .mutation(async ({ input }) => {
      try {
        return await submissionService.createSubmission(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),

  getSubmissionById: publicProcedure
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

  getFormSubmissions: publicProcedure
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

  updateSubmissionStatus: publicProcedure
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

  replaceSubmissionAnswers: publicProcedure
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

  deleteSubmission: publicProcedure
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

  getSubmissionStats: publicProcedure
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

  getUserSubmissions: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/user"), tags: TAGS } })
    .input(getUserSubmissionsInputSchema)
    .output(userSubmissionsResponseSchema)
    .query(async ({ input }) => {
      try {
        return await submissionService.getUserSubmissions(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),

  getRecentSubmissions: publicProcedure
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
});
