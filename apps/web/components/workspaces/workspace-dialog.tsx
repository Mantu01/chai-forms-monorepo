"use client";

import { useState } from "react";
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

interface CreateWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
}

export function CreateWorkspaceDialog({ open, onClose, userId }: CreateWorkspaceDialogProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [logo, setLogo] = useState<File | null>(null);
  const [slugValue, setSlugValue] = useState("");
  const [slugError, setSlugError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    setSlugValue(result.substring(0, 10));
    setSlugError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const slug = slugValue.trim();

    if (!slug) {
      setSlugError("Workspace slug is required");
      return;
    }

    setIsSubmitting(true);
    setSlugError("");

    try {
      // 1. Create the workspace directly
      const data = await createWorkspace.mutateAsync({
        name,
        slug,
      });

      // 2. Upload logo if selected
      if (logo && data?.id) {
        const logoFormData = new FormData();
        logoFormData.append("workspaceId", data.id);
        logoFormData.append("logo", logo);

        const response = await fetch("http://localhost:5000/api/workspace/upload-logo", {
          method: "POST",
          body: logoFormData,
        });

        if (!response.ok) {
          throw new Error("Workspace created, but logo upload failed.");
        }
      }

      toast.success(`Workspace "${name}" created successfully!`);
      await utils.workspace.getUserWorkspaces.invalidate();
      
      // Reset form state
      setLogo(null);
      setSlugValue("");
      onClose();

      // Redirect to the newly created workspace
      router.push(`/workspaces/${slug}`);
    } catch (error: any) {
      console.error(error);
      const msg = error.message || "";
      if (msg.toLowerCase().includes("slug already exists") || msg.toLowerCase().includes("slug exists")) {
        setSlugError("This workspace slug is already taken. Please choose a different slug.");
        toast.error("Failed to create workspace: Workspace slug already exists.");
      } else {
        toast.error(msg || "An unexpected error occurred while creating the workspace.");
      }
    } finally {
      setIsSubmitting(false);
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
                  name="slug"
                  required
                  value={slugValue}
                  onChange={(e) => {
                    setSlugValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                    setSlugError("");
                  }}
                  placeholder="acme-inc"
                  className="h-11 rounded-xl text-sm"
                />
                {slugError && (
                  <p className="text-[11px] text-red-500 font-medium">{slugError}</p>
                )}
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
                      {logo ? logo.name : "Upload workspace logo"}
                    </p>

                    <p className="text-[11px] text-muted-foreground">
                      PNG, JPG or SVG
                    </p>
                  </div>

                  <Input
                    type="file"
                    accept="image/*"
                    className="max-w-45 text-xs"
                    onChange={(e) => setLogo(e.target.files?.[0] || null)}
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
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl"
              >
                {isSubmitting ? (
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