"use client";

import { useTambo } from "@tambo-ai/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "~/trpc/client";
import { PageSchemaType } from "~/lib/tambo";

export default function GeneratedPage(pages: PageSchemaType) {
  const { streamingState } = useTambo();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const shouldMakeReq = useRef(false);
  const hasSaved = useRef(false);
  const [status, setStatus] = useState("Waiting for generated form data...");
  const [savedPages, setSavedPages] = useState<PageSchemaType>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const routeParams = useMemo(() => {
    if (!pathname) return undefined;
    const match = pathname.match(/^\/workspaces\/([^/]+)\/form\/([^/]+)/);
    if (!match) return undefined;
    return {
      workspaceSlug: match[1],
      formSlug: match[2],
    };
  }, [pathname]);

  const { data: workspace } = trpc.workspace.getWorkspaceBySlug.useQuery(
    { slug: routeParams?.workspaceSlug || "" },
    { enabled: !!routeParams?.workspaceSlug }
  );

  const { data: form } = trpc.form.getFormBySlug.useQuery(
    { workspaceId: workspace?.id || "", slug: routeParams?.formSlug || "" },
    { enabled: !!workspace?.id && !!routeParams?.formSlug }
  );

  const createPage = trpc.form.createPage.useMutation();
  const createField = trpc.form.createField.useMutation();

  const saveGeneratedPages = async () => {
    if (!form?.id) {
      setErrorMessage("Unable to save generated pages: form not found.");
      setStatus("Unable to save generated pages.");
      return;
    }

    if (!pages || pages.length === 0) {
      setStatus("No generated pages were returned.");
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);
    setStatus("Saving generated form structure to the database...");

    try {
      const saved: PageSchemaType = [];

      for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
        const page = pages[pageIndex];
        const createdPage = await createPage.mutateAsync({
          formId: form.id,
          title: page.title || undefined,
          description: page.description || undefined,
          order: page.order ?? pageIndex + 1,
        });

        const fieldList = page.fields || [];
        for (let fieldIndex = 0; fieldIndex < fieldList.length; fieldIndex += 1) {
          const field = fieldList[fieldIndex];
          const fieldKey =
            field.fieldKey ||
            (field.label || "field")
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "_")
              .replace(/^_+|_+$/g, "") ||
            `field_${Date.now()}_${fieldIndex}`;

          await createField.mutateAsync({
            formId: form.id,
            pageId: createdPage.id,
            label: field.label || `Field ${fieldIndex + 1}`,
            type: field.type,
            placeholder: field.placeholder || undefined,
            helperText: field.helperText || undefined,
            defaultValue: field.defaultValue || undefined,
            isRequired: field.isRequired ?? false,
            fieldKey,
            order: field.order ?? fieldIndex + 1,
            config: field.config || undefined,
          });
        }

        saved.push(page);
      }

      await queryClient.invalidateQueries(["form.getPagesByForm", { formId: form.id }]);
      await queryClient.invalidateQueries(["form.getFieldsByForm", { formId: form.id }]);

      setSavedPages(saved);
      setStatus("Generated pages saved successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save generated form data."
      );
      setStatus("Error saving generated form data.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (hasSaved.current) return;
    if (streamingState.status !== "idle") {
      shouldMakeReq.current = true;
      return;
    }
    if (streamingState.status === "idle" && shouldMakeReq.current) {
      shouldMakeReq.current = false;
      hasSaved.current = true;
      saveGeneratedPages();
    }
  }, [streamingState.status, form?.id]);

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-card/95 p-4 text-sm text-foreground">
      <div className="space-y-1">
        <p className="font-semibold">Generated Form Output</p>
        <p className="text-xs text-muted-foreground">{status}</p>
      </div>

      {isSaving && (
        <div className="rounded-xl border border-border/60 bg-muted/10 p-3 text-xs">
          Saving generated pages and fields to database...
        </div>
      )}

      {errorMessage ? (
        <div className="rounded-xl border border-destructive/60 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {savedPages.length > 0 ? (
        <div className="space-y-4">
          {savedPages.map((page, pageIndex) => (
            <div key={`${page.title || "page"}-${pageIndex}`} className="rounded-2xl border border-border/50 bg-background/80 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{page.title || `Page ${pageIndex + 1}`}</p>
                  {page.description ? (
                    <p className="text-[11px] text-muted-foreground">{page.description}</p>
                  ) : null}
                </div>
                <span className="rounded-full border border-border/60 bg-muted/10 px-2 py-1 text-[11px] text-muted-foreground">
                  Order {page.order ?? pageIndex + 1}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {page.fields.map((field, fieldIndex) => (
                  <div key={`${field.fieldKey || field.label || fieldIndex}-${fieldIndex}`} className="rounded-xl border border-border/50 bg-muted/5 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium">{field.label || `Field ${fieldIndex + 1}`}</p>
                      <span className="text-[11px] text-muted-foreground capitalize">{field.type}</span>
                    </div>
                    {field.placeholder ? (
                      <p className="text-[11px] text-muted-foreground">Placeholder: {field.placeholder}</p>
                    ) : null}
                    {field.isRequired ? (
                      <p className="text-[11px] text-foreground">Required</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
