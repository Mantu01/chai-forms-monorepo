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
import { FormFieldsTab } from "~/components/workspaces/form-fields-tab";
import { FormSubmissionsTab } from "~/components/workspaces/form-submissions-tab";
import { FormSettingsTab } from "~/components/workspaces/form-settings-tab";

interface FormDetailsPageProps {
  params: Promise<{ workspaceSlug: string; slug: string }>;
}

export default function FormDetailsPage({ params }: FormDetailsPageProps) {
  const { workspaceSlug, slug: formSlug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();

  const activeTab = (searchParams.get("tab") || "fields") as "fields" | "submissions" | "settings";

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
      router.replace(`?tab=fields`);
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
              key={formId}
              form={form}
              workspaceId={workspaceId!}
              workspaceSlug={workspaceSlug}
              isAdminOrOwner={isAdminOrOwner}
            />
          )}
        </main>
      </div>
    </div>
  );
}