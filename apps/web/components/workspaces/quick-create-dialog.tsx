"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle,} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

export function QuickCreateDialog() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [prompt, setPrompt] = useState("");

  const { data: userData } = trpc.auth.me.useQuery();

  const { data: workspaces } =trpc.workspace.getUserWorkspaces.useQuery(
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
    if(!workspaceId)  return;

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
      <DialogContent className="sm:max-w-xl">
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
            className="w-full h-11 rounded-xl border px-4"
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
            className="min-h-40 w-full rounded-2xl border p-4"
          />

          <Button
            type="submit"
            className="w-full"
          >
            Generate Form
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}