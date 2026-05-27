"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ImagePlus,
  Loader2,
  Sparkles,
} from "lucide-react";

import { trpc } from "~/trpc/client";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card } from "~/components/ui/card";
import { getApiBaseUrl } from "~/lib/api-url";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
}

export function CreateWorkspaceDialog({ open, onClose, userId }: CreateWorkspaceDialogProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const slugInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createWorkspace = trpc.workspace.createWorkspace.useMutation();

  const handleGenerateRandomSlug = () => {
    let result = "";
    if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
      result = window.crypto.randomUUID().replace(/[^a-z]/gi, "").toLowerCase();
    } else {
      result = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }).replace(/[^a-z]/gi, "").toLowerCase();
    }
    
    const chars = "abcdefghijklmnopqrstuvwxyz";
    while (result.length < 10) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    
    if (slugInputRef.current) {
      slugInputRef.current.value = result.substring(0, 10);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const slug = slugInputRef.current?.value.trim() || "";
    const logoFile = fileInputRef.current?.files?.[0] || null;

    if (!slug) {
      toast.error("Workspace slug is required");
      return;
    }

    try {
      const data = await createWorkspace.mutateAsync({
        name,
        slug,
      });

      if (logoFile && data?.id) {
        const logoFormData = new FormData();
        logoFormData.append("workspaceId", data.id);
        logoFormData.append("logo", logoFile);

        const response = await fetch(`${getApiBaseUrl()}/api/workspace/upload-logo`, {
          method: "POST",
          body: logoFormData,
          credentials:'include'
        });

        if (!response.ok) {
          throw new Error("Workspace created, but logo upload failed.");
        }
      }

      toast.success(`Workspace "${name}" created successfully!`);
      await utils.workspace.getUserWorkspaces.invalidate();
      
      if (slugInputRef.current) {
        slugInputRef.current.value = "";
      }
      onClose();

      router.replace(`/workspaces/${slug}`);
    } catch (error: any) {
      console.error(error);
      const msg = error.message || "";
      if (msg.toLowerCase().includes("slug already exists") || msg.toLowerCase().includes("slug exists")) {
        toast.error("Failed to create workspace: Workspace slug already exists.");
      } else {
        toast.error(msg || "An unexpected error occurred while creating the workspace.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-3xl p-0">
        <div className="flex flex-col gap-6 p-6">
          <DialogHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-muted">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold">
                Create Workspace
              </DialogTitle>


              <DialogDescription className="text-xs">
                Create a collaborative workspace for your projects, forms and team members.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-xs">
                  Workspace Name
                </Label>

                <div className="flex items-center gap-2 rounded-xl border px-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Input
                    name="name"
                    required
                    placeholder="Acme Inc."
                    className="border-0 px-0 text-sm shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">
                    Workspace Slug
                  </Label>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-xs text-primary"
                    onClick={handleGenerateRandomSlug}
                  >
                    Generate random slug
                  </Button>
                </div>

                <Input
                  ref={slugInputRef}
                  name="slug"
                  required
                  placeholder="acme-inc"
                  className="h-11 rounded-xl text-sm"
                  onChange={(e) => {
                    if (slugInputRef.current) {
                      slugInputRef.current.value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">
                  Workspace Logo
                </Label>

                <Card className="flex items-center gap-3 rounded-2xl border-dashed p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-muted">
                    <ImagePlus className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">
                      PNG, JPG or SVG
                    </p>
                  </div>

                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="max-w-45 text-xs"
                  />
                </Card>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="rounded-xl"
                disabled={createWorkspace.isPending}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={createWorkspace.isPending}
                className="rounded-xl"
              >
                {createWorkspace.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating
                  </>
                ) : (
                  "Create Workspace"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}