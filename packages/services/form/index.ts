import { z } from "zod";
import {
  CreateFieldInputSchema,
  CreateFormInputSchema,
  CreatePageInputSchema,
  FieldResponseSchema,
  FormResponseSchema,
  FormWithStatsResponseSchema,
  PageResponseSchema,
  ReorderInputSchema,
  UpdateFieldInputSchema,
  UpdateFormInputSchema,
  UpdatePageInputSchema,
} from "./model";
import { FormQuery, WorkspaceQuery } from "@repo/database/queries";
import { uploadImage } from "../clients/cloudinary";
import { and, eq, desc } from "@repo/database";
import { db, forms as dbForms, formThemes as dbFormThemes, archivedTemplates as dbArchivedTemplates, workspaces as dbWorkspaces } from "@repo/database";

const DEFAULT_THEMES: Record<string, Record<string, string>> = {
  dark: {
    backgroundColor: "#09090b",
    formBackgroundColor: "#18181b",
    headerBackgroundColor: "#27272a",
    primaryColor: "#3f3f46",
    buttonTextColor: "#ffffff",
    textColor: "#ffffff",
    mutedTextColor: "#a1a1aa",
    borderColor: "#27272a",
    inputBackgroundColor: "#27272a",
    inputTextColor: "#ffffff",
  },
  light: {
    backgroundColor: "#f4f4f5",
    formBackgroundColor: "#ffffff",
    headerBackgroundColor: "#e4e4e7",
    primaryColor: "#18181b",
    buttonTextColor: "#ffffff",
    textColor: "#09090b",
    mutedTextColor: "#71717a",
    borderColor: "#e4e4e7",
    inputBackgroundColor: "#f4f4f5",
    inputTextColor: "#09090b",
  },
  ocean: {
    backgroundColor: "#f0f9ff",
    formBackgroundColor: "#ffffff",
    headerBackgroundColor: "#e0f2fe",
    primaryColor: "#0284c7",
    buttonTextColor: "#ffffff",
    textColor: "#0f172a",
    mutedTextColor: "#475569",
    borderColor: "#e2e8f0",
    inputBackgroundColor: "#f8fafc",
    inputTextColor: "#0f172a",
  },
  emerald: {
    backgroundColor: "#f0fdf4",
    formBackgroundColor: "#ffffff",
    headerBackgroundColor: "#dcfce7",
    primaryColor: "#16a34a",
    buttonTextColor: "#ffffff",
    textColor: "#0f172a",
    mutedTextColor: "#475569",
    borderColor: "#e2e8f0",
    inputBackgroundColor: "#f8fafc",
    inputTextColor: "#0f172a",
  },
  sunset: {
    backgroundColor: "#fff7ed",
    formBackgroundColor: "#ffffff",
    headerBackgroundColor: "#ffedd5",
    primaryColor: "#ea580c",
    buttonTextColor: "#ffffff",
    textColor: "#0f172a",
    mutedTextColor: "#475569",
    borderColor: "#e2e8f0",
    inputBackgroundColor: "#f8fafc",
    inputTextColor: "#0f172a",
  },
};

export class WorkspaceService {
  constructor(
    private readonly workspaceQuery = new FormQuery(),
    private readonly workspaceMemberQuery = new WorkspaceQuery()
  ) {}

  private async checkWorkspaceRole(workspaceId: string, userId: string, allowedRoles: string[]) {
    const member = await this.workspaceMemberQuery.findWorkspaceMember(workspaceId, userId);
    if (!member?.role || !allowedRoles.includes(member.role)) {
      throw new Error("Unauthorized: You do not have permission to perform this action");
    }
    return member;
  }

  private async checkFormWorkspaceRole(formId: string, userId: string, allowedRoles: string[]) {
    const form = await this.workspaceQuery.getFormById(formId);
    if (!form) throw new Error("Form not found");
    await this.checkWorkspaceRole(form.workspaceId, userId, allowedRoles);
    return form;
  }

