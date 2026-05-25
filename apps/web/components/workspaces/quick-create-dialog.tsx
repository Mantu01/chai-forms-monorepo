"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { Sparkles, Send } from "lucide-react";

export function QuickCreateDialog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();

  const { data: userData, isLoading: userLoading } = trpc.auth.me.useQuery();
  const user = userData?.user;
  const isSubscribed = user?.isSubscribed ?? false;

  const { data: workspaces, isLoading: workspacesLoading } = trpc.workspace.getUserWorkspaces.useQuery(
    {},
    { enabled: !!user && isSubscribed }
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const createForm = trpc.form.createForm.useMutation();
  const createPage = trpc.form.createPage.useMutation();
  const createField = trpc.form.createField.useMutation();

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("quick-create");
    router.push(`?${params.toString()}`);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSubscribed) return;

    const formData = new FormData(e.currentTarget);
    const prompt = (formData.get("prompt") as string) || "";
    const workspaceVal = formData.get("workspaceId") as string;

    if (!workspaceVal) {
      toast.error("Please select a workspace");
      return;
    }

    const [workspaceId, workspaceSlug] = workspaceVal.split(":");
    const title = prompt.trim() || "Generated Form";
    const slugBase = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 30) || "generated-form";
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 7)}`;
    const description = prompt ? `Generated from prompt: ${prompt}` : "A mock generated form created for your workspace.";

    setIsGenerating(true);

    try {
      const form = await createForm.mutateAsync({
        workspaceId: workspaceId || "",
        title,
        slug,
        description,
        themeConfig: {},
        status: "draft",
        accessLevel: "unlisted",
      });

      await createPage.mutateAsync({
        formId: form.id,
        title: "Page 1",
        description: "Generated page with mock fields",
        order: 1,
      }).then(async (page) => {
        await Promise.all([
          createField.mutateAsync({
            formId: form.id,
            pageId: page.id,
            label: "Full Name",
            type: "text",
            placeholder: "John Doe",
            fieldKey: "full_name",
            isRequired: true,
            order: 1,
          }),
          createField.mutateAsync({
            formId: form.id,
            pageId: page.id,
            label: "Email Address",
            type: "email",
            placeholder: "john@example.com",
            fieldKey: "email_address",
            isRequired: true,
            order: 2,
          }),
          createField.mutateAsync({
            formId: form.id,
            pageId: page.id,
            label: "Your Feedback",
            type: "textarea",
            placeholder: "Tell us what you think...",
            fieldKey: "your_feedback",
            isRequired: false,
            order: 3,
          }),
        ]);
      });

      if (workspaceId) {
        utils.form.getFormsWithStats.invalidate({ workspaceId });
      }

      toast.success("Form generated successfully!");
      router.push(`/workspaces/${workspaceSlug}/form/${slug}?tab=fields&generated=true`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to generate form");
    } finally {
      setIsGenerating(false);
    }
  };
  const isOpen = searchParams.get("quick-create") === "true";

  if (userLoading || (isSubscribed && workspacesLoading)) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-lg border-border bg-zinc-950 text-white backdrop-blur-md">
        <DialogHeader className="pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" />
            <DialogTitle className="text-white text-base font-bold">Quick Form Creator</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400 text-2xs">
            Create a new form with mock pages and fields instantly.
          </DialogDescription>
        </DialogHeader>

        {!isSubscribed ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shadow-lg animate-pulse">
              PRO
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-200">Upgrade Required</p>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                Form generation is only available for pro users.
              </p>
            </div>
            <Button
              variant="default"
              onClick={() => router.push("/profile?upgrade=true")}
              className="rounded-xl mt-2 bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-semibold text-xs h-9 px-4 hover:opacity-90"
            >
              Subscribe Now
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-3">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="qc-workspace" className="text-2xs font-semibold text-zinc-300">
                  Target Workspace
                </label>
                <select
                  id="qc-workspace"
                  name="workspaceId"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all cursor-pointer"
                >
                  <option value="" disabled selected>
                    Choose a workspace
                  </option>
                  {(workspaces || []).map((w) => (
                    <option key={w.workspace.id} value={`${w.workspace.id}:${w.workspace.slug}`}>
                      {w.workspace.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="qc-prompt" className="text-2xs font-semibold text-zinc-300">
                  Describe what kind of form you need
                </label>
                <div className="flex flex-col gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <textarea
                    id="qc-prompt"
                    name="prompt"
                    required
                    placeholder="e.g. Create a customer registration form with page 1 for contact details and page 2 for products feedback..."
                    rows={4}
                    className="w-full bg-transparent text-white placeholder-zinc-550 text-xs px-2.5 py-2 resize-none focus:outline-none"
                  />
                  <div className="flex justify-end p-1">
                    <Button
                      type="submit"
                      disabled={isGenerating}
                      className="h-8 rounded-lg text-2xs bg-amber-600 hover:bg-amber-700 text-white font-medium gap-1.5 px-3"
                    >
                      {isGenerating ? "Generating..." : "Generate Form"}
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
