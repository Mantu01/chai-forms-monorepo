"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useAppSelector } from "~/lib/store";
import { Spinner } from "~/components/ui/spinner";
import { WorkspaceCard } from "./workspace-card";
import { CreateWorkspaceDialog } from "./workspace-dialog";
import { WorkspaceMembersDialog } from "./members-dialog";
import { WorkspaceSettingsDialog } from "./settings-dialog";
import { WorkspaceDeleteDialog } from "./delete-dialog";
import { Card } from "~/components/ui/card";

export function WorkspacesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, loading: userLoading } = useAppSelector((state) => state.user);
  const { workspaces, loading: workspacesLoading } = useAppSelector((state) => state.workspace);

  const userId = user?.id;

  const [activeMembersId, setActiveMembersId] = useState<string | null>(null);
  const [activeSettingsId, setActiveSettingsId] = useState<string | null>(null);
  const [activeDeleteId, setActiveDeleteId] = useState<string | null>(null);

  const isCreateOpen = searchParams.get("new-workspace") === "true";

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    router.push("/auth");
    return null;
  }

  return (
    <>
      <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight">
                Workspaces
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage and organize all your collaborative spaces
              </p>
            </div>
          </div>

          {workspacesLoading && !workspaces ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {(workspaces ?? []).map((item) => (
                <WorkspaceCard
                  key={item.workspace.id}
                  workspace={item.workspace}
                  role={item.role || "member"}
                  onOpenMembers={setActiveMembersId}
                  onOpenSettings={setActiveSettingsId}
                  onOpenDelete={setActiveDeleteId}
                />
              ))}

              <Card
                onClick={() =>
                  router.push("/workspaces?new-workspace=true")
                }
                className="group flex h-45 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed transition-all hover:scale-[1.01]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border bg-muted/40 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Plus className="h-5 w-5" />
                </div>

                <div className="space-y-1 text-center">
                  <h3 className="text-sm font-medium">
                    Create Workspace
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Start a new collaborative environment
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      <CreateWorkspaceDialog
        open={isCreateOpen}
        onClose={() => router.push("/workspaces")}
        userId={userId}
      />

      <WorkspaceMembersDialog
        workspaceId={activeMembersId}
        open={!!activeMembersId}
        onClose={() => setActiveMembersId(null)}
      />

      <WorkspaceSettingsDialog
        workspaceId={activeSettingsId}
        open={!!activeSettingsId}
        onClose={() => setActiveSettingsId(null)}
      />

      <WorkspaceDeleteDialog
        workspaceId={activeDeleteId}
        open={!!activeDeleteId}
        onClose={() => setActiveDeleteId(null)}
      />
    </>
  );
}