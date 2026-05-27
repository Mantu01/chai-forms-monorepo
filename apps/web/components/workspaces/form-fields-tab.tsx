"use client";

import React, { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "~/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";
import { FormFieldDialogs } from "~/components/workspaces/field-dialogs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Trash2,
  Settings,
  Eye,
  GripVertical,
  CheckCircle
} from "lucide-react";
import { FormRenderer } from "~/components/forms/form-renderer";

interface FormFieldsTabProps {
  formId: string;
  isAdminOrOwner: boolean;
}

function SortablePagePanel({
  page,
  fields,
  isAdminOrOwner,
  onEditPage,
  onDeletePage,
  onEditField,
  onDeleteField,
  onAddFieldToPage
}: {
  page: any;
  fields: any[];
  isAdminOrOwner: boolean;
  onEditPage: (page: any) => void;
  onDeletePage: (id: string) => void;
  onEditField: (field: any) => void;
  onDeleteField: (id: string) => void;
  onAddFieldToPage: (pageId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `page-${page.id}`
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="border border-border/60 bg-card/45 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAdminOrOwner && (
            <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground/80 hover:text-foreground">
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold">{page.title || "Untitled Page"}</h3>
            {page.description && <p className="text-xs text-muted-foreground">{page.description}</p>}
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => onEditPage(page)}>
            <Settings className="h-3.5 w-3.5" />
          </Button>
          {isAdminOrOwner && (
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => onDeletePage(page.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <SortableContext items={fields.map(f => `field-${f.id}`)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-12 border border-dashed border-border/40 rounded-xl p-2 bg-muted/20">
          {fields.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Drag fields here or click Add Field</p>
          ) : (
            fields.map((field) => (
              <SortableFieldRow
                key={field.id}
                field={field}
                isAdminOrOwner={isAdminOrOwner}
                onEditField={onEditField}
                onDeleteField={onDeleteField}
              />
            ))
          )}
        </div>
      </SortableContext>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => onAddFieldToPage(page.id)} className="h-8 text-xs rounded-lg">
          <Plus className="h-3 w-3 mr-1" /> Add Field
        </Button>
      </div>
    </div>
  );
}

function SortableFieldRow({
  field,
  isAdminOrOwner,
  onEditField,
  onDeleteField
}: {
  field: any;
  isAdminOrOwner: boolean;
  onEditField: (field: any) => void;
  onDeleteField: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `field-${field.id}`
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between border border-border/55 bg-background/80 rounded-lg p-2.5">
      <div className="flex items-center gap-2 min-w-0">
        {isAdminOrOwner && (
          <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground/80 hover:text-foreground">
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        )}
        <div className="min-w-0 space-y-0.5">
          <p className="text-xs font-medium truncate">{field.label}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[10px] text-muted-foreground">{field.fieldKey}</span>
            <Badge variant="outline" className="text-[10px] px-1 py-0 capitalize scale-90 origin-left">
              {field.type}
            </Badge>
            {field.isRequired && (
              <span className="text-[10px] text-rose-600 font-bold">* Required</span>
            )}
            {field.config?.logic?.showIf && (
              <span className="text-[10px] text-amber-600 font-bold">Conditional</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => onEditField(field)}>
          <Settings className="h-3.5 w-3.5" />
        </Button>
        {isAdminOrOwner && (
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => onDeleteField(field.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function FormFieldsTab({ formId, isAdminOrOwner }: FormFieldsTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();

  const { data: form } = trpc.form.getFormById.useQuery(
    { formId },
    { enabled: !!formId }
  );

  const { data: pages, isLoading: pagesLoading } = trpc.form.getPagesByForm.useQuery(
    { formId },
    { enabled: !!formId }
  );

  const { data: fields, isLoading: fieldsLoading } = trpc.form.getFieldsByForm.useQuery(
    { formId },
    { enabled: !!formId }
  );

  const { data: previewPage } = useQuery({
    queryKey: ["previewPage"],
    queryFn: () => 0,
    initialData: 0,
  });

  const { data: previewAnswers } = useQuery({
    queryKey: ["previewAnswers"],
    queryFn: () => ({} as Record<string, any>),
    initialData: {},
  });

  const { data: previewSuccess } = useQuery({
    queryKey: ["previewSuccess"],
    queryFn: () => false,
    initialData: false,
  });

  const createPage = trpc.form.createPage.useMutation({
    onSuccess: () => {
      toast.success("New page successfully added!");
      utils.form.getPagesByForm.invalidate({ formId });
    }
  });

  const deletePage = trpc.form.deletePage.useMutation({
    onSuccess: () => {
      toast.success("Page successfully deleted!");
      utils.form.getPagesByForm.invalidate({ formId });
      utils.form.getFieldsByForm.invalidate({ formId });
    }
  });

  const updatePage = trpc.form.updatePage.useMutation({
    onSuccess: () => {
      toast.success("Page properties updated successfully!");
      router.replace(`?tab=fields`);
      utils.form.getPagesByForm.invalidate({ formId });
    }
  });

  const reorderPagesMutation = trpc.form.reorderPages.useMutation({
    onSuccess: () => {
      utils.form.getPagesByForm.invalidate({ formId });
    }
  });

  const createField = trpc.form.createField.useMutation({
    onSuccess: () => {
      toast.success("New field successfully added!");
      router.replace(`?tab=fields`);
      utils.form.getFieldsByForm.invalidate({ formId });
    }
  });

  const updateField = trpc.form.updateField.useMutation({
    onSuccess: () => {
      toast.success("Field properties updated successfully!");
      router.replace(`?tab=fields`);
      utils.form.getFieldsByForm.invalidate({ formId });
    }
  });

  const deleteField = trpc.form.deleteField.useMutation({
    onSuccess: () => {
      toast.success("Field successfully deleted!");
      utils.form.getFieldsByForm.invalidate({ formId });
    }
  });

  const reorderFieldsMutation = trpc.form.reorderFields.useMutation({
    onSuccess: () => {
      utils.form.getFieldsByForm.invalidate({ formId });
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !pages || !fields) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    if (activeIdStr.startsWith("page-") && overIdStr.startsWith("page-")) {
      const activeId = activeIdStr.replace("page-", "");
      const overId = overIdStr.replace("page-", "");
      const oldIndex = pages.findIndex((p) => p.id === activeId);
      const newIndex = pages.findIndex((p) => p.id === overId);

      const newPages = arrayMove([...pages], oldIndex, newIndex);
      queryClient.setQueryData(["form.getPagesByForm", { formId }], newPages);

      reorderPagesMutation.mutate({
        ids: newPages.map((p) => p.id)
      });
    } else if (activeIdStr.startsWith("field-")) {
      const activeFieldId = activeIdStr.replace("field-", "");
      const activeField = fields.find((f) => f.id === activeFieldId);
      if (!activeField) return;

      if (overIdStr.startsWith("field-")) {
        const overFieldId = overIdStr.replace("field-", "");
        const overField = fields.find((f) => f.id === overFieldId);
        if (!overField) return;

        if (activeField.pageId === overField.pageId) {
          const pageFields = fields.filter((f) => f.pageId === activeField.pageId);
          const oldIndex = pageFields.findIndex((f) => f.id === activeFieldId);
          const newIndex = pageFields.findIndex((f) => f.id === overFieldId);

          const reorderedPageFields = arrayMove([...pageFields], oldIndex, newIndex);

          const otherFields = fields.filter((f) => f.pageId !== activeField.pageId);
          const finalFields = [...otherFields, ...reorderedPageFields].sort((a, b) => {
            if (a.pageId === b.pageId) return a.order - b.order;
            return 0;
          });

          queryClient.setQueryData(["form.getFieldsByForm", { formId }], finalFields);
          reorderFieldsMutation.mutate({
            ids: reorderedPageFields.map((f) => f.id)
          });
        } else {
          const targetPageId = overField.pageId;
          const updatedFields = fields.map((f) => {
            if (f.id === activeFieldId) {
              return { ...f, pageId: targetPageId };
            }
            return f;
          });
          queryClient.setQueryData(["form.getFieldsByForm", { formId }], updatedFields);
          updateField.mutate({
            fieldId: activeFieldId,
            data: { pageId: targetPageId || undefined }
          });
        }
      } else if (overIdStr.startsWith("page-")) {
        const targetPageId = overIdStr.replace("page-", "");
        if (activeField.pageId !== targetPageId) {
          const updatedFields = fields.map((f) => {
            if (f.id === activeFieldId) {
              return { ...f, pageId: targetPageId };
            }
            return f;
          });
          queryClient.setQueryData(["form.getFieldsByForm", { formId }], updatedFields);
          updateField.mutate({
            fieldId: activeFieldId,
            data: { pageId: targetPageId }
          });
        }
      }
    }
  };

  const handleAddPage = () => {
    createPage.mutate({
      formId,
      title: `Page ${(pages?.length || 0) + 1}`,
      order: (pages?.length || 0) + 1
    });
  };

  const handleDeletePage = (pageId: string) => {
    if (confirm("Are you sure you want to delete this page? All fields on this page will lose their page grouping.")) {
      deletePage.mutate({ pageId });
    }
  };

  const handleCreateField = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const label = formData.get("label") as string;
    const type = formData.get("type") as any;
    const placeholder = formData.get("placeholder") as string;
    const isRequired = formData.get("isRequired") === "true";
    const pageId = formData.get("pageId") as string;

    const fieldKey = label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    const rawOptions = formData.get("options") as string;
    const options = rawOptions ? rawOptions.split(",").map(o => o.trim()).filter(Boolean) : undefined;

    const rawRows = formData.get("matrixRows") as string;
    const rawCols = formData.get("matrixCols") as string;
    const matrixRows = rawRows ? rawRows.split(",").map(o => o.trim()).filter(Boolean) : undefined;
    const matrixCols = rawCols ? rawCols.split(",").map(o => o.trim()).filter(Boolean) : undefined;

    const enableLogic = formData.get("enableLogic") === "true";
    const showIfFieldKey = formData.get("showIfFieldKey") as string;
    const showIfOperator = formData.get("showIfOperator") as string;
    const showIfValue = formData.get("showIfValue") as string;

    const config: Record<string, any> = {};
    if (options) config.options = options;
    if (matrixRows) config.matrixRows = matrixRows;
    if (matrixCols) config.matrixCols = matrixCols;
    if (enableLogic && showIfFieldKey && showIfValue) {
      config.logic = {
        showIf: {
          fieldKey: showIfFieldKey,
          operator: showIfOperator || "equals",
          value: showIfValue
        }
      };
    }

    createField.mutate({
      formId,
      pageId: pageId || undefined,
      label,
      type,
      placeholder: placeholder || undefined,
      isRequired,
      fieldKey: fieldKey || `field_${Date.now()}`,
      order: (fields?.length || 0) + 1,
      config: Object.keys(config).length > 0 ? config : undefined
    });
  };

  const handleUpdateField = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fieldId = searchParams.get("edit-field")!;
    const label = formData.get("label") as string;
    const placeholder = formData.get("placeholder") as string;
    const helperText = formData.get("helperText") as string;
    const isRequired = formData.get("isRequired") === "true";

    const rawOptions = formData.get("options") as string;
    const options = rawOptions ? rawOptions.split(",").map(o => o.trim()).filter(Boolean) : undefined;

    const rawRows = formData.get("matrixRows") as string;
    const rawCols = formData.get("matrixCols") as string;
    const matrixRows = rawRows ? rawRows.split(",").map(o => o.trim()).filter(Boolean) : undefined;
    const matrixCols = rawCols ? rawCols.split(",").map(o => o.trim()).filter(Boolean) : undefined;

    const enableLogic = formData.get("enableLogic") === "true";
    const showIfFieldKey = formData.get("showIfFieldKey") as string;
    const showIfOperator = formData.get("showIfOperator") as string;
    const showIfValue = formData.get("showIfValue") as string;

    const config: Record<string, any> = {};
    if (options) config.options = options;
    if (matrixRows) config.matrixRows = matrixRows;
    if (matrixCols) config.matrixCols = matrixCols;
    if (enableLogic && showIfFieldKey && showIfValue) {
      config.logic = {
        showIf: {
          fieldKey: showIfFieldKey,
          operator: showIfOperator || "equals",
          value: showIfValue
        }
      };
    }

    updateField.mutate({
      fieldId,
      data: {
        label,
        placeholder: placeholder || undefined,
        helperText: helperText || undefined,
        isRequired,
        config: Object.keys(config).length > 0 ? config : undefined
      }
    });
  };

  const handleUpdatePageDetails = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const pageId = searchParams.get("edit-page")!;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    updatePage.mutate({
      pageId,
      data: {
        formId,
        title,
        description: description || undefined
      }
    });
  };

  if (pagesLoading || fieldsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const activeEditFieldId = searchParams.get("edit-field");
  const editingField = fields?.find((f) => f.id === activeEditFieldId);

  const activeEditPageId = searchParams.get("edit-page");
  const editingPage = pages?.find((p) => p.id === activeEditPageId);

  const pageMap: Record<string, any[]> = {};
  if (pages) {
    pages.forEach((p) => {
      pageMap[p.id] = [];
    });
  }
  if (fields) {
    fields.forEach((f) => {
      const pageId = f.pageId;
      if (pageId && pageMap[pageId]) {
        pageMap[pageId].push(f);
      } else if (pages && pages.length > 0) {
        const firstPage = pages[0];
        if (firstPage) {
          const firstPageId = firstPage.id;
          if (!pageMap[firstPageId]) {
            pageMap[firstPageId] = [];
          }
          pageMap[firstPageId].push(f);
        }
      }
    });
  }

  const resetPreview = () => {
    queryClient.setQueryData(["previewPage"], 0);
    queryClient.setQueryData(["previewAnswers"], {});
    queryClient.setQueryData(["previewSuccess"], false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <h2 className="text-lg font-bold">Form Fields & Pages Builder</h2>
          <p className="text-xs text-muted-foreground">Reorder pages and drag fields between pages smoothly</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetPreview} asChild>
            <Link href="?tab=fields&preview=true" className="gap-1.5 text-xs">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </Link>
          </Button>
          {isAdminOrOwner && (
            <Button size="sm" onClick={handleAddPage} className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              <span>Add Page</span>
            </Button>
          )}
        </div>
      </div>

      {!pages || pages.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl border-border/80 flex flex-col items-center justify-center gap-3">
          <p className="text-xs text-muted-foreground">Add at least one page to begin placing form fields.</p>
          <Button size="sm" onClick={handleAddPage} className="text-xs">
            <Plus className="h-4 w-4 mr-2" /> Add Your First Page
          </Button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={pages.map(p => `page-${p.id}`)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-6">
              {pages.map((page) => (
                <SortablePagePanel
                  key={page.id}
                  page={page}
                  fields={pageMap[page.id] || []}
                  isAdminOrOwner={isAdminOrOwner}
                  onEditPage={(p) => router.replace(`?tab=fields&edit-page=${p.id}`)}
                  onDeletePage={handleDeletePage}
                  onEditField={(f) => router.replace(`?tab=fields&edit-field=${f.id}`)}
                  onDeleteField={(fid) => deleteField.mutate({ fieldId: fid })}
                  onAddFieldToPage={(pid) => router.replace(`?tab=fields&new-field=true&targetPageId=${pid}`)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <FormFieldDialogs
        router={router}
        searchParams={searchParams}
        fields={fields}
        pages={pages}
        createField={createField}
        updateField={updateField}
        editingField={editingField}
        handleCreateField={handleCreateField}
        handleUpdateField={handleUpdateField}
      />

      <Dialog open={!!activeEditPageId} onOpenChange={(open) => { if (!open) router.replace(`?tab=fields`); }}>
        <DialogContent className="border-border bg-card/95 backdrop-blur-md">
          {editingPage && (
            <form key={editingPage?.id} onSubmit={handleUpdatePageDetails} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Edit Page Properties</DialogTitle>
                <DialogDescription>Update page titles and layout helper text.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="page-title" className="text-xs">Page Title</Label>
                  <Input id="page-title" name="title" defaultValue={editingPage.title || ""} required className="rounded-xl border-border/80" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="page-desc" className="text-xs">Description / Helper Text</Label>
                  <Input id="page-desc" name="description" defaultValue={editingPage.description || ""} placeholder="Helper text for users on this page" className="rounded-xl border-border/80" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => router.replace(`?tab=fields`)} className="rounded-xl">Cancel</Button>
                <Button type="submit" disabled={updatePage.isPending} className="rounded-xl">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Sheet open={searchParams.get("preview") === "true"} onOpenChange={(open) => { if (!open) router.replace(`?tab=fields`); }}>
        <SheetContent
          side="right"
          className="w-[95%] sm:max-w-[500px] overflow-y-auto border-l p-6 flex flex-col gap-5"
          style={{
            backgroundColor: (form?.themeConfig as any)?.backgroundColor || "#09090b",
            color: (form?.themeConfig as any)?.textColor || "#ffffff",
            borderColor: (form?.themeConfig as any)?.borderColor || "#27272a"
          }}
        >
          <SheetHeader className="pb-3 border-b" style={{ borderColor: (form?.themeConfig as any)?.borderColor || "#27272a" }}>
            <SheetTitle className="text-lg font-bold" style={{ color: (form?.themeConfig as any)?.textColor || "#ffffff" }}>Live Form Preview</SheetTitle>
            <SheetDescription className="text-xs" style={{ color: (form?.themeConfig as any)?.mutedTextColor || "#a1a1aa" }}>Test the layout, multiple pages, conditional questions, and validation inputs.</SheetDescription>
          </SheetHeader>

          {previewSuccess ? (
            <div className="flex flex-col items-center justify-center text-center gap-4 py-16 flex-1">
              <CheckCircle className="h-14 w-14 text-emerald-500 animate-bounce" />
              <h3 className="text-xl font-bold">Response Recorded!</h3>
              <p className="text-xs max-w-xs leading-relaxed" style={{ color: (form?.themeConfig as any)?.mutedTextColor || "#a1a1aa" }}>
                This preview response was validated successfully. Your conditional flows and multi-page configurations work perfectly.
              </p>
              <Button onClick={resetPreview} className="mt-4 rounded-xl" style={{ backgroundColor: (form?.themeConfig as any)?.primaryColor, color: (form?.themeConfig as any)?.buttonTextColor }}>Test Again</Button>
            </div>
          ) : pages && pages.length > 0 ? (
            <FormRenderer
              form={form}
              pages={pages || []}
              fields={fields || []}
              currentPageIndex={previewPage}
              onPageChange={(index) => queryClient.setQueryData(["previewPage"], index)}
              formAnswers={previewAnswers}
              onAnswerChange={(key, val) => {
                queryClient.setQueryData(["previewAnswers"], (prev: any) => ({
                  ...prev,
                  [key]: val
                }));
              }}
              onSubmit={(e) => {
                e.preventDefault();
                queryClient.setQueryData(["previewSuccess"], true);
              }}
              isPreview={true}
            />
          ) : (
            <p className="text-xs text-zinc-400 text-center py-10">No pages found in this form.</p>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
