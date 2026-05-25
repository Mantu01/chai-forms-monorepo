"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface FormSettingsTabProps {
  form: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    status: "draft" | "published" | "archived";
    isPublic: boolean;
    isTemplate: boolean;
    accessLevel: string;
    themeConfig?: any;
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
  const queryClient = useQueryClient();

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

  const { data: bannerUrl = (form.themeConfig as any)?.bannerUrl || "" } = useQuery({
    queryKey: ["formSettingsBannerUrl", form.id],
    queryFn: () => (form.themeConfig as any)?.bannerUrl || "",
    initialData: (form.themeConfig as any)?.bannerUrl || "",
  });

  const uploadFile = trpc.form.uploadFile.useMutation();

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await uploadFile.mutateAsync({
          fileData: reader.result as string,
          folder: "banners",
        });
        queryClient.setQueryData(["formSettingsBannerUrl", form.id], res.url);
        toast.success("Banner image uploaded");
      } catch (err) {
        toast.error("Failed to upload banner image");
      }
    };
  };

  const handleUpdateForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const newSlug = formData.get("slug") as string;
    const accessLevel = formData.get("accessLevel") as string;
    const isPublic = accessLevel !== "private";
    const status = formData.get("status") as any;
    const isTemplate = formData.get("isTemplate") === "true" || formData.get("isTemplate") === "on";

    const themeConfig = {
      backgroundColor: formData.get("backgroundColor") as string,
      formBackgroundColor: formData.get("formBackgroundColor") as string,
      headerBackgroundColor: formData.get("headerBackgroundColor") as string,
      textColor: formData.get("textColor") as string,
      mutedTextColor: formData.get("mutedTextColor") as string,
      primaryColor: formData.get("primaryColor") as string,
      buttonTextColor: formData.get("buttonTextColor") as string,
      borderColor: formData.get("borderColor") as string,
      inputBackgroundColor: formData.get("inputBackgroundColor") as string,
      inputTextColor: formData.get("inputTextColor") as string,
      bannerUrl,
    };

    updateForm.mutate({
      formId: form.id,
      data: {
        title,
        description,
        slug: newSlug,
        isPublic,
        accessLevel,
        status,
        themeConfig,
        isTemplate,
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
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="form-desc" className="text-xs">Description</Label>
              <Textarea
                id="form-desc"
                name="description"
                defaultValue={form.description || ""}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="form-slug" className="text-xs">Form Slug</Label>
              <Input
                id="form-slug"
                name="slug"
                defaultValue={form.slug}
                required
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="form-status" className="text-xs">Status</Label>
                <Select name="status" defaultValue={form.status} disabled={!isAdminOrOwner}>
                  <SelectTrigger className="rounded-xl text-xs h-10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft" className="text-xs">Draft</SelectItem>
                    <SelectItem value="published" className="text-xs">Published</SelectItem>
                  </SelectContent>
                </Select>
                {!isAdminOrOwner && (
                  <p className="text-[10px] text-muted-foreground">Only administrators or owners can publish/archive forms.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="form-access" className="text-xs">Access Level</Label>
                <Select name="accessLevel" defaultValue={form.accessLevel || "public"}>
                  <SelectTrigger className="rounded-xl text-xs h-10">
                    <SelectValue placeholder="Select access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public" className="text-xs">Public (anyone can submit)</SelectItem>
                    <SelectItem value="unlisted" className="text-xs">Unlisted (access with link)</SelectItem>
                    <SelectItem value="private" className="text-xs">Private (only workspace members)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-border/80 rounded-xl bg-zinc-900/40">
              <div className="space-y-0.5">
                <Label htmlFor="form-is-template" className="text-xs font-semibold">Make Public Template</Label>
                <p className="text-[10px] text-muted-foreground">Feature this form in the community templates page for anyone to use.</p>
              </div>
              <Switch
                id="form-is-template"
                name="isTemplate"
                defaultChecked={form.isTemplate}
              />
            </div>

            <div className="border-t border-border/80 pt-6 mt-6">
              <h3 className="text-sm font-semibold mb-1 text-white font-sans">Form Custom Theme Styling</h3>
              <p className="text-2xs text-muted-foreground mb-4">Design the look & feel of your form by picking custom color highlights and banner header.</p>

              <div className="space-y-2 mb-6 p-4 rounded-xl border border-zinc-800 bg-zinc-950/40">
                <Label className="text-xs font-bold text-white">Custom Header Banner Image</Label>
                <p className="text-[10px] text-zinc-500">Upload a banner image to display on the first page of your form.</p>
                {bannerUrl && (
                  <div className="relative h-24 w-full overflow-hidden rounded-lg border border-zinc-800 mb-2">
                    <img src={bannerUrl} alt="Form Banner" className="h-full w-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => queryClient.setQueryData(["formSettingsBannerUrl", form.id], "")}
                      className="absolute right-2 top-2 h-7 px-2 text-2xs rounded-lg"
                    >
                      Remove
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="text-xs file:bg-zinc-800 file:text-white file:border-0 h-9 rounded-lg"
                  />
                  <Input
                    type="text"
                    placeholder="Or paste banner image URL"
                    value={bannerUrl}
                    onChange={(e) => queryClient.setQueryData(["formSettingsBannerUrl", form.id], e.target.value)}
                    className="text-xs h-9 rounded-lg flex-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="theme-bg" className="text-xs">Page Background</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" id="theme-bg-picker" value={(form.themeConfig as any)?.backgroundColor || "#09090b"} onChange={(e) => {
                      const input = document.getElementById("theme-bg") as HTMLInputElement;
                      if (input) input.value = e.target.value;
                    }} className="h-9 w-9 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
                    <Input id="theme-bg" name="backgroundColor" defaultValue={(form.themeConfig as any)?.backgroundColor || "#09090b"} className="h-9 rounded-xl flex-1 text-xs font-mono" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="theme-form-bg" className="text-xs">Form Background</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" id="theme-form-bg-picker" value={(form.themeConfig as any)?.formBackgroundColor || "#18181b"} onChange={(e) => {
                      const input = document.getElementById("theme-form-bg") as HTMLInputElement;
                      if (input) input.value = e.target.value;
                    }} className="h-9 w-9 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
                    <Input id="theme-form-bg" name="formBackgroundColor" defaultValue={(form.themeConfig as any)?.formBackgroundColor || "#18181b"} className="h-9 rounded-xl flex-1 text-xs font-mono" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="theme-header-bg" className="text-xs">Card Header Background</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" id="theme-header-bg-picker" value={(form.themeConfig as any)?.headerBackgroundColor || "#27272a"} onChange={(e) => {
                      const input = document.getElementById("theme-header-bg") as HTMLInputElement;
                      if (input) input.value = e.target.value;
                    }} className="h-9 w-9 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
                    <Input id="theme-header-bg" name="headerBackgroundColor" defaultValue={(form.themeConfig as any)?.headerBackgroundColor || "#27272a"} className="h-9 rounded-xl flex-1 text-xs font-mono" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="theme-primary" className="text-xs">Primary Accent / Button</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" id="theme-primary-picker" value={(form.themeConfig as any)?.primaryColor || "#3f3f46"} onChange={(e) => {
                      const input = document.getElementById("theme-primary") as HTMLInputElement;
                      if (input) input.value = e.target.value;
                    }} className="h-9 w-9 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
                    <Input id="theme-primary" name="primaryColor" defaultValue={(form.themeConfig as any)?.primaryColor || "#3f3f46"} className="h-9 rounded-xl flex-1 text-xs font-mono" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="theme-btn-txt" className="text-xs">Button Text</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" id="theme-btn-txt-picker" value={(form.themeConfig as any)?.buttonTextColor || "#ffffff"} onChange={(e) => {
                      const input = document.getElementById("theme-btn-txt") as HTMLInputElement;
                      if (input) input.value = e.target.value;
                    }} className="h-9 w-9 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
                    <Input id="theme-btn-txt" name="buttonTextColor" defaultValue={(form.themeConfig as any)?.buttonTextColor || "#ffffff"} className="h-9 rounded-xl flex-1 text-xs font-mono" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="theme-txt" className="text-xs">Text & Labels</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" id="theme-txt-picker" value={(form.themeConfig as any)?.textColor || "#ffffff"} onChange={(e) => {
                      const input = document.getElementById("theme-txt") as HTMLInputElement;
                      if (input) input.value = e.target.value;
                    }} className="h-9 w-9 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
                    <Input id="theme-txt" name="textColor" defaultValue={(form.themeConfig as any)?.textColor || "#ffffff"} className="h-9 rounded-xl flex-1 text-xs font-mono" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="theme-muted-txt" className="text-xs">Muted Description Text</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" id="theme-muted-txt-picker" value={(form.themeConfig as any)?.mutedTextColor || "#a1a1aa"} onChange={(e) => {
                      const input = document.getElementById("theme-muted-txt") as HTMLInputElement;
                      if (input) input.value = e.target.value;
                    }} className="h-9 w-9 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
                    <Input id="theme-muted-txt" name="mutedTextColor" defaultValue={(form.themeConfig as any)?.mutedTextColor || "#a1a1aa"} className="h-9 rounded-xl flex-1 text-xs font-mono" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="theme-border" className="text-xs">Border Color</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" id="theme-border-picker" value={(form.themeConfig as any)?.borderColor || "#27272a"} onChange={(e) => {
                      const input = document.getElementById("theme-border") as HTMLInputElement;
                      if (input) input.value = e.target.value;
                    }} className="h-9 w-9 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
                    <Input id="theme-border" name="borderColor" defaultValue={(form.themeConfig as any)?.borderColor || "#27272a"} className="h-9 rounded-xl flex-1 text-xs font-mono" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="theme-input-bg" className="text-xs">Input Background</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" id="theme-input-bg-picker" value={(form.themeConfig as any)?.inputBackgroundColor || "#27272a"} onChange={(e) => {
                      const input = document.getElementById("theme-input-bg") as HTMLInputElement;
                      if (input) input.value = e.target.value;
                    }} className="h-9 w-9 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
                    <Input id="theme-input-bg" name="inputBackgroundColor" defaultValue={(form.themeConfig as any)?.inputBackgroundColor || "#27272a"} className="h-9 rounded-xl flex-1 text-xs font-mono" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="theme-input-txt" className="text-xs">Input Text Color</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" id="theme-input-txt-picker" value={(form.themeConfig as any)?.inputTextColor || "#ffffff"} onChange={(e) => {
                      const input = document.getElementById("theme-input-txt") as HTMLInputElement;
                      if (input) input.value = e.target.value;
                    }} className="h-9 w-9 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
                    <Input id="theme-input-txt" name="inputTextColor" defaultValue={(form.themeConfig as any)?.inputTextColor || "#ffffff"} className="h-9 rounded-xl flex-1 text-xs font-mono" />
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={updateForm.isPending} className="rounded-xl mt-2 text-xs h-9">
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
            <Button variant="outline" className="w-full text-xs h-9" onClick={copyShareLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Public Url
            </Button>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
              <Button className="w-full text-xs h-9">
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
                className="w-full rounded-xl text-xs h-9"
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
