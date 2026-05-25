"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { FormRenderer } from "~/components/form/form-renderer";
import { Suspense } from "react";

interface SubmitPageProps {
  params: Promise<{ slug: string }>;
}

function SubmitFormContent({ params }: SubmitPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const createSubmission = trpc.submission.createSubmission.useMutation({
    onSuccess: () => {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("success", "true");
      router.push(nextUrl.pathname + nextUrl.search);
    },
  });

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
              <CardTitle className="text-2xl font-bold text-red-500">Draft Form</CardTitle>
              <CardDescription className="text-zinc-400">
                This form is currently a draft and can only be accessed by workspace members.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link href="/auth">
                <Button>Sign In as Member</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="max-w-md w-full text-center space-y-3 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-red-500 font-semibold text-lg">Form Access Restricted</p>
          <p className="text-sm text-zinc-400">This form is currently a draft and cannot be accessed.</p>
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
              <CardTitle className="text-2xl font-bold text-red-500">Private Form</CardTitle>
              <CardDescription className="text-zinc-400">
                This form is private and can only be accessed by workspace members.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link href="/auth">
                <Button>Sign In to Workspace</Button>
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
            <div className="text-2xl font-bold text-red-500">Access Denied</div>
            <div className="text-zinc-400">You do not have permission to view or submit this form.</div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleFormSubmit = (submissionAnswers: any[]) => {
    createSubmission.mutate({
      formId: form.id,
      answers: submissionAnswers,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center py-10">
      <FormRenderer
        formId={form.id}
        form={form}
        fields={[...(fields || [])]}
        pages={[...(pages || [])]}
        onSubmit={handleFormSubmit}
        isPending={createSubmission.isPending}
      />
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
