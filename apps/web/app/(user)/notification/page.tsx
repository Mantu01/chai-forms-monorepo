"use client";

import { trpc } from "~/trpc/client";
import { Spinner } from "~/components/ui/spinner";
import { toast } from "sonner";
import { InvitationCard } from "~/components/user/invitation-card";

export default function UserNotificationPage() {
  const utils = trpc.useUtils();
  const { data: userData, isLoading: userLoading } = trpc.auth.me.useQuery();
  const user = userData?.user;

  const { data: invites, isLoading: invitesLoading } = trpc.workspace.getPendingInvites.useQuery(undefined, {
    enabled: !!user,
  });

  const acceptInviteMutation = trpc.workspace.acceptInvite.useMutation({
    onSuccess: () => {
      utils.workspace.getPendingInvites.invalidate();
      utils.workspace.getUserWorkspaces.invalidate();
      toast.success("Joined workspace successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to accept invitation");
    },
  });

  const rejectInviteMutation = trpc.workspace.rejectInvite.useMutation({
    onSuccess: () => {
      utils.workspace.getPendingInvites.invalidate();
      toast.success("Invitation rejected");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to reject invitation");
    },
  });

  const handleAcceptInvite = (token: string) => {
    if (!user) return;
    acceptInviteMutation.mutate({
      token,
      userId: user.id,
      userName: user.fullName || "User",
    });
  };

  const handleRejectInvite = (inviteId: string) => {
    rejectInviteMutation.mutate({ inviteId });
  };

  if (userLoading || invitesLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10 text-xs text-muted-foreground bg-card rounded-xl border border-border">
        Please sign in to view notifications.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="text-lg font-bold tracking-tight">Workspace Invitations</h1>
        <p className="text-xs text-muted-foreground">Manage requests to collaborate inside shared spaces</p>
      </header>

      <div className="space-y-3 max-w-2xl">
        {!invites || invites.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl text-xs text-muted-foreground bg-card">
            No pending workspace invitations found.
          </div>
        ) : (
          invites.map((invite) => (
            <InvitationCard
              key={invite.id}
              invite={invite}
              onAccept={handleAcceptInvite}
              onReject={handleRejectInvite}
              isAccepting={acceptInviteMutation.isPending}
              isRejecting={rejectInviteMutation.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}
