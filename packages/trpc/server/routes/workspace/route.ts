import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
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
  workspaceSchema,
  workspaceInviteSchema,
  workspaceMemberSchema,
  successResponseSchema,
  getUserWorkspacesOutputSchema,
  getWorkspaceMembersOutputSchema,
  getWorkspaceInvitesOutputSchema,
} from "@repo/services/workspace/model";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { workspaceService } from "@repo/services";

const TAGS = ["Workspace"];
const getPath = generatePath("/workspace");

export const workspaceRouter = router({
  createWorkspace: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/create"), tags: TAGS } })
    .input(createWorkspaceInputSchema)
    .output(workspaceSchema)
    .mutation(async ({ ctx, input }) => {
      return workspaceService.createWorkspace(ctx.userId, input);
    }),

  updateWorkspace: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/update"), tags: TAGS } })
    .input(updateWorkspaceInputSchema)
    .output(workspaceSchema)
    .mutation(async ({ ctx, input }) => {
      return workspaceService.updateWorkspace(ctx.userId, input);
    }),

  deleteWorkspace: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/delete"), tags: TAGS } })
    .input(deleteWorkspaceInputSchema)
    .output(workspaceSchema)
    .mutation(async ({ ctx, input }) => {
      return workspaceService.deleteWorkspace(ctx.userId, input);
    }),

  getWorkspace: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/get"), tags: TAGS } })
    .input(getWorkspaceInputSchema)
    .output(workspaceSchema)
    .query(async ({ input }) => {
      return workspaceService.getWorkspace(input);
    }),

  getWorkspaceBySlug: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/get-by-slug"), tags: TAGS } })
    .input(z.object({ slug: z.string() }))
    .output(workspaceSchema)
    .query(async ({ input }) => {
      try {
        return await workspaceService.getWorkspaceBySlug(input.slug);
      } catch (err: any) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: err.message || "Workspace not found",
        });
      }
    }),

  getUserWorkspaces: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/list"), tags: TAGS } })
    .input(getUserWorkspacesInputSchema)
    .output(getUserWorkspacesOutputSchema)
    .query(async ({ ctx }) => {
      return workspaceService.getUserWorkspaces(ctx.userId);
    }),

  inviteMember: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/invite"), tags: TAGS } })
    .input(inviteMemberInputSchema)
    .output(workspaceInviteSchema)
    .mutation(async ({ ctx, input }) => {
      return workspaceService.inviteMember(ctx.userId, input);
    }),

  acceptInvite: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/invite/accept"), tags: TAGS } })
    .input(acceptInviteInputSchema)
    .output(successResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return workspaceService.acceptInvite(ctx.userId, input);
    }),

  removeMember: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/member/remove"), tags: TAGS } })
    .input(removeMemberInputSchema)
    .output(workspaceMemberSchema)
    .mutation(async ({ ctx, input }) => {
      return workspaceService.removeMember(ctx.userId, input);
    }),

  changeMemberRole: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/member/role"), tags: TAGS } })
    .input(changeMemberRoleInputSchema)
    .output(workspaceMemberSchema)
    .mutation(async ({ ctx, input }) => {
      return workspaceService.changeMemberRole(ctx.userId, input);
    }),

  getWorkspaceMembers: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/members"), tags: TAGS } })
    .input(getWorkspaceMembersInputSchema)
    .output(getWorkspaceMembersOutputSchema)
    .query(async ({ input }) => {
      return workspaceService.getWorkspaceMembers(input);
    }),

  getWorkspaceInvites: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/invites"), tags: TAGS } })
    .input(getWorkspaceInvitesInputSchema)
    .output(getWorkspaceInvitesOutputSchema)
    .query(async ({ input }) => {
      return workspaceService.getWorkspaceInvites(input);
    }),

  cancelInvite: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/invite/cancel"), tags: TAGS } })
    .input(cancelInviteInputSchema)
    .output(workspaceInviteSchema)
    .mutation(async ({ ctx, input }) => {
      return workspaceService.cancelInvite(ctx.userId, input);
    }),
});
