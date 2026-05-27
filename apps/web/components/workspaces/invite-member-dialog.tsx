"use client";

import React, { useRef } from "react";
import { Mail, Shield, Loader2 } from "lucide-react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface InviteMemberDialogProps {
  workspaceId: string;
  open: boolean;
  onClose: () => void;
}

export function InviteMemberDialog({ workspaceId, open, onClose }: InviteMemberDialogProps) {
  const utils = trpc.useUtils();
  const formRef = useRef<HTMLFormElement>(null);

  const inviteMember = trpc.workspace.inviteMember.useMutation({
    onSuccess: () => {
      toast.success("Invitation sent successfully");
      utils.workspace.getWorkspaceInvites.invalidate({ workspaceId });
      if (formRef.current) {
        formRef.current.reset();
      }
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send invitation");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const role = formData.get("role") as "admin" | "member";

    inviteMember.mutate({
      workspaceId,
      email,
      role,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl p-6 bg-background border-border text-foreground">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold">Invite Member</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Invite a new member to collaborate in your workspace.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email" className="text-xs">
              Email Address
            </Label>
            <div className="flex items-center gap-2 rounded-xl border px-3 h-11 bg-card">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                id="invite-email"
                name="email"
                type="email"
                required
                placeholder="colleague@example.com"
                className="border-0 px-0 text-sm shadow-none focus-visible:ring-0 w-full bg-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role" className="text-xs">
              Workspace Role
            </Label>
            <div className="flex items-center gap-2 rounded-xl border px-3 h-11 bg-card">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <select
                id="invite-role"
                name="role"
                required
                defaultValue="member"
                className="bg-transparent border-0 px-0 text-sm focus:outline-hidden w-full h-full text-foreground cursor-pointer"
              >
                <option value="member" className="bg-background text-foreground">Member</option>
                <option value="admin" className="bg-background text-foreground">Admin</option>
              </select>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl"
              disabled={inviteMember.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={inviteMember.isPending}
              className="rounded-xl"
            >
              {inviteMember.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Invite"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
