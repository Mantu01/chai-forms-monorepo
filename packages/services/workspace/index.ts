import crypto from "crypto";

import { WorkspaceQuery } from "@repo/database/queries";

import {
  workspaceSchema,
  workspaceMemberSchema,
  workspaceInviteSchema,
  successResponseSchema,
  createWorkspaceInputSchema,
  updateWorkspaceInputSchema,
  deleteWorkspaceInputSchema,
  getWorkspaceInputSchema,
  getUserWorkspacesInputSchema,
  inviteMemberInputSchema,
  acceptInviteInputSchema,
  removeMemberInputSchema,
  changeMemberRoleInputSchema,
  getWorkspaceMembersInputSchema,
  getWorkspaceInvitesInputSchema,
  cancelInviteInputSchema,
  WorkspaceSchema,
  WorkspaceMemberSchema,
  WorkspaceInviteSchema,
  SuccessResponseSchema,
  CreateWorkspaceInputSchema,
  UpdateWorkspaceInputSchema,
  DeleteWorkspaceInputSchema,
  GetWorkspaceInputSchema,
  GetUserWorkspacesInputSchema,
  InviteMemberInputSchema,
  AcceptInviteInputSchema,
  RemoveMemberInputSchema,
  ChangeMemberRoleInputSchema,
  GetWorkspaceMembersInputSchema,
  GetWorkspaceInvitesInputSchema,
  CancelInviteInputSchema,
  GetUserWorkspacesOutputSchema,
  GetWorkspaceMembersOutputSchema,
  GetWorkspaceInvitesOutputSchema,
} from "./model";

export class WorkspaceService {
  private workspaceQuery = new WorkspaceQuery();

  public async createWorkspace(input: CreateWorkspaceInputSchema): Promise<WorkspaceSchema> {
    const validated = createWorkspaceInputSchema.parse(input);

    const existingWorkspace = await this.workspaceQuery.findWorkspaceBySlug(validated.slug);

    if (existingWorkspace) {
      throw new Error("Workspace slug already exists");
    }

    const workspace = await this.workspaceQuery.createWorkspace({
      name: validated.name,
      slug: validated.slug,
      createdBy: validated.userId,
    });

    if(!workspace){
      throw new Error("Workspace creation failed");
    }

    await this.workspaceQuery.addWorkspaceMember({
      workspaceId: workspace.id,
      userId: validated.userId,
      role: "owner",
    });

    return workspaceSchema.parse(workspace);
  }

  public async updateWorkspace(input: UpdateWorkspaceInputSchema): Promise<WorkspaceSchema> {
    const validated = updateWorkspaceInputSchema.parse(input);

    const member = await this.workspaceQuery.findWorkspaceMember(validated.workspaceId, validated.userId);

    if (!member?.role || !["owner", "admin"].includes(member.role)) {
      throw new Error("Unauthorized");
    }

    if (validated.data.slug) {
      const existingWorkspace = await this.workspaceQuery.findWorkspaceBySlug(validated.data.slug);

      if (existingWorkspace && existingWorkspace.id !== validated.workspaceId) {
        throw new Error("Workspace slug already exists");
      }
    }

    const workspace = await this.workspaceQuery.updateWorkspace(validated.workspaceId, validated.data);

    return workspaceSchema.parse(workspace);
  }

  public async deleteWorkspace(input: DeleteWorkspaceInputSchema): Promise<WorkspaceSchema> {
    const validated = deleteWorkspaceInputSchema.parse(input);

    const member = await this.workspaceQuery.findWorkspaceMember(validated.workspaceId, validated.userId);

    if (!member?.role || member.role !== "owner") {
      throw new Error("Only owner can delete workspace");
    }

    const workspace = await this.workspaceQuery.deleteWorkspace(validated.workspaceId);

    return workspaceSchema.parse(workspace);
  }

  public async getWorkspace(input: GetWorkspaceInputSchema): Promise<WorkspaceSchema> {
    const validated = getWorkspaceInputSchema.parse(input);

    const workspace = await this.workspaceQuery.findWorkspaceById(validated.workspaceId);

    return workspaceSchema.parse(workspace);
  }

  public async getUserWorkspaces(input: GetUserWorkspacesInputSchema): Promise<GetUserWorkspacesOutputSchema> {
    const validated = getUserWorkspacesInputSchema.parse(input);

    const workspaces = await this.workspaceQuery.getUserWorkspaces(validated.userId);

    return workspaces.map((item) => ({
      workspace: workspaceSchema.parse(item.workspace),
      role: item.role,
      joinedAt: item.joinedAt,
    }));
  }

