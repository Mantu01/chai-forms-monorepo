"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { TamboAI } from "@tambo-ai/typescript-sdk";
import { trpc } from "~/trpc/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Spinner } from "~/components/ui/spinner";
import { Button } from "~/components/ui/button";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { env } from "~/env";

interface FormGeneratorOverlayProps {
  formId: string;
  prompt: string;
}

function findThreadId(obj: any): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  if (typeof obj.threadId === "string" && obj.threadId.startsWith("thr_")) {
    return obj.threadId;
  }
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === "string" && val.startsWith("thr_")) {
      return val;
    }
    if (val && typeof val === "object") {
      const found = findThreadId(val);
      if (found) return found;
    }
  }
  return undefined;
}

export function FormGeneratorOverlay({ formId, prompt }: FormGeneratorOverlayProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  const createPage = trpc.form.createPage.useMutation();
  const createField = trpc.form.createField.useMutation();

  const { data: statusData } = useQuery({
    queryKey: ["formGenStatus", formId],
    queryFn: () => queryClient.getQueryData<string>(["formGenStatus", formId]) ?? "thinking",
    initialData: "thinking",
    enabled: true,
  });

  const { data, error, isLoading } = useQuery({
    queryKey: ["tamboFormGeneration", formId, prompt],
    queryFn: async () => {
      queryClient.setQueryData(["formGenStatus", formId], "thinking");

      const tambo = new TamboAI({
        apiKey: env.NEXT_PUBLIC_TAMBO_API_KEY,
      });

      const stream = await tambo.threads.runs.create({
        message: {
          role: "user",
          content: [{ type: "text", text: prompt }],
        },
        availableComponents: [
          {
            name: "generateForm",
            description: "Generates a structured form schema containing pages and fields based on the prompt description.",
            propsSchema: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                pages: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      order: { type: "number" },
                      fields: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            label: { type: "string" },
                            type: { type: "string" },
                            placeholder: { type: "string" },
                            isRequired: { type: "boolean" },
                            order: { type: "number" },
                          },
                          required: ["label", "type", "isRequired", "order"],
                        },
                      },
                    },
                    required: ["title", "description", "order", "fields"],
                  },
                },
              },
              required: ["title", "description", "pages"],
            },
          },
        ],
        toolChoice: { name: "generateForm" },
      });

      let threadId: string | undefined = undefined;
      for await (const chunk of stream) {
        if (!threadId) {
          threadId = findThreadId(chunk);
        }
      }

      if (!threadId) {
        throw new Error("Could not initialize AI thread");
      }

      queryClient.setQueryData(["formGenStatus", formId], "almost there, finalizing form structure...");
      const messages = await tambo.beta.threads.messages.list(threadId);
      const assistantMessage = messages.find(
        (m) => m.role === "assistant" && m.component?.componentName === "generateForm"
      );

      if (!assistantMessage || !assistantMessage.component?.props) {
        throw new Error("AI did not generate a valid form structure");
      }

      const generatedForm = assistantMessage.component.props as any;
      const pages = generatedForm.pages || [];

      for (let pIndex = 0; pIndex < pages.length; pIndex++) {
        const pageData = pages[pIndex];
        queryClient.setQueryData(
          ["formGenStatus", formId],
          `adding page ${pIndex + 1}: ${pageData.title || "Page"}`
        );

        const page = await createPage.mutateAsync({
          formId,
          title: pageData.title || `Page ${pIndex + 1}`,
          description: pageData.description || "",
          order: pageData.order || pIndex + 1,
        });

        const fieldsData = pageData.fields || [];
        for (let fIndex = 0; fIndex < fieldsData.length; fIndex++) {
          const fieldData = fieldsData[fIndex];
          queryClient.setQueryData(
            ["formGenStatus", formId],
            `adding field: ${fieldData.label || "Field"} on page ${pIndex + 1}`
          );

          const fieldKey = (fieldData.label || "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "") || `field_${Date.now()}_${fIndex}`;

          await createField.mutateAsync({
            formId,
            pageId: page.id,
            label: fieldData.label,
            type: fieldData.type,
            placeholder: fieldData.placeholder || undefined,
            isRequired: !!fieldData.isRequired,
            fieldKey,
            order: fieldData.order || fIndex + 1,
          });
        }
      }

      queryClient.setQueryData(["formGenStatus", formId], "almost there, finalizing...");
      await utils.form.getFormBySlug.invalidate();
      await utils.form.getFieldsByForm.invalidate();
      queryClient.setQueryData(["formGenStatus", formId], "completed");

      return { success: true };
    },
    enabled: !!formId && !!prompt,
    staleTime: Infinity,
    retry: false,
  });

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("generate");
    params.delete("prompt");
    router.replace(`?${params.toString()}`);
  };

  const isCompleted = data?.success && statusData === "completed";

  return (
    <Dialog open={true} onOpenChange={() => { if (isCompleted) handleClose(); }}>
      <DialogContent className="sm:max-w-md border-border bg-zinc-950/90 text-white backdrop-blur-xl">
        <DialogHeader className="pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            <DialogTitle className="text-white text-base font-bold">AI Form Generation</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400 text-xs">
            Tambo AI is crafting your form experience based on your requirements.
          </DialogDescription>
        </DialogHeader>

        <div className="py-8 flex flex-col items-center justify-center text-center gap-6">
          {isCompleted ? (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 fill-emerald-500/10 animate-bounce" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-100">Generation Complete!</p>
                <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                  Your custom form pages and input fields have been generated and configured successfully.
                </p>
              </div>
              <Button
                variant="default"
                onClick={handleClose}
                className="rounded-xl mt-2 bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-semibold text-xs h-9 px-6 hover:opacity-90 transition-opacity"
              >
                Start Customizing Form
              </Button>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-semibold text-red-500">Failed to Generate Form</p>
              <p className="text-xs text-zinc-450 max-w-xs leading-relaxed">
                {(error as any)?.message || "An unexpected error occurred during generation."}
              </p>
              <Button
                variant="outline"
                onClick={handleClose}
                className="rounded-xl mt-2 border-zinc-800 bg-zinc-900 text-zinc-300 text-xs h-9 px-6"
              >
                Close
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Spinner />
              <div className="space-y-1">
                <p className="text-xs text-zinc-400 capitalize tracking-wider font-semibold animate-pulse">
                  {statusData}
                </p>
                <p className="text-2xs text-zinc-500">
                  Please keep this window open while the form is constructed.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
