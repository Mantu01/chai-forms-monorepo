"use client";

import { use, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Suspense } from "react";
import { FormsTab } from "~/components/workspaces/forms-tab";
import { MembersTab } from "~/components/workspaces/members-tab";
import { SettingsTab } from "~/components/workspaces/settings-tab";

interface WorkspacePageProps {
  params: Promise<{ workspaceSlug: string }>;
}

function WorkspaceContent({ params }: WorkspacePageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.workspaceSlug;
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();

  const currentTab = searchParams.get("tab") || "forms";

  const { data: userData, isLoading: userLoading } = trpc.auth.me.useQuery();
  const userId = userData?.user?.id;

  const { data: workspace, isLoading: workspaceLoading } = trpc.workspace.getWorkspaceBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const workspaceId = workspace?.id;

  const { data: members } = trpc.workspace.getWorkspaceMembers.useQuery(
    { workspaceId: workspaceId || "" },
    { enabled: !!workspaceId }
  );

  const currentUserMember = members?.find((m) => m.userId === userId);
  const userRole = currentUserMember?.role;
  const isAdminOrOwner = userRole ? ["owner", "admin"].includes(userRole) : false;

  const createForm = trpc.form.createForm.useMutation({
    onSuccess: () => {
      router.push(`?tab=forms`);
      if (workspaceId) {
        utils.form.getFormsByWorkspace.invalidate({ workspaceId });
      }
    },
  });

  const inviteMember = trpc.workspace.inviteMember.useMutation({
    onSuccess: () => {
      router.push(`?tab=members`);
      if (workspaceId) {
        utils.workspace.getWorkspaceInvites.invalidate({ workspaceId });
      }
    },
  });

  if (userLoading || workspaceLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!userData?.user || !workspace) {
    return null;
  }

  const handleCreateForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId || !workspaceId) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const formSlug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    createForm.mutate({
      workspaceId,
      title,
      slug: formSlug,
      description,
      themeConfig: {},
    });
  };

  const handleInviteMember = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId || !workspaceId) return;
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
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <main className="mt-4">
          {currentTab === "forms" && workspaceId && (
            <FormsTab workspaceId={workspaceId} workspaceSlug={slug} />
          )}

          {currentTab === "members" && workspaceId && (
            <MembersTab workspaceId={workspaceId} isAdminOrOwner={isAdminOrOwner} workspaceSlug={slug} />
          )}

          {currentTab === "settings" && (
            <SettingsTab workspace={workspace} isAdminOrOwner={isAdminOrOwner} />
          )}
        </main>
      </div>

      <Dialog open={searchParams.get("new-form") === "true"} onOpenChange={(open) => { if (!open) router.push(`?tab=forms`); }}>
        <DialogContent>
          <form onSubmit={handleCreateForm} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Create Form</DialogTitle>
              <DialogDescription>
                Setup a new form to start gathering responses from your users.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="form-title">Form Title</Label>
                <Input
                  id="form-title"
                  name="title"
                  required
                  placeholder="Feedback Form"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="form-slug">Form Slug</Label>
                <Input
                  id="form-slug"
                  name="slug"
                  required
                  placeholder="feedback"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="form-desc">Description</Label>
                <Input
                  id="form-desc"
                  name="description"
                  placeholder="Help us improve our service by providing your feedback."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`?tab=forms`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createForm.isPending}>
                Create Form
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={searchParams.get("new-invite") === "true"} onOpenChange={(open) => { if (!open) router.push(`?tab=members`); }}>
        <DialogContent>
          <form onSubmit={handleInviteMember} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Invite Member</DialogTitle>
              <DialogDescription>
                Send an invite link to someone to join this workspace.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="colleague@gmail.com"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="member">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`?tab=members`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMember.isPending}>
                Send Invite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function WorkspacePage(props: WorkspacePageProps) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Spinner /></div>}>
      <WorkspaceContent {...props} />
    </Suspense>
  );
}
