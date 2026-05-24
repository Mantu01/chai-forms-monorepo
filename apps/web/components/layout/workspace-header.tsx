"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { trpc } from "~/trpc/client";
import { FileText, Users, BarChart3, Settings, Sparkles } from "lucide-react";

interface WorkspaceHeaderProps {
  slug: string;
}

const tabs = [
  { id: "forms", label: "Forms", icon: FileText },
  { id: "members", label: "Members", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export function WorkspaceHeader({ slug }: WorkspaceHeaderProps) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "forms";

  const { data: workspace, isLoading } = trpc.workspace.getWorkspaceBySlug.useQuery(
    { slug },
    { enabled: !!slug }
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

  return (
    <div className="border bg-linear-to-br from-card to-card/80 shadow-sm backdrop-blur-sm transition-all">
      <div className="flex flex-col gap-4 p-2 px-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 rounded-xl border shadow-sm">
            <AvatarImage src={workspace.logoUrl || undefined} alt={workspace.name} />
            <AvatarFallback className="rounded-xl bg-linear-to-br from-primary/20 to-primary/5 text-sm font-semibold">
              {getInitials(workspace.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{workspace.name}</h1>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-mono text-[11px]">{workspace.slug}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
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
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="h-0.5 bg-linear-to-r from-primary/20 via-primary/50 to-primary/20" />
    </div>
  );
}