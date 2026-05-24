"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";

interface FormSettingsTabProps {
  form: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    status: "draft" | "published" | "archived";
    isPublic: boolean;
  };
  workspaceId: string;
  workspaceSlug: string;
  isAdminOrOwner: boolean;
}

export function FormSettingsTab({
  form,
  workspaceId,
  workspaceSlug,
  isAdminOrOwner,
}: FormSettingsTabProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const updateForm = trpc.form.updateForm.useMutation({
    onSuccess: (data) => {
      toast.success(`Form "${data.title}" updated successfully`);
      utils.form.getFormBySlug.invalidate({ workspaceId, slug: form.slug });
      if (data.slug !== form.slug) {
        router.push(`/workspaces/${workspaceSlug}/form/${data.slug}?tab=settings`);
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update form");
    },
  });

  const deleteForm = trpc.form.deleteForm.useMutation({
    onSuccess: () => {
      toast.success("Form deleted successfully");
      router.push(`/workspaces/${workspaceSlug}`);
      utils.form.getFormsByWorkspace.invalidate({ workspaceId });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete form");
    },
  });

  const handleUpdateForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const newSlug = formData.get("slug") as string;
    const isPublic = formData.get("isPublic") === "true";
    const status = formData.get("status") as any;

    updateForm.mutate({
      formId: form.id,
      data: {
        title,
        description,
        slug: newSlug,
        isPublic,
        status,
      },
    });
  };

  const handleDeleteForm = () => {
    if (confirm("Are you sure you want to delete this form? This will permanently delete all fields and submissions!")) {
      deleteForm.mutate({ formId: form.id });
    }
  };

  const copyShareLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${origin}/form/${form.slug}/submit`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/form/${form.slug}/submit` : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Form Settings</CardTitle>
          <CardDescription>Update general properties of your form</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateForm} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="form-title" className="text-xs">Form Title</Label>
              <Input
                id="form-title"
                name="title"
                defaultValue={form.title}
                required
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="form-desc" className="text-xs">Description</Label>
              <Textarea
                id="form-desc"
                name="description"
                defaultValue={form.description || ""}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="form-slug" className="text-xs">Form Slug</Label>
              <Input
                id="form-slug"
                name="slug"
                defaultValue={form.slug}
                required
                className="h-10 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="form-status" className="text-xs">Status</Label>
                <Select name="status" defaultValue={form.status} disabled={!isAdminOrOwner}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                {!isAdminOrOwner && (
                  <p className="text-[10px] text-muted-foreground">Only administrators or owners can publish/archive forms.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="form-public" className="text-xs">Access Level</Label>
                <Select name="isPublic" defaultValue={form.isPublic ? "true" : "false"}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Public (anyone can submit)</SelectItem>
                    <SelectItem value="false">Private (restricted access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={updateForm.isPending} className="rounded-xl mt-2">
              {updateForm.isPending ? "Saving Changes..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6 md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Sharing Links</CardTitle>
            <CardDescription>Share form with users to accept replies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full" onClick={copyShareLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Public Url
            </Button>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
              <Button className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Live Form
              </Button>
            </a>
          </CardContent>
        </Card>

        {isAdminOrOwner && (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive font-bold">Danger Zone</CardTitle>
              <CardDescription>Permanently delete this form and all response logs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full rounded-xl"
                onClick={handleDeleteForm}
                disabled={deleteForm.isPending}
              >
                {deleteForm.isPending ? "Deleting..." : "Delete Form"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
