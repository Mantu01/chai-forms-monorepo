import { z } from "zod";

export const workspaceRoleSchema = z.enum(["owner", "admin", "member"]);

export const inviteRoleSchema = z.enum(["admin", "member"]);

export const workspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export const workspaceMemberSchema = z.object({
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  role: workspaceRoleSchema,
  joinedAt: z.date().nullable(),
});

export const workspaceInviteSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  email: z.string().email(),
  role: workspaceRoleSchema,
  token: z.string(),
  expiresAt: z.date(),
  acceptedAt: z.date().nullable(),
  createdAt: z.date(),
});

export const createWorkspaceInputSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().trim().min(2).max(255),
  slug: z.string().trim().min(2).max(255),
  logoUrl: z.string().url().optional(),
});

export const updateWorkspaceInputSchema = z.object({
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  data: z.object({
    name: z.string().trim().min(2).max(255).optional(),
    slug: z.string().trim().min(2).max(255).optional(),
    logoUrl: z.string().url().optional().nullable(),
  }),
});

export const deleteWorkspaceInputSchema = z.object({
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const getWorkspaceInputSchema = z.object({
  workspaceId: z.string().uuid(),
});

export const getUserWorkspacesInputSchema = z.object({
  userId: z.string().uuid(),
});

export const inviteMemberInputSchema = z.object({
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  email: z.string().email(),
  role: inviteRoleSchema,
});

export const acceptInviteInputSchema = z.object({
  token: z.string(),
  userId: z.string().uuid(),
});

export const removeMemberInputSchema = z.object({
  workspaceId: z.string().uuid(),
  currentUserId: z.string().uuid(),
  targetUserId: z.string().uuid(),
});

export const changeMemberRoleInputSchema = z.object({
  workspaceId: z.string().uuid(),
  currentUserId: z.string().uuid(),
  targetUserId: z.string().uuid(),
  role: inviteRoleSchema,
});

export const getWorkspaceMembersInputSchema = z.object({
  workspaceId: z.string().uuid(),
});

export const getWorkspaceInvitesInputSchema = z.object({
  workspaceId: z.string().uuid(),
});

export const cancelInviteInputSchema = z.object({
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  inviteId: z.string().uuid(),
});

export const successResponseSchema = z.object({
  success: z.boolean(),
});

export const userWorkspaceOutputSchema = z.object({
  workspace: workspaceSchema,
  role: workspaceRoleSchema.nullable(),
  joinedAt: z.date().nullable(),
});

export const getUserWorkspacesOutputSchema = z.array(userWorkspaceOutputSchema);

export const getWorkspaceMembersOutputSchema = z.array(workspaceMemberSchema);

export const getWorkspaceInvitesOutputSchema = z.array(workspaceInviteSchema);

export type WorkspaceSchema = z.infer<typeof workspaceSchema>;
export type WorkspaceMemberSchema = z.infer<typeof workspaceMemberSchema>;
export type WorkspaceInviteSchema = z.infer<typeof workspaceInviteSchema>;
export type CreateWorkspaceInputSchema = z.infer<typeof createWorkspaceInputSchema>;
export type UpdateWorkspaceInputSchema = z.infer<typeof updateWorkspaceInputSchema>;
export type DeleteWorkspaceInputSchema = z.infer<typeof deleteWorkspaceInputSchema>;
export type GetWorkspaceInputSchema = z.infer<typeof getWorkspaceInputSchema>;
export type GetUserWorkspacesInputSchema = z.infer<typeof getUserWorkspacesInputSchema>;
export type InviteMemberInputSchema = z.infer<typeof inviteMemberInputSchema>;
export type AcceptInviteInputSchema = z.infer<typeof acceptInviteInputSchema>;
export type RemoveMemberInputSchema = z.infer<typeof removeMemberInputSchema>;
export type ChangeMemberRoleInputSchema = z.infer<typeof changeMemberRoleInputSchema>;
export type GetWorkspaceMembersInputSchema = z.infer<typeof getWorkspaceMembersInputSchema>;
export type GetWorkspaceInvitesInputSchema = z.infer<typeof getWorkspaceInvitesInputSchema>;
export type CancelInviteInputSchema = z.infer<typeof cancelInviteInputSchema>;
export type SuccessResponseSchema = z.infer<typeof successResponseSchema>;
export type GetUserWorkspacesOutputSchema = z.infer<typeof getUserWorkspacesOutputSchema>;
export type GetWorkspaceMembersOutputSchema = z.infer<typeof getWorkspaceMembersOutputSchema>;
export type GetWorkspaceInvitesOutputSchema = z.infer<typeof getWorkspaceInvitesOutputSchema>;