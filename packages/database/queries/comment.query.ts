import db from "..";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { formComments } from "../models/comment.model";
import { users } from "../models/user.model";
import { forms } from "../models/form.model";
import { workspaceMembers } from "../models/workspace.model";

export class CommentQuery {
  public async getCommentsByForm(formId: string) {
    return db
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
      .where(eq(formComments.formId, formId))
      .orderBy(asc(formComments.createdAt));
  }

  public async createComment(data: typeof formComments.$inferInsert) {
    const [inserted] = await db.insert(formComments).values(data).returning();
    return inserted;
  }

  public async getCommentById(commentId: string) {
    const [comment] = await db.select().from(formComments).where(eq(formComments.id, commentId));
    return comment;
  }

  public async deleteComment(commentId: string) {
    return db.delete(formComments).where(eq(formComments.id, commentId)).returning();
  }

  public async getCommentsCountByForm(formId: string) {
    const [res] = await db.select({ count: count() }).from(formComments).where(eq(formComments.formId, formId));
    return res?.count ?? 0;
  }

  public async getCommunityInteractions(userId: string) {
    const userWorkspaces = await db
      .select({ workspaceId: workspaceMembers.workspaceId })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId));

    if (!userWorkspaces.length) {
      return [];
    }

    const workspaceIds = userWorkspaces.map((uw) => uw.workspaceId);

    const formList = await db
      .select()
      .from(forms)
      .where(
        and(
          eq(forms.isTemplate, true),
          eq(forms.status, "published"),
          eq(forms.isPublic, true)
        )
      );

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
          comments: commentRows,
        });
      }
    }

    return result;
  }
}
