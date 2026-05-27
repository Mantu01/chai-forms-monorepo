import { TRPCError } from "@trpc/server";
import { z, zodUndefinedModel } from "../../schema";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { CommentResponseSchema, CreateCommentInputSchema } from "@repo/services/form/model";
import { commentService } from "@repo/services";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Comment"];
const getPath = generatePath("/comment");

export const commentRouter = router({
  getCommentsByForm: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/by-form"), tags: TAGS } })
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
    .meta({ openapi: { method: "POST", path: getPath("/create"), tags: TAGS } })
    .input(CreateCommentInputSchema)
    .output(CommentResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await commentService.createComment({
          formId: input.formId,
          content: input.content,
          parentId: input.parentId,
          guestName: input.guestName,
          userId: ctx.userId || undefined,
        });
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  deleteComment: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/delete"), tags: TAGS } })
    .input(z.object({ commentId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await commentService.deleteComment(ctx.userId, input.commentId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  getCommunityInteractions: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/interactions"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(
      z.array(
        z.object({
          formId: z.string().uuid(),
          formTitle: z.string(),
          formSlug: z.string(),
          workspaceId: z.string().uuid(),
          comments: z.array(CommentResponseSchema),
        })
      )
    )
    .query(async ({ ctx }) => {
      try {
        return await commentService.getCommunityInteractions(ctx.userId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),
});
