import { and, asc, desc, eq } from "drizzle-orm";
import db from "..";
import { formComments, InsertFormComment, SelectFormComment } from "../models/comment.model";
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

  public async createComment(data: InsertFormComment) {
    const [inserted] = await db.insert(formComments).values(data).returning();
    return inserted;
  }

  public async getCommentById(commentId: string) {
    const [comment] = await db.select().from(formComments).where(eq(formComments.id, commentId));
    return comment;
  }

  public async deleteComment(commentId: string) {
    const [deleted] = await db.delete(formComments).where(eq(formComments.id, commentId)).returning();
    return deleted;
  }

  public async getFormById(formId: string) {
    const [form] = await db.select().from(forms).where(eq(forms.id, formId));
    return form;
  }

  public async getWorkspaceMember(workspaceId: string, userId: string) {
    const [member] = await db
      .select()
      .from(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)));
    return member;
  }

  public async getCommunityInteractions(userId: string) {
    const userWorkspaces = await db
      .select({ workspaceId: workspaceMembers.workspaceId })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId));

    if (!userWorkspaces.length) return [];

    const workspaceIds = userWorkspaces.map((uw) => uw.workspaceId);

    const formList = await db
      .select()
      .from(forms)
      .where(and(eq(forms.isTemplate, true), eq(forms.status, "published"), eq(forms.isPublic, true)));

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
