"use client";

import { use } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { Users, FileText, CheckCircle2, FileEdit, ArrowRight, BarChart3, Mail, Plus } from "lucide-react";

interface WorkspacePageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceSlug } = use(params);

  const { data: workspace, isLoading: workspaceLoading } = trpc.workspace.getWorkspaceBySlug.useQuery(
    { slug: workspaceSlug },
    { enabled: !!workspaceSlug }
  );

  const workspaceId = workspace?.id;

  const { data: members, isLoading: membersLoading } = trpc.workspace.getWorkspaceMembers.useQuery(
    { workspaceId: workspaceId || "" },
    { enabled: !!workspaceId }
  );

  const { data: invites, isLoading: invitesLoading } = trpc.workspace.getWorkspaceInvites.useQuery(
    { workspaceId: workspaceId || "" },
    { enabled: !!workspaceId }
  );

  const { data: forms, isLoading: formsLoading } = trpc.form.getFormsWithStats.useQuery(
    { workspaceId: workspaceId || "" },
    { enabled: !!workspaceId }
  );

  if (workspaceLoading || membersLoading || invitesLoading || formsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!workspace || !workspaceId) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-muted-foreground">Workspace not found.</p>
      </div>
    );
  }

  const totalMembers = members?.length || 0;
  const pendingInvites = invites?.length || 0;
  const totalForms = forms?.length || 0;
  const activeForms = forms?.filter((f) => f.status === "published").length || 0;
  const draftForms = forms?.filter((f) => f.status === "draft").length || 0;
  const totalSubmissions = forms?.reduce((sum, f) => sum + (f.submissionCount || 0), 0) || 0;

  return (
    <div className="px-4 py-5 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Workspace Overview</h2>
          <p className="text-xs text-muted-foreground">
            Overview metrics and statistics for workspace: <span className="font-mono text-[11px] text-foreground">{workspace.name}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:scale-[1.01] hover:border-primary/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Forms</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold">{totalForms}</div>
            <div className="flex gap-2 text-2xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {activeForms} Active
              </span>
              <span className="flex items-center gap-1">
                <FileEdit className="h-3 w-3 text-amber-500" />
                {draftForms} Drafts
              </span>
            </div>
            <div className="pt-2 border-t border-border/50">
              <Link href={`/workspaces/${workspaceSlug}/forms`}>
                <Button variant="ghost" size="sm" className="w-full justify-between h-7 px-2 text-xs">
                  <span>View Forms</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-[1.01] hover:border-primary/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Form Submissions</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold">{totalSubmissions}</div>
            <p className="text-2xs text-muted-foreground">Total replies across all forms in this workspace</p>
            <div className="pt-2 border-t border-border/50">
              <Link href={`/workspaces/${workspaceSlug}/forms`}>
                <Button variant="ghost" size="sm" className="w-full justify-between h-7 px-2 text-xs">
                  <span>View Submissions</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-[1.01] hover:border-primary/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold">{totalMembers}</div>
            <div className="flex gap-2 text-2xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-blue-500" />
                {pendingInvites} Pending Invites
              </span>
            </div>
            <div className="pt-2 border-t border-border/50">
              <Link href={`/workspaces/${workspaceSlug}/members`}>
                <Button variant="ghost" size="sm" className="w-full justify-between h-7 px-2 text-xs">
                  <span>Manage Members</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            <CardDescription className="text-2xs">Common actions to get started quickly</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href={`/workspaces/${workspaceSlug}/forms?new-form=true`}>
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 rounded-xl hover:bg-muted/40 transition-colors">
                <Plus className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">Create New Form</span>
              </Button>
            </Link>
            <Link href={`/workspaces/${workspaceSlug}/members?new-invite=true`}>
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 rounded-xl hover:bg-muted/40 transition-colors">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">Invite Team Member</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Workspace Information</CardTitle>
            <CardDescription className="text-2xs">Details and metadata of your workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 py-2 border-b border-border/40 text-sm">
              <span className="text-muted-foreground text-xs">Workspace Name</span>
              <span className="font-semibold text-right">{workspace.name}</span>
            </div>
            <div className="grid grid-cols-2 py-2 border-b border-border/40 text-sm">
              <span className="text-muted-foreground text-xs">Workspace Slug</span>
              <span className="font-mono text-xs text-right">{workspace.slug}</span>
            </div>
            <div className="grid grid-cols-2 py-2 border-b border-border/40 text-sm">
              <span className="text-muted-foreground text-xs">Workspace ID</span>
              <span className="font-mono text-[10px] text-right truncate" title={workspace.id}>{workspace.id}</span>
            </div>
            <div className="grid grid-cols-2 py-2 text-sm">
              <span className="text-muted-foreground text-xs">Created On</span>
              <span className="font-mono text-xs text-right">
                {workspace.createdAt ? new Date(workspace.createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
