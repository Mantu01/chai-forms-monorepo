import { and, asc, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import db from "..";
import { formFields, formPages, forms, InsertForm, InsertFormField, InsertFormPage, SelectForm, SelectFormField, SelectFormPage } from "../models/form.model";
import { submissions } from "../models/submission.model";
import { formThemes, defaultThemes, SelectFormTheme } from "../models/theme.model";


export class FormQuery {
  public async createForm(data: InsertForm): Promise<SelectForm | undefined> {
    const [form] = await db.insert(forms).values(data).returning();
    return form;
  }

  public async updateForm(formId: string, data: Partial<InsertForm>): Promise<SelectForm | undefined> {
    const [form] = await db.update(forms).set(data).where(eq(forms.id, formId)).returning();
    return form;
  }

  public async deleteForm(formId: string): Promise<SelectForm | undefined> {
    const [form] = await db.delete(forms).where(eq(forms.id, formId)).returning();
    return form;
  }

  public async getFormById(formId: string): Promise<SelectForm | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, formId));
    return form;
  }

  public async getFormBySlug(workspaceId: string, slug: string): Promise<SelectForm | undefined> {
    const [form] = await db.select().from(forms).where(and(eq(forms.workspaceId, workspaceId), eq(forms.slug, slug)));
    return form;
  }

  public async getFormBySlugOnly(slug: string): Promise<SelectForm | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.slug, slug));
    return form;
  }

  public async getFormsByWorkspace(workspaceId: string): Promise<ReadonlyArray<SelectForm>> {
    return db.select().from(forms).where(eq(forms.workspaceId, workspaceId)).orderBy(desc(forms.createdAt));
  }

  public async searchForms(workspaceId: string, search: string): Promise<ReadonlyArray<SelectForm>> {
    return db.select().from(forms).where(and(eq(forms.workspaceId, workspaceId), ilike(forms.title, `%${search}%`))).orderBy(desc(forms.createdAt));
  }

  public async getPublishedForms(workspaceId: string): Promise<ReadonlyArray<SelectForm>> {
    return db.select().from(forms).where(and(eq(forms.workspaceId, workspaceId), eq(forms.status, "published")));
  }

  public async getPublicFormBySlug(slug: string): Promise<SelectForm | undefined> {
    const [form] = await db.select().from(forms).where(and(eq(forms.slug, slug), eq(forms.isPublic, true), eq(forms.status, "published")));
    return form;
  }

  public async duplicateForm(data: InsertForm): Promise<SelectForm | undefined> {
    const [form] = await db.insert(forms).values(data).returning();
    return form;
  }

  public async createPage(data: InsertFormPage): Promise<SelectFormPage | undefined> {
    const [page] = await db.insert(formPages).values(data).returning();
    return page;
  }

  public async updatePage(pageId: string, data: Partial<InsertFormPage>): Promise<SelectFormPage | undefined> {
    const [page] = await db.update(formPages).set(data).where(eq(formPages.id, pageId)).returning();
    return page;
  }

  public async deletePage(pageId: string): Promise<SelectFormPage | undefined> {
    const [page] = await db.delete(formPages).where(eq(formPages.id, pageId)).returning();
    return page;
  }

  public async getPagesByForm(formId: string): Promise<ReadonlyArray<SelectFormPage>> {
    return db.select().from(formPages).where(eq(formPages.formId, formId)).orderBy(asc(formPages.order));
  }

  public async createField(data: InsertFormField): Promise<SelectFormField | undefined> {
    const [field] = await db.insert(formFields).values(data).returning();
    return field;
  }

  public async updateField(fieldId: string, data: Partial<InsertFormField>): Promise<SelectFormField | undefined> {
    const [field] = await db.update(formFields).set(data).where(eq(formFields.id, fieldId)).returning();
    return field;
  }

  public async deleteField(fieldId: string): Promise<SelectFormField | undefined> {
    const [field] = await db.delete(formFields).where(eq(formFields.id, fieldId)).returning();
    return field;
  }

  public async getFieldById(fieldId: string): Promise<SelectFormField | undefined> {
    const [field] = await db.select().from(formFields).where(eq(formFields.id, fieldId));
    return field;
  }

  public async getFieldsByForm(formId: string): Promise<ReadonlyArray<SelectFormField>> {
    return db.select().from(formFields).where(eq(formFields.formId, formId)).orderBy(asc(formFields.order));
  }

  public async getFieldsByPage(pageId: string): Promise<ReadonlyArray<SelectFormField>> {
    return db.select().from(formFields).where(eq(formFields.pageId, pageId)).orderBy(asc(formFields.order));
  }

  public async reorderPages(pageIds: string[]): Promise<void> {
    await Promise.all(pageIds.map((id, index) => db.update(formPages).set({ order: index + 1 }).where(eq(formPages.id, id))));
  }

  public async reorderFields(fieldIds: string[]): Promise<void> {
    await Promise.all(fieldIds.map((id, index) => db.update(formFields).set({ order: index + 1 }).where(eq(formFields.id, id))));
  }

  public async deleteFieldsByPage(pageId: string): Promise<void> {
    await db.delete(formFields).where(eq(formFields.pageId, pageId));
  }

  public async getFormsCount(workspaceId: string): Promise<number | undefined> {
    const [result] = await db.select({ count: count() }).from(forms).where(eq(forms.workspaceId, workspaceId));
    return result?.count;
  }

  public async getManyFormsByIds(formIds: string[]): Promise<ReadonlyArray<SelectForm>> {
    return db.select().from(forms).where(inArray(forms.id, formIds));
  }

  public async getFormsWithStats(workspaceId: string) {
    // Single query with LEFT JOIN instead of N+1 per-form count queries
    const rows = await db
      .select({
        form: forms,
        submissionCount: sql<number>`cast(count(${submissions.id}) as integer)`,
      })
      .from(forms)
      .leftJoin(submissions, eq(submissions.formId, forms.id))
      .where(eq(forms.workspaceId, workspaceId))
      .groupBy(forms.id)
      .orderBy(desc(forms.createdAt));

    return rows.map((r) => ({
      ...r.form,
      submissionCount: r.submissionCount ?? 0,
    }));
  }

  /** Batch-fetch form themes for multiple form IDs in one query */
  public async getFormThemesByIds(formIds: string[]): Promise<SelectFormTheme[]> {
    if (!formIds.length) return [];
    return db.select().from(formThemes).where(inArray(formThemes.formId, formIds));
  }

  public async getFormTheme(formId: string) {
    const [theme] = await db.select().from(formThemes).where(eq(formThemes.formId, formId));
    return theme;
  }

  public async upsertFormTheme(formId: string, data: any) {
    const existing = await this.getFormTheme(formId);
    if (existing) {
      const [updated] = await db.update(formThemes).set(data).where(eq(formThemes.formId, formId)).returning();
      return updated;
    } else {
      const [inserted] = await db.insert(formThemes).values({ ...data, formId }).returning();
      return inserted;
    }
  }

  public async getDefaultThemes() {
    return await db.select().from(defaultThemes).where(eq(defaultThemes.isDefault, true)).orderBy(asc(defaultThemes.name));
  }

  public async createDefaultTheme(data: any) {
    const [theme] = await db.insert(defaultThemes).values(data).returning();
    return theme;
  }

  public async deleteDefaultTheme(id: string) {
    await db.delete(defaultThemes).where(eq(defaultThemes.id, id));
  }

  public async getDefaultThemeById(id: string) {
    const [theme] = await db.select().from(defaultThemes).where(eq(defaultThemes.id, id));
    return theme;
  }

  public async getDefaultThemeByName(name: string) {
    const [theme] = await db.select().from(defaultThemes).where(eq(defaultThemes.name, name));
    return theme;
  }
}