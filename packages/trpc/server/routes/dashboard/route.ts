import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../../trpc";
import { dashboardService } from "@repo/services";

export const dashboardRouter = router({
  getDashboardData: protectedProcedure
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
    .input(
      z.object({
        timeRange: z.enum(["90d", "30d", "7d"]),
        type: z.enum(["workspace", "form"]),
        selectedIds: z.array(z.string()),
      })
    )
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
