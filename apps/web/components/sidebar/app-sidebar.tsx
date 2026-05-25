"use client";

import * as React from "react";
import {
  IconDatabase,
  IconHelp,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";

import { NavDocuments } from "~/components/sidebar/nav-documents";
import { NavMain } from "~/components/sidebar/nav-main";
import { NavUser } from "~/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import Logo from "../layout/logo";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();

  const { data: userData } = trpc.auth.me.useQuery();
  const user = userData?.user;

  const { data: invites } = trpc.workspace.getPendingInvites.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: userForms } = trpc.dashboard.getAllUserForms.useQuery(undefined, {
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
    }
  });

  const rejectInviteMutation = trpc.workspace.rejectInvite.useMutation({
    onSuccess: () => {
      utils.workspace.getPendingInvites.invalidate();
      toast.success("Invitation rejected");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to reject invitation");
    }
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

  const currentUser = user ? {
    name: user.fullName || "User",
    email: user.email || "",
    avatar: user.profileImageUrl || "",
    isSubscribed: !!user.isSubscribed,
  } : {
    name: "User",
    email: "",
    avatar: "",
    isSubscribed: false,
  };

  const documentItems = userForms? userForms.map((f) => f.title): [];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/" className="flex items-center gap-2">
                <Logo />
                <span className="text-base font-semibold">Chai Form</span>
                {user?.isSubscribed && (
                  <span className="rounded-md bg-linear-to-r from-amber-500 to-orange-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                    PRO
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavDocuments names={documentItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>

      <Dialog open={searchParams.get("notifications") === "true"} onOpenChange={(open) => { if (!open) router.push(window.location.pathname); }}>
        <DialogContent className="sm:max-w-md border-border bg-card/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Workspace Invitations</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Accept or reject pending invitations to join workspaces.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!invites || invites.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No pending invitations.</p>
            ) : (
              invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 border-border/55">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{invite.workspaceName}</p>
                    <p className="text-xs text-muted-foreground capitalize">Role: {invite.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAcceptInvite(invite.token)}
                      disabled={acceptInviteMutation.isPending}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleRejectInvite(invite.id)}
                      disabled={rejectInviteMutation.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