  private async attachThemeToForm(form: any) {
    if (!form) return form;
    let theme = await this.workspaceQuery.getFormTheme(form.id);
    if (!theme) {
      theme = await this.workspaceQuery.upsertFormTheme(form.id, {
        themeName: "dark",
        backgroundColor: "#09090b",
        formBackgroundColor: "#18181b",
        headerBackgroundColor: "#27272a",
        primaryColor: "#3f3f46",
        buttonTextColor: "#ffffff",
        textColor: "#ffffff",
        mutedTextColor: "#a1a1aa",
        borderColor: "#27272a",
        inputBackgroundColor: "#27272a",
        inputTextColor: "#ffffff",
        bannerUrl: null,
      });
    }
    if (!theme) throw new Error("Failed to initialize form theme");
    const resolvedTheme = (theme.themeName && theme.themeName !== "custom" && DEFAULT_THEMES[theme.themeName]) || theme;

    form.themeConfig = {
      themeName: theme.themeName || "custom",
      backgroundColor: resolvedTheme.backgroundColor,
      formBackgroundColor: resolvedTheme.formBackgroundColor,
      headerBackgroundColor: resolvedTheme.headerBackgroundColor,
      primaryColor: resolvedTheme.primaryColor,
      buttonTextColor: resolvedTheme.buttonTextColor,
      textColor: resolvedTheme.textColor,
      mutedTextColor: resolvedTheme.mutedTextColor,
      borderColor: resolvedTheme.borderColor,
      inputBackgroundColor: resolvedTheme.inputBackgroundColor,
      inputTextColor: resolvedTheme.inputTextColor,
      bannerUrl: theme.bannerUrl,
    };
    return form;
  }

  public async createForm(createdBy: string, input: z.infer<typeof CreateFormInputSchema>): Promise<z.infer<typeof FormResponseSchema>> {
    const parsed = CreateFormInputSchema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid form input");

    await this.checkWorkspaceRole(parsed.data.workspaceId, createdBy, ["owner", "admin", "member"]);

    const existing = await this.workspaceQuery.getFormBySlug(parsed.data.workspaceId, parsed.data.slug);
    if (existing) throw new Error("Form slug already exists");

    const form = await this.workspaceQuery.createForm({
      ...parsed.data,
      createdBy,
      themeConfig: parsed.data.themeConfig || {},
    });
    if (!form) throw new Error("Failed to create form");

    await this.workspaceQuery.upsertFormTheme(form.id, parsed.data.themeConfig || {});

    const formWithTheme = await this.attachThemeToForm(form);
    return FormResponseSchema.parse(formWithTheme);
  }

  public async updateForm(userId: string, formId: string, input: z.infer<typeof UpdateFormInputSchema>): Promise<z.infer<typeof FormResponseSchema>> {
    if (!formId) throw new Error("Form id is required");

    const parsed = UpdateFormInputSchema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid update input");

    const allowedRoles = parsed.data.status && parsed.data.status !== "draft"
      ? ["owner", "admin"]
      : ["owner", "admin", "member"];

    const existing = await this.checkFormWorkspaceRole(formId, userId, allowedRoles);

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugExists = await this.workspaceQuery.getFormBySlug(existing.workspaceId, parsed.data.slug);
      if (slugExists) throw new Error("Slug already exists");
    }

    const updated = await this.workspaceQuery.updateForm(formId, parsed.data);
    if (!updated) throw new Error("Failed to update form");

    if (parsed.data.themeConfig) {
      await this.workspaceQuery.upsertFormTheme(formId, parsed.data.themeConfig);
    }

    const formWithTheme = await this.attachThemeToForm(updated);
    return FormResponseSchema.parse(formWithTheme);
  }

  public async deleteForm(userId: string, formId: string): Promise<z.infer<typeof FormResponseSchema>> {
    if (!formId) throw new Error("Form id is required");

    await this.checkFormWorkspaceRole(formId, userId, ["owner", "admin", "member"]);

    const deleted = await this.workspaceQuery.deleteForm(formId);
    if (!deleted) throw new Error("Failed to delete form");

    return FormResponseSchema.parse(deleted);
  }

  public async getFormById(formId: string): Promise<z.infer<typeof FormResponseSchema>> {
    if (!formId) throw new Error("Form id is required");

    const form = await this.workspaceQuery.getFormById(formId);
    if (!form) throw new Error("Form not found");

    const formWithTheme = await this.attachThemeToForm(form);
    return FormResponseSchema.parse(formWithTheme);
  }

  public async getFormBySlug(workspaceId: string | undefined, slug: string): Promise<z.infer<typeof FormResponseSchema>> {
    if (!slug) throw new Error("Slug is required");

    const form = workspaceId
      ? await this.workspaceQuery.getFormBySlug(workspaceId, slug)
      : await this.workspaceQuery.getFormBySlugOnly(slug);

    if (!form) throw new Error("Form not found");

    const formWithTheme = await this.attachThemeToForm(form);
    return FormResponseSchema.parse(formWithTheme);
  }

  public async getFormsByWorkspace(workspaceId: string): Promise<ReadonlyArray<z.infer<typeof FormResponseSchema>>> {
    if (!workspaceId) throw new Error("Workspace id is required");

    const forms = await this.workspaceQuery.getFormsByWorkspace(workspaceId);
    const formsWithThemes = await Promise.all((forms || []).map(f => this.attachThemeToForm(f)));
    return z.array(FormResponseSchema).parse(formsWithThemes || []);
  }

  public async searchForms(workspaceId: string, search: string): Promise<ReadonlyArray<z.infer<typeof FormResponseSchema>>> {
    if (!workspaceId) throw new Error("Workspace id is required");
    if (!search?.trim()) return [];

    const forms = await this.workspaceQuery.searchForms(workspaceId, search);
    const formsWithThemes = await Promise.all((forms || []).map(f => this.attachThemeToForm(f)));
    return z.array(FormResponseSchema).parse(formsWithThemes || []);
  }

  public async publishForm(userId: string, formId: string): Promise<z.infer<typeof FormResponseSchema>> {
    if (!formId) throw new Error("Form id is required");

    const form = await this.checkFormWorkspaceRole(formId, userId, ["owner", "admin"]);

    if (form.status === "published") throw new Error("Form already published");

    const updated = await this.workspaceQuery.updateForm(formId, {
      status: "published",
      publishedAt: new Date(),
    });

    if (!updated) throw new Error("Failed to publish form");

    return FormResponseSchema.parse(updated);
  }

  public async archiveForm(userId: string, formId: string): Promise<z.infer<typeof FormResponseSchema>> {
    if (!formId) throw new Error("Form id is required");

    const form = await this.checkFormWorkspaceRole(formId, userId, ["owner", "admin"]);

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

  public async getFormsWithStats(workspaceId: string): Promise<ReadonlyArray<z.infer<typeof FormWithStatsResponseSchema>>> {
    if (!workspaceId) throw new Error("Workspace id is required");
    const formsWithStats = await this.workspaceQuery.getFormsWithStats(workspaceId);
    const formsWithThemes = await Promise.all((formsWithStats || []).map(f => this.attachThemeToForm(f)));
    return z.array(FormWithStatsResponseSchema).parse(formsWithThemes || []);
  }

  public async uploadFile(fileData: string, folderName: string): Promise<string> {
    if (!fileData) throw new Error("File data is required");
    return uploadImage(fileData, folderName || "forms");
  }

  public async cloneFormTemplate(userId: string, formId: string, targetWorkspaceId: string): Promise<z.infer<typeof FormResponseSchema>> {
    const originalForm = await this.workspaceQuery.getFormById(formId);
    if (!originalForm) throw new Error("Original form not found");

    await this.checkWorkspaceRole(targetWorkspaceId, userId, ["owner", "admin", "member"]);

    const newSlug = `clone-${originalForm.slug}-${Math.random().toString(36).substring(2, 7)}`;
    const newForm = await this.workspaceQuery.createForm({
      workspaceId: targetWorkspaceId,
      title: `${originalForm.title} (Clone)`,
      description: originalForm.description,
      slug: newSlug,
      status: "draft",
      isPublic: originalForm.isPublic,
      accessLevel: originalForm.accessLevel,
      createdBy: userId,
      allowMultipleSubmissions: originalForm.allowMultipleSubmissions,
      requireAuth: originalForm.requireAuth,
      maxSubmissions: originalForm.maxSubmissions,
      redirectUrl: originalForm.redirectUrl,
      themeConfig: originalForm.themeConfig || {},
      isTemplate: false,
    });
    if (!newForm) throw new Error("Failed to clone form");

    const originalTheme = await this.workspaceQuery.getFormTheme(formId);
    if (originalTheme) {
      await this.workspaceQuery.upsertFormTheme(newForm.id, {
        themeName: originalTheme.themeName || "custom",
        backgroundColor: originalTheme.backgroundColor,
        formBackgroundColor: originalTheme.formBackgroundColor,
        headerBackgroundColor: originalTheme.headerBackgroundColor,
        primaryColor: originalTheme.primaryColor,
        buttonTextColor: originalTheme.buttonTextColor,
        textColor: originalTheme.textColor,
        mutedTextColor: originalTheme.mutedTextColor,
        borderColor: originalTheme.borderColor,
        inputBackgroundColor: originalTheme.inputBackgroundColor,
        inputTextColor: originalTheme.inputTextColor,
        bannerUrl: originalTheme.bannerUrl,
      });
    }

    const originalPages = await this.workspaceQuery.getPagesByForm(formId);
    const pageIdMapping: Record<string, string> = {};
    for (const page of originalPages) {
      const newPage = await this.workspaceQuery.createPage({
        formId: newForm.id,
        title: page.title,
        description: page.description,
        order: page.order,
      });
      if (newPage) {
        pageIdMapping[page.id] = newPage.id;
      }
    }

    const originalFields = await this.workspaceQuery.getFieldsByForm(formId);
    for (const field of originalFields) {
      const targetPageId = field.pageId ? pageIdMapping[field.pageId] : null;
      await this.workspaceQuery.createField({
        formId: newForm.id,
        pageId: targetPageId,
        label: field.label,
        placeholder: field.placeholder,
        helperText: field.helperText,
        type: field.type,
        fieldKey: field.fieldKey,
        defaultValue: field.defaultValue,
        isRequired: field.isRequired,
        order: field.order,
        config: field.config,
      });
    }

    const formWithTheme = await this.attachThemeToForm(newForm);
    return FormResponseSchema.parse(formWithTheme);
  }

  public async getPublicTemplates(): Promise<ReadonlyArray<any>> {
    const list = await db
      .select({
        form: dbForms,
        workspace: {
          name: dbWorkspaces.name,
          logoUrl: dbWorkspaces.logoUrl,
        },
      })
      .from(dbForms)
      .innerJoin(dbWorkspaces, eq(dbForms.workspaceId, dbWorkspaces.id))
      .where(and(eq(dbForms.isTemplate, true), eq(dbForms.status, "published")))
      .orderBy(desc(dbForms.createdAt));

    const formsWithThemes = await Promise.all((list || []).map(async (item) => {
      const formWithTheme = await this.attachThemeToForm(item.form);
      return {
        form: formWithTheme,
        workspace: item.workspace,
      };
    }));

    return formsWithThemes;
  }

  public async archiveTemplate(userId: string, formId: string): Promise<void> {
    const existing = await db
      .select()
      .from(dbArchivedTemplates)
      .where(and(eq(dbArchivedTemplates.userId, userId), eq(dbArchivedTemplates.formId, formId)));

    if (existing.length === 0) {
      await db.insert(dbArchivedTemplates).values({ userId, formId });
    }
  }

  public async unarchiveTemplate(userId: string, formId: string): Promise<void> {
    await db
      .delete(dbArchivedTemplates)
      .where(and(eq(dbArchivedTemplates.userId, userId), eq(dbArchivedTemplates.formId, formId)));
  }

  public async getArchivedTemplates(userId: string): Promise<ReadonlyArray<any>> {
    const list = await db
      .select({
        form: dbForms,
        workspace: {
          name: dbWorkspaces.name,
          logoUrl: dbWorkspaces.logoUrl,
        },
      })
      .from(dbArchivedTemplates)
      .innerJoin(dbForms, eq(dbArchivedTemplates.formId, dbForms.id))
      .innerJoin(dbWorkspaces, eq(dbForms.workspaceId, dbWorkspaces.id))
      .where(eq(dbArchivedTemplates.userId, userId))
      .orderBy(desc(dbArchivedTemplates.createdAt));

    const formsWithThemes = await Promise.all((list || []).map(async (item) => {
      const formWithTheme = await this.attachThemeToForm(item.form);
      return {
        form: formWithTheme,
        workspace: item.workspace,
      };
    }));

    return formsWithThemes;
  }

  public async isTemplateArchived(userId: string, formId: string): Promise<boolean> {
    const existing = await db
      .select()
      .from(dbArchivedTemplates)
      .where(and(eq(dbArchivedTemplates.userId, userId), eq(dbArchivedTemplates.formId, formId)));

    return existing.length > 0;
  }
}