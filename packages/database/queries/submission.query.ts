import db from "..";
import { and, asc, count, desc, eq, ilike, inArray, isNotNull, sql } from "drizzle-orm";
import { submissionAnswers, submissions } from "../models/submission.model";

export class SubmissionQuery {
  public async createSubmission(data: typeof submissions.$inferInsert) {
    const [submission] = await db.insert(submissions).values(data).returning();
    return submission;
  }

  public async bulkCreateAnswers(data: Array<typeof submissionAnswers.$inferInsert>) {
    if (!data.length) return [];
    return db.insert(submissionAnswers).values(data).returning();
  }

  public async findSubmissionById(id: string) {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission;
  }

  public async findSubmissionByIdWithAnswers(id: string) {
    const rows = await db
      .select({
        submission: submissions,
        answer: submissionAnswers,
      })
      .from(submissions)
      .leftJoin(submissionAnswers, eq(submissionAnswers.submissionId, submissions.id))
      .where(eq(submissions.id, id));

    return rows;
  }

  public async findSubmissionByNumber(formId: string, submissionNumber: number) {
    const [submission] = await db
      .select()
      .from(submissions)
      .where(and(eq(submissions.formId, formId), eq(submissions.submissionNumber, submissionNumber)));

    return submission;
  }

  public async getFormSubmissionById(formId: string, submissionId: string) {
    const [submission] = await db
      .select()
      .from(submissions)
      .where(and(eq(submissions.id, submissionId), eq(submissions.formId, formId)));

    return submission;
  }

  public async getFormSubmissions(params: {
    formId: string;
    page: number;
    limit: number;
    status?: string;
    submittedBy?: string;
    search?: string;
  }) {
    const { formId, page, limit, status, submittedBy, search } = params;

    const conditions = [
      eq(submissions.formId, formId),
      status ? eq(submissions.status, status) : undefined,
      submittedBy ? eq(submissions.submittedBy, submittedBy) : undefined,
      search
        ? ilike(sql`CAST(${submissions.submissionNumber} AS TEXT)`, `%${search}%`)
        : undefined,
    ];

    const data = await db
      .select()
      .from(submissions)
      .where(and(...conditions))
      .orderBy(desc(submissions.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const totalResult = await db
      .select({ total: count() })
      .from(submissions)
      .where(and(...conditions));

    const total = totalResult[0]?.total ?? 0;

    return { data, total };
  }

  public async getSubmissionAnswers(submissionId: string) {
    return db
      .select()
      .from(submissionAnswers)
      .where(eq(submissionAnswers.submissionId, submissionId));
  }

  public async updateSubmissionStatus(id: string, status: string) {
    const [submission] = await db
      .update(submissions)
      .set({ status })
      .where(eq(submissions.id, id))
      .returning();

    return submission;
  }

  public async deleteSubmission(id: string) {
    const [submission] = await db
      .delete(submissions)
      .where(eq(submissions.id, id))
      .returning();

    return submission;
  }

  public async deleteSubmissionAnswers(submissionId: string) {
    return db
      .delete(submissionAnswers)
      .where(eq(submissionAnswers.submissionId, submissionId))
      .returning();
  }

  public async replaceSubmissionAnswers(
    submissionId: string,
    answers: Array<typeof submissionAnswers.$inferInsert>
  ) {
    await this.deleteSubmissionAnswers(submissionId);
    if (!answers.length) return [];
    return db.insert(submissionAnswers).values(answers).returning();
  }

  public async getSubmissionStats(formId: string) {
    const totalSubmissions = await db
      .select({ count: count() })
      .from(submissions)
      .where(eq(submissions.formId, formId));

    const completedSubmissions = await db
      .select({ count: count() })
      .from(submissions)
      .where(and(eq(submissions.formId, formId), eq(submissions.status, "completed")));

    return {
      totalSubmissions: totalSubmissions[0]?.count || 0,
      completedSubmissions: completedSubmissions[0]?.count || 0,
    };
  }

  public async findManySubmissionByIds(ids: string[]) {
    if (!ids.length) return [];

    return db
      .select()
      .from(submissions)
      .where(inArray(submissions.id, ids));
  }

  public async getRecentSubmissions(formId: string, limit = 10) {
    return db
      .select()
      .from(submissions)
      .where(eq(submissions.formId, formId))
      .orderBy(desc(submissions.createdAt))
      .limit(limit);
  }

  public async getUserSubmissions(userId: string) {
    return db
      .select()
      .from(submissions)
      .where(eq(submissions.submittedBy, userId))
      .orderBy(desc(submissions.createdAt));
  }

  public async getPendingSubmissions(formId: string) {
    return db
      .select()
      .from(submissions)
      .where(and(eq(submissions.formId, formId), isNotNull(submissions.submittedAt)))
      .orderBy(asc(submissions.createdAt));
  }
}