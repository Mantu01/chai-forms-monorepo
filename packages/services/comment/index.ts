import { CommentQuery } from "@repo/database/queries";
import { users, forms, workspaceMembers, eq, and, db } from "@repo/database";

export class CommentService {
  private readonly commentQuery = new CommentQuery();

  public async getCommentsByForm(formId: string) {
    const comments = await this.commentQuery.getCommentsByForm(formId);
    return comments.map((r) => ({
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
  }

  public async createComment(input: {
    formId: string;
    content: string;
    parentId?: string;
    guestName?: string;
    userId?: string;
  }) {
    const userId = input.userId || null;
    const guestName = userId ? null : (input.guestName || "Anonymous");

    const inserted = await this.commentQuery.createComment({
      formId: input.formId,
      userId,
      guestName,
      content: input.content,
      parentId: input.parentId || null,
    });

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
  }

  public async deleteComment(userId: string, commentId: string) {
    const commentObj = await this.commentQuery.getCommentById(commentId);
    if (!commentObj) {
      throw new Error("Comment not found");
    }

    let canDelete = commentObj.userId === userId;

    if (!canDelete) {
      const [formObj] = await db.select().from(forms).where(eq(forms.id, commentObj.formId));
      if (formObj) {
        const [member] = await db
          .select()
          .from(workspaceMembers)
          .where(
            and(
              eq(workspaceMembers.workspaceId, formObj.workspaceId),
              eq(workspaceMembers.userId, userId)
            )
          );
        if (member && (member.role === "owner" || member.role === "admin")) {
          canDelete = true;
        }
      }
    }

    if (!canDelete) {
      throw new Error("You do not have permission to delete this comment");
    }

    await this.commentQuery.deleteComment(commentId);
    return { success: true };
  }

  public async getCommunityInteractions(userId: string) {
    const interactions = await this.commentQuery.getCommunityInteractions(userId);
    return interactions.map((section) => ({
      formId: section.formId,
      formTitle: section.formTitle,
      formSlug: section.formSlug,
      workspaceId: section.workspaceId,
      comments: section.comments.map((r: any) => ({
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
    }));
  }
}
