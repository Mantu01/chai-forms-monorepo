"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";

interface SettingsTabProps {
  workspace: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  isAdminOrOwner: boolean;
}

export function SettingsTab({ workspace, isAdminOrOwner }: SettingsTabProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateWorkspace = trpc.workspace.updateWorkspace.useMutation({
    onSuccess: (data) => {
      toast.success("Workspace updated successfully");
      utils.workspace.getWorkspaceBySlug.invalidate({ slug: workspace.slug });
      utils.workspace.getUserWorkspaces.invalidate();
      if (data?.slug && data.slug !== workspace.slug) {
        router.push(`/workspaces/${data.slug}?tab=settings`);
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update workspace");
    },
  });

  const deleteWorkspace = trpc.workspace.deleteWorkspace.useMutation({
    onSuccess: () => {
      toast.success("Workspace deleted successfully");
      router.push("/workspaces");
      utils.workspace.getUserWorkspaces.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete workspace");
    },
  });

  const handleUpdateWorkspace = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    updateWorkspace.mutate({
      workspaceId: workspace.id,
      data: { name, slug },
    });
  };

  const handleUploadLogo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const logoFile = fileInputRef.current?.files?.[0];
    if (!logoFile) {
      toast.error("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("workspaceId", workspace.id);
    formData.append("logo", logoFile);

    try {
      const response = await fetch("http://localhost:5000/api/workspace/upload-logo", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Logo upload failed");
      }
      toast.success("Logo uploaded successfully");
      utils.workspace.getWorkspaceBySlug.invalidate({ slug: workspace.slug });
      utils.workspace.getUserWorkspaces.invalidate();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload logo");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Update workspace name and slug</CardDescription>
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
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="slug">Workspace Slug</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={workspace.slug}
                required
              />
            </div>
            <Button type="submit" disabled={updateWorkspace.isPending}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6 md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Workspace Logo</CardTitle>
            <CardDescription>Upload or change logo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workspace.logoUrl && (
              <div className="flex justify-center">
                <img
                  src={workspace.logoUrl}
                  alt="Logo"
                  className="max-h-24 max-w-full rounded object-contain border"
                />
              </div>
            )}
            <form onSubmit={handleUploadLogo} className="space-y-3">
              <Input
                ref={fileInputRef}
                type="file"
                name="logo"
                accept="image/*"
                required
              />
              <Button type="submit" variant="secondary" className="w-full">
                Upload Logo
              </Button>
            </form>
          </CardContent>
        </Card>

        {isAdminOrOwner && (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Delete workspace. This is permanent.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this workspace?")) {
                    deleteWorkspace.mutate({ workspaceId: workspace.id });
                  }
                }}
                disabled={deleteWorkspace.isPending}
              >
                Delete Workspace
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
