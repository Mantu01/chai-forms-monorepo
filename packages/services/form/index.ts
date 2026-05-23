import { z } from "zod";
import {
  CreateFieldInputSchema,
  CreateFormInputSchema,
  CreatePageInputSchema,
  FieldResponseSchema,
  FormResponseSchema,
  PageResponseSchema,
  ReorderInputSchema,
  UpdateFieldInputSchema,
  UpdateFormInputSchema,
  UpdatePageInputSchema,
} from "./model";
import { FormQuery } from "@repo/database/queries";

export class WorkspaceService {
  constructor(private readonly workspaceQuery = new FormQuery()) {}

  public async createForm(createdBy: string, input: z.infer<typeof CreateFormInputSchema>): Promise<z.infer<typeof FormResponseSchema>> {
    const parsed = CreateFormInputSchema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid form input");

    const existing = await this.workspaceQuery.getFormBySlug(parsed.data.workspaceId, parsed.data.slug);
    if (existing) throw new Error("Form slug already exists");

    const form = await this.workspaceQuery.createForm({
      ...parsed.data,
      createdBy,
    });
    if (!form) throw new Error("Failed to create form");

    return FormResponseSchema.parse(form);
  }

  public async updateForm(formId: string, input: z.infer<typeof UpdateFormInputSchema>): Promise<z.infer<typeof FormResponseSchema>> {
    if (!formId) throw new Error("Form id is required");

    const parsed = UpdateFormInputSchema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid update input");

    const existing = await this.workspaceQuery.getFormById(formId);
    if (!existing) throw new Error("Form not found");

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugExists = await this.workspaceQuery.getFormBySlug(existing.workspaceId, parsed.data.slug);
      if (slugExists) throw new Error("Slug already exists");
    }

    const updated = await this.workspaceQuery.updateForm(formId, parsed.data);
    if (!updated) throw new Error("Failed to update form");

    return FormResponseSchema.parse(updated);
  }

  public async deleteForm(formId: string): Promise<z.infer<typeof FormResponseSchema>> {
    if (!formId) throw new Error("Form id is required");

    const existing = await this.workspaceQuery.getFormById(formId);
    if (!existing) throw new Error("Form not found");

    const deleted = await this.workspaceQuery.deleteForm(formId);
    if (!deleted) throw new Error("Failed to delete form");

    return FormResponseSchema.parse(deleted);
  }

  public async getFormById(formId: string): Promise<z.infer<typeof FormResponseSchema>> {
    if (!formId) throw new Error("Form id is required");

    const form = await this.workspaceQuery.getFormById(formId);
    if (!form) throw new Error("Form not found");

    return FormResponseSchema.parse(form);
  }

  public async getFormBySlug(workspaceId: string | undefined, slug: string): Promise<z.infer<typeof FormResponseSchema>> {
    if (!slug) throw new Error("Slug is required");

    const form = workspaceId
      ? await this.workspaceQuery.getFormBySlug(workspaceId, slug)
      : await this.workspaceQuery.getFormBySlugOnly(slug);

    if (!form) throw new Error("Form not found");

    return FormResponseSchema.parse(form);
  }

  public async getFormsByWorkspace(workspaceId: string): Promise<ReadonlyArray<z.infer<typeof FormResponseSchema>>> {
    if (!workspaceId) throw new Error("Workspace id is required");

    const forms = await this.workspaceQuery.getFormsByWorkspace(workspaceId);
    return z.array(FormResponseSchema).parse(forms || []);
  }

  public async searchForms(workspaceId: string, search: string): Promise<ReadonlyArray<z.infer<typeof FormResponseSchema>>> {
    if (!workspaceId) throw new Error("Workspace id is required");
    if (!search?.trim()) return [];

    const forms = await this.workspaceQuery.searchForms(workspaceId, search);
    return z.array(FormResponseSchema).parse(forms || []);
  }

  public async publishForm(formId: string): Promise<z.infer<typeof FormResponseSchema>> {
    if (!formId) throw new Error("Form id is required");

    const form = await this.workspaceQuery.getFormById(formId);
    if (!form) throw new Error("Form not found");

    if (form.status === "published") throw new Error("Form already published");

    const updated = await this.workspaceQuery.updateForm(formId, {
      status: "published",
      publishedAt: new Date(),
    });

    if (!updated) throw new Error("Failed to publish form");

    return FormResponseSchema.parse(updated);
  }

  public async archiveForm(formId: string): Promise<z.infer<typeof FormResponseSchema>> {
    if (!formId) throw new Error("Form id is required");

    const form = await this.workspaceQuery.getFormById(formId);
    if (!form) throw new Error("Form not found");

    if (form.status === "archived") throw new Error("Form already archived");

    const updated = await this.workspaceQuery.updateForm(formId, { status: "archived" });
    if (!updated) throw new Error("Failed to archive form");

    return FormResponseSchema.parse(updated);
  }

  public async createPage(input: z.infer<typeof CreatePageInputSchema>): Promise<z.infer<typeof PageResponseSchema>> {
    const parsed = CreatePageInputSchema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid page input");

    const form = await this.workspaceQuery.getFormById(parsed.data.formId);
    if (!form) throw new Error("Form not found");

    const page = await this.workspaceQuery.createPage(parsed.data);
    if (!page) throw new Error("Failed to create page");

    return PageResponseSchema.parse(page);
  }

  public async updatePage(pageId: string, input: z.infer<typeof UpdatePageInputSchema>): Promise<z.infer<typeof PageResponseSchema>> {
    if (!pageId) throw new Error("Page id is required");

    const parsed = UpdatePageInputSchema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid page update input");

    const pages = await this.workspaceQuery.getPagesByForm(parsed.data.formId || "");
    const existing = pages.find((page) => page.id === pageId);

    if (!existing) throw new Error("Page not found");

    const updated = await this.workspaceQuery.updatePage(pageId, parsed.data);
    if (!updated) throw new Error("Failed to update page");

    return PageResponseSchema.parse(updated);
  }

  public async deletePage(pageId: string): Promise<z.infer<typeof PageResponseSchema>> {
    if (!pageId) throw new Error("Page id is required");

    const page = await this.workspaceQuery.deletePage(pageId);
    if (!page) throw new Error("Page not found");

    return PageResponseSchema.parse(page);
  }

  public async getPagesByForm(formId: string): Promise<ReadonlyArray<z.infer<typeof PageResponseSchema>>> {
    if (!formId) throw new Error("Form id is required");

    const form = await this.workspaceQuery.getFormById(formId);
    if (!form) throw new Error("Form not found");

    const pages = await this.workspaceQuery.getPagesByForm(formId);
    return z.array(PageResponseSchema).parse(pages || []);
  }

  public async reorderPages(input: z.infer<typeof ReorderInputSchema>): Promise<void> {
    const parsed = ReorderInputSchema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid reorder input");

    if (!parsed.data.ids.length) throw new Error("No page ids provided");

    await this.workspaceQuery.reorderPages(parsed.data.ids);
  }

  public async createField(input: z.infer<typeof CreateFieldInputSchema>): Promise<z.infer<typeof FieldResponseSchema>> {
    const parsed = CreateFieldInputSchema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid field input");

    const form = await this.workspaceQuery.getFormById(parsed.data.formId);
    if (!form) throw new Error("Form not found");

    if (parsed.data.pageId) {
      const pages = await this.workspaceQuery.getPagesByForm(parsed.data.formId);
      const pageExists = pages.some((page) => page.id === parsed.data.pageId);
      if (!pageExists) throw new Error("Page not found");
    }

    const field = await this.workspaceQuery.createField(parsed.data);
    if (!field) throw new Error("Failed to create field");

    return FieldResponseSchema.parse(field);
  }

  public async updateField(fieldId: string, input: z.infer<typeof UpdateFieldInputSchema>): Promise<z.infer<typeof FieldResponseSchema>> {
    if (!fieldId) throw new Error("Field id is required");

    const parsed = UpdateFieldInputSchema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid field update input");

    const existing = await this.workspaceQuery.getFieldById(fieldId);
    if (!existing) throw new Error("Field not found");

    const updated = await this.workspaceQuery.updateField(fieldId, parsed.data);
    if (!updated) throw new Error("Failed to update field");

    return FieldResponseSchema.parse(updated);
  }

  public async deleteField(fieldId: string): Promise<z.infer<typeof FieldResponseSchema>> {
    if (!fieldId) throw new Error("Field id is required");

    const existing = await this.workspaceQuery.getFieldById(fieldId);
    if (!existing) throw new Error("Field not found");

    const deleted = await this.workspaceQuery.deleteField(fieldId);
    if (!deleted) throw new Error("Failed to delete field");

    return FieldResponseSchema.parse(deleted);
  }

  public async getFieldsByForm(formId: string): Promise<ReadonlyArray<z.infer<typeof FieldResponseSchema>>> {
    if (!formId) throw new Error("Form id is required");

    const form = await this.workspaceQuery.getFormById(formId);
    if (!form) throw new Error("Form not found");

    const fields = await this.workspaceQuery.getFieldsByForm(formId);
    return z.array(FieldResponseSchema).parse(fields || []);
  }

  public async getFieldsByPage(pageId: string): Promise<ReadonlyArray<z.infer<typeof FieldResponseSchema>>> {
    if (!pageId) throw new Error("Page id is required");

    const fields = await this.workspaceQuery.getFieldsByPage(pageId);
    return z.array(FieldResponseSchema).parse(fields || []);
  }

  public async reorderFields(input: z.infer<typeof ReorderInputSchema>): Promise<void> {
    const parsed = ReorderInputSchema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid reorder input");

    if (!parsed.data.ids.length) throw new Error("No field ids provided");

    await this.workspaceQuery.reorderFields(parsed.data.ids);
  }
}