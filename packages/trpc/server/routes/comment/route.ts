import { TRPCError } from "@trpc/server";
import { z } from "../../schema";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { CommentResponseSchema, CreateCommentInputSchema } from "@repo/services/form/model";
import { db, formComments, users, forms, workspaceMembers,eq, and, desc, asc } from "@repo/database";

export const commentRouter = router({
  getCommentsByForm: publicProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.array(CommentResponseSchema))
    .query(async ({ input }) => {
      try {
        const rows = await db
          .select({
            id: formComments.id,
            formId: formComments.formId,
            userId: formComments.userId,
            guestName: formComments.guestName,
            content: formComments.content,
            parentId: formComments.parentId,
            createdAt: formComments.createdAt,
            userFullName: users.fullName,
            userProfileImageUrl: users.profileImageUrl,
          })
          .from(formComments)
          .leftJoin(users, eq(formComments.userId, users.id))
          .where(eq(formComments.formId, input.formId))
          .orderBy(asc(formComments.createdAt));

        return rows.map((r) => ({
          id: r.id,
          formId: r.formId,
          userId: r.userId,
          guestName: r.guestName,
          content: r.content,
          parentId: r.parentId,
          createdAt: r.createdAt,
          userFullName: r.userFullName,
          userProfileImageUrl: r.userProfileImageUrl,
        }));
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
        const guestName = userId ? null : (input.guestName || "Anonymous");

        const [inserted] = await db
          .insert(formComments)
          .values({
            formId: input.formId,
            userId,
            guestName,
            content: input.content,
            parentId: input.parentId || null,
          })
          .returning();

        if (!inserted) {
          throw new Error("Failed to create comment");
        }

        let userFullName = null;
        let userProfileImageUrl = null;
        if (userId) {
          const [userObj] = await db.select().from(users).where(eq(users.id, userId));
          if (userObj) {
            userFullName = userObj.fullName;
            userProfileImageUrl = userObj.profileImageUrl;
          }
        }

        return {
          id: inserted.id,
          formId: inserted.formId,
          userId: inserted.userId,
          guestName: inserted.guestName,
          content: inserted.content,
          parentId: inserted.parentId,
          createdAt: inserted.createdAt,
          userFullName,
          userProfileImageUrl,
        };
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const [commentObj] = await db.select().from(formComments).where(eq(formComments.id, input.commentId));
        if (!commentObj) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
        }

        let canDelete = commentObj.userId === ctx.userId;

        if (!canDelete) {
          const [formObj] = await db.select().from(forms).where(eq(forms.id, commentObj.formId));
          if (formObj) {
            const [member] = await db
              .select()
              .from(workspaceMembers)
              .where(
                and(
                  eq(workspaceMembers.workspaceId, formObj.workspaceId),
                  eq(workspaceMembers.userId, ctx.userId)
                )
              );
            if (member && (member.role === "owner" || member.role === "admin")) {
              canDelete = true;
            }
          }
        }

        if (!canDelete) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "You do not have permission to delete this comment" });
        }

        await db.delete(formComments).where(eq(formComments.id, input.commentId));
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  getCommunityInteractions: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userWorkspaces = await db
          .select({ workspaceId: workspaceMembers.workspaceId })
          .from(workspaceMembers)
          .where(eq(workspaceMembers.userId, ctx.userId));

        if (!userWorkspaces.length) {
          return [];
        }

        const workspaceIds = userWorkspaces.map((uw) => uw.workspaceId);

        const formList = await db
          .select()
          .from(forms)
          .where(and(eq(forms.isTemplate, true), eq(forms.status, "published"), and(eq(forms.isPublic, true))));

        const workspaceForms = formList.filter((f) => workspaceIds.includes(f.workspaceId));

        const result: Array<any> = [];

        for (const form of workspaceForms) {
          const commentRows = await db
            .select({
              id: formComments.id,
              formId: formComments.formId,
              userId: formComments.userId,
              guestName: formComments.guestName,
              content: formComments.content,
              parentId: formComments.parentId,
              createdAt: formComments.createdAt,
              userFullName: users.fullName,
              userProfileImageUrl: users.profileImageUrl,
            })
            .from(formComments)
            .leftJoin(users, eq(formComments.userId, users.id))
            .where(eq(formComments.formId, form.id))
            .orderBy(desc(formComments.createdAt));

          if (commentRows.length > 0) {
            result.push({
              formId: form.id,
              formTitle: form.title,
              formSlug: form.slug,
              workspaceId: form.workspaceId,
              comments: commentRows.map((r) => ({
                id: r.id,
                formId: r.formId,
                userId: r.userId,
                guestName: r.guestName,
                content: r.content,
                parentId: r.parentId,
                createdAt: r.createdAt,
                userFullName: r.userFullName,
                userProfileImageUrl: r.userProfileImageUrl,
              })),
            });
          }
        }

        return result;
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),
});