  public async inviteMember(input: InviteMemberInputSchema): Promise<WorkspaceInviteSchema> {
    const validated = inviteMemberInputSchema.parse(input);

    const member = await this.workspaceQuery.findWorkspaceMember(validated.workspaceId, validated.userId);

    if (!member?.role || !["owner", "admin"].includes(member.role)) {
      throw new Error("Unauthorized");
    }

    const existingInvite = await this.workspaceQuery.findPendingInvite(validated.workspaceId, validated.email);

    if (existingInvite) {
      throw new Error("Invite already exists");
    }

    const token = crypto.randomBytes(32).toString("hex");

    const invite = await this.workspaceQuery.createWorkspaceInvite({
      workspaceId: validated.workspaceId,
      email: validated.email,
      role: validated.role,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    return workspaceInviteSchema.parse(invite);
  }

  public async acceptInvite(input: AcceptInviteInputSchema): Promise<SuccessResponseSchema> {
    const validated = acceptInviteInputSchema.parse(input);

    const invite = await this.workspaceQuery.findInviteByToken(validated.token);

    if (!invite) {
      throw new Error("Invite not found");
    }

    if (invite.acceptedAt) {
      throw new Error("Invite already accepted");
    }

    if (invite.expiresAt < new Date()) {
      throw new Error("Invite expired");
    }

    const existingMember = await this.workspaceQuery.findWorkspaceMember(invite.workspaceId, validated.userId);

    if (existingMember) {
      throw new Error("Already member");
    }

    await this.workspaceQuery.addWorkspaceMember({
      workspaceId: invite.workspaceId,
      userId: validated.userId,
      role: invite.role,
    });

    await this.workspaceQuery.acceptInvite(invite.id);

    return successResponseSchema.parse({ success: true });
  }

  public async removeMember(input: RemoveMemberInputSchema): Promise<WorkspaceMemberSchema> {
    const validated = removeMemberInputSchema.parse(input);

    const currentMember = await this.workspaceQuery.findWorkspaceMember(validated.workspaceId, validated.currentUserId);

    if (!currentMember?.role || !["owner", "admin"].includes(currentMember.role)) {
      throw new Error("Unauthorized");
    }

    const targetMember = await this.workspaceQuery.findWorkspaceMember(validated.workspaceId, validated.targetUserId);

    if (!targetMember) {
      throw new Error("Member not found");
    }

    if (targetMember.role === "owner") {
      throw new Error("Owner cannot be removed");
    }

    const removed = await this.workspaceQuery.removeWorkspaceMember(validated.workspaceId, validated.targetUserId);

    return workspaceMemberSchema.parse(removed);
  }

  public async changeMemberRole(input: ChangeMemberRoleInputSchema): Promise<WorkspaceMemberSchema> {
    const validated = changeMemberRoleInputSchema.parse(input);

    const currentMember = await this.workspaceQuery.findWorkspaceMember(validated.workspaceId, validated.currentUserId);

    if (!currentMember || currentMember.role !== "owner") {
      throw new Error("Only owner can change roles");
    }

    const targetMember = await this.workspaceQuery.findWorkspaceMember(validated.workspaceId, validated.targetUserId);

    if (!targetMember) {
      throw new Error("Member not found");
    }

    if (targetMember.role === "owner") {
      throw new Error("Owner role cannot be changed");
    }

    const updated = await this.workspaceQuery.updateWorkspaceMemberRole(validated.workspaceId, validated.targetUserId, validated.role);

    return workspaceMemberSchema.parse(updated);
  }

  public async getWorkspaceMembers(input: GetWorkspaceMembersInputSchema): Promise<GetWorkspaceMembersOutputSchema> {
    const validated = getWorkspaceMembersInputSchema.parse(input);

    const members = await this.workspaceQuery.getWorkspaceMembers(validated.workspaceId);

    return members.map((member) => workspaceMemberSchema.parse(member));
  }

  public async getWorkspaceInvites(input: GetWorkspaceInvitesInputSchema): Promise<GetWorkspaceInvitesOutputSchema> {
    const validated = getWorkspaceInvitesInputSchema.parse(input);

    const invites = await this.workspaceQuery.getWorkspaceInvites(validated.workspaceId);

    return invites.map((invite) => workspaceInviteSchema.parse(invite));
  }

  public async cancelInvite(input: CancelInviteInputSchema): Promise<WorkspaceInviteSchema> {
    const validated = cancelInviteInputSchema.parse(input);

    const member = await this.workspaceQuery.findWorkspaceMember(validated.workspaceId, validated.userId);

    if (!member?.role || !["owner", "admin"].includes(member.role)) {
      throw new Error("Unauthorized");
    }

    const invite = await this.workspaceQuery.deleteInvite(validated.inviteId);

    return workspaceInviteSchema.parse(invite);
  }
}