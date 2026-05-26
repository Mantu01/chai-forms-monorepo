"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export function QuickCreateDialog() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [prompt, setPrompt] = useState("");

  const { data: userData } = trpc.auth.me.useQuery();

  const { data: workspaces } = trpc.workspace.getUserWorkspaces.useQuery(
    {},
    {
      enabled: !!userData?.user,
    }
  );

  const createForm = trpc.form.createForm.useMutation();

  const isOpen = searchParams.get("quick-create") === "true";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const workspaceVal = formData.get("workspaceId") as string;

    const [workspaceId, workspaceSlug] = workspaceVal.split(":");
    if (!workspaceId) return;

    try {
      const slug = `generated-${Date.now()}`;

      await createForm.mutateAsync({
        workspaceId,
        title: prompt,
        slug,
        description: prompt,
        status: "draft",
        accessLevel: "unlisted",
        themeConfig: {},
      });

      router.push(`/workspaces/${workspaceSlug}/form/${slug}?generate=true&prompt=${encodeURIComponent(prompt)}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("quick-create");

          const query = params.toString();
          router.replace(query ? `?${query}` : window.location.pathname);
        }
      }}
    >
      <DialogContent className="sm:max-w-xl border-border bg-zinc-950/90 text-white backdrop-blur-xl">
        {!userData?.user?.isSubscribed ? (
          <div className="py-6 flex flex-col items-center justify-center text-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 animate-pulse">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-zinc-100">AI Form Generator is a Pro Feature</h2>
              <p className="text-xs text-zinc-450 max-w-sm leading-relaxed">
                Unlock instant form scaffolding, smart validation generation, and multi-page layouts designed automatically by our AI system.
              </p>
            </div>
            <Button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("quick-create");
                router.push(`/billings?${params.toString()}`);
              }}
              className="rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-semibold text-xs h-10 px-8 hover:opacity-90 transition-opacity w-full max-w-xs shadow-lg shadow-amber-500/10"
            >
              Subscribe to Pro (₹499/mo)
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                AI Form Generator
              </DialogTitle>

              <DialogDescription>
                Generate forms using AI
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <select
                name="workspaceId"
                required
                className="w-full h-11 rounded-xl border px-4 bg-zinc-900 border-zinc-800 text-white"
              >
                {(workspaces || []).map((workspace) => (
                  <option
                    key={workspace.workspace.id}
                    value={`${workspace.workspace.id}:${workspace.workspace.slug}`}
                  >
                    {workspace.workspace.name}
                  </option>
                ))}
              </select>

              <textarea
                value={prompt}
                onChange={(e) =>
                  setPrompt(e.target.value)
                }
                placeholder="Generate a job application form with education, experience and portfolio sections"
                className="min-h-40 w-full rounded-2xl border p-4 bg-zinc-900 border-zinc-800 text-white"
              />

              <Button
                type="submit"
                className="w-full"
              >
                Generate Form
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}