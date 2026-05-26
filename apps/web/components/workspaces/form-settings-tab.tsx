"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ExternalLink, ImagePlus } from "lucide-react";

import { trpc } from "~/trpc/client";

import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { Separator } from "~/components/ui/separator";

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

const fieldClass =
  "h-10 rounded-xl border-border/60 bg-background/60 text-sm shadow-sm";

const themeDefaults = {
  themeName: "dark",
  backgroundColor: "#09090b",
  formBackgroundColor: "#18181b",
  headerBackgroundColor: "#27272a",
  textColor: "#ffffff",
  mutedTextColor: "#a1a1aa",
  primaryColor: "#3f3f46",
  buttonTextColor: "#ffffff",
  borderColor: "#27272a",
  inputBackgroundColor: "#27272a",
  inputTextColor: "#ffffff",
};

const presets: Record<string, Record<string, string>> = {
  dark: {
    backgroundColor: "#09090b",
    formBackgroundColor: "#18181b",
    headerBackgroundColor: "#27272a",
    primaryColor: "#3f3f46",
    buttonTextColor: "#ffffff",
    textColor: "#ffffff",
    mutedTextColor: "#a1a1aa",
    borderColor: "#27272a",
    inputBackgroundColor: "#27272a",
    inputTextColor: "#ffffff",
  },
  light: {
    backgroundColor: "#f4f4f5",
    formBackgroundColor: "#ffffff",
    headerBackgroundColor: "#e4e4e7",
    primaryColor: "#18181b",
    buttonTextColor: "#ffffff",
    textColor: "#09090b",
    mutedTextColor: "#71717a",
    borderColor: "#e4e4e7",
    inputBackgroundColor: "#f4f4f5",
    inputTextColor: "#09090b",
  },
  ocean: {
    backgroundColor: "#f0f9ff",
    formBackgroundColor: "#ffffff",
    headerBackgroundColor: "#e0f2fe",
    primaryColor: "#0284c7",
    buttonTextColor: "#ffffff",
    textColor: "#0f172a",
    mutedTextColor: "#475569",
    borderColor: "#e2e8f0",
    inputBackgroundColor: "#f8fafc",
    inputTextColor: "#0f172a",
  },
  emerald: {
    backgroundColor: "#f0fdf4",
    formBackgroundColor: "#ffffff",
    headerBackgroundColor: "#dcfce7",
    primaryColor: "#16a34a",
    buttonTextColor: "#ffffff",
    textColor: "#0f172a",
    mutedTextColor: "#475569",
    borderColor: "#e2e8f0",
    inputBackgroundColor: "#f8fafc",
    inputTextColor: "#0f172a",
  },
  sunset: {
    backgroundColor: "#fff7ed",
    formBackgroundColor: "#ffffff",
    headerBackgroundColor: "#ffedd5",
    primaryColor: "#ea580c",
    buttonTextColor: "#ffffff",
    textColor: "#0f172a",
    mutedTextColor: "#475569",
    borderColor: "#e2e8f0",
    inputBackgroundColor: "#f8fafc",
    inputTextColor: "#0f172a",
  },
};

