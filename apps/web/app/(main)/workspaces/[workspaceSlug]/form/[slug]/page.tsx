"use client";

import { use, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Spinner } from "~/components/ui/spinner";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "~/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, ExternalLink, Copy, Check, Sliders, ListFilter, ClipboardList } from "lucide-react";
import { Suspense } from "react";

interface FormDetailsPageProps {
  params: Promise<{ workspaceSlug: string; slug: string }>;
}

function FormDetailsContent({ params }: FormDetailsPageProps) {
  const { workspaceSlug, slug: formSlug } = use(params);
  const router = useRouter();
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState<"fields" | "submissions" | "settings">("fields");
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Queries
  const { data: workspace, isLoading: workspaceLoading } = trpc.workspace.getWorkspaceBySlug.useQuery(
    { slug: workspaceSlug },
    { enabled: !!workspaceSlug }
  );

  const workspaceId = workspace?.id;

  const { data: form, isLoading: formLoading } = trpc.form.getFormBySlug.useQuery(
    { workspaceId: workspaceId || "", slug: formSlug },
    { enabled: !!workspaceId && !!formSlug }
  );

  const formId = form?.id;

  const { data: fields, isLoading: fieldsLoading } = trpc.form.getFieldsByForm.useQuery(
    { formId: formId || "" },
    { enabled: !!formId }
  );

  const { data: submissionsData, isLoading: submissionsLoading } = trpc.submission.getFormSubmissions.useQuery(
    { formId: formId || "", page: 1, limit: 100 },
    { enabled: !!formId && activeTab === "submissions" }
  );

  // Mutations
  const createField = trpc.form.createField.useMutation({
    onSuccess: () => {
      toast.success("Field added successfully");
      setIsAddFieldOpen(false);
      if (formId) {
        utils.form.getFieldsByForm.invalidate({ formId });
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add field");
    },
  });

  const deleteField = trpc.form.deleteField.useMutation({
    onSuccess: () => {
      toast.success("Field deleted successfully");
      if (formId) {
        utils.form.getFieldsByForm.invalidate({ formId });
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete field");
    },
  });

  const updateForm = trpc.form.updateForm.useMutation({
    onSuccess: (data) => {
      toast.success(`Form "${data.title}" updated successfully`);
      utils.form.getFormBySlug.invalidate({ workspaceId: workspaceId!, slug: formSlug });
      if (data.slug !== formSlug) {
        router.push(`/workspaces/${workspaceSlug}/form/${data.slug}`);
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
      utils.form.getFormsByWorkspace.invalidate({ workspaceId: workspaceId! });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete form");
    },
  });

  const copyShareLink = () => {
    if (!form) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${origin}/form/${form.slug}/submit`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Public submission link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

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

  const handleUpdateForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formId) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const newSlug = formData.get("slug") as string;
    const isPublic = formData.get("isPublic") === "true";
    const status = formData.get("status") as any;

    updateForm.mutate({
      formId,
      data: {
        title,
        description,
        slug: newSlug,
        isPublic,
        status,
      },
    });
  };

  const handleDeleteForm = () => {
    if (!formId) return;
    if (confirm("Are you sure you want to delete this form? This will permanently delete all fields and submissions!")) {
      deleteForm.mutate({ formId });
    }
  };

  if (workspaceLoading || formLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Spinner />
      </div>
    );
  }

  if (!workspace || !form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white gap-4">
        <p className="text-red-500 font-semibold">Form not found.</p>
        <Link href={`/workspaces/${workspaceSlug}`}>
          <Button variant="outline">Back to Workspace</Button>
        </Link>
      </div>
    );
  }

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/form/${form.slug}/submit` : "";

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm text-zinc-400">
            <Link href={`/workspaces/${workspaceSlug}`} className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> {workspace.name}
            </Link>
            <span>/</span>
            <span className="text-zinc-600">Forms</span>
            <span>/</span>
            <span className="text-zinc-200">{form.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{form.title}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
              form.status === "published" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" :
              form.status === "archived" ? "bg-zinc-800 text-zinc-400 border border-zinc-700" :
              "bg-amber-950 text-amber-400 border border-amber-800"
            }`}>
              {form.status}
            </span>
          </div>
          {form.description && <p className="text-sm text-zinc-400 max-w-2xl">{form.description}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-200 hover:text-white" onClick={copyShareLink}>
            {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
            Copy Link
          </Button>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            <Button className="bg-blue-650 hover:bg-blue-600">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Form
            </Button>
          </a>
        </div>
      </header>

      {/* Tabs bar */}
      <div className="flex border-b border-zinc-800 gap-4">
        <button
          onClick={() => setActiveTab("fields")}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "fields" ? "border-white text-white" : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Sliders className="h-4 w-4" />
          Fields ({fields?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "submissions" ? "border-white text-white" : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Submissions
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "settings" ? "border-white text-white" : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <ListFilter className="h-4 w-4" />
          Settings
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "fields" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Form Fields</h2>
            <Button onClick={() => setIsAddFieldOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Field
            </Button>
          </div>

          {fieldsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : fields && fields.length > 0 ? (
            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400 w-12 text-center">#</TableHead>
                      <TableHead className="text-zinc-400">Label</TableHead>
                      <TableHead className="text-zinc-400">Key (Identifier)</TableHead>
                      <TableHead className="text-zinc-400">Type</TableHead>
                      <TableHead className="text-zinc-400 text-center">Required</TableHead>
                      <TableHead className="text-zinc-450 w-20 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, idx) => (
                      <TableRow key={field.id} className="border-zinc-800 hover:bg-zinc-800/20">
                        <TableCell className="font-mono text-zinc-500 text-center">{idx + 1}</TableCell>
                        <TableCell className="font-semibold text-zinc-200">{field.label}</TableCell>
                        <TableCell className="font-mono text-xs text-zinc-400">{field.fieldKey}</TableCell>
                        <TableCell className="capitalize text-zinc-350">{field.type}</TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-0.5 text-2xs font-semibold rounded ${
                            field.isRequired ? "bg-red-950 text-red-400 border border-red-900" : "bg-zinc-800 text-zinc-400"
                          }`}>
                            {field.isRequired ? "Yes" : "No"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-zinc-400 hover:text-red-500 hover:bg-red-950/20"
                            onClick={() => {
                              if (confirm(`Delete the field "${field.label}"?`)) {
                                deleteField.mutate({ fieldId: field.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-lg">
              <p className="text-zinc-500">No fields created inside this form yet. Add some to display fields to your submitters!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "submissions" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Submissions Log</h2>
              <p className="text-xs text-zinc-400">Total submission count: {submissionsData?.total || 0}</p>
            </div>
          </div>

          {submissionsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : submissionsData && submissionsData.data.length > 0 ? (
            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Submission No.</TableHead>
                      <TableHead className="text-zinc-400">Submitted At</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400">Submitter ID</TableHead>
                      <TableHead className="text-zinc-400 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissionsData.data.map((sub) => (
                      <TableRow key={sub.id} className="border-zinc-800 hover:bg-zinc-800/20">
                        <TableCell className="font-semibold text-zinc-200">#{sub.submissionNumber}</TableCell>
                        <TableCell className="text-zinc-350 text-xs">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "N/A"}
                        </TableCell>
                        <TableCell className="capitalize text-zinc-400">
                          <span className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                            sub.status === "completed" ? "bg-emerald-950/55 text-emerald-400" :
                            sub.status === "flagged" ? "bg-red-950/55 text-red-400" :
                            "bg-zinc-800 text-zinc-400"
                          }`}>
                            {sub.status || "completed"}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-zinc-500 max-w-[120px] truncate">
                          {sub.submittedBy || "Anonymous"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/submissions/${sub.id}`}>
                            <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-lg">
              <p className="text-zinc-500">No submissions received for this form yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* General Config */}
          <Card className="bg-zinc-900 border-zinc-800 text-white md:col-span-2">
            <CardHeader>
              <CardTitle>Form Settings</CardTitle>
              <CardDescription className="text-zinc-400">Update general properties of your form</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateForm} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="form-title" className="text-xs">Form Title</Label>
                  <Input
                    id="form-title"
                    name="title"
                    defaultValue={form.title}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="form-desc" className="text-xs">Description</Label>
                  <Textarea
                    id="form-desc"
                    name="description"
                    defaultValue={form.description || ""}
                    className="bg-zinc-800 border-zinc-700 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="form-slug" className="text-xs">Form Slug</Label>
                  <Input
                    id="form-slug"
                    name="slug"
                    defaultValue={form.slug}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white h-10 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="form-status" className="text-xs">Status</Label>
                    <Select name="status" defaultValue={form.status}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="form-public" className="text-xs">Access Level</Label>
                    <Select name="isPublic" defaultValue={form.isPublic ? "true" : "false"}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white rounded-xl">
                        <SelectValue placeholder="Select access" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="true">Public (anyone can submit)</SelectItem>
                        <SelectItem value="false">Private (restricted access)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" disabled={updateForm.isPending} className="rounded-xl mt-2">
                  {updateForm.isPending ? "Saving Changes..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <div className="space-y-6 md:col-span-1">
            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader>
                <CardTitle className="text-red-500">Danger Zone</CardTitle>
                <CardDescription className="text-zinc-400">Permanently delete this form and all data</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="w-full rounded-xl"
                  onClick={handleDeleteForm}
                  disabled={deleteForm.isPending}
                >
                  {deleteForm.isPending ? "Deleting..." : "Delete Form"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Add Field Dialog */}
      <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <form onSubmit={handleAddField} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add Form Field</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Create a new input field for submitters to respond to.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="field-label" className="text-zinc-300">Field Label</Label>
                <Input
                  id="field-label"
                  name="label"
                  required
                  placeholder="e.g. Email Address"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="field-type" className="text-zinc-300">Field Type</Label>
                <Select name="type" defaultValue="text">
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-48 overflow-y-auto">
                    <SelectItem value="text">Short Text</SelectItem>
                    <SelectItem value="textarea">Long Text (Paragraph)</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Number</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="time">Time</SelectItem>
                    <SelectItem value="url">URL Link</SelectItem>
                    <SelectItem value="checkbox">Yes/No Checkbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="field-placeholder" className="text-zinc-300">Placeholder</Label>
                <Input
                  id="field-placeholder"
                  name="placeholder"
                  placeholder="e.g. enter your email"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="field-req" className="text-zinc-300">Required Field</Label>
                <Select name="isRequired" defaultValue="false">
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
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
                onClick={() => setIsAddFieldOpen(false)}
                className="bg-transparent border-zinc-700 hover:bg-zinc-800 text-white"
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
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white"><Spinner /></div>}>
      <FormDetailsContent {...props} />
    </Suspense>
  );
}