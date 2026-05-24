"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "~/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { trpc } from "~/trpc/client";
import { MemberDetailsDialog } from "./member-details-dialog";

interface MembersTabProps {
  workspaceId: string;
  isAdminOrOwner: boolean;
  workspaceSlug: string;
}

export function MembersTab({ workspaceId, isAdminOrOwner, workspaceSlug }: MembersTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();

  const selectedMemberId = searchParams.get("memberId");

  const { data: members, isLoading: membersLoading } = trpc.workspace.getWorkspaceMembers.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  );

  const { data: invites, isLoading: invitesLoading } = trpc.workspace.getWorkspaceInvites.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  );

  const removeMember = trpc.workspace.removeMember.useMutation({
    onSuccess: () => {
      utils.workspace.getWorkspaceMembers.invalidate({ workspaceId });
    },
  });

  const changeMemberRole = trpc.workspace.changeMemberRole.useMutation({
    onSuccess: () => {
      utils.workspace.getWorkspaceMembers.invalidate({ workspaceId });
    },
  });

  const cancelInvite = trpc.workspace.cancelInvite.useMutation({
    onSuccess: () => {
      utils.workspace.getWorkspaceInvites.invalidate({ workspaceId });
    },
  });

  const handleMemberClick = (userId: string) => {
    router.push(`?tab=members&memberId=${userId}`);
  };

  const handleCloseMemberDetails = () => {
    router.push(`?tab=members`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>Users with access to this workspace</CardDescription>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <Spinner />
          ) : members && members.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow
                    key={member.userId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleMemberClick(member.userId)}
                  >
                    <TableCell className="font-mono text-xs">{member.name}</TableCell>
                    <TableCell className="capitalize">{member.role}</TableCell>
                    <TableCell className="space-x-2">
                      {member.role !== "owner" && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              changeMemberRole.mutate({
                                workspaceId,
                                targetUserId: member.userId,
                                role: member.role === "admin" ? "member" : "admin",
                              });
                            }}
                          >
                            Toggle Admin
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMember.mutate({
                                workspaceId,
                                targetUserId: member.userId,
                              });
                            }}
                          >
                            Remove
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm">No members found.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Invites</CardTitle>
            <CardDescription>Pending workspace invitations</CardDescription>
          </div>
          {isAdminOrOwner && (
            <Link href="?tab=members&new-invite=true">
              <Button size="sm">Invite Member</Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {invitesLoading ? (
            <Spinner />
          ) : invites && invites.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell className="capitalize">{invite.role}</TableCell>
                    <TableCell>
                      {isAdminOrOwner && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            cancelInvite.mutate({
                              workspaceId,
                              inviteId: invite.id,
                            })
                          }
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm">No pending invites.</p>
          )}
        </CardContent>
      </Card>

      <MemberDetailsDialog
        workspaceId={workspaceId}
        userId={selectedMemberId}
        open={!!selectedMemberId}
        onClose={handleCloseMemberDetails}
      />
    </div>
  );
}