export function FormSettingsTab({form,workspaceId,workspaceSlug,isAdminOrOwner,}: FormSettingsTabProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();

  const initialTheme = useMemo(
    () => ({
      ...themeDefaults,
      ...(form.themeConfig || {}),
    }),
    [form.themeConfig]
  );

  const [theme, setTheme] = useState(initialTheme);

  const updateTheme = (key: string, value: string) => {
    setTheme((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateForm = trpc.form.updateForm.useMutation({
    onSuccess: (data) => {
      toast.success(`Form "${data.title}" updated successfully`);
      utils.form.getFormBySlug.invalidate({
        workspaceId,
        slug: form.slug,
      });

      if (data.slug !== form.slug) {
        router.push(
          `/workspaces/${workspaceSlug}/form/${data.slug}?tab=settings`
        );
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

  const { data: bannerUrl = initialTheme.bannerUrl || "" } = useQuery({
    queryKey: ["formSettingsBannerUrl", form.id],
    queryFn: () => initialTheme.bannerUrl || "",
    initialData: initialTheme.bannerUrl || "",
  });

  const uploadFile = trpc.form.uploadFile.useMutation();

  const handleBannerUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

        queryClient.setQueryData(
          ["formSettingsBannerUrl", form.id],
          res.url
        );

        toast.success("Banner image uploaded");
      } catch {
        toast.error("Failed to upload banner image");
      }
    };
  };

  const handleUpdateForm = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    updateForm.mutate({
      formId: form.id,
      data: {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        slug: formData.get("slug") as string,
        accessLevel: formData.get("accessLevel") as string,
        isPublic: formData.get("accessLevel") !== "private",
        status: formData.get("status") as any,
        isTemplate:
          formData.get("isTemplate") === "true" ||
          formData.get("isTemplate") === "on",
        themeConfig: {
          ...theme,
          bannerUrl,
        },
      },
    });
  };

  const handleDeleteForm = () => {
    if (
      confirm(
        "Are you sure you want to delete this form? This will permanently delete all fields and submissions!"
      )
    ) {
      deleteForm.mutate({ formId: form.id });
    }
  };

  const copyShareLink = async () => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "";

    const shareUrl = `${origin}/form/${form.slug}/submit`;

    await navigator.clipboard.writeText(shareUrl);

    toast.success("Link copied to clipboard!");
  };

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/form/${form.slug}/submit`
      : "";

  const themeFields = [
    {
      key: "backgroundColor",
      label: "Page Background",
    },
    {
      key: "formBackgroundColor",
      label: "Form Background",
    },
    {
      key: "headerBackgroundColor",
      label: "Header Background",
    },
    {
      key: "primaryColor",
      label: "Primary Accent",
    },
    {
      key: "buttonTextColor",
      label: "Button Text",
    },
    {
      key: "textColor",
      label: "Text Color",
    },
    {
      key: "mutedTextColor",
      label: "Muted Text",
    },
    {
      key: "borderColor",
      label: "Border Color",
    },
    {
      key: "inputBackgroundColor",
      label: "Input Background",
    },
    {
      key: "inputTextColor",
      label: "Input Text",
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="overflow-hidden border-border/60 shadow-xl shadow-black/5">
        <CardHeader className="space-y-2 border-b bg-muted/30">
          <CardTitle className="text-xl">
            Form Settings
          </CardTitle>

          <CardDescription>
            Configure form details, visibility and custom
            appearance.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form
            onSubmit={handleUpdateForm}
            className="space-y-8"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Form Title</Label>

                <Input
                  id="title"
                  name="title"
                  required
                  defaultValue={form.title}
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description
                </Label>

                <Textarea
                  id="description"
                  name="description"
                  defaultValue={form.description || ""}
                  className="min-h-28 rounded-xl border-border/60 bg-background/60 text-sm shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Form Slug</Label>

                <Input
                  id="slug"
                  name="slug"
                  required
                  defaultValue={form.slug}
                  className={fieldClass}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>

                  <Select
                    name="status"
                    defaultValue={form.status}
                    disabled={!isAdminOrOwner}
                  >
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="draft">
                        Draft
                      </SelectItem>

                      <SelectItem value="published">
                        Published
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {!isAdminOrOwner && (
                    <p className="text-xs text-muted-foreground">
                      Only admins or owners can publish forms.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Access Level</Label>

                  <Select
                    name="accessLevel"
                    defaultValue={
                      form.accessLevel || "public"
                    }
                  >
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select access" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="public">
                        Public
                      </SelectItem>

                      <SelectItem value="unlisted">
                        Unlisted
                      </SelectItem>

                      <SelectItem value="private">
                        Private
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 px-4 py-4">
                <div className="space-y-1">
                  <Label
                    htmlFor="isTemplate"
                    className="font-medium"
                  >
                    Public Template
                  </Label>

                  <p className="text-xs text-muted-foreground">
                    Make this form available in templates.
                  </p>
                </div>

                <Switch
                  id="isTemplate"
                  name="isTemplate"
                  defaultChecked={form.isTemplate}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold tracking-tight">
                  Custom Theme
                </h3>

                <p className="text-sm text-muted-foreground">
                  Personalize the form appearance with your
                  branding.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Theme Preset</Label>
                <Select
                  value={theme.themeName || "dark"}
                  onValueChange={(val) => {
                    if (val === "custom") {
                      updateTheme("themeName", "custom");
                    } else {
                      const selected = presets[val];
                      if (selected) {
                        setTheme({
                          ...selected,
                          themeName: val,
                        });
                      }
                    }
                  }}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="Select theme preset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Default Dark</SelectItem>
                    <SelectItem value="light">Sleek Light</SelectItem>
                    <SelectItem value="ocean">Ocean Breeze</SelectItem>
                    <SelectItem value="emerald">Forest Emerald</SelectItem>
                    <SelectItem value="sunset">Sunset Glow</SelectItem>
                    <SelectItem value="custom">Custom Theme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="border-border/60 bg-muted/20 shadow-none">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center gap-2">
                    <ImagePlus className="h-4 w-4" />

                    <div>
                      <p className="text-sm font-medium">
                        Banner Image
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Upload or paste a banner image URL.
                      </p>
                    </div>
                  </div>

                  {bannerUrl && (
                    <div className="overflow-hidden rounded-2xl border border-border/60">
                      <img
                        src={bannerUrl}
                        alt="Banner"
                        className="h-40 w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className={fieldClass}
                    />

                    <Input
                      value={bannerUrl}
                      placeholder="Paste image URL"
                      onChange={(e) =>
                        queryClient.setQueryData(
                          [
                            "formSettingsBannerUrl",
                            form.id,
                          ],
                          e.target.value
                        )
                      }
                      className={fieldClass}
                    />
                  </div>

                  {bannerUrl && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="rounded-xl"
                      onClick={() =>
                        queryClient.setQueryData(
                          [
                            "formSettingsBannerUrl",
                            form.id,
                          ],
                          ""
                        )
                      }
                    >
                      Remove Banner
                    </Button>
                  )}
                </CardContent>
              </Card>

              {theme.themeName === "custom" && (
                <div className="grid gap-4 md:grid-cols-2">
                  {themeFields.map((item) => (
                    <div
                      key={item.key}
                      className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4"
                    >
                      <Label className="text-sm font-medium">
                        {item.label}
                      </Label>

                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={
                            theme[
                              item.key as keyof typeof theme
                            ]
                          }
                          onChange={(e) =>
                            updateTheme(
                              item.key,
                              e.target.value
                            )
                          }
                          className="h-11 w-14 cursor-pointer rounded-xl border border-border bg-transparent"
                        />

                        <Input
                          name={item.key}
                          value={
                            theme[
                              item.key as keyof typeof theme
                            ]
                          }
                          onChange={(e) =>
                            updateTheme(
                              item.key,
                              e.target.value
                            )
                          }
                          className="h-11 rounded-xl font-mono text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={updateForm.isPending}
              className="h-11 rounded-xl px-6 text-sm font-medium shadow-lg"
            >
              {updateForm.isPending
                ? "Saving Changes..."
                : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border/60 shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle>Sharing</CardTitle>

            <CardDescription>
              Share your form publicly.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <Button
              variant="outline"
              onClick={copyShareLink}
              className="h-11 w-full rounded-xl"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Public URL
            </Button>

            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="h-11 w-full rounded-xl">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Live Form
              </Button>
            </a>
          </CardContent>
        </Card>

        {isAdminOrOwner && (
          <Card className="border-destructive/30 shadow-lg shadow-red-500/5">
            <CardHeader>
              <CardTitle className="text-destructive">
                Danger Zone
              </CardTitle>

              <CardDescription>
                Permanently delete this form and all
                submissions.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button
                variant="destructive"
                onClick={handleDeleteForm}
                disabled={deleteForm.isPending}
                className="h-11 w-full rounded-xl"
              >
                {deleteForm.isPending
                  ? "Deleting..."
                  : "Delete Form"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}