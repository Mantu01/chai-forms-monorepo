import { and, eq, gt, isNull } from "drizzle-orm";
import db from "..";
import {workspaces,workspaceMembers,workspaceInvites,InsertWorkspace,InsertWorkspaceInvite,InsertWorkspaceMember,} from "../models/workspace.model";
import { users } from "../models/user.model";

export class WorkspaceQuery {
  async createWorkspace(data: InsertWorkspace) {
    const [workspace] = await db
      .insert(workspaces)
      .values(data)
      .returning();

    return workspace;
  }

  async findWorkspaceById(id: string) {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id));

    return workspace;
  }

  async findWorkspaceBySlug(slug: string) {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.slug, slug));

    return workspace;
  }

  async updateWorkspace(
    workspaceId: string,
    data: Partial<InsertWorkspace>
  ) {
    const [workspace] = await db
      .update(workspaces)
      .set(data)
      .where(eq(workspaces.id, workspaceId))
      .returning();

    return workspace;
  }

  async deleteWorkspace(workspaceId: string) {
    const [workspace] = await db
      .delete(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .returning();

    return workspace;
  }

  async getUserWorkspaces(userId: string) {
    return db
      .select({
        workspace: workspaces,
        role: workspaceMembers.role,
        joinedAt: workspaceMembers.joinedAt,
      })
      .from(workspaceMembers)
      .innerJoin(
        workspaces,
        eq(workspaceMembers.workspaceId, workspaces.id)
      )
      .where(eq(workspaceMembers.userId, userId));
  }

  async addWorkspaceMember(data: InsertWorkspaceMember) {
    const [member] = await db
      .insert(workspaceMembers)
      .values(data)
      .returning();

    return member;
  }

  async findWorkspaceMember(workspaceId: string, userId: string) {
    const [member] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        )
      );

    return member;
  }

  async getWorkspaceMembers(workspaceId: string) {
    return db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, workspaceId));
  }

  async getWorkspaceMemberDetails(workspaceId: string, userId: string) {
    const [result] = await db
      .select({
        workspaceId: workspaceMembers.workspaceId,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        joinedAt: workspaceMembers.joinedAt,
        name: users.fullName,
        email: users.email,
        profileImageUrl: users.profileImageUrl,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        )
      );
    return result;
  }

  async updateWorkspaceMemberRole(
    workspaceId: string,
    userId: string,
    role: "owner" | "admin" | "member"
  ) {
    const [member] = await db
      .update(workspaceMembers)
      .set({ role })
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        )
      )
      .returning();

    return member;
  }

  async removeWorkspaceMember(workspaceId: string, userId: string) {
    const [member] = await db
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        )
      )
      .returning();

    return member;
  }

  async createWorkspaceInvite(data: InsertWorkspaceInvite) {
    const [invite] = await db
      .insert(workspaceInvites)
      .values(data)
      .returning();

    return invite;
  }

  async findInviteByToken(token: string) {
    const [invite] = await db
      .select()
      .from(workspaceInvites)
      .where(eq(workspaceInvites.token, token));

    return invite;
  }

  async findPendingInvite(
    workspaceId: string,
    email: string
  ) {
    const [invite] = await db
      .select()
      .from(workspaceInvites)
      .where(
        and(
          eq(workspaceInvites.workspaceId, workspaceId),
          eq(workspaceInvites.email, email),
          isNull(workspaceInvites.acceptedAt),
          gt(workspaceInvites.expiresAt, new Date())
        )
      );

    return invite;
  }

  async getWorkspaceInvites(workspaceId: string) {
    return db
      .select()
      .from(workspaceInvites)
      .where(eq(workspaceInvites.workspaceId, workspaceId));
  }

  async acceptInvite(inviteId: string) {
    const [invite] = await db
      .update(workspaceInvites)
      .set({
        acceptedAt: new Date(),
      })
      .where(eq(workspaceInvites.id, inviteId))
      .returning();

    return invite;
  }

  async deleteInvite(inviteId: string) {
    const [invite] = await db
      .delete(workspaceInvites)
      .where(eq(workspaceInvites.id, inviteId))
      .returning();

    return invite;
  }

  async getPendingInvitesForEmail(email: string) {
    return db
      .select({
        id: workspaceInvites.id,
        role: workspaceInvites.role,
        workspaceId: workspaceInvites.workspaceId,
        workspaceName: workspaces.name,
        token: workspaceInvites.token,
      })
      .from(workspaceInvites)
      .innerJoin(workspaces, eq(workspaceInvites.workspaceId, workspaces.id))
      .where(
        and(
          eq(workspaceInvites.email, email),
          isNull(workspaceInvites.acceptedAt),
          gt(workspaceInvites.expiresAt, new Date())
        )
      );
  }
}