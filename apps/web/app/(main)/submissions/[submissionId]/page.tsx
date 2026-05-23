"use client";

import { use, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Spinner } from "~/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

interface SubmissionPageProps {
  params: Promise<{ submissionId: string }>;
}

export default function SubmissionDetailsPage({ params }: SubmissionPageProps) {
  const { submissionId } = use(params);
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: userData, isLoading: userLoading } = trpc.auth.me.useQuery();

  const { data: subData, isLoading: subLoading } = trpc.submission.getSubmissionById.useQuery(
    { submissionId },
    { enabled: !!submissionId }
  );

  const formId = subData?.submission?.formId;

  const { data: form, isLoading: formLoading } = trpc.form.getFormById.useQuery(
    { formId: formId || "" },
    { enabled: !!formId }
  );

  const { data: workspace } = trpc.workspace.getWorkspace.useQuery(
    { workspaceId: form?.workspaceId || "" },
    { enabled: !!form?.workspaceId }
  );

  const workspaceSlug = workspace?.slug || form?.workspaceId || "";

  const { data: fields, isLoading: fieldsLoading } = trpc.form.getFieldsByForm.useQuery(
    { formId: formId || "" },
    { enabled: !!formId }
  );

  const updateStatus = trpc.submission.updateSubmissionStatus.useMutation({
    onSuccess: () => {
      utils.submission.getSubmissionById.invalidate({ submissionId });
    },
  });

  const replaceAnswers = trpc.submission.replaceSubmissionAnswers.useMutation({
    onSuccess: () => {
      utils.submission.getSubmissionById.invalidate({ submissionId });
    },
  });

  const deleteSubmission = trpc.submission.deleteSubmission.useMutation({
    onSuccess: () => {
      if (formId && form?.slug) {
        router.push(`/workspaces/${workspaceSlug}/form/${form.slug}?tab=submissions`);
      } else {
        router.push("/profile");
      }
    },
  });

  if (userLoading || subLoading || formLoading || fieldsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Spinner />
      </div>
    );
  }

  if (!userData?.user || !subData) {
    router.push("/auth");
    return null;
  }

  const { submission, answers } = subData;

  const handleUpdateAnswers = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fields) return;

    const formData = new FormData(e.currentTarget);
    const updatedAnswers = fields.map((field) => {
      let value: any = formData.get(field.fieldKey);
      if (field.type === "number") {
        value = value ? Number(value) : null;
      }
      return {
        fieldId: field.id,
        value: value ?? "",
      };
    });

    replaceAnswers.mutate({
      submissionId,
      answers: updatedAnswers,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 space-y-6">
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div className="flex items-center space-x-3">
          {formId && form?.slug ? (
            <Link
              href={`/workspaces/${workspaceSlug}/form/${form.slug}?tab=submissions`}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Submissions
            </Link>
          ) : (
            <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors">
              Profile
            </Link>
          )}
          <span className="text-zinc-600">/</span>
          <h1 className="text-xl font-bold">Submission Details</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            defaultValue={submission.status || "completed"}
            onValueChange={(val) => updateStatus.mutate({ submissionId, status: val })}
          >
            <SelectTrigger className="w-36 bg-zinc-900 border-zinc-800 text-white capitalize h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("Are you sure you want to delete this submission?")) {
                deleteSubmission.mutate({ submissionId });
              }
            }}
            disabled={deleteSubmission.isPending}
          >
            Delete Submission
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-zinc-800 text-white lg:col-span-1">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription className="text-zinc-400">Submission system variables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-350">
            <div>
              <span className="font-semibold text-zinc-450">Submission ID:</span>
              <p className="font-mono text-xs text-white break-all">{submission.id}</p>
            </div>
            <div>
              <span className="font-semibold text-zinc-450">Submission Number:</span>
              <p className="text-white">#{submission.submissionNumber ?? "N/A"}</p>
            </div>
            <div>
              <span className="font-semibold text-zinc-450">Submitted At:</span>
              <p className="text-white">
                {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "N/A"}
              </p>
            </div>
            <div>
              <span className="font-semibold text-zinc-450">Submitter ID:</span>
              <p className="font-mono text-xs text-white break-all">
                {submission.submittedBy || "Anonymous"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 text-white lg:col-span-2">
          <CardHeader>
            <CardTitle>Response Answers</CardTitle>
            <CardDescription className="text-zinc-400">
              View and edit responses submitted by the user.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fields && fields.length > 0 ? (
              <form onSubmit={handleUpdateAnswers} className="space-y-4">
                {fields.map((field) => {
                  const answer = answers.find((a) => a.fieldId === field.id);
                  const displayValue = answer?.value ?? "";
                  return (
                    <div key={field.id} className="space-y-1.5 border-b border-zinc-800/50 pb-3 last:border-b-0">
                      <Label htmlFor={field.fieldKey} className="text-zinc-300 font-semibold block">
                        {field.label}
                      </Label>
                      {field.type === "textarea" ? (
                        <Textarea
                          id={field.fieldKey}
                          name={field.fieldKey}
                          defaultValue={displayValue}
                          className="bg-zinc-800 border-zinc-700 text-white mt-1"
                        />
                      ) : (
                        <Input
                          id={field.fieldKey}
                          name={field.fieldKey}
                          type={field.type}
                          defaultValue={displayValue}
                          className="bg-zinc-800 border-zinc-700 text-white mt-1"
                        />
                      )}
                    </div>
                  );
                })}
                <div className="pt-2 flex justify-end">
                  <Button type="submit" disabled={replaceAnswers.isPending}>
                    Save Answer Overwrites
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-zinc-550 text-center py-6">No fields matched for this form.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
