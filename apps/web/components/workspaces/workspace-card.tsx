"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  FolderOpen,
  Trash2,
  Settings,
  Users,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import {
  Card,
  CardContent,
} from "~/components/ui/card";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

interface WorkspaceCardProps {
  workspace: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  role: string;
  onOpenMembers: (workspaceId: string) => void;
  onOpenSettings: (workspaceId: string) => void;
  onOpenDelete: (workspaceId: string) => void;
}

const actions = [
  { label: "Open", icon: FolderOpen },
  { label: "Members", icon: Users },
  { label: "Settings", icon: Settings },
  { label: "Delete", icon: Trash2, destructive: true },
];

export function WorkspaceCard({
  workspace,
  role,
  onOpenMembers,
  onOpenSettings,
  onOpenDelete,
}: WorkspaceCardProps) {
  const router = useRouter();

  const handleActionClick = (label: string) => {
    if (label === "Open") {
      router.push(`/workspaces/${workspace.slug}`);
    } else if (label === "Members") {
      onOpenMembers(workspace.id);
    } else if (label === "Settings") {
      onOpenSettings(workspace.id);
    } else if (label === "Delete") {
      onOpenDelete(workspace.id);
    }
  };

  return (
    <Card className="group overflow-hidden rounded-2xl border transition-all hover:scale-[1.01]">
      <CardContent className="flex h-45 flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/workspaces/${workspace.slug}`}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <Avatar className="h-11 w-11 rounded-xl">
              {workspace.logoUrl && (
                <AvatarImage
                  src={workspace.logoUrl}
                  alt={workspace.name}
                />
              )}

              <AvatarFallback className="rounded-xl text-xs font-semibold">
                {workspace.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 space-y-1">
              <h3 className="truncate text-sm font-semibold">
                {workspace.name}
              </h3>

              <p className="truncate text-[11px] text-muted-foreground">
                {workspace.slug}
              </p>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-lg"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
              {actions.map((action) => (
                <DropdownMenuItem
                  key={action.label}
                  onClick={() => handleActionClick(action.label)}
                  className={`gap-2 text-xs cursor-pointer ${
                    action.destructive
                      ? "text-red-500 hover:text-red-650"
                      : ""
                  }`}
                >
                  <action.icon className="h-3.5 w-3.5" />
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="rounded-md px-2 py-0.5 text-[10px] capitalize"
          >
            {role}
          </Badge>

          <Link
            href={`/workspaces/${workspace.slug}`}
            className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Open Workspace
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}