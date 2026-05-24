"use client";

import React from "react";
import { trpc } from "~/trpc/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Spinner } from "~/components/ui/spinner";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Card, CardContent } from "~/components/ui/card";
import { Mail, Shield, Calendar } from "lucide-react";

interface MemberDetailsDialogProps {
  workspaceId: string | null;
  userId: string | null;
  open: boolean;
  onClose: () => void;
}

export function MemberDetailsDialog({workspaceId,userId,open,onClose,}: MemberDetailsDialogProps) {
  
  const { data: member, isLoading } = trpc.workspace.getWorkspaceMemberDetails.useQuery(
    { workspaceId: workspaceId || "", userId: userId || "" },
    { enabled: !!workspaceId && !!userId && open }
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl p-6 bg-zinc-950 text-white border-zinc-800">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold">Member Details</DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            View profile information and workspace role.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : member ? (
          <div className="space-y-6 mt-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <Avatar className="h-20 w-20 border border-zinc-800">
                {member.profileImageUrl && <AvatarImage src={member.profileImageUrl} alt={member.name} />}
                <AvatarFallback className="text-xl bg-zinc-800 text-zinc-300">
                  {member.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-bold">{member.name}</h3>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold capitalize ${
                  member.role === "owner" ? "bg-purple-950/60 text-purple-400 border border-purple-900" :
                  member.role === "admin" ? "bg-blue-950/60 text-blue-400 border border-blue-900" :
                  "bg-zinc-800 text-zinc-400 border border-zinc-700"
                }`}>
                  {member.role}
                </span>
              </div>
            </div>

            <Card className="bg-zinc-900 border-zinc-800 text-white rounded-2xl overflow-hidden">
              <CardContent className="p-4 space-y-3.5">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-zinc-400" />
                  <div className="flex-1">
                    <p className="text-xs text-zinc-400">Email Address</p>
                    <p className="text-zinc-200">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-zinc-400" />
                  <div className="flex-1">
                    <p className="text-xs text-zinc-400">Workspace Role</p>
                    <p className="text-zinc-200 capitalize">{member.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  <div className="flex-1">
                    <p className="text-xs text-zinc-400">Joined Workspace</p>
                    <p className="text-zinc-200">
                      {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-zinc-500">
            Failed to load member details.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
