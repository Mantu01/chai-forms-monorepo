"use client";

import { use, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Spinner } from "~/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

interface SubmissionPageProps {
  params: Promise<{ submissionId: string }>;
}

export default function SubmissionDetailsPage({ params }: SubmissionPageProps) {
  const { submissionId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
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
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
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

  const isDeleteOpen = searchParams.get("deleteOpen") === "true";

  const handleOpenDelete = (open: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (open) {
      params.set("deleteOpen", "true");
    } else {
      params.delete("deleteOpen");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      <header className="flex justify-between items-center border-b border-border pb-4">
        <div className="flex items-center space-x-3 text-xs">
          {formId && form?.slug ? (
            <Link
              href={`/workspaces/${workspaceSlug}/form/${form.slug}?tab=submissions`}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Submissions
            </Link>
          ) : (
            <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Profile
            </Link>
          )}
          <span className="text-muted-foreground/50">/</span>
          <h1 className="text-sm font-bold">Submission Details</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            defaultValue={submission.status || "completed"}
            onValueChange={(val) => updateStatus.mutate({ submissionId, status: val })}
          >
            <SelectTrigger className="w-36 bg-muted border-border text-foreground capitalize h-9 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="completed" className="cursor-pointer">Completed</SelectItem>
              <SelectItem value="pending" className="cursor-pointer">Pending</SelectItem>
              <SelectItem value="flagged" className="cursor-pointer">Flagged</SelectItem>
              <SelectItem value="archived" className="cursor-pointer">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="destructive"
            onClick={() => handleOpenDelete(true)}
            className="cursor-pointer"
          >
            Delete Submission
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Metadata</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Submission system variables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="font-semibold text-muted-foreground">Submission ID:</span>
              <p className="font-mono text-2xs select-all break-all bg-muted/40 p-1.5 rounded border border-border/50 mt-1">{submission.id}</p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Submission Number:</span>
              <p className="font-medium text-foreground">#{submission.submissionNumber ?? "N/A"}</p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Submitted At:</span>
              <p className="font-medium text-foreground">
                {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "N/A"}
              </p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Submitter ID:</span>
              <p className="font-mono text-2xs select-all break-all bg-muted/40 p-1.5 rounded border border-border/50 mt-1">
                {submission.submittedBy || "Anonymous"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Response Answers</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
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
                    <div key={field.id} className="space-y-1.5 border-b border-border/50 pb-3 last:border-b-0">
                      <Label htmlFor={field.fieldKey} className="text-foreground font-semibold block text-xs">
                        {field.label}
                      </Label>
                      {field.type === "textarea" ? (
                        <Textarea
                          id={field.fieldKey}
                          name={field.fieldKey}
                          defaultValue={displayValue}
                          className="bg-background border-border mt-1 text-xs"
                        />
                      ) : (
                        <Input
                          id={field.fieldKey}
                          name={field.fieldKey}
                          type={field.type}
                          defaultValue={displayValue}
                          className="bg-background border-border mt-1 text-xs"
                        />
                      )}
                    </div>
                  );
                })}
                <div className="pt-2 flex justify-end">
                  <Button type="submit" disabled={replaceAnswers.isPending} className="cursor-pointer">
                    Save Answer Overwrites
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-muted-foreground text-center py-6 text-xs">No fields matched for this form.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={handleOpenDelete}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete submission?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this submission? This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              onClick={() => deleteSubmission.mutate({ submissionId })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
