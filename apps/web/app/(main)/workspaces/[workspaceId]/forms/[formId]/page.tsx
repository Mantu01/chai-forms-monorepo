"use client";

import { use, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "~/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";

interface FormPageProps {
  params: Promise<{ workspaceId: string; formId: string }>;
}

import { Suspense } from "react";

function WorkspaceFormContent({ params }: FormPageProps) {
  const { workspaceId, formId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();

  const currentTab = searchParams.get("tab") || "fields";

  const { data: userData, isLoading: userLoading } = trpc.auth.me.useQuery();
  
  const { data: form, isLoading: formLoading } = trpc.form.getFormById.useQuery(
    { formId },
    { enabled: !!formId }
  );

  const { data: fields, isLoading: fieldsLoading } = trpc.form.getFieldsByForm.useQuery(
    { formId },
    { enabled: currentTab === "fields" && !!formId }
  );

  const { data: submissionsData, isLoading: submissionsLoading } = trpc.submission.getFormSubmissions.useQuery(
    { formId, page: 1, limit: 100 },
    { enabled: currentTab === "submissions" && !!formId }
  );

  const { data: stats, isLoading: statsLoading } = trpc.submission.getSubmissionStats.useQuery(
    { formId },
    { enabled: currentTab === "stats" && !!formId }
  );

  const { data: recentSubmissions, isLoading: recentLoading } = trpc.submission.getRecentSubmissions.useQuery(
    { formId, limit: 5 },
    { enabled: currentTab === "stats" && !!formId }
  );

  const createField = trpc.form.createField.useMutation({
    onSuccess: () => {
      router.push(`?tab=fields`);
      utils.form.getFieldsByForm.invalidate({ formId });
    },
  });

  const deleteField = trpc.form.deleteField.useMutation({
    onSuccess: () => {
      utils.form.getFieldsByForm.invalidate({ formId });
    },
  });

  const updateSubmissionStatus = trpc.submission.updateSubmissionStatus.useMutation({
    onSuccess: () => {
      utils.submission.getFormSubmissions.invalidate({ formId });
      utils.submission.getRecentSubmissions.invalidate({ formId });
      utils.submission.getSubmissionStats.invalidate({ formId });
    },
  });

  const deleteSubmission = trpc.submission.deleteSubmission.useMutation({
    onSuccess: () => {
      utils.submission.getFormSubmissions.invalidate({ formId });
      utils.submission.getRecentSubmissions.invalidate({ formId });
      utils.submission.getSubmissionStats.invalidate({ formId });
    },
  });

  const updateForm = trpc.form.updateForm.useMutation({
    onSuccess: () => {
      utils.form.getFormById.invalidate({ formId });
    },
  });

  if (userLoading || formLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Spinner />
      </div>
    );
  }

  if (!userData?.user || !form) {
    router.push("/auth");
    return null;
  }

  const handleCreateField = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const label = formData.get("label") as string;
    const fieldKey = formData.get("fieldKey") as string;
    const type = formData.get("type") as "text" | "textarea" | "number" | "email";
    const placeholder = formData.get("placeholder") as string;
    const defaultValue = formData.get("defaultValue") as string;
    const isRequired = formData.get("isRequired") === "on";
    const order = Number(formData.get("order") || "1");

    createField.mutate({
      formId,
      label,
      fieldKey,
      type,
      placeholder: placeholder || undefined,
      defaultValue: defaultValue || undefined,
      isRequired,
      order,
    });
  };

  const toggleFormStatus = () => {
    const nextStatus = form.status === "published" ? "draft" : "published";
    if (nextStatus === "published") {
      trpc.form.publishForm.useMutation().mutate({ formId }, {
        onSuccess: () => utils.form.getFormById.invalidate({ formId }),
      });
    } else {
      trpc.form.archiveForm.useMutation().mutate({ formId }, {
        onSuccess: () => utils.form.getFormById.invalidate({ formId }),
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 space-y-6">
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div className="flex items-center space-x-3">
          <Link href={`/workspaces/${workspaceId}`} className="text-zinc-400 hover:text-white transition-colors">
            Workspace
          </Link>
          <span className="text-zinc-600">/</span>
          <h1 className="text-xl font-bold">{form.title}</h1>
          <span className="text-xs bg-zinc-800 text-zinc-300 font-mono px-2 py-0.5 rounded capitalize">
            {form.status}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Link href={`/forms/${form.id}/submit`} target="_blank">
            <Button variant="outline" size="sm">Public Link</Button>
          </Link>
          <div className="flex space-x-2 border-l border-zinc-800 pl-3">
            <Link href="?tab=fields" className={currentTab === "fields" ? "text-white" : "text-zinc-400"}>
              <Button variant={currentTab === "fields" ? "default" : "ghost"} size="sm">Fields</Button>
            </Link>
            <Link href="?tab=submissions" className={currentTab === "submissions" ? "text-white" : "text-zinc-400"}>
              <Button variant={currentTab === "submissions" ? "default" : "ghost"} size="sm">Submissions</Button>
            </Link>
            <Link href="?tab=stats" className={currentTab === "stats" ? "text-white" : "text-zinc-400"}>
              <Button variant={currentTab === "stats" ? "default" : "ghost"} size="sm">Stats</Button>
            </Link>
          </div>
        </div>
      </header>

      {currentTab === "fields" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Fields</h2>
              <p className="text-sm text-zinc-400">Design the structure of inputs that users will fill out.</p>
            </div>
            <Link href="?tab=fields&new-field=true">
              <Button>Add Field</Button>
            </Link>
          </div>

          {fieldsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : fields && fields.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Label</TableHead>
                  <TableHead className="text-zinc-400">Key</TableHead>
                  <TableHead className="text-zinc-400">Type</TableHead>
                  <TableHead className="text-zinc-400">Required</TableHead>
                  <TableHead className="text-zinc-400">Order</TableHead>
                  <TableHead className="text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field) => (
                  <TableRow key={field.id} className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell className="font-semibold text-zinc-200">{field.label}</TableCell>
                    <TableCell className="font-mono text-xs text-zinc-400">{field.fieldKey}</TableCell>
                    <TableCell className="capitalize text-zinc-300">{field.type}</TableCell>
                    <TableCell className="text-zinc-300">{field.isRequired ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-zinc-300">{field.order}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteField.mutate({ fieldId: field.id })}
                        disabled={deleteField.isPending}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-lg">
              <p className="text-zinc-500 mb-4">No fields defined yet. A form needs at least 1 field to accept submissions.</p>
              <Link href="?tab=fields&new-field=true">
                <Button variant="secondary">Add your first field</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {currentTab === "submissions" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold">Submissions</h2>
            <p className="text-sm text-zinc-400">List of responses gathered for this form.</p>
          </div>

          {submissionsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : submissionsData && submissionsData.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Number</TableHead>
                  <TableHead className="text-zinc-400">Submission ID</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Submitted At</TableHead>
                  <TableHead className="text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissionsData.data.map((sub) => (
                  <TableRow key={sub.id} className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell className="text-zinc-300">#{sub.submissionNumber || "N/A"}</TableCell>
                    <TableCell className="font-mono text-xs text-zinc-400">{sub.id}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={sub.status || "completed"}
                        onValueChange={(val) =>
                          updateSubmissionStatus.mutate({ submissionId: sub.id, status: val })
                        }
                      >
                        <SelectTrigger className="w-32 bg-zinc-900 border-zinc-800 text-white capitalize h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-850 text-white text-xs">
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="flagged">Flagged</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-zinc-400 text-xs">
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "N/A"}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Link href={`/submissions/${sub.id}`}>
                        <Button size="sm" variant="secondary">View Answers</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteSubmission.mutate({ submissionId: sub.id })}
                        disabled={deleteSubmission.isPending}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-lg">
              <p className="text-zinc-500">No submissions received yet.</p>
            </div>
          )}
        </div>
      )}

      {currentTab === "stats" && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold">Submission Statistics</h2>
          {statsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    Total Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-4xl font-extrabold">{stats.totalSubmissions}</span>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    Completed Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-4xl font-extrabold">{stats.completedSubmissions}</span>
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-zinc-550">Stats unavailable.</p>
          )}

          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="text-zinc-450">Latest responses received</CardDescription>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <Spinner />
              ) : recentSubmissions && recentSubmissions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-zinc-400">ID</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSubmissions.map((s) => (
                      <TableRow key={s.id} className="border-zinc-800">
                        <TableCell className="font-mono text-xs text-zinc-300">{s.id}</TableCell>
                        <TableCell className="capitalize text-zinc-300">{s.status || "Completed"}</TableCell>
                        <TableCell className="text-zinc-450 text-xs">
                          {s.submittedAt ? new Date(s.submittedAt).toLocaleTimeString() : ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-zinc-500">No activity yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={searchParams.get("new-field") === "true"} onOpenChange={(open) => { if (!open) router.push(`?tab=fields`); }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <form onSubmit={handleCreateField} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add Form Field</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Define a new input field for users to fill out.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="label" className="text-zinc-300">Field Label</Label>
                <Input
                  id="label"
                  name="label"
                  required
                  placeholder="Full Name"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fieldKey" className="text-zinc-300">Field Key (unique identifier)</Label>
                <Input
                  id="fieldKey"
                  name="fieldKey"
                  required
                  placeholder="fullName"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="type" className="text-zinc-300">Field Type</Label>
                  <Select name="type" defaultValue="text">
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="order" className="text-zinc-300">Field Order</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    defaultValue="1"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="placeholder" className="text-zinc-300">Placeholder Text</Label>
                <Input
                  id="placeholder"
                  name="placeholder"
                  placeholder="John Doe"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="defaultValue" className="text-zinc-300">Default Value</Label>
                <Input
                  id="defaultValue"
                  name="defaultValue"
                  placeholder="Optional default"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="isRequired" name="isRequired" />
                <Label htmlFor="isRequired" className="text-zinc-300 cursor-pointer">
                  Is this field required?
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`?tab=fields`)}
                className="bg-transparent border-zinc-700 hover:bg-zinc-800 text-white"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createField.isPending}>
                Create Field
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function WorkspaceFormPage(props: FormPageProps) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white"><Spinner /></div>}>
      <WorkspaceFormContent {...props} />
    </Suspense>
  );
}
