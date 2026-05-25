"use client";

import { use, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { CheckCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Suspense } from "react";
import { FormRenderer } from "~/components/forms/form-renderer";

interface SubmitPageProps {
  params: Promise<{ slug: string }>;
}

function SubmitFormContent({ params }: SubmitPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { data: userData, isLoading: userLoading } = trpc.auth.me.useQuery();
  const userId = userData?.user?.id;

  const { data: form, isLoading: formLoading } = trpc.form.getFormBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const formId = form?.id;

  const { data: fields, isLoading: fieldsLoading } = trpc.form.getFieldsByForm.useQuery(
    { formId: formId || "" },
    { enabled: !!formId }
  );

  const { data: pages, isLoading: pagesLoading } = trpc.form.getPagesByForm.useQuery(
    { formId: formId || "" },
    { enabled: !!formId }
  );

  const { data: userWorkspaces, isLoading: workspacesLoading } = trpc.workspace.getUserWorkspaces.useQuery(
    {},
    { enabled: !!userId && !!form && (form.status !== "published" || form.accessLevel === "private") }
  );

  const { data: formAnswers } = useQuery({
    queryKey: ["formAnswers"],
    queryFn: () => ({} as Record<string, any>),
    initialData: {},
  });

  const uploadFile = trpc.form.uploadFile.useMutation();

  const createSubmission = trpc.submission.createSubmission.useMutation({
    onSuccess: () => {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("success", "true");
      router.push(nextUrl.pathname + nextUrl.search);
    },
  });

  const isSuccess = searchParams.get("success") === "true";
  const showLoading = formLoading || fieldsLoading || pagesLoading || userLoading || (userId && workspacesLoading);

  if (showLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Spinner />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-red-500 font-semibold">Form not found.</p>
      </div>
    );
  }

  const isMember = userWorkspaces?.some((uw) => uw.workspace.id === form.workspaceId) ?? false;

  if (form.status !== "published" && !isMember) {
    if (!userId) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white p-6">
          <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 text-white text-center py-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-500">Draft Form</CardTitle>
              <CardDescription className="text-zinc-400 text-xs">
                This form is currently a draft and can only be accessed by workspace members.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link href="/auth">
                <Button className="text-xs">Sign In as Member</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="max-w-md w-full text-center space-y-2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-red-500 font-semibold text-sm">Form Access Restricted</p>
          <p className="text-xs text-zinc-400">This form is currently a draft and cannot be accessed.</p>
        </div>
      </div>
    );
  }

  if (form.accessLevel === "private" && !isMember) {
    if (!userId) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white p-6">
          <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 text-white text-center py-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-500">Private Form</CardTitle>
              <CardDescription className="text-zinc-400 text-xs">
                This form is private and can only be accessed by workspace members.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link href="/auth">
                <Button className="text-xs">Sign In to Workspace</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white p-6">
        <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 text-white text-center py-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-red-500">Access Denied</CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              You do not have permission to view or submit this form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-400">Only members of the owning workspace are authorized to submit responses.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const theme = (form.themeConfig as Record<string, string>) || {};
  const bgColor = theme.backgroundColor || "#09090b";
  const textColor = theme.textColor || "#ffffff";
  const formBgColor = theme.formBackgroundColor || "#18181b";
  const borderColor = theme.borderColor || "#27272a";
  const primaryColor = theme.primaryColor || "#3f3f46";
  const buttonTextColor = theme.buttonTextColor || "#ffffff";
  const mutedTextColor = theme.mutedTextColor || "#a1a1aa";

  const currentPageIndex = Number(searchParams.get("page") || "0");

  const handlePageChange = (index: number) => {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("page", String(index));
    router.push(nextUrl.pathname + nextUrl.search);
  };

  const handleAnswerChange = (fieldKey: string, value: any) => {
    queryClient.setQueryData(["formAnswers"], (prev: any) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const isFieldVisible = (field: any, answers: Record<string, any>) => {
    const logic = field.config?.logic?.showIf;
    if (!logic) return true;

    const targetVal = answers[logic.fieldKey];
    if (targetVal === undefined || targetVal === null) return false;

    if (logic.operator === "equals") {
      return String(targetVal) === String(logic.value);
    }
    if (logic.operator === "not_equals") {
      return String(targetVal) !== String(logic.value);
    }
    if (logic.operator === "contains") {
      return String(targetVal).toLowerCase().includes(String(logic.value).toLowerCase());
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fields || !formId) return;

    const fileFields = fields.filter((f) => f.type === "file" && isFieldVisible(f, formAnswers));
    const uploadedFiles = await Promise.all(
      fileFields.map(async (field) => {
        const fileInput = document.getElementById(field.fieldKey) as HTMLInputElement | null;
        const file = fileInput?.files?.[0];
        if (file && file.size > 0) {
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
          });
          const res = await uploadFile.mutateAsync({
            fileData: base64Data,
            folder: `submissions_${formId}`,
          });
          return { fieldId: field.id, value: res.url };
        }
        return { fieldId: field.id, value: "" };
      })
    );

    const answers = fields.map((field) => {
      if (!isFieldVisible(field, formAnswers)) {
        return { fieldId: field.id, value: "" };
      }
      const uploaded = uploadedFiles.find((u) => u.fieldId === field.id);
      if (uploaded) return uploaded;

      let value = formAnswers[field.fieldKey];
      if (field.type === "number") {
        value = value ? Number(value) : null;
      }
      return {
        fieldId: field.id,
        value: value ?? "",
      };
    });

    createSubmission.mutate({
      formId,
      answers,
    });
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6" style={{ backgroundColor: bgColor, color: textColor }}>
        <Card className="max-w-md w-full text-center py-8 border" style={{ backgroundColor: formBgColor, borderColor: borderColor }}>
          <CardHeader>
            <div className="flex justify-center mb-2">
              <CheckCircle className="h-12 w-12 text-emerald-500 animate-pulse" />
            </div>
            <CardTitle className="text-xl font-bold" style={{ color: textColor }}>Thank You!</CardTitle>
            <CardDescription style={{ color: mutedTextColor }} className="text-xs">
              Your response has been successfully recorded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs leading-relaxed" style={{ color: textColor }}>
              The response has been saved to form: <span className="font-semibold">{form.title}</span>
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            {userId ? (
              <Link href="/profile">
                <Button size="sm" style={{ backgroundColor: primaryColor, color: buttonTextColor }} className="text-xs">
                  Back to Profile
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button size="sm" style={{ backgroundColor: primaryColor, color: buttonTextColor }} className="text-xs">
                  Sign In to ChaiForm
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="max-w-xl w-full">
        <FormRenderer
          form={form}
          pages={pages || []}
          fields={fields || []}
          currentPageIndex={currentPageIndex}
          onPageChange={handlePageChange}
          formAnswers={formAnswers}
          onAnswerChange={handleAnswerChange}
          onSubmit={handleSubmit}
          isSubmitting={createSubmission.isPending}
        />
      </div>
    </div>
  );
}

export default function SubmitFormPage(props: SubmitPageProps) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white"><Spinner /></div>}>
      <SubmitFormContent {...props} />
    </Suspense>
  );
}
