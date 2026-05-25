"use client";

import { use, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { toast } from "sonner";
import { Suspense } from "react";
import { FormFieldsTab } from "~/components/workspaces/form-fields-tab";
import { FormSubmissionsTab } from "~/components/workspaces/form-submissions-tab";
import { FormSettingsTab } from "~/components/workspaces/form-settings-tab";
import { FormGeneratorOverlay } from "~/components/workspaces/form-generator-overlay";

interface FormDetailsPageProps {
  params: Promise<{ workspaceSlug: string; slug: string }>;
}

function FormDetailsContent({ params }: FormDetailsPageProps) {
  const { workspaceSlug, slug: formSlug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();

  const activeTab = (searchParams.get("tab") || "fields") as "fields" | "submissions" | "settings";
  const generateParam = searchParams.get("generate") === "true";
  const promptParam = searchParams.get("prompt") || "";

  const { data: userData, isLoading: userLoading } = trpc.auth.me.useQuery();
  const userId = userData?.user?.id;

  const { data: workspace, isLoading: workspaceLoading } = trpc.workspace.getWorkspaceBySlug.useQuery(
    { slug: workspaceSlug },
    { enabled: !!workspaceSlug }
  );

  const workspaceId = workspace?.id;

  const { data: members } = trpc.workspace.getWorkspaceMembers.useQuery(
    { workspaceId: workspaceId || "" },
    { enabled: !!workspaceId }
  );

  const currentUserMember = members?.find((m) => m.userId === userId);
  const userRole = currentUserMember?.role;
  const isAdminOrOwner = userRole ? ["owner", "admin"].includes(userRole) : false;

  const { data: form, isLoading: formLoading } = trpc.form.getFormBySlug.useQuery(
    { workspaceId: workspaceId || "", slug: formSlug },
    { enabled: !!workspaceId && !!formSlug }
  );

  const formId = form?.id;

  const { data: fields } = trpc.form.getFieldsByForm.useQuery(
    { formId: formId || "" },
    { enabled: !!formId }
  );

  const createField = trpc.form.createField.useMutation({
    onSuccess: () => {
      toast.success("Field added successfully");
      router.push(`?tab=fields`);
      if (formId) {
        utils.form.getFieldsByForm.invalidate({ formId });
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add field");
    },
  });

  const handleAddField = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formId) return;

    const formData = new FormData(e.currentTarget);
    const label = formData.get("label") as string;
    const type = formData.get("type") as any;
    const placeholder = formData.get("placeholder") as string;
    const isRequired = formData.get("isRequired") === "true";

    const fieldKey = label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    createField.mutate({
      formId,
      label,
      type,
      placeholder: placeholder || undefined,
      isRequired,
      fieldKey: fieldKey || `field_${Date.now()}`,
      order: (fields?.length || 0) + 1,
    });
  };

  if (userLoading || workspaceLoading || formLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!workspace || !form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive font-semibold">Form not found.</p>
        <Link href={`/workspaces/${workspaceSlug}`}>
          <Button variant="outline">Back to Workspace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      {generateParam && promptParam && formId && (
        <FormGeneratorOverlay formId={formId} prompt={promptParam} />
      )}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <main className="w-full min-w-0">
          {activeTab === "fields" && formId && (
            <FormFieldsTab formId={formId} isAdminOrOwner={isAdminOrOwner} />
          )}

          {activeTab === "submissions" && formId && (
            <FormSubmissionsTab formId={formId} />
          )}

          {activeTab === "settings" && formId && (
            <FormSettingsTab
              form={form}
              workspaceId={workspaceId!}
              workspaceSlug={workspaceSlug}
              isAdminOrOwner={isAdminOrOwner}
            />
          )}
        </main>
      </div>

      <Dialog open={searchParams.get("new-field") === "true"} onOpenChange={(open) => { if (!open) router.push(`?tab=fields`); }}>
        <DialogContent>
          <form onSubmit={handleAddField} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add Form Field</DialogTitle>
              <DialogDescription>
                Create a new input field for submitters to respond to.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="field-label">Field Label</Label>
                <Input
                  id="field-label"
                  name="label"
                  required
                  placeholder="e.g. Email Address"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="field-type">Field Type</Label>
                <Select name="type" defaultValue="text">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 overflow-y-auto">
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Number</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="time">Time</SelectItem>
                    <SelectItem value="file">File</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="radio">Radio</SelectItem>
                    <SelectItem value="matrix">Matrix</SelectItem>
                    <SelectItem value="multi_select">Multi Select</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="field-placeholder">Placeholder</Label>
                <Input
                  id="field-placeholder"
                  name="placeholder"
                  placeholder="e.g. enter your email"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="field-req">Required Field</Label>
                <Select name="isRequired" defaultValue="false">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Optional</SelectItem>
                    <SelectItem value="true">Required (*)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`?tab=fields`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createField.isPending}>
                Add Field
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function FormDetailsPage(props: FormDetailsPageProps) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Spinner /></div>}>
      <FormDetailsContent {...props} />
    </Suspense>
  );
}