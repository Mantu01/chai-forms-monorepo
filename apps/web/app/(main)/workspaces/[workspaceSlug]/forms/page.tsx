"use client";

import { use, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import {
  MoreHorizontal,
  FolderOpen,
  Settings,
  ListCollapse,
  BarChart,
  Trash2,
  Plus,
  ArrowUpDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";

interface FormsPageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default function FormsPage({ params }: FormsPageProps) {
  const { workspaceSlug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();

  const activeFilter = searchParams.get("filter") || "all";
  const sortBy = searchParams.get("sortBy") || "date_desc";

  const { data: userData, isLoading: userLoading } = trpc.auth.me.useQuery();
  const userId = userData?.user?.id;

  const { data: workspace, isLoading: workspaceLoading } = trpc.workspace.getWorkspaceBySlug.useQuery(
    { slug: workspaceSlug },
    { enabled: !!workspaceSlug }
  );

  const workspaceId = workspace?.id;

  const { data: forms, isLoading: formsLoading } = trpc.form.getFormsWithStats.useQuery(
    { workspaceId: workspaceId || "" },
    { enabled: !!workspaceId }
  );

  const createForm = trpc.form.createForm.useMutation({
    onSuccess: () => {
      toast.success("Form created successfully");
      router.push(window.location.pathname);
      if (workspaceId) {
        utils.form.getFormsWithStats.invalidate({ workspaceId });
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create form");
    }
  });

  const deleteForm = trpc.form.deleteForm.useMutation({
    onSuccess: () => {
      toast.success("Form deleted successfully");
      if (workspaceId) {
        utils.form.getFormsWithStats.invalidate({ workspaceId });
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete form");
    }
  });

  if (userLoading || workspaceLoading || formsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!userData?.user || !workspace || !workspaceId) {
    return null;
  }

  const handleCreateForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const formSlug = formData.get("slug") as string;
    const description = formData.get("description") as string;

    createForm.mutate({
      workspaceId,
      title,
      slug: formSlug,
      description: description || undefined,
      themeConfig: {},
    });
  };

  const handleDeleteForm = (formId: string) => {
    if (confirm("Are you sure you want to delete this form? All submissions will be lost!")) {
      deleteForm.mutate({ formId });
    }
  };

  const filteredForms = (forms ?? []).filter((form) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "draft") return form.status === "draft";
    if (activeFilter === "published") return form.status === "published" && form.accessLevel === "public";
    if (activeFilter === "unlisted") return form.status === "published" && form.accessLevel === "unlisted";
    if (activeFilter === "private") return form.status === "published" && form.accessLevel === "private";
    return true;
  });

  const sortedForms = [...filteredForms].sort((a, b) => {
    if (sortBy === "date_desc") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "date_asc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === "submissions_asc") {
      return a.submissionCount - b.submissionCount;
    }
    if (sortBy === "submissions_desc") {
      return b.submissionCount - a.submissionCount;
    }
    return 0;
  });

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold tracking-tight">Forms</h2>
            <p className="text-xs text-muted-foreground">Manage and check your workspaces forms</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("?sort-dialog=true")}
              className="h-9 gap-1.5"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span>Sort</span>
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("?new-form=true")}
              className="h-9 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Create Form</span>
            </Button>
          </div>
        </div>

        {sortedForms.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-2xl border-border/80 flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground">No forms found matching the filter.</p>
            <Button size="sm" variant="outline" onClick={() => router.push("?new-form=true")}>
              Create your first form
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedForms.map((form) => (
              <Card key={form.id} className="group overflow-hidden rounded-xl border border-border/55 bg-card/60 backdrop-blur-xs hover:scale-[1.002] transition-transform">
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-4">
                  <Link
                    href={`/workspaces/${workspaceSlug}/form/${form.slug}?tab=fields`}
                    className="flex flex-1 flex-col sm:flex-row sm:items-center gap-4 min-w-0"
                  >
                    <div className="min-w-0 sm:w-1/4">
                      <h3 className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
                        {form.title}
                      </h3>
                      <p className="truncate text-[10px] font-mono text-muted-foreground">
                        {form.slug}
                      </p>
                    </div>

                    <div className="flex-1 min-w-0">
                      {form.description ? (
                        <p className="truncate text-xs text-muted-foreground/80 leading-normal">
                          {form.description}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/40 italic">No description</p>
                      )}
                    </div>

                    <div className="flex gap-1.5 sm:w-48 shrink-0 justify-start sm:justify-end">
                      <Badge variant="outline" className="text-3xs px-1.5 py-0 capitalize bg-muted/40 font-mono">
                        {form.status}
                      </Badge>
                      <Badge variant="outline" className="text-3xs px-1.5 py-0 capitalize bg-muted/40 font-mono">
                        {form.accessLevel}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded border self-center">
                        {form.submissionCount} replies
                      </span>
                    </div>
                  </Link>

                  <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 border-border/30 pt-2 sm:pt-0">
                    <span className="text-[10px] text-muted-foreground sm:w-20 sm:text-right">
                      {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : ""}
                    </span>

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
                      <DropdownMenuContent align="end" className="w-44 border-border/80">
                        <DropdownMenuItem
                          onClick={() => window.open(`/form/${form.slug}/submit`, "_blank")}
                          className="gap-2 text-xs cursor-pointer"
                        >
                          <FolderOpen className="h-3.5 w-3.5" />
                          <span>Open Live Form</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/workspaces/${workspaceSlug}/form/${form.slug}?tab=fields`)}
                          className="gap-2 text-xs cursor-pointer"
                        >
                          <ListCollapse className="h-3.5 w-3.5" />
                          <span>Fields</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/workspaces/${workspaceSlug}/form/${form.slug}?tab=submissions`)}
                          className="gap-2 text-xs cursor-pointer"
                        >
                          <BarChart className="h-3.5 w-3.5" />
                          <span>Submissions</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/workspaces/${workspaceSlug}/form/${form.slug}?tab=settings`)}
                          className="gap-2 text-xs cursor-pointer"
                        >
                          <Settings className="h-3.5 w-3.5" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteForm(form.id)}
                          className="gap-2 text-xs cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={searchParams.get("new-form") === "true"} onOpenChange={(open) => { if (!open) router.push(window.location.pathname); }}>
        <DialogContent className="border-border bg-card/95 backdrop-blur-md">
          <form onSubmit={handleCreateForm} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Create Form</DialogTitle>
              <DialogDescription>
                Setup a new form to start gathering responses from your users.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="form-title" className="text-xs">Form Title</Label>
                <Input
                  id="form-title"
                  name="title"
                  required
                  placeholder="Feedback Form"
                  className="rounded-xl border-border/80"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="form-slug" className="text-xs">Form Slug</Label>
                <Input
                  id="form-slug"
                  name="slug"
                  required
                  placeholder="feedback"
                  className="rounded-xl border-border/80"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="form-desc" className="text-xs">Description</Label>
                <Input
                  id="form-desc"
                  name="description"
                  placeholder="Help us improve our service by providing your feedback."
                  className="rounded-xl border-border/80"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(window.location.pathname)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createForm.isPending} className="rounded-xl">
                Create Form
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={searchParams.get("sort-dialog") === "true"} onOpenChange={(open) => { if (!open) router.push(window.location.pathname); }}>
        <DialogContent className="border-border bg-card/95 backdrop-blur-md sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Sort Forms</DialogTitle>
            <DialogDescription>Choose a sorting option for your forms list.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-3">
            {[
              { id: "date_desc", label: "Date: Newest First" },
              { id: "date_asc", label: "Date: Oldest First" },
              { id: "submissions_desc", label: "Submissions: High to Low" },
              { id: "submissions_asc", label: "Submissions: Low to High" },
            ].map((option) => {
              const isActive = sortBy === option.id;
              return (
                <Button
                  key={option.id}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => router.push(`?sortBy=${option.id}`)}
                  className="justify-start text-xs rounded-xl"
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
