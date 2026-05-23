"use client";

import React, { FormEvent } from "react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";

interface WorkspaceSettingsDialogProps {
  workspaceId: string | null;
  open: boolean;
  onClose: () => void;
}

export function WorkspaceSettingsDialog({
  workspaceId,
  open,
  onClose,
}: WorkspaceSettingsDialogProps) {
  const utils = trpc.useUtils();

  const { data: workspace, isLoading: workspaceLoading } = trpc.workspace.getWorkspace.useQuery(
    { workspaceId: workspaceId || "" },
    { enabled: !!workspaceId && open }
  );

  const updateWorkspace = trpc.workspace.updateWorkspace.useMutation({
    onSuccess: () => {
      utils.workspace.getWorkspace.invalidate({ workspaceId: workspaceId! });
      utils.workspace.getUserWorkspaces.invalidate();
      toast.success("Workspace updated successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update workspace");
    },
  });

  const handleUpdateWorkspace = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!workspaceId) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    updateWorkspace.mutate({
      workspaceId,
      data: { name, slug },
    });
  };

  const handleUploadLogo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!workspaceId) return;
    const formData = new FormData(e.currentTarget);
    formData.append("workspaceId", workspaceId);

    try {
      const response = await fetch("http://localhost:5000/api/workspace/upload-logo", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload");
      utils.workspace.getWorkspace.invalidate({ workspaceId });
      utils.workspace.getUserWorkspaces.invalidate();
      toast.success("Logo uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload logo");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-3xl p-6 overflow-y-auto max-h-[85vh]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-semibold">
            Workspace Settings
          </DialogTitle>
          <DialogDescription className="text-xs">
            Manage your workspace name, slug, and branding
          </DialogDescription>
        </DialogHeader>

        {workspaceLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : !workspace ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            Failed to load workspace settings.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">General Info</h3>
              <form onSubmit={handleUpdateWorkspace} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="settings-name" className="text-xs">
                    Workspace Name
                  </Label>
                  <Input
                    id="settings-name"
                    name="name"
                    defaultValue={workspace.name}
                    required
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settings-slug" className="text-xs">
                    Workspace Slug
                  </Label>
                  <Input
                    id="settings-slug"
                    name="slug"
                    defaultValue={workspace.slug}
                    required
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={updateWorkspace.isPending}
                  className="rounded-xl w-full"
                >
                  {updateWorkspace.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">Workspace Logo</h3>
              <Card className="flex flex-col items-center justify-center p-4 border border-dashed rounded-2xl gap-3">
                {workspace.logoUrl ? (
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden border">
                    <img
                      src={workspace.logoUrl}
                      alt="Logo Preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted border text-muted-foreground text-2xl font-bold">
                    {workspace.name.charAt(0)}
                  </div>
                )}
                <form onSubmit={handleUploadLogo} className="w-full space-y-3">
                  <Input
                    type="file"
                    name="logo"
                    accept="image/*"
                    required
                    className="text-xs h-9"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    className="rounded-xl w-full text-xs"
                  >
                    Upload Logo
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
