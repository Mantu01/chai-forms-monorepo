import { TRPCError } from "@trpc/server";
import { z, zodUndefinedModel } from "../../schema";
import { protectedProcedure, router } from "../../trpc";
import { dashboardService } from "@repo/services";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Dashboard"];
const getPath = generatePath("/dashboard");

export const dashboardRouter = router({
  getDashboardData: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/data"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(
      z.object({
        stats: z.object({
          totalSubmissionsLastMonth: z.number(),
          submissionsTrend: z.number(),
          totalForms: z.number(),
          activeForms: z.number(),
          submissionRate: z.number(),
          submissionRateTrend: z.number(),
        }),
        recentForms: z.array(
          z.object({
            id: z.string().uuid(),
            title: z.string(),
            createdAt: z.any(),
            publishedAt: z.any().nullable(),
            createdByName: z.string(),
            submissionCount: z.number(),
          })
        ),
        recentComments: z.array(
          z.object({
            id: z.string().uuid(),
            content: z.string(),
            createdAt: z.any(),
            commenterName: z.string(),
            formTitle: z.string(),
          })
        ),
      })
    )
    .query(async ({ ctx }) => {
      try {
        return await dashboardService.getDashboardData(ctx.userId);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),

  getAllUserForms: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/forms"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(
      z.array(
        z.object({
          id: z.string().uuid(),
          title: z.string(),
          workspaceName: z.string(),
        })
      )
    )
    .query(async ({ ctx }) => {
      try {
        return await dashboardService.getAllUserForms(ctx.userId);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),

  getGraphData: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/graph"), tags: TAGS } })
    .input(
      z.object({
        timeRange: z.enum(["90d", "30d", "7d"]),
        type: z.enum(["workspace", "form"]),
        selectedIds: z.array(z.string()),
      })
    )
    .output(z.array(z.record(z.string(), z.any())))
    .query(async ({ ctx, input }) => {
      try {
        return await dashboardService.getGraphData(ctx.userId, input);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),
});
