import { TRPCError } from "@trpc/server";
import { z } from "../../schema";
import { protectedProcedure, router } from "../../trpc";
import { dashboardService } from "@repo/services";

export const dashboardRouter = router({
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return await dashboardService.getDashboardStats(ctx.userId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  getTimeSeries: protectedProcedure
    .input(
      z.object({
        workspaceIds: z.array(z.string().uuid()).optional(),
        formIds: z.array(z.string().uuid()).optional(),
        timeframe: z.enum(["7d", "30d", "90d"]),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        return await dashboardService.getDashboardTimeSeries(ctx.userId, input);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  getFooter: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return await dashboardService.getDashboardFooter(ctx.userId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),
});
