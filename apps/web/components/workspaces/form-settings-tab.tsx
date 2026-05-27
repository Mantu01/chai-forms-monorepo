"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, ImagePlus } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

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

const fieldClass = "h-10 rounded-xl border-border/60 bg-background/60 text-sm shadow-sm";

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

const formSettingsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  status: z.enum(["draft", "published", "archived"]),
  accessLevel: z.string(),
  isTemplate: z.boolean(),
  themeType: z.enum(["choose", "custom"]),
  defaultThemeId: z.string().optional().nullable(),
  themeName: z.string(),
  backgroundColor: z.string(),
  formBackgroundColor: z.string(),
  headerBackgroundColor: z.string(),
  primaryColor: z.string(),
  buttonTextColor: z.string(),
  textColor: z.string(),
  mutedTextColor: z.string(),
  borderColor: z.string(),
  inputBackgroundColor: z.string(),
  inputTextColor: z.string(),
  bannerUrl: z.string().optional().nullable(),
});

type FormSettingsData = z.infer<typeof formSettingsSchema>;

export function FormSettingsTab({ form, workspaceId, workspaceSlug, isAdminOrOwner }: FormSettingsTabProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const defaultThemesQuery = trpc.form.getDefaultThemes.useQuery();
  const defaultThemes = defaultThemesQuery.data || [];
  console.log({defaultThemes})

  const initialTheme = useMemo(() => ({
    ...themeDefaults,
    ...(form.themeConfig || {}),
  }), [form.themeConfig]);

  const formMethods = useForm<FormSettingsData>({
    resolver: zodResolver(formSettingsSchema),
    defaultValues: {
      title: form.title,
      description: form.description || "",
      slug: form.slug,
      status: form.status,
      accessLevel: form.accessLevel || "public",
      isTemplate: form.isTemplate,
      themeType: form.themeConfig?.defaultThemeId ? "choose" : "custom",
      defaultThemeId: form.themeConfig?.defaultThemeId || "",
      themeName: form.themeConfig?.themeName || "custom",
      backgroundColor: initialTheme.backgroundColor,
      formBackgroundColor: initialTheme.formBackgroundColor,
      headerBackgroundColor: initialTheme.headerBackgroundColor,
      primaryColor: initialTheme.primaryColor,
      buttonTextColor: initialTheme.buttonTextColor,
      textColor: initialTheme.textColor,
      mutedTextColor: initialTheme.mutedTextColor,
      borderColor: initialTheme.borderColor,
      inputBackgroundColor: initialTheme.inputBackgroundColor,
      inputTextColor: initialTheme.inputTextColor,
      bannerUrl: initialTheme.bannerUrl || "",
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = formMethods;

  const themeType = watch("themeType");
  const bannerUrl = watch("bannerUrl");

  const currentThemeValues = {
    backgroundColor: watch("backgroundColor"),
    formBackgroundColor: watch("formBackgroundColor"),
    headerBackgroundColor: watch("headerBackgroundColor"),
    primaryColor: watch("primaryColor"),
    buttonTextColor: watch("buttonTextColor"),
    textColor: watch("textColor"),
    mutedTextColor: watch("mutedTextColor"),
    borderColor: watch("borderColor"),
    inputBackgroundColor: watch("inputBackgroundColor"),
    inputTextColor: watch("inputTextColor"),
  };

  const updateForm = trpc.form.updateForm.useMutation({
    onSuccess: (data) => {
      toast.success(`Form "${data.title}" updated successfully`);
      utils.form.getFormBySlug.invalidate({
        workspaceId,
        slug: form.slug,
      });

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
        setValue("bannerUrl", res.url);
        if (watch("themeType") === "choose") {
          setValue("themeType", "custom");
          setValue("themeName", "custom");
          setValue("defaultThemeId", "");
        }
        toast.success("Banner image uploaded");
      } catch {
        toast.error("Failed to upload banner image");
      }
    };
  };

  const handleRemoveBanner = () => {
    setValue("bannerUrl", "");
    if (watch("themeType") === "choose") {
      setValue("themeType", "custom");
      setValue("themeName", "custom");
      setValue("defaultThemeId", "");
    }
  };

  const handleColorChange = (key: string, val: string) => {
    setValue(key as any, val);
    if (watch("themeType") === "choose") {
      setValue("themeType", "custom");
      setValue("themeName", "custom");
      setValue("defaultThemeId", "");
    }
  };

  const handleDefaultThemeSelect = (themeId: string) => {
    const selected = defaultThemes.find((t: any) => t.id === themeId);
    if (selected) {
      setValue("defaultThemeId", selected.id);
      setValue("themeName", selected.name);
      setValue("backgroundColor", selected.backgroundColor);
      setValue("formBackgroundColor", selected.formBackgroundColor);
      setValue("headerBackgroundColor", selected.headerBackgroundColor);
      setValue("primaryColor", selected.primaryColor);
      setValue("buttonTextColor", selected.buttonTextColor);
      setValue("textColor", selected.textColor);
      setValue("mutedTextColor", selected.mutedTextColor);
      setValue("borderColor", selected.borderColor);
      setValue("inputBackgroundColor", selected.inputBackgroundColor);
      setValue("inputTextColor", selected.inputTextColor);
      setValue("bannerUrl", selected.bannerUrl || "");
    }
  };

  const onSubmit = (data: FormSettingsData) => {
    updateForm.mutate({
      formId: form.id,
      data: {
        title: data.title,
        description: data.description,
        slug: data.slug,
        accessLevel: data.accessLevel,
        isPublic: data.accessLevel !== "private",
        status: data.status,
        isTemplate: data.isTemplate,
        themeConfig: {
          themeName: data.themeName,
          defaultThemeId: data.defaultThemeId || null,
          backgroundColor: data.backgroundColor,
          formBackgroundColor: data.formBackgroundColor,
          headerBackgroundColor: data.headerBackgroundColor,
          primaryColor: data.primaryColor,
          buttonTextColor: data.buttonTextColor,
          textColor: data.textColor,
          mutedTextColor: data.mutedTextColor,
          borderColor: data.borderColor,
          inputBackgroundColor: data.inputBackgroundColor,
          inputTextColor: data.inputTextColor,
          bannerUrl: data.bannerUrl || null,
        },
      },
    });
  };

  const handleDeleteForm = () => {
    if (confirm("Are you sure you want to delete this form? This will permanently delete all fields and submissions!")) {
      deleteForm.mutate({ formId: form.id });
    }
  };

  const copyShareLink = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${origin}/form/${form.slug}/submit`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/form/${form.slug}/submit` : "";

  const themeFields = [
    { key: "backgroundColor", label: "Page Background" },
    { key: "formBackgroundColor", label: "Form Background" },
    { key: "headerBackgroundColor", label: "Header Background" },
    { key: "primaryColor", label: "Primary Accent" },
    { key: "buttonTextColor", label: "Button Text" },
    { key: "textColor", label: "Text Color" },
    { key: "mutedTextColor", label: "Muted Text" },
    { key: "borderColor", label: "Border Color" },
    { key: "inputBackgroundColor", label: "Input Background" },
    { key: "inputTextColor", label: "Input Text" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="overflow-hidden border-border/60 shadow-xl shadow-black/5">
        <CardHeader className="space-y-2 border-b bg-muted/30">
          <CardTitle className="text-xl">Form Settings</CardTitle>
          <CardDescription>Configure form details, visibility and custom appearance.</CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Form Title</Label>
                <Input id="title" required className={fieldClass} {...register("title")} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" className="min-h-28 rounded-xl border-border/60 bg-background/60 text-sm shadow-sm" {...register("description")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Form Slug</Label>
                <Input id="slug" required className={fieldClass} {...register("slug")} />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Controller
                    control={formMethods.control}
                    name="status"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={!isAdminOrOwner}>
                        <SelectTrigger className={fieldClass}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {!isAdminOrOwner && <p className="text-xs text-muted-foreground">Only admins or owners can publish forms.</p>}
                </div>

                <div className="space-y-2">
                  <Label>Access Level</Label>
                  <Controller
                    control={formMethods.control}
                    name="accessLevel"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={fieldClass}>
                          <SelectValue placeholder="Select access" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="unlisted">Unlisted</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 px-4 py-4">
                <div className="space-y-1">
                  <Label htmlFor="isTemplate" className="font-medium">Public Template</Label>
                  <p className="text-xs text-muted-foreground">Make this form available in templates.</p>
                </div>
                <Controller
                  control={formMethods.control}
                  name="isTemplate"
                  render={({ field }) => (
                    <Switch id="isTemplate" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold tracking-tight">Form Theme</h3>
                <p className="text-sm text-muted-foreground">Choose a default theme or customize the appearance of your form.</p>
              </div>

              <div className="space-y-3">
                <Label>Theme Configuration Mode</Label>
                <Controller
                  control={formMethods.control}
                  name="themeType"
                  render={({ field }) => (
                    <Tabs
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        if (val === "choose") {
                          const firstTheme = defaultThemes[0];
                          if (firstTheme) {
                            handleDefaultThemeSelect(firstTheme.id);
                          }
                        } else {
                          setValue("themeName", "custom");
                          setValue("defaultThemeId", "");
                        }
                      }}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1 rounded-xl">
                        <TabsTrigger value="choose" className="rounded-lg data-[state=active]:bg-background">Choose Theme</TabsTrigger>
                        <TabsTrigger value="custom" className="rounded-lg data-[state=active]:bg-background">Custom Theme</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  )}
                />
              </div>

              {themeType === "choose" && (
                <div className="space-y-2">
                  <Label>Default Themes</Label>
                  <Controller
                    control={formMethods.control}
                    name="defaultThemeId"
                    render={({ field }) => (
                      <Select onValueChange={handleDefaultThemeSelect} value={field.value || ""}>
                        <SelectTrigger className={fieldClass}>
                          <SelectValue placeholder="Select default theme preset" />
                        </SelectTrigger>
                        <SelectContent>
                          {defaultThemes.map((t: any) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}

              <Card className="border-border/60 bg-muted/20 shadow-none">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center gap-2">
                    <ImagePlus className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">Banner Image</p>
                      <p className="text-xs text-muted-foreground">Upload or paste a banner image URL.</p>
                    </div>
                  </div>

                  {bannerUrl && (
                    <div className="overflow-hidden rounded-2xl border border-border/60">
                      <img src={bannerUrl} alt="Banner" className="h-40 w-full object-cover" />
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <Input type="file" accept="image/*" onChange={handleBannerUpload} className={fieldClass} />
                    {bannerUrl && (
                      <Button type="button" variant="destructive" size="sm" className="rounded-xl" onClick={handleRemoveBanner}>
                        Remove Banner
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {themeFields.map((item) => (
                  <div key={item.key} className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={currentThemeValues[item.key as keyof typeof currentThemeValues] || "#ffffff"}
                        onChange={(e) => handleColorChange(item.key, e.target.value)}
                        className="h-11 w-14 cursor-pointer rounded-xl border border-border bg-transparent"
                      />
                      <Input
                        value={currentThemeValues[item.key as keyof typeof currentThemeValues] || "#ffffff"}
                        onChange={(e) => handleColorChange(item.key, e.target.value)}
                        className="h-11 rounded-xl font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={updateForm.isPending} className="h-11 rounded-xl px-6 text-sm font-medium shadow-lg">
              {updateForm.isPending ? "Saving Changes..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border/60 shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle>Sharing</CardTitle>
            <CardDescription>Share your form publicly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" onClick={copyShareLink} className="h-11 w-full rounded-xl">
              <Copy className="mr-2 h-4 w-4" />
              Copy Public URL
            </Button>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="block">
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
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Permanently delete this form and all submissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleDeleteForm} disabled={deleteForm.isPending} className="h-11 w-full rounded-xl">
                {deleteForm.isPending ? "Deleting..." : "Delete Form"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}