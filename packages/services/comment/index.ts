import { CommentQuery, UserQuery } from "@repo/database/queries";

export class CommentService {
  constructor(
    private readonly commentQuery = new CommentQuery(),
    private readonly userQuery = new UserQuery()
  ) {}

  public async getCommentsByForm(formId: string) {
    if (!formId) throw new Error("Form id is required");
    return this.commentQuery.getCommentsByForm(formId);
  }

  public async createComment(userId: string | null, input: { formId: string; content: string; parentId?: string; guestName?: string }) {
    if (!input.formId) throw new Error("Form id is required");
    if (!input.content?.trim()) throw new Error("Content is required");

    const guestName = userId ? null : (input.guestName || "Anonymous");

    const inserted = await this.commentQuery.createComment({
      formId: input.formId,
      userId,
      guestName,
      content: input.content,
      parentId: input.parentId || null,
    });

    if (!inserted) throw new Error("Failed to create comment");

    let userFullName = null;
    let userProfileImageUrl = null;
    if (userId) {
      const user = await this.userQuery.findUserById(userId);
      if (user) {
        userFullName = user.fullName;
        userProfileImageUrl = user.profileImageUrl;
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
    if (!commentId) throw new Error("Comment id is required");

    const comment = await this.commentQuery.getCommentById(commentId);
    if (!comment) throw new Error("Comment not found");

    let canDelete = comment.userId === userId;

    if (!canDelete) {
      const formObj = await this.commentQuery.getFormById(comment.formId);
      if (formObj) {
        const member = await this.commentQuery.getWorkspaceMember(formObj.workspaceId, userId);
        if (member && (member.role === "owner" || member.role === "admin")) {
          canDelete = true;
        }
      }
    }

    if (!canDelete) {
      throw new Error("Unauthorized: You do not have permission to delete this comment");
    }

    await this.commentQuery.deleteComment(commentId);
    return { success: true };
  }

  public async getCommunityInteractions(userId: string) {
    if (!userId) throw new Error("User id is required");
    return this.commentQuery.getCommunityInteractions(userId);
  }
}
