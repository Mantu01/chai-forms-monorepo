import { TRPCError } from "@trpc/server";
import { z } from "../../schema";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { billingService } from "@repo/services";

const TAGS = ["Billing"];
const getPath = generatePath("/billing");

export const billingRouter = router({
  createOrder: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/order/create"), tags: TAGS } })
    .input(z.object({ amount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await billingService.createOrder(ctx.userId, input.amount);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  verifyPayment: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/payment/verify"), tags: TAGS } })
    .input(
      z.object({
        razorpayOrderId: z.string(),
        razorpayPaymentId: z.string(),
        razorpaySignature: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await billingService.verifyPayment(
          ctx.userId,
          input.razorpayOrderId,
          input.razorpayPaymentId,
          input.razorpaySignature
        );
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),
});
