import { TRPCError } from "@trpc/server";
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
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { workspaceService } from "@repo/services";

const TAGS = ["Workspace"];
const getPath = generatePath("/workspace");

export const workspaceRouter = router({
  createWorkspace: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/create"), tags: TAGS } })
    .input(createWorkspaceInputSchema)
    .output(workspaceSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId || ctx.userId !== input.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }
      return workspaceService.createWorkspace(input);
    }),

  updateWorkspace: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/update"), tags: TAGS } })
    .input(updateWorkspaceInputSchema)
    .output(workspaceSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId || ctx.userId !== input.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }
      return workspaceService.updateWorkspace(input);
    }),

  deleteWorkspace: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/delete"), tags: TAGS } })
    .input(deleteWorkspaceInputSchema)
    .output(workspaceSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId || ctx.userId !== input.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }
      return workspaceService.deleteWorkspace(input);
    }),

  getWorkspace: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/get"), tags: TAGS } })
    .input(getWorkspaceInputSchema)
    .output(workspaceSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }
      return workspaceService.getWorkspace(input);
    }),

  getUserWorkspaces: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/list"), tags: TAGS } })
    .input(getUserWorkspacesInputSchema)
    .output(getUserWorkspacesOutputSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.userId || ctx.userId !== input.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }
      return workspaceService.getUserWorkspaces(input);
    }),

  inviteMember: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/invite"), tags: TAGS } })
    .input(inviteMemberInputSchema)
    .output(workspaceInviteSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId || ctx.userId !== input.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }
      return workspaceService.inviteMember(input);
    }),

  acceptInvite: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/invite/accept"), tags: TAGS } })
    .input(acceptInviteInputSchema)
    .output(successResponseSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId || ctx.userId !== input.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }
      return workspaceService.acceptInvite(input);
    }),

  removeMember: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/member/remove"), tags: TAGS } })
    .input(removeMemberInputSchema)
    .output(workspaceMemberSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId || ctx.userId !== input.currentUserId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }
      return workspaceService.removeMember(input);
    }),

  changeMemberRole: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/member/role"), tags: TAGS } })
    .input(changeMemberRoleInputSchema)
    .output(workspaceMemberSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId || ctx.userId !== input.currentUserId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }
      return workspaceService.changeMemberRole(input);
    }),

  getWorkspaceMembers: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/members"), tags: TAGS } })
    .input(getWorkspaceMembersInputSchema)
    .output(getWorkspaceMembersOutputSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }
      return workspaceService.getWorkspaceMembers(input);
    }),

  getWorkspaceInvites: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/invites"), tags: TAGS } })
    .input(getWorkspaceInvitesInputSchema)
    .output(getWorkspaceInvitesOutputSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }
      return workspaceService.getWorkspaceInvites(input);
    }),

  cancelInvite: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/invite/cancel"), tags: TAGS } })
    .input(cancelInviteInputSchema)
    .output(workspaceInviteSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId || ctx.userId !== input.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }
      return workspaceService.cancelInvite(input);
    }),
});
