"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";

import { Suspense } from "react";

function WorkspacesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();

  const { data: userData, isLoading: userLoading } = trpc.auth.me.useQuery();
  const userId = userData?.user?.id;

  const { data: workspaces, isLoading: workspacesLoading } = trpc.workspace.getUserWorkspaces.useQuery(
    { userId: userId || "" },
    { enabled: !!userId }
  );

  const createWorkspace = trpc.workspace.createWorkspace.useMutation({
    onSuccess: () => {
      router.push("/workspaces");
      utils.workspace.getUserWorkspaces.invalidate();
    },
  });

  const isCreateOpen = searchParams.get("new-workspace") === "true";

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Spinner />
      </div>
    );
  }

  if (!userData?.user) {
    router.push("/auth");
    return null;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    createWorkspace.mutate({ userId, name, slug });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 space-y-6">
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div className="flex items-center space-x-3">
          <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors">
            Profile
          </Link>
          <span className="text-zinc-600">/</span>
          <h1 className="text-xl font-bold">Workspaces</h1>
        </div>
        <Link href="?new-workspace=true">
          <Button>Create Workspace</Button>
        </Link>
      </header>

      {workspacesLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : workspaces && workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workspaces.map((item) => (
            <Link key={item.workspace.id} href={`/workspaces/${item.workspace.id}`}>
              <Card className="bg-zinc-900 border-zinc-800 text-white hover:border-zinc-700 hover:bg-zinc-800/50 transition-all h-full flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center space-x-4">
                  <Avatar className="w-10 h-10">
                    {item.workspace.logoUrl && <AvatarImage src={item.workspace.logoUrl} alt={item.workspace.name} />}
                    <AvatarFallback>{item.workspace.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-bold">{item.workspace.name}</CardTitle>
                    <CardDescription className="text-zinc-500 font-mono text-xs">
                      {item.workspace.slug}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-zinc-400">
                    Role: <span className="font-semibold text-white capitalize">{item.role || "member"}</span>
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-lg">
          <p className="text-zinc-500 mb-4">You do not have any workspaces yet.</p>
          <Link href="?new-workspace=true">
            <Button variant="secondary">Create your first workspace</Button>
          </Link>
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={(open) => { if (!open) router.push("/workspaces"); }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Setup a new workspace to start designing forms and managing submissions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-zinc-300">Workspace Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Acme Corp"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="slug" className="text-zinc-300">Workspace Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  required
                  placeholder="acme"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/workspaces")}
                className="bg-transparent border-zinc-700 hover:bg-zinc-800 text-white"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createWorkspace.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function WorkspacesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white"><Spinner /></div>}>
      <WorkspacesContent />
    </Suspense>
  );
}
