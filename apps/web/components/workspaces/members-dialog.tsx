"use client";

import React, { FormEvent } from "react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Loader2, UserMinus, MoreVertical, UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "~/components/ui/table";
import { Spinner } from "~/components/ui/spinner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";

interface WorkspaceMembersDialogProps {
  workspaceId: string | null;
  open: boolean;
  onClose: () => void;
}

export function WorkspaceMembersDialog({
  workspaceId,
  open,
  onClose,
}: WorkspaceMembersDialogProps) {
  const utils = trpc.useUtils();

  const { data: members, isLoading: membersLoading } =
    trpc.workspace.getWorkspaceMembers.useQuery(
      { workspaceId: workspaceId || "" },
      { enabled: !!workspaceId && open }
    );

  const { data: invites, isLoading: invitesLoading } =
    trpc.workspace.getWorkspaceInvites.useQuery(
      { workspaceId: workspaceId || "" },
      { enabled: !!workspaceId && open }
    );

  const cancelInvite = trpc.workspace.cancelInvite.useMutation({
    onSuccess: () => {
      utils.workspace.getWorkspaceInvites.invalidate({
        workspaceId: workspaceId!,
      });
      toast.success("Invitation cancelled");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to cancel invitation");
    },
  });

  const removeMember = trpc.workspace.removeMember.useMutation({
    onSuccess: () => {
      utils.workspace.getWorkspaceMembers.invalidate({
        workspaceId: workspaceId!,
      });
      toast.success("Member removed from workspace");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to remove member");
    },
  });

  const changeMemberRole = trpc.workspace.changeMemberRole.useMutation({
    onSuccess: () => {
      utils.workspace.getWorkspaceMembers.invalidate({
        workspaceId: workspaceId!,
      });
      toast.success("Role updated successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update role");
    },
  });

  const isLoading = membersLoading || invitesLoading;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl w-[95vw] border-accent max-h-[85vh] overflow-y-auto p-0 gap-0 rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Workspace members
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Manage members and pending invitations.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-6 p-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Active members
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Users with current workspace access.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  {members && members.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b">
                          <TableHead className="text-xs h-9">Name</TableHead>
                          <TableHead className="text-xs h-9">Role</TableHead>
                          <TableHead className="text-xs h-9 w-12.5"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.map((member) => (
                          <TableRow key={member.userId} className="border-b">
                            <TableCell className="py-2 text-sm font-medium">
                              {member.name}
                            </TableCell>
                            <TableCell className="py-2">
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${
                                  member.role === "owner"
                                    ? "bg-primary/10 text-primary"
                                    : member.role === "admin"
                                    ? "bg-blue-500/10 text-blue-500"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {member.role}
                              </span>
                            </TableCell>
                            <TableCell className="py-2 text-right">
                              {member.role !== "owner" && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-40">
                                    {member.role === "member" && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          changeMemberRole.mutate({
                                            workspaceId: workspaceId!,
                                            targetUserId: member.userId,
                                            role: "admin",
                                          })
                                        }
                                        disabled={changeMemberRole.isPending}
                                      >
                                        <UserCog className="mr-2 h-4 w-4" />
                                        Promote to admin
                                      </DropdownMenuItem>
                                    )}
                                    {member.role === "admin" && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          changeMemberRole.mutate({
                                            workspaceId: workspaceId!,
                                            targetUserId: member.userId,
                                            role: "member",
                                          })
                                        }
                                        disabled={changeMemberRole.isPending}
                                      >
                                        <UserCog className="mr-2 h-4 w-4" />
                                        Demote to member
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        removeMember.mutate({
                                          workspaceId: workspaceId!,
                                          targetUserId: member.userId,
                                        })
                                      }
                                      disabled={removeMember.isPending}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <UserMinus className="mr-2 h-4 w-4" />
                                      Remove member
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No members found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Pending invites
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Invitations waiting for acceptance.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  {invites && invites.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b">
                          <TableHead className="text-xs h-9">Email</TableHead>
                          <TableHead className="text-xs h-9">Role</TableHead>
                          <TableHead className="text-xs h-9 w-12.5"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invites.map((invite) => (
                          <TableRow key={invite.id} className="border-b">
                            <TableCell className="py-2 text-sm">
                              {invite.email}
                            </TableCell>
                            <TableCell className="py-2">
                              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                                {invite.role}
                              </span>
                            </TableCell>
                            <TableCell className="py-2 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() =>
                                  cancelInvite.mutate({
                                    workspaceId: workspaceId!,
                                    inviteId: invite.id,
                                  })
                                }
                                disabled={cancelInvite.isPending}
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No pending invites.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}