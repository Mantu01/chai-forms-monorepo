import { and, asc, count, desc, eq, ilike, inArray } from "drizzle-orm";
import db from "..";
import { formFields, formPages, forms, InsertForm, InsertFormField, InsertFormPage, SelectForm, SelectFormField, SelectFormPage } from "../models/form.model";
import { submissions } from "../models/submission.model";

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
    const formsList = await db.select().from(forms).where(eq(forms.workspaceId, workspaceId)).orderBy(desc(forms.createdAt));
    const stats = await Promise.all(
      formsList.map(async (f) => {
        const [res] = await db.select({ count: count() }).from(submissions).where(eq(submissions.formId, f.id));
        return {
          ...f,
          submissionCount: res?.count ?? 0,
        };
      })
    );
    return stats;
  }
}