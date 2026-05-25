"use client";

import { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { Sparkles, Send } from "lucide-react";
import { ChatInput } from "../ai-builder/chat-interface";

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

  const createForm = trpc.form.createForm.useMutation();

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

      if (workspaceId) {
        utils.form.getFormsWithStats.invalidate({ workspaceId });
      }

      toast.success("Form created! Starting AI generation...");
      router.push(`/workspaces/${workspaceSlug}/form/${slug}?tab=fields&generate=true&prompt=${encodeURIComponent(prompt)}`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to generate form");
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
          <DialogDescription className="text-zinc-400 text-xs">
            Create a new form with mock pages and fields instantly.
          </DialogDescription>
        </DialogHeader>

        {!isSubscribed ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-linear-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shadow-lg animate-pulse">
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
              className="rounded-xl mt-2 bg-linear-to-tr from-amber-500 to-orange-600 text-white font-semibold text-xs h-9 px-4 hover:opacity-90"
            >
              Subscribe Now
            </Button>
          </div>
        ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="qc-workspace" className="text-xs font-semibold text-zinc-300">
                  Target Workspace
                </label>
                <select
                  id="qc-workspace"
                  name="workspaceId"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all cursor-pointer"
                >
                  <option value="none" disabled selected>
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
                <label htmlFor="qc-prompt" className="text-xs font-semibold text-zinc-300">
                  Describe what kind of form you need
                </label>
                <ChatInput/>
              </div>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
