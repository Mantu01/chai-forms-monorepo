"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { trpc } from "~/trpc/client";
import { FileText, Users, BarChart3, ArrowLeft } from "lucide-react";

interface WorkspaceHeaderProps {
  slug: string;
}

const mainTabs = [
  { id: "forms", label: "Forms", icon: FileText, path: (slug: string) => `/workspaces/${slug}/forms` },
  { id: "members", label: "Members", icon: Users, path: (slug: string) => `/workspaces/${slug}/members` },
  { id: "analytics", label: "Analytics", icon: BarChart3, path: (slug: string) => `/workspaces/${slug}/analytics` },
];

const formsFilterTabs = [
  { id: "all", label: "All Forms" },
  { id: "draft", label: "Draft" },
  { id: "published", label: "Published" },
  { id: "unlisted", label: "Unlisted" },
  { id: "private", label: "Private" },
];

const analyticsFilterTabs = [
  { id: "overview", label: "Overview" },
  { id: "submissions", label: "Submissions" },
  { id: "device", label: "Devices" },
  { id: "country", label: "Countries" },
];

const formTabs = [
  { id: "fields", label: "Fields" },
  { id: "submissions", label: "Submissions" },
  { id: "settings", label: "Settings" },
];

export function WorkspaceHeader({ slug }: WorkspaceHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("filter") || "all";
  const currentAnalyticsTab = searchParams.get("type") || "overview";

  const parts = pathname.split("/");
  const formIndex = parts.indexOf("form");
  const formSlug = formIndex !== -1 ? parts[formIndex + 1] : null;
  const isFormDetailsPage = formIndex !== -1 && !!formSlug;
  const activeFormTab = searchParams.get("tab") || "fields";

  const { data: workspace, isLoading } = trpc.workspace.getWorkspaceBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const { data: form } = trpc.form.getFormBySlug.useQuery(
    { workspaceId: workspace?.id || "", slug: formSlug || "" },
    { enabled: !!workspace?.id && !!formSlug }
  );

  if (isLoading || !workspace) {
    return (
      <div className="flex h-24 items-center justify-center rounded-xl border bg-card">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isFormsPath = pathname.endsWith(`/forms`);
  const isAnalyticsPath = pathname.endsWith(`/analytics`);
  const isMembersPath = pathname.endsWith(`/members`);
  const isMainWorkspacePath = pathname === `/workspaces/${slug}` || pathname === `/workspaces/${slug}/`;

  return (
    <div className="border bg-linear-to-br from-card to-card/80 shadow-sm backdrop-blur-sm transition-all">
      <div className="flex flex-col gap-4 p-2 px-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href={isFormDetailsPage ? `/workspaces/${workspace.slug}/forms` : "/workspaces"}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-border/80 flex items-center justify-center">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={isFormDetailsPage ? `/workspaces/${workspace.slug}/form/${formSlug}?tab=fields` : `/workspaces/${workspace.slug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Avatar className="h-12 w-12 rounded-xl border shadow-sm">
              <AvatarImage src={workspace.logoUrl || undefined} alt={workspace.name} />
              <AvatarFallback className="rounded-xl bg-linear-to-br from-primary/20 to-primary/5 text-sm font-semibold">
                {getInitials(workspace.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">
                  {isFormDetailsPage && form ? form.title : workspace.name}
                </h1>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-mono text-[11px]">
                  {isFormDetailsPage ? `${workspace.name} / ${formSlug}` : workspace.slug}
                </span>
              </p>
            </div>
          </Link>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {isMainWorkspacePath && mainTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link key={tab.id} href={tab.path(workspace.slug)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-3 text-xs font-normal transition-all text-muted-foreground hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </Button>
              </Link>
            );
          })}

          {isFormsPath && formsFilterTabs.map((tab) => {
            const isActive = currentFilter === tab.id;
            return (
              <Link key={tab.id} href={`?filter=${tab.id}`} scroll={false}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 gap-1.5 px-3 text-xs font-normal transition-all ${
                    isActive
                      ? "shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </Button>
              </Link>
            );
          })}

          {isAnalyticsPath && analyticsFilterTabs.map((tab) => {
            const isActive = currentAnalyticsTab === tab.id;
            return (
              <Link key={tab.id} href={`?type=${tab.id}`} scroll={false}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 gap-1.5 px-3 text-xs font-normal transition-all ${
                    isActive
                      ? "shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </Button>
              </Link>
            );
          })}

          {isFormDetailsPage && formTabs.map((tab) => {
            const isActive = activeFormTab === tab.id;
            return (
              <Link key={tab.id} href={`?tab=${tab.id}`} scroll={false}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 gap-1.5 px-3 text-xs font-normal transition-all ${
                    isActive
                      ? "shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </Button>
              </Link>
            );
          })}

          {isMembersPath && (
            <span className="text-xs text-muted-foreground self-center px-3 py-1 bg-muted/50 rounded-lg border">
              Workspace Members
            </span>
          )}
        </div>
      </div>
      <div className="h-0.5 bg-linear-to-r from-primary/20 via-primary/50 to-primary/20" />
    </div>
  );
}