"use client";

import { use, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "~/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Suspense } from "react";
import { useAppSelector } from "~/lib/store";

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

  const { user, loading: userLoading } = useAppSelector((state) => state.user);
  const userId = user?.id;

  const { data: workspace, isLoading: workspaceLoading } = trpc.workspace.getWorkspaceBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const workspaceId = workspace?.id;

  const { data: forms, isLoading: formsLoading } = trpc.form.getFormsByWorkspace.useQuery(
    { workspaceId: workspaceId || "" },
    { enabled: currentTab === "forms" && !!workspaceId }
  );

  const { data: members, isLoading: membersLoading } = trpc.workspace.getWorkspaceMembers.useQuery(
    { workspaceId: workspaceId || "" },
    { enabled: currentTab === "members" && !!workspaceId }
  );

  const { data: invites, isLoading: invitesLoading } = trpc.workspace.getWorkspaceInvites.useQuery(
    { workspaceId: workspaceId || "" },
    { enabled: currentTab === "members" && !!workspaceId }
  );

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

  const cancelInvite = trpc.workspace.cancelInvite.useMutation({
    onSuccess: () => {
      if (workspaceId) {
        utils.workspace.getWorkspaceInvites.invalidate({ workspaceId });
      }
    },
  });

  const removeMember = trpc.workspace.removeMember.useMutation({
    onSuccess: () => {
      if (workspaceId) {
        utils.workspace.getWorkspaceMembers.invalidate({ workspaceId });
      }
    },
  });

  const changeMemberRole = trpc.workspace.changeMemberRole.useMutation({
    onSuccess: () => {
      if (workspaceId) {
        utils.workspace.getWorkspaceMembers.invalidate({ workspaceId });
      }
    },
  });

  const updateWorkspace = trpc.workspace.updateWorkspace.useMutation({
    onSuccess: (data) => {
      utils.workspace.getWorkspaceBySlug.invalidate({ slug });
      if (workspaceId) {
        utils.workspace.getWorkspace.invalidate({ workspaceId });
      }
      utils.workspace.getUserWorkspaces.invalidate();
      if (data?.slug && data.slug !== slug) {
        router.push(`/workspaces/${data.slug}?tab=settings`);
      }
    },
  });

  const deleteWorkspace = trpc.workspace.deleteWorkspace.useMutation({
    onSuccess: () => {
      router.push("/workspaces");
      utils.workspace.getUserWorkspaces.invalidate();
    },
  });

  if (userLoading || workspaceLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Spinner />
      </div>
    );
  }

  if (!user || !workspace) {
    router.push("/auth");
    return null;
  }

  const handleCreateForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId || !workspaceId) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    createForm.mutate({
      workspaceId,
      title,
      slug,
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

  const handleUpdateWorkspace = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId || !workspaceId) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const newSlug = formData.get("slug") as string;
    updateWorkspace.mutate({
      workspaceId,
      data: { name, slug: newSlug },
    });
  };

  const handleUploadLogo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId || !workspaceId) return;
    const formData = new FormData(e.currentTarget);
    formData.append("workspaceId", workspaceId);
    
    try {
      await fetch("http://localhost:5000/api/workspace/upload-logo", {
        method: "POST",
        body: formData,
      });
      utils.workspace.getWorkspaceBySlug.invalidate({ slug });
      utils.workspace.getWorkspace.invalidate({ workspaceId });
      utils.workspace.getUserWorkspaces.invalidate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 space-y-6">
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div className="flex items-center space-x-3">
          <Link href="/workspaces" className="text-zinc-400 hover:text-white transition-colors">
            Workspaces
          </Link>
          <span className="text-zinc-600">/</span>
          <Avatar className="w-8 h-8">
            {workspace.logoUrl && <AvatarImage src={workspace.logoUrl} alt={workspace.name} />}
            <AvatarFallback>{workspace.name[0]}</AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold">{workspace.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Link href="?tab=forms" className={currentTab === "forms" ? "text-white" : "text-zinc-400"}>
            <Button variant={currentTab === "forms" ? "default" : "ghost"}>Forms</Button>
          </Link>
          <Link href="?tab=members" className={currentTab === "members" ? "text-white" : "text-zinc-400"}>
            <Button variant={currentTab === "members" ? "default" : "ghost"}>Members</Button>
          </Link>
          <Link href="?tab=settings" className={currentTab === "settings" ? "text-white" : "text-zinc-400"}>
            <Button variant={currentTab === "settings" ? "default" : "ghost"}>Settings</Button>
          </Link>
        </div>
      </header>

      {currentTab === "forms" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Forms</h2>
            <Link href="?tab=forms&new-form=true">
              <Button>Create Form</Button>
            </Link>
          </div>

          {formsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : forms && forms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {forms.map((form) => (
                <Link key={form.id} href={`/workspaces/${slug}/form/${form.slug}`}>
                  <Card className="bg-zinc-900 border-zinc-800 text-white hover:border-zinc-700 hover:bg-zinc-800/50 transition-all h-full">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">{form.title}</CardTitle>
                      <CardDescription className="text-zinc-400 font-mono text-xs">{form.slug}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-zinc-300 line-clamp-2">{form.description || "No description provided."}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                      <span>Status: <span className="capitalize font-semibold text-zinc-300">{form.status}</span></span>
                      <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-lg">
              <p className="text-zinc-500">No forms created inside this workspace yet.</p>
            </div>
          )}
        </div>
      )}

      {currentTab === "members" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Members</CardTitle>
                <CardDescription className="text-zinc-400">Users with access to this workspace</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <Spinner />
              ) : members && members.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-zinc-400">User ID</TableHead>
                      <TableHead className="text-zinc-400">Role</TableHead>
                      <TableHead className="text-zinc-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.userId} className="border-zinc-800">
                        <TableCell className="font-mono text-xs text-zinc-300">{member.userId}</TableCell>
                        <TableCell className="capitalize text-zinc-300">{member.role}</TableCell>
                        <TableCell className="space-x-2">
                          {member.role !== "owner" && (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
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
                                onClick={() =>
                                  removeMember.mutate({
                                    workspaceId: workspaceId!,
                                    targetUserId: member.userId,
                                  })
                                }
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
                <p className="text-zinc-500">No members found.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Invites</CardTitle>
                <CardDescription className="text-zinc-400">Pending workspace invitations</CardDescription>
              </div>
              <Link href="?tab=members&new-invite=true">
                <Button size="sm">Invite Member</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {invitesLoading ? (
                <Spinner />
              ) : invites && invites.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-zinc-400">Email</TableHead>
                      <TableHead className="text-zinc-400">Role</TableHead>
                      <TableHead className="text-zinc-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invites.map((invite) => (
                      <TableRow key={invite.id} className="border-zinc-800">
                        <TableCell className="text-zinc-300">{invite.email}</TableCell>
                        <TableCell className="capitalize text-zinc-300">{invite.role}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
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
                <p className="text-zinc-500">No pending invites.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {currentTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900 border-zinc-800 text-white md:col-span-2">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription className="text-zinc-400">Update workspace name and slug</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateWorkspace} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={workspace.name}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="slug">Workspace Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    defaultValue={workspace.slug}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <Button type="submit" disabled={updateWorkspace.isPending}>
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6 md:col-span-1">
            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader>
                <CardTitle>Workspace Logo</CardTitle>
                <CardDescription className="text-zinc-400">Upload or change logo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {workspace.logoUrl && (
                  <div className="flex justify-center">
                    <img src={workspace.logoUrl} alt="Logo" className="max-h-24 max-w-full rounded object-contain border border-zinc-800" />
                  </div>
                )}
                <form onSubmit={handleUploadLogo} className="space-y-3">
                  <Input
                    type="file"
                    name="logo"
                    accept="image/*"
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                  <Button type="submit" variant="secondary" className="w-full">
                    Upload Logo
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription className="text-zinc-400">Delete workspace. This is permanent.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this workspace?")) {
                      deleteWorkspace.mutate({ workspaceId: workspaceId! });
                    }
                  }}
                >
                  Delete Workspace
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Dialog open={searchParams.get("new-form") === "true"} onOpenChange={(open) => { if (!open) router.push(`?tab=forms`); }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <form onSubmit={handleCreateForm} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Create Form</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Setup a new form to start gathering responses from your users.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="form-title" className="text-zinc-300">Form Title</Label>
                <Input
                  id="form-title"
                  name="title"
                  required
                  placeholder="Feedback Form"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="form-slug" className="text-zinc-300">Form Slug</Label>
                <Input
                  id="form-slug"
                  name="slug"
                  required
                  placeholder="feedback"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="form-desc" className="text-zinc-300">Description</Label>
                <Input
                  id="form-desc"
                  name="description"
                  placeholder="Help us improve our service by providing your feedback."
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`?tab=forms`)}
                className="bg-transparent border-zinc-700 hover:bg-zinc-800 text-white"
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
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <form onSubmit={handleInviteMember} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Invite Member</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Send an invite link to someone to join this workspace.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="colleague@acme.com"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="role" className="text-zinc-300">Role</Label>
                <Select name="role" defaultValue="member">
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
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
                className="bg-transparent border-zinc-700 hover:bg-zinc-800 text-white"
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
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white"><Spinner /></div>}>
      <WorkspaceContent {...props} />
    </Suspense>
  );
}
