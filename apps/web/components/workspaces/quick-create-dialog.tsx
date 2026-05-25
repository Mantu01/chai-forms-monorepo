import { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "~/trpc/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { generateAIFormDefinition } from "~/lib/tambo";

export function QuickCreateDialog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  const { data: userData, isLoading: userLoading } = trpc.auth.me.useQuery();
  const user = userData?.user;
  const isSubscribed = user?.isSubscribed ?? false;

  const { data: workspaces, isLoading: workspacesLoading } = trpc.workspace.getUserWorkspaces.useQuery(
    {},
    { enabled: !!user && isSubscribed }
  );

  const { data: generationState } = useQuery({
    queryKey: ["aiFormGeneration"],
    queryFn: () => ({ active: false, statusMessage: "" } as any),
    initialData: { active: false, statusMessage: "" },
  });

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
    if (!workspaceId) return;

    queryClient.setQueryData(["aiFormGeneration"], {
      active: true,
      statusMessage: "Thinking...",
    });

    try {
      const formDef = await generateAIFormDefinition(prompt);

      const title = formDef.title || "Generated Form";
      const slugBase = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 30) || "generated-form";
      const slug = `${slugBase}-${Math.random().toString(36).slice(2, 7)}`;
      const description = formDef.description || `Generated from prompt: ${prompt}`;

      const form = await createForm.mutateAsync({
        workspaceId,
        title,
        slug,
        description,
        themeConfig: {},
        status: "draft",
        accessLevel: "unlisted",
      });

      queryClient.setQueryData(["aiFormGeneration"], {
        active: true,
        statusMessage: "Form shell created. Preparing pages...",
        pages: formDef.pages || [],
        formId: form.id,
        workspaceId,
        workspaceSlug,
        slug,
        index: 0,
      });

      utils.form.getFormsWithStats.invalidate({ workspaceId });
      handleClose();
      router.push(`/workspaces/${workspaceSlug}/form/${slug}?tab=fields&generated=true`);
    } catch (error: any) {
      queryClient.setQueryData(["aiFormGeneration"], { active: false, statusMessage: "" });
      toast.error(error?.message || "Failed to generate form");
    }
  };

  const isOpen = searchParams.get("quick-create") === "true";

  if (userLoading || (isSubscribed && workspacesLoading)) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-md border-border bg-zinc-950 text-white backdrop-blur-md">
        <DialogHeader className="pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500/20" />
            <DialogTitle className="text-white text-sm font-bold">AI Form Creator</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400 text-3xs">
            Describe your form goals in plain text. Tambo AI builds optimal structures in seconds.
          </DialogDescription>
        </DialogHeader>

        {!isSubscribed ? (
          <div className="py-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-650 flex items-center justify-center font-bold text-white shadow-lg">
              PRO
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-zinc-200">Subscription Required</p>
              <p className="text-3xs text-zinc-550 max-w-xs leading-relaxed">
                Tambo AI form builder is exclusively available for upgraded accounts.
              </p>
            </div>
            <Button
              variant="default"
              onClick={() => router.push("/profile?upgrade=true")}
              className="rounded-xl mt-1 bg-gradient-to-tr from-amber-500 to-orange-650 text-white font-semibold text-xs h-9 px-4 hover:opacity-90"
            >
              Subscribe Now
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <label htmlFor="qc-workspace" className="text-3xs font-semibold text-zinc-300">
                Target Workspace
              </label>
              <select
                id="qc-workspace"
                name="workspaceId"
                required
                className="w-full h-9 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/30 cursor-pointer"
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

            <div className="space-y-1">
              <label htmlFor="qc-prompt" className="text-3xs font-semibold text-zinc-300">
                Form description and requirements
              </label>
              <div className="flex flex-col gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
                <textarea
                  id="qc-prompt"
                  name="prompt"
                  required
                  placeholder="e.g. A product feedback form. First page asks for email and rating. Second page asks for textual details..."
                  rows={3}
                  className="w-full bg-transparent text-white placeholder-zinc-550 text-2xs px-2.5 py-1.5 resize-none focus:outline-none"
                />
                <div className="flex justify-end p-1 border-t border-zinc-800/40">
                  <Button
                    type="submit"
                    disabled={generationState.active}
                    className="h-8 rounded-lg text-3xs bg-amber-600 hover:bg-amber-700 text-white font-medium gap-1 px-3"
                  >
                    {generationState.active ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate Form</span>
                        <Send className="h-2.5 w-2.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
