import { SubmissionQuery } from "@repo/database/queries";
import {
  CreateSubmissionInputSchema,
  createSubmissionInputSchema,
  DeleteSubmissionInputSchema,
  deleteSubmissionInputSchema,
  GetFormSubmissionsInputSchema,
  getFormSubmissionsInputSchema,
  GetSubmissionByIdInputSchema,
  getSubmissionByIdInputSchema,
  paginatedSubmissionResponseSchema,
  PaginatedSubmissionResponseSchema,
  ReplaceSubmissionAnswersInputSchema,
  replaceSubmissionAnswersInputSchema,
  SubmissionResponseSchema,
  submissionResponseSchema,
  SubmissionWithAnswersResponseSchema,
  submissionWithAnswersResponseSchema,
  UpdateSubmissionStatusInputSchema,
  updateSubmissionStatusInputSchema,
  GetSubmissionStatsInputSchema,
  getSubmissionStatsInputSchema,
  SubmissionStatsResponseSchema,
  submissionStatsResponseSchema,
  GetUserSubmissionsInputSchema,
  getUserSubmissionsInputSchema,
  UserSubmissionsResponseSchema,
  userSubmissionsResponseSchema,
  GetRecentSubmissionsInputSchema,
  getRecentSubmissionsInputSchema,
  RecentSubmissionsResponseSchema,
  recentSubmissionsResponseSchema,
} from "./modal";

export class SubmissionService {
  private readonly submissionQuery = new SubmissionQuery();

  public async createSubmission(
    input: CreateSubmissionInputSchema & { submittedBy?: string }
  ): Promise<SubmissionWithAnswersResponseSchema> {
    const payload = createSubmissionInputSchema.parse(input);

    const submission = await this.submissionQuery.createSubmission({
      formId: payload.formId,
      submittedBy: input.submittedBy,
      status: payload.status || "completed",
      submittedAt: new Date(),
    });

    if (!submission) {
      throw new Error("Failed to create submission");
    }

    const answers = await this.submissionQuery.bulkCreateAnswers(
      payload.answers.map((answer) => ({
        submissionId: submission.id,
        fieldId: answer.fieldId,
        value: answer.value,
      }))
    );

    return submissionWithAnswersResponseSchema.parse({
      submission,
      answers,
    });
  }

  public async getSubmissionById(
    input: GetSubmissionByIdInputSchema
  ): Promise<SubmissionWithAnswersResponseSchema> {
    const payload = getSubmissionByIdInputSchema.parse(input);

    const rows = await this.submissionQuery.findSubmissionByIdWithAnswers(
      payload.submissionId
    );

    if (!rows.length) {
      throw new Error("Submission not found");
    }

    const submission = rows[0]?.submission;

    if (!submission) {
      throw new Error("Submission not found");
    }

    const answers = rows
      .filter((row) => row.answer)
      .map((row) => row.answer);

    return submissionWithAnswersResponseSchema.parse({
      submission,
      answers,
    });
  }

  public async getFormSubmissions(
    input: GetFormSubmissionsInputSchema
  ): Promise<PaginatedSubmissionResponseSchema> {
    const payload = getFormSubmissionsInputSchema.parse(input);

    const result = await this.submissionQuery.getFormSubmissions(payload);

    return paginatedSubmissionResponseSchema.parse({
      data: result.data,
      total: result.total,
      page: payload.page,
      limit: payload.limit,
    });
  }

  public async updateSubmissionStatus(
    input: UpdateSubmissionStatusInputSchema
  ): Promise<SubmissionResponseSchema> {
    const payload = updateSubmissionStatusInputSchema.parse(input);

    const existingSubmission = await this.submissionQuery.findSubmissionById(
      payload.submissionId
    );

    if (!existingSubmission) {
      throw new Error("Submission not found");
    }

    const updatedSubmission =
      await this.submissionQuery.updateSubmissionStatus(
        payload.submissionId,
        payload.status
      );

    if (!updatedSubmission) {
      throw new Error("Failed to update submission status");
    }

    return submissionResponseSchema.parse(updatedSubmission);
  }

  public async replaceSubmissionAnswers(
    input: ReplaceSubmissionAnswersInputSchema
  ): Promise<SubmissionWithAnswersResponseSchema> {
    const payload = replaceSubmissionAnswersInputSchema.parse(input);

    const existingSubmission = await this.submissionQuery.findSubmissionById(
      payload.submissionId
    );

    if (!existingSubmission) {
      throw new Error("Submission not found");
    }

    const answers = await this.submissionQuery.replaceSubmissionAnswers(
      payload.submissionId,
      payload.answers.map((answer) => ({
        submissionId: payload.submissionId,
        fieldId: answer.fieldId,
        value: answer.value,
      }))
    );

    return submissionWithAnswersResponseSchema.parse({
      submission: existingSubmission,
      answers,
    });
  }

  public async deleteSubmission(
    input: DeleteSubmissionInputSchema
  ): Promise<SubmissionResponseSchema> {
    const payload = deleteSubmissionInputSchema.parse(input);

    const existingSubmission = await this.submissionQuery.findSubmissionById(
      payload.submissionId
    );

    if (!existingSubmission) {
      throw new Error("Submission not found");
    }

    const deletedSubmission = await this.submissionQuery.deleteSubmission(
      payload.submissionId
    );

    if (!deletedSubmission) {
      throw new Error("Failed to delete submission");
    }

    return submissionResponseSchema.parse(deletedSubmission);
  }

  public async getSubmissionStats(
    input: GetSubmissionStatsInputSchema
  ): Promise<SubmissionStatsResponseSchema> {
    const payload = getSubmissionStatsInputSchema.parse(input);
    const stats = await this.submissionQuery.getSubmissionStats(payload.formId);
    return submissionStatsResponseSchema.parse(stats);
  }

  public async getUserSubmissions(
    userId: string
  ): Promise<UserSubmissionsResponseSchema> {
    const result = await this.submissionQuery.getUserSubmissions(userId);
    return userSubmissionsResponseSchema.parse(result);
  }

  public async getRecentSubmissions(
    input: GetRecentSubmissionsInputSchema
  ): Promise<RecentSubmissionsResponseSchema> {
    const payload = getRecentSubmissionsInputSchema.parse(input);
    const result = await this.submissionQuery.getRecentSubmissions(payload.formId, payload.limit);
    return recentSubmissionsResponseSchema.parse(result);
  }
}