"use client";

import React, { FormEvent } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";

interface FieldDialogsProps {
  router: any;
  searchParams: any;
  fields?: readonly any[];
  pages?: readonly any[];
  createField: any;
  updateField: any;
  editingField?: any;
  handleCreateField: (e: FormEvent<HTMLFormElement>) => void;
  handleUpdateField: (e: FormEvent<HTMLFormElement>) => void;
}

export function FormFieldDialogs({
  router,
  searchParams,
  fields,
  pages,
  createField,
  updateField,
  editingField,
  handleCreateField,
  handleUpdateField
}: FieldDialogsProps) {
  const newFieldType = searchParams.get("newFieldType") || "text";

  const handleTypeChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("newFieldType", val);
    router.replace(`?${params.toString()}`);
  };

  return (
    <>
      <Dialog open={searchParams.get("new-field") === "true"} onOpenChange={(open) => { if (!open) router.push(`?tab=fields`); }}>
        <DialogContent className="border-border bg-card/95 backdrop-blur-md max-h-[85vh] overflow-y-auto scroll-smooth">
          <form onSubmit={handleCreateField} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add Form Field</DialogTitle>
              <DialogDescription>Create a new input field for submitters to respond to.</DialogDescription>
            </DialogHeader>
            <input type="hidden" name="pageId" key={searchParams.get("targetPageId") || "target"} value={searchParams.get("targetPageId") || ""} readOnly />
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="field-label" className="text-xs">Field Label</Label>
                <Input id="field-label" name="label" required placeholder="e.g. Email Address" className="rounded-xl border-border/80" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="field-type" className="text-xs">Field Type</Label>
                <Select name="type" defaultValue="text" onValueChange={handleTypeChange}>
                  <SelectTrigger className="rounded-xl border-border/80">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 overflow-y-auto border-border/80">
                    <SelectItem value="text">Short Text</SelectItem>
                    <SelectItem value="textarea">Long Text (Paragraph)</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Number</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="select">Dropdown Options</SelectItem>
                    <SelectItem value="radio">Radio Options</SelectItem>
                    <SelectItem value="checkbox">Yes/No Checkbox</SelectItem>
                    <SelectItem value="multi_select">Multiple Select</SelectItem>
                    <SelectItem value="rating">Rating Stars</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="time">Time</SelectItem>
                    <SelectItem value="file">File Upload</SelectItem>
                    <SelectItem value="matrix">Matrix Grid</SelectItem>
                    <SelectItem value="url">URL Link</SelectItem>
                    <SelectItem value="signature">Signature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="field-placeholder" className="text-xs">Placeholder</Label>
                <Input id="field-placeholder" name="placeholder" placeholder="e.g. enter your email" className="rounded-xl border-border/80" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="field-req" className="text-xs">Required Field</Label>
                <Select name="isRequired" defaultValue="false">
                  <SelectTrigger className="rounded-xl border-border/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border/80">
                    <SelectItem value="false">Optional</SelectItem>
                    <SelectItem value="true">Required (*)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {['select', 'radio', 'multi_select'].includes(newFieldType) && (
                <div className="space-y-1 border border-border/50 p-3.5 rounded-xl bg-muted/20">
                  <Label htmlFor="add-options" className="text-xs font-semibold">Options</Label>
                  <Input id="add-options" name="options" placeholder="Option 1, Option 2, Option 3" className="rounded-xl border-border/80" />
                  <p className="text-[10px] text-muted-foreground">Separate options with commas.</p>
                </div>
              )}
              {newFieldType === 'matrix' && (
                <div className="space-y-2 border border-border/50 p-3.5 rounded-xl bg-muted/20">
                  <div className="space-y-1">
                    <Label htmlFor="add-matrix-rows" className="text-xs font-semibold">Rows (Questions)</Label>
                    <Input id="add-matrix-rows" name="matrixRows" placeholder="Speed, Quality" className="rounded-xl border-border/80" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="add-matrix-cols" className="text-xs font-semibold">Columns (Ratings)</Label>
                    <Input id="add-matrix-cols" name="matrixCols" placeholder="Poor, Fair, Good" className="rounded-xl border-border/80" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Separate items with commas.</p>
                </div>
              )}
              <div className="space-y-2 border border-border/60 p-4 rounded-xl bg-amber-500/5 border-amber-500/20">
                <div className="flex items-center gap-2">
                  <Checkbox id="add-enableLogic" name="enableLogic" value="true" />
                  <Label htmlFor="add-enableLogic" className="text-xs font-semibold text-amber-600 dark:text-amber-500">Enable Conditional Logic</Label>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Show this field if:</Label>
                    <Select name="showIfFieldKey" defaultValue="">
                      <SelectTrigger className="rounded-xl border-border/80">
                        <SelectValue placeholder="Choose target field" />
                      </SelectTrigger>
                      <SelectContent className="border-border/80">
                        {(fields ?? []).filter(f => ["select", "radio", "checkbox", "multi_select", "rating"].includes(f.type)).map(f => (
                          <SelectItem key={f.id} value={f.fieldKey}>{f.label} ({f.fieldKey})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Operator</Label>
                    <Select name="showIfOperator" defaultValue="equals">
                      <SelectTrigger className="rounded-xl border-border/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border/80">
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="not_equals">Does Not Equal</SelectItem>
                        <SelectItem value="contains">Contains Substring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="add-logic-val" className="text-[11px] text-muted-foreground">Value</Label>
                    <Input id="add-logic-val" name="showIfValue" placeholder="e.g. Yes" className="rounded-xl border-border/80" />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => router.push(`?tab=fields`)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={createField.isPending} className="rounded-xl">Add Field</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!searchParams.get("edit-field")} onOpenChange={(open) => { if (!open) router.push(`?tab=fields`); }}>
        <DialogContent className="border-border bg-card/95 backdrop-blur-md max-h-[85vh] overflow-y-auto scroll-smooth">
          {editingField && (
            <form key={editingField.id} onSubmit={handleUpdateField} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Edit Field Properties</DialogTitle>
                <DialogDescription>Configure validation, options, grid rows/cols, and conditional rules.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <Label htmlFor="edit-label" className="text-xs">Field Label</Label>
                  <Input id="edit-label" name="label" defaultValue={editingField.label} required className="rounded-xl border-border/80" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-placeholder" className="text-xs">Placeholder Text</Label>
                  <Input id="edit-placeholder" name="placeholder" defaultValue={editingField.placeholder || ""} className="rounded-xl border-border/80" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-helper" className="text-xs">Helper Text</Label>
                  <Input id="edit-helper" name="helperText" defaultValue={editingField.helperText || ""} className="rounded-xl border-border/80" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-default" className="text-xs">Default Value</Label>
                  <Input id="edit-default" name="defaultValue" defaultValue={editingField.defaultValue || ""} className="rounded-xl border-border/80" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Required</Label>
                  <Select name="isRequired" defaultValue={editingField.isRequired ? "true" : "false"}>
                    <SelectTrigger className="rounded-xl border-border/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border/80">
                      <SelectItem value="false">Optional</SelectItem>
                      <SelectItem value="true">Required (*)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Belongs to Page</Label>
                  <Select name="pageId" defaultValue={editingField.pageId || ""}>
                    <SelectTrigger className="rounded-xl border-border/80">
                      <SelectValue placeholder="Select Page" />
                    </SelectTrigger>
                    <SelectContent className="border-border/80">
                      {(pages ?? []).map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.title || "Untitled Page"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                { ["select", "radio", "multi_select"].includes(editingField.type) && (
                  <div className="space-y-1 border border-border/50 p-3.5 rounded-xl bg-muted/20">
                    <Label htmlFor="edit-options" className="text-xs font-semibold text-foreground">Options</Label>
                    <Input id="edit-options" name="options" defaultValue={(editingField.config?.options || []).join(", ")} placeholder="Option 1, Option 2, Option 3" className="rounded-xl border-border/80" />
                    <p className="text-[10px] text-muted-foreground">Separate options with commas.</p>
                  </div>
                )}
                { editingField.type === "matrix" && (
                  <div className="space-y-2 border border-border/50 p-3.5 rounded-xl bg-muted/20">
                    <div className="space-y-1">
                      <Label htmlFor="edit-matrix-rows" className="text-xs font-semibold">Rows (Questions)</Label>
                      <Input id="edit-matrix-rows" name="matrixRows" defaultValue={(editingField.config?.matrixRows || ["Speed", "Quality"]).join(", ")} placeholder="Speed, Quality" className="rounded-xl border-border/80" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edit-matrix-cols" className="text-xs font-semibold">Columns (Ratings)</Label>
                      <Input id="edit-matrix-cols" name="matrixCols" defaultValue={(editingField.config?.matrixCols || ["Poor", "Fair", "Good", "Excellent"]).join(", ")} placeholder="Poor, Fair, Good" className="rounded-xl border-border/80" />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Separate items with commas.</p>
                  </div>
                )}
                <div className="space-y-2 border border-border/60 p-4 rounded-xl bg-amber-500/5 border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <Checkbox id="enableLogic" name="enableLogic" value="true" defaultChecked={!!editingField.config?.logic?.showIf} />
                    <Label htmlFor="enableLogic" className="text-xs font-semibold text-amber-600 dark:text-amber-500">Enable Conditional Logic</Label>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Show this field if:</Label>
                      <Select name="showIfFieldKey" defaultValue={editingField.config?.logic?.showIf?.fieldKey || ""}>
                        <SelectTrigger className="rounded-xl border-border/80">
                          <SelectValue placeholder="Choose target field" />
                        </SelectTrigger>
                        <SelectContent className="border-border/80">
                          {(fields ?? []).filter(f => ["select", "radio", "checkbox", "multi_select", "rating"].includes(f.type)).map(f => (
                            <SelectItem key={f.id} value={f.fieldKey}>{f.label} ({f.fieldKey})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Operator</Label>
                      <Select name="showIfOperator" defaultValue={editingField.config?.logic?.showIf?.operator || "equals"}>
                        <SelectTrigger className="rounded-xl border-border/80">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-border/80">
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_equals">Does Not Equal</SelectItem>
                          <SelectItem value="contains">Contains Substring</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="logic-val" className="text-[11px] text-muted-foreground">Value</Label>
                      <Input id="logic-val" name="showIfValue" defaultValue={editingField.config?.logic?.showIf?.value || ""} placeholder="e.g. Yes" className="rounded-xl border-border/80" />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => router.push(`?tab=fields`)} className="rounded-xl">Cancel</Button>
                <Button type="submit" disabled={updateField.isPending} className="rounded-xl">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
