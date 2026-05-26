'use client'
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTambo } from "@tambo-ai/react";
import { PageSchemaType } from "~/lib/tambo";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";

type CreationStatus = "idle" | "creating_form" | "creating_pages" | "creating_fields" | "done" | "error";

const statusMessages: Record<CreationStatus, string> = {
  idle: "Waiting",
  creating_form: "Setting up form",
  creating_pages: "Building pages",
  creating_fields: "Adding fields",
  done: "Form created!",
  error: "Something went wrong",
};

const GenerateForm: React.FC<PageSchemaType> = ({ pages, description, title }) => {
  const shouldMakeReq = useRef(false);
  const hasRun = useRef(false);
  const { isIdle, streamingState } = useTambo();
  const searchParams = useSearchParams();
  const router = useRouter();
  const workspaceSlug = searchParams.get("workspaceSlug") ?? "";

  const [creationStatus, setCreationStatus] = useState<CreationStatus>("idle");
  const [activePageLabel, setActivePageLabel] = useState<string>("");

  const { data: workspaceData } = trpc.workspace.getWorkspaceBySlug.useQuery(
    { slug: workspaceSlug },
    { enabled: !!workspaceSlug }
  );

  const createFormMutation = trpc.form.createForm.useMutation();
  const createPageMutation = trpc.form.createPage.useMutation();
  const createFieldMutation = trpc.form.createField.useMutation();

  useEffect(() => {
    const run = async () => {
      if (hasRun.current || !workspaceData?.id || !pages?.length) return;
      hasRun.current = true;

      try {
        setCreationStatus("creating_form");

        const formSlug = title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          + `-${Date.now()}`;

        const newForm = await createFormMutation.mutateAsync({
          workspaceId: workspaceData.id,
          title,
          description: description || undefined,
          slug: formSlug,
          status: "draft",
          isPublic: false,
          accessLevel: "private",
          themeConfig: {},
        });
        router.push(`/workspaces/${workspaceSlug}/form/${formSlug}?tab=fields`);

        setCreationStatus("creating_pages");

        for (const page of pages) {
          setActivePageLabel(page.currentState ?? "");

          const newPage = await createPageMutation.mutateAsync({
            formId: newForm.id,
            title: page.title ?? `Page ${page.order}`,
            description: page.description ?? undefined,
            order: page.order,
          });

          setCreationStatus("creating_fields");

          for (const field of page.fields) {
            await createFieldMutation.mutateAsync({
              formId: newForm.id,
              pageId: newPage.id,
              label: field.label,
              type: field.type as any,
              placeholder: field.placeholder ?? undefined,
              helperText: field.helperText ?? undefined,
              isRequired: field.isRequired,
              fieldKey: field.fieldKey,
              defaultValue: field.defaultValue ?? undefined,
              order: field.order,
              config: field.config ?? undefined,
            });
          }

          setCreationStatus("creating_pages");
        }

        setCreationStatus("done");
        toast.success(`"${title}" is ready!`);
      } catch (err) {
        console.error("Failed to generate form:", err);
        hasRun.current = false;
        setCreationStatus("error");
        toast.error("Failed to create form. Please try again.");
      }
    };

    if (!isIdle) {
      shouldMakeReq.current = true;
    }
    if (isIdle && shouldMakeReq.current) {
      console.log({pages})
      run();
    }
  }, [streamingState.status, workspaceData?.id]);

  const isStreaming = !isIdle;
  const isDone = creationStatus === "done";
  const isError = creationStatus === "error";
  const isWorking = !isStreaming && creationStatus !== "idle" && !isDone && !isError;

  const streamingPage = pages ? [...pages].reverse().find(p => !!p.currentState) : undefined;
  const liveLabel = isStreaming
    ? (streamingPage?.currentState ?? "Generating")
    : statusMessages[creationStatus];

  const dotCount = isWorking || isStreaming ? 3 : 0;

  return (
    <div className="inline-flex items-center">
      <div
        className={[
          "relative flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-semibold border backdrop-blur-sm select-none transition-all duration-500",
          isDone
            ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-300 shadow-[0_0_16px_-4px_rgba(52,211,153,0.3)]"
            : isError
            ? "bg-red-950/60 border-red-500/30 text-red-300"
            : "bg-amber-950/40 border-amber-500/20 text-amber-300 shadow-[0_0_12px_-4px_rgba(245,158,11,0.25)]",
        ].join(" ")}
      >
        {!isDone && !isError && (
          <span className="absolute inset-0 rounded-2xl animate-pulse bg-amber-400/5 pointer-events-none" />
        )}

        <span className="relative flex items-center gap-2">
          {isDone ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          ) : isError ? (
            <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
          ) : isStreaming ? (
            <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0 animate-pulse" />
          ) : (
            <Loader2 className="h-3.5 w-3.5 text-amber-400 shrink-0 animate-spin" />
          )}

          <span className="tracking-wide">{liveLabel}</span>

          {isWorking && activePageLabel && (
            <span className="text-amber-500/50 font-normal">· {activePageLabel}</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default GenerateForm;