"use client";

import React, { FormEvent } from "react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Loader2, Plus, UserMinus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "~/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Spinner } from "~/components/ui/spinner";
import { Card } from "~/components/ui/card";

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

  const { data: members, isLoading: membersLoading } = trpc.workspace.getWorkspaceMembers.useQuery(
    { workspaceId: workspaceId || "" },
    { enabled: !!workspaceId && open }
  );

  const { data: invites, isLoading: invitesLoading } = trpc.workspace.getWorkspaceInvites.useQuery(
    { workspaceId: workspaceId || "" },
    { enabled: !!workspaceId && open }
  );

  const inviteMember = trpc.workspace.inviteMember.useMutation({
    onSuccess: () => {
      utils.workspace.getWorkspaceInvites.invalidate({ workspaceId: workspaceId! });
      toast.success("Invitation sent successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to invite member");
    },
  });

  const cancelInvite = trpc.workspace.cancelInvite.useMutation({
    onSuccess: () => {
      utils.workspace.getWorkspaceInvites.invalidate({ workspaceId: workspaceId! });
      toast.success("Invitation cancelled");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to cancel invitation");
    },
  });

  const removeMember = trpc.workspace.removeMember.useMutation({
    onSuccess: () => {
      utils.workspace.getWorkspaceMembers.invalidate({ workspaceId: workspaceId! });
      toast.success("Member removed from workspace");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to remove member");
    },
  });

  const changeMemberRole = trpc.workspace.changeMemberRole.useMutation({
    onSuccess: () => {
      utils.workspace.getWorkspaceMembers.invalidate({ workspaceId: workspaceId! });
      toast.success("Role updated successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update role");
    },
  });

  const handleInvite = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!workspaceId) return;

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const role = formData.get("role") as "admin" | "member";

    inviteMember.mutate({
      workspaceId,
      email,
      role,
    });
    e.currentTarget.reset();
  };

  const isLoading = membersLoading || invitesLoading;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl rounded-3xl p-6 overflow-y-auto max-h-[85vh]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-semibold">
            Manage Members
          </DialogTitle>
          <DialogDescription className="text-xs">
            Add team members, manage permissions, and see pending invitations.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold border-b pb-2">Active Members</h3>
                <div className="overflow-x-auto max-h-60 overflow-y-auto border rounded-xl">
                  {members && members.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">User ID</TableHead>
                          <TableHead className="text-xs">Role</TableHead>
                          <TableHead className="text-xs text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.map((member) => (
                          <TableRow key={member.userId}>
                            <TableCell className="font-mono text-[10px] truncate max-w-40">
                              {member.userId}
                            </TableCell>
                            <TableCell className="capitalize text-xs">
                              {member.role}
                            </TableCell>
                            <TableCell className="text-right">
                              {member.role !== "owner" && (
                                <div className="inline-flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-[10px] h-7 px-2 rounded-lg"
                                    onClick={() =>
                                      changeMemberRole.mutate({
                                        workspaceId: workspaceId!,
                                        targetUserId: member.userId,
                                        role: member.role === "admin" ? "member" : "admin",
                                      })
                                    }
                                  >
                                    Toggle Admin
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="text-[10px] h-7 px-2 rounded-lg gap-1"
                                    onClick={() =>
                                      removeMember.mutate({
                                        workspaceId: workspaceId!,
                                        targetUserId: member.userId,
                                      })
                                    }
                                  >
                                    <UserMinus className="h-3 w-3" />
                                    Remove
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No members found.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold border-b pb-2">Pending Invites</h3>
                <div className="overflow-x-auto max-h-40 overflow-y-auto border rounded-xl">
                  {invites && invites.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Email</TableHead>
                          <TableHead className="text-xs">Role</TableHead>
                          <TableHead className="text-xs text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invites.map((invite) => (
                          <TableRow key={invite.id}>
                            <TableCell className="text-xs">{invite.email}</TableCell>
                            <TableCell className="capitalize text-xs">{invite.role}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="text-[10px] h-7 px-2 rounded-lg"
                                onClick={() =>
                                  cancelInvite.mutate({
                                    workspaceId: workspaceId!,
                                    inviteId: invite.id,
                                  })
                                }
                              >
                                Cancel
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No pending invitations.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Card className="p-4 h-fit border rounded-2xl bg-muted/30">
              <h3 className="text-sm font-semibold mb-4 border-b pb-2">Invite Member</h3>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="invite-email" className="text-xs">
                    Email Address
                  </Label>
                  <Input
                    id="invite-email"
                    name="email"
                    type="email"
                    required
                    placeholder="teammate@company.com"
                    className="h-10 rounded-xl text-xs bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invite-role" className="text-xs">
                    Role
                  </Label>
                  <Select name="role" defaultValue="member">
                    <SelectTrigger className="h-10 rounded-xl text-xs bg-background">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={inviteMember.isPending}
                  className="w-full rounded-xl gap-1 text-xs"
                >
                  {inviteMember.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  Send Invitation
                </Button>
              </form>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
