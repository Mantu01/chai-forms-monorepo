import { TRPCError } from "@trpc/server";
import { z } from "../../schema";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { CommentResponseSchema, CreateCommentInputSchema } from "@repo/services/form/model";
import { commentService } from "@repo/services";

export const commentRouter = router({
  getCommentsByForm: publicProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.array(CommentResponseSchema))
    .query(async ({ input }) => {
      try {
        return await commentService.getCommentsByForm(input.formId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  createComment: publicProcedure
    .input(CreateCommentInputSchema)
    .output(CommentResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId || null;
        return await commentService.createComment(userId, input);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await commentService.deleteComment(ctx.userId, input.commentId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  getCommunityInteractions: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return await commentService.getCommunityInteractions(ctx.userId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),
});
