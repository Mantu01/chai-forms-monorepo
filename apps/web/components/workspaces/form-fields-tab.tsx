"use client";

import React, { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
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
  ChevronLeft,
  ChevronRight,
  GripVertical,
  CheckCircle,
  Star
} from "lucide-react";

interface FormFieldsTabProps {
  formId: string;
  isAdminOrOwner: boolean;
}

// Draggable Page Panel
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
            {page.description && <p className="text-2xs text-muted-foreground">{page.description}</p>}
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
            <p className="text-3xs text-muted-foreground text-center py-4">Drag fields here or click Add Field</p>
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
        <Button variant="outline" size="sm" onClick={() => onAddFieldToPage(page.id)} className="h-8 text-2xs rounded-lg">
          <Plus className="h-3 w-3 mr-1" /> Add Field
        </Button>
      </div>
    </div>
  );
}

// Draggable Field Row
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
            <span className="font-mono text-4xs text-muted-foreground">{field.fieldKey}</span>
            <Badge variant="outline" className="text-4xs px-1 py-0 capitalize scale-90 origin-left">
              {field.type}
            </Badge>
            {field.isRequired && (
              <span className="text-4xs text-red-500 font-bold">* Required</span>
            )}
            {field.config?.logic?.showIf && (
              <span className="text-4xs text-amber-500 font-bold">Conditional</span>
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

  // local preview active page
  const { data: previewPage } = useQuery({
    queryKey: ["previewPage"],
    queryFn: () => 0,
    initialData: 0,
  });

  // local preview answers for conditional visibility testing
  const { data: previewAnswers } = useQuery({
    queryKey: ["previewAnswers"],
    queryFn: () => ({} as Record<string, any>),
    initialData: {},
  });

  // local preview success state
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
      router.push(`?tab=fields`);
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
      router.push(`?tab=fields`);
      utils.form.getFieldsByForm.invalidate({ formId });
    }
  });

  const updateField = trpc.form.updateField.useMutation({
    onSuccess: () => {
      toast.success("Field properties updated successfully!");
      router.push(`?tab=fields`);
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

  const FIELD_TYPE_OPTIONS = [
    { value: "text", label: "Short Text" },
    { value: "textarea", label: "Long Text (Paragraph)" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone Number" },
    { value: "number", label: "Number" },
    { value: "select", label: "Dropdown Options" },
    { value: "radio", label: "Radio Options" },
    { value: "checkbox", label: "Yes/No Checkbox" },
    { value: "multi_select", label: "Multiple Select" },
    { value: "rating", label: "Rating Stars" },
    { value: "date", label: "Date" },
    { value: "time", label: "Time" },
    { value: "file", label: "File Upload" },
    { value: "matrix", label: "Matrix Grid" },
    { value: "url", label: "URL Link" },
    { value: "signature", label: "Signature" }
  ];

  const [newFieldType, setNewFieldType] = useState<string>("text");

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
          // Reorder in same page
          const pageFields = fields.filter((f) => f.pageId === activeField.pageId);
          const oldIndex = pageFields.findIndex((f) => f.id === activeFieldId);
          const newIndex = pageFields.findIndex((f) => f.id === overFieldId);

          const reorderedPageFields = arrayMove([...pageFields], oldIndex, newIndex);

          // Update cache for all fields
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
          // Move field to another page
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
        // Drop on page container
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

    // options parsing
    const rawOptions = formData.get("options") as string;
    const options = rawOptions ? rawOptions.split(",").map(o => o.trim()).filter(Boolean) : undefined;

    // matrix parsing
    const rawRows = formData.get("matrixRows") as string;
    const rawCols = formData.get("matrixCols") as string;
    const matrixRows = rawRows ? rawRows.split(",").map(o => o.trim()).filter(Boolean) : undefined;
    const matrixCols = rawCols ? rawCols.split(",").map(o => o.trim()).filter(Boolean) : undefined;

    // conditional visibility logic parsing
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
  const activePreviewPage = pages?.[previewPage];

  // Group fields by page
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

  // evaluate conditional logic
  const isFieldVisible = (field: any, answers: Record<string, any>) => {
    const logic = field.config?.logic?.showIf;
    if (!logic) return true;

    const targetVal = answers[logic.fieldKey];
    if (targetVal === undefined || targetVal === null) return false;

    if (logic.operator === "equals") {
      return String(targetVal) === String(logic.value);
    }
    if (logic.operator === "not_equals") {
      return String(targetVal) !== String(logic.value);
    }
    if (logic.operator === "contains") {
      return String(targetVal).toLowerCase().includes(String(logic.value).toLowerCase());
    }
    return true;
  };

  const handleNextPage = () => {
    if (!pages || !fields) return;
    const activePage = pages[previewPage];
    if (!activePage) return;
    const pageFields = pageMap[activePage.id] || [];

    const missing = pageFields.filter((f) => {
      if (!f.isRequired) return false;
      if (!isFieldVisible(f, previewAnswers)) return false;
      const val = previewAnswers[f.fieldKey];
      return val === undefined || val === null || String(val).trim() === "";
    });

    if (missing.length > 0) {
      toast.error(`Please fill in required fields: ${missing.map(f => f.label).join(", ")}`);
      return;
    }

    queryClient.setQueryData(["previewPage"], previewPage + 1);
  };

  const handlePrevPage = () => {
    if (previewPage > 0) {
      queryClient.setQueryData(["previewPage"], previewPage - 1);
    }
  };

  const handlePreviewSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pages || !fields) return;

    const activePage = pages[previewPage];
    if (!activePage) return;
    const pageFields = pageMap[activePage.id] || [];
    const missing = pageFields.filter((f) => {
      if (!f.isRequired) return false;
      if (!isFieldVisible(f, previewAnswers)) return false;
      const val = previewAnswers[f.fieldKey];
      return val === undefined || val === null || String(val).trim() === "";
    });

    if (missing.length > 0) {
      toast.error(`Please fill in required fields: ${missing.map(f => f.label).join(", ")}`);
      return;
    }

    queryClient.setQueryData(["previewSuccess"], true);
  };

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
            <Link href="?tab=fields&preview=true" className="gap-1.5">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </Link>
          </Button>
          {isAdminOrOwner && (
            <Button size="sm" onClick={handleAddPage} className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Add Page</span>
            </Button>
          )}
        </div>
      </div>

      {!pages || pages.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl border-border/80 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-muted-foreground">Add at least one page to begin placing form fields.</p>
          <Button size="sm" onClick={handleAddPage}>
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
                  onEditPage={(p) => router.push(`?tab=fields&edit-page=${p.id}`)}
                  onDeletePage={handleDeletePage}
                  onEditField={(f) => router.push(`?tab=fields&edit-field=${f.id}`)}
                  onDeleteField={(fid) => {
                    if (confirm("Delete this field?")) {
                      deleteField.mutate({ fieldId: fid });
                    }
                  }}
                  onAddFieldToPage={(pid) => router.push(`?tab=fields&new-field=true&targetPageId=${pid}`)}
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
        newFieldType={newFieldType}
        setNewFieldType={setNewFieldType}
        createField={createField}
        updateField={updateField}
        editingField={editingField}
        handleCreateField={handleCreateField}
        handleUpdateField={handleUpdateField}
      />

      <Dialog open={!!activeEditPageId} onOpenChange={(open) => { if (!open) router.push(`?tab=fields`); }}>
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
                <Button type="button" variant="outline" onClick={() => router.push(`?tab=fields`)} className="rounded-xl">Cancel</Button>
                <Button type="submit" disabled={updatePage.isPending} className="rounded-xl">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Sheet open={searchParams.get("preview") === "true"} onOpenChange={(open) => { if (!open) router.push(`?tab=fields`); }}>
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
            <form onSubmit={handlePreviewSubmit} className="flex-1 flex flex-col justify-between p-4 rounded-2xl border" style={{ backgroundColor: (form?.themeConfig as any)?.formBackgroundColor || "#18181b", borderColor: (form?.themeConfig as any)?.borderColor || "#27272a" }}>
              <div className="space-y-5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium font-mono" style={{ color: (form?.themeConfig as any)?.mutedTextColor || "#a1a1aa" }}>
                    Page {previewPage + 1} of {pages.length}
                  </span>
                  <div className="flex gap-1">
                    {pages.map((_, i) => (
                      <div key={i} className="h-1.5 w-6 rounded-full transition-all" style={{ backgroundColor: i === previewPage ? ((form?.themeConfig as any)?.primaryColor || "#ffffff") : ((form?.themeConfig as any)?.borderColor || "#27272a") }} />
                    ))}
                  </div>
                </div>

                {activePreviewPage && (
                  <div className="space-y-0.5 border-b pb-3" style={{ borderColor: (form?.themeConfig as any)?.borderColor || "#27272a" }}>
                    <h4 className="text-sm font-semibold" style={{ color: (form?.themeConfig as any)?.textColor || "#ffffff" }}>{activePreviewPage.title || "Untitled Page"}</h4>
                    {activePreviewPage.description && (
                      <p className="text-3xs" style={{ color: (form?.themeConfig as any)?.mutedTextColor || "#a1a1aa" }}>{activePreviewPage.description}</p>
                    )}
                  </div>
                )}

                <div className="space-y-4 py-2">
                  {((activePreviewPage && pageMap[activePreviewPage.id]) || []).map((field) => {
                    const visible = isFieldVisible(field, previewAnswers);
                    if (!visible) return null;

                    const handleFieldChange = (val: any) => {
                      queryClient.setQueryData(["previewAnswers"], (prev: any) => ({
                        ...prev,
                        [field.fieldKey]: val
                      }));
                    };

                    const options = field.config?.options || [];
                    const currentValue = previewAnswers[field.fieldKey] ?? "";

                    const inputBg = (form?.themeConfig as any)?.inputBackgroundColor || "#27272a";
                    const inputTxt = (form?.themeConfig as any)?.inputTextColor || "#ffffff";
                    const borderCol = (form?.themeConfig as any)?.borderColor || "#27272a";
                    const textCol = (form?.themeConfig as any)?.textColor || "#ffffff";
                    const mutedCol = (form?.themeConfig as any)?.mutedTextColor || "#a1a1aa";

                    return (
                      <div key={field.id} className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1" style={{ color: textCol }}>
                          <span>{field.label}</span>
                          {field.isRequired && <span className="text-red-500">*</span>}
                        </Label>
                        {field.helperText && <p className="text-4xs" style={{ color: mutedCol }}>{field.helperText}</p>}

                        {field.type === "textarea" && (
                          <Textarea
                            placeholder={field.placeholder || ""}
                            value={currentValue}
                            onChange={(e) => handleFieldChange(e.target.value)}
                            required={field.isRequired}
                            style={{ backgroundColor: inputBg, color: inputTxt, borderColor: borderCol }}
                            className="text-xs rounded-lg placeholder-zinc-500"
                          />
                        )}

                        {["text", "email", "phone", "number", "url", "date", "time"].includes(field.type) && (
                          <Input
                            type={field.type === "phone" ? "tel" : field.type}
                            placeholder={field.placeholder || ""}
                            value={currentValue}
                            onChange={(e) => handleFieldChange(e.target.value)}
                            required={field.isRequired}
                            style={{ backgroundColor: inputBg, color: inputTxt, borderColor: borderCol }}
                            className="text-xs rounded-lg h-9 placeholder-zinc-550"
                          />
                        )}

                        {field.type === "checkbox" && (
                          <div className="flex items-center gap-2 pt-1">
                            <Checkbox
                              id={`preview-${field.id}`}
                              checked={!!currentValue}
                              onCheckedChange={(checked) => handleFieldChange(!!checked)}
                            />
                            <Label htmlFor={`preview-${field.id}`} className="text-2xs" style={{ color: mutedCol }}>{field.placeholder || "Yes"}</Label>
                          </div>
                        )}

                        {field.type === "select" && (
                          <Select value={currentValue} onValueChange={handleFieldChange}>
                            <SelectTrigger className="text-xs rounded-lg h-9" style={{ backgroundColor: inputBg, color: inputTxt, borderColor: borderCol }}>
                              <SelectValue placeholder={field.placeholder || "Select option"} />
                            </SelectTrigger>
                            <SelectContent style={{ backgroundColor: inputBg, color: inputTxt, borderColor: borderCol }}>
                              {options.map((opt: string) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {field.type === "radio" && (
                          <RadioGroup value={currentValue} onValueChange={handleFieldChange} className="flex flex-col gap-2 pt-1">
                            {options.map((opt: string) => (
                              <div key={opt} className="flex items-center gap-2">
                                <RadioGroupItem value={opt} id={`preview-opt-${opt}-${field.id}`} />
                                <Label htmlFor={`preview-opt-${opt}-${field.id}`} className="text-2xs" style={{ color: mutedCol }}>{opt}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}

                        {field.type === "multi_select" && (
                          <div className="flex flex-col gap-2 pt-1">
                            {options.map((opt: string) => {
                              const list = Array.isArray(currentValue) ? currentValue : [];
                              const isChecked = list.includes(opt);
                              const toggleOpt = (checked: boolean) => {
                                const newList = checked ? [...list, opt] : list.filter((item: string) => item !== opt);
                                handleFieldChange(newList);
                              };
                              return (
                                <div key={opt} className="flex items-center gap-2">
                                  <Checkbox
                                    id={`preview-check-${opt}-${field.id}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => toggleOpt(!!checked)}
                                  />
                                  <Label htmlFor={`preview-check-${opt}-${field.id}`} className="text-2xs" style={{ color: mutedCol }}>{opt}</Label>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {field.type === "rating" && (
                          <div className="flex gap-1.5 pt-1">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const active = Number(currentValue) >= star;
                              return (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => handleFieldChange(star)}
                                  className="focus:outline-hidden"
                                >
                                  <Star className="h-5 w-5" style={{ color: active ? ((form?.themeConfig as any)?.primaryColor || "#f59e0b") : borderCol, fill: active ? ((form?.themeConfig as any)?.primaryColor || "#f59e0b") : "none" }} />
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {field.type === "file" && (
                          <Input
                            type="file"
                            onChange={(e) => handleFieldChange(e.target.files?.[0]?.name || "")}
                            required={field.isRequired}
                            style={{ backgroundColor: inputBg, color: inputTxt, borderColor: borderCol }}
                            className="text-xs rounded-lg h-9 file:text-white file:text-2xs file:bg-zinc-800 file:border-0"
                          />
                        )}

                        {field.type === "matrix" && (
                          <div className="border rounded-lg overflow-x-auto bg-zinc-900/50 mt-1" style={{ borderColor: borderCol }}>
                            <table className="w-full text-[10px]" style={{ color: textCol }}>
                              <thead>
                                <tr className="border-b" style={{ borderColor: borderCol, backgroundColor: inputBg }}>
                                  <th className="p-2 text-left">Questions</th>
                                  {(field.config?.matrixCols || ["Poor", "Fair", "Good"]).map((col: string) => (
                                    <th key={col} className="p-2 text-center">{col}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {(field.config?.matrixRows || ["Speed", "Quality"]).map((row: string) => {
                                  const rowVal = currentValue[row] || "";
                                  const handleRowChange = (col: string) => {
                                    handleFieldChange({
                                      ...currentValue,
                                      [row]: col
                                    });
                                  };
                                  return (
                                    <tr key={row} className="border-b last:border-0" style={{ borderColor: borderCol }}>
                                      <td className="p-2 font-medium">{row}</td>
                                      {(field.config?.matrixCols || ["Poor", "Fair", "Good"]).map((col: string) => (
                                        <td key={col} className="p-2 text-center">
                                          <input
                                            type="radio"
                                            name={`matrix-${field.id}-${row}`}
                                            checked={rowVal === col}
                                            onChange={() => handleRowChange(col)}
                                            className="accent-primary"
                                          />
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flex justify-between items-center border-t pt-4 mt-6" style={{ borderColor: (form?.themeConfig as any)?.borderColor || "#27272a" }}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={previewPage === 0}
                  style={{ borderColor: (form?.themeConfig as any)?.borderColor || "#27272a", color: (form?.themeConfig as any)?.textColor || "#ffffff" }}
                  className="rounded-lg h-8 text-2xs"
                >
                  <ChevronLeft className="h-3 w-3 mr-1" /> Back
                </Button>
                {previewPage < pages.length - 1 ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleNextPage}
                    style={{ backgroundColor: (form?.themeConfig as any)?.primaryColor || "#3f3f46", color: (form?.themeConfig as any)?.buttonTextColor || "#ffffff" }}
                    className="rounded-lg h-8 text-2xs"
                  >
                    Next <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="sm"
                    style={{ backgroundColor: (form?.themeConfig as any)?.primaryColor || "#10b981", color: (form?.themeConfig as any)?.buttonTextColor || "#ffffff" }}
                    className="rounded-lg h-8 text-2xs"
                  >
                    Submit Response
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <p className="text-xs text-zinc-400 text-center py-10">No pages found in this form.</p>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
