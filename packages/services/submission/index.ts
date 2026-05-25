import { SubmissionQuery, FormQuery } from "@repo/database/queries";
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
    const formQuery = new FormQuery();

    const formFields = await formQuery.getFieldsByForm(payload.formId);

    const fieldById = new Map<string, any>();
    const fieldByKey = new Map<string, any>();
    formFields.forEach((f: any) => {
      fieldById.set(f.id, f);
      fieldByKey.set(f.fieldKey, f);
    });

    const answersMap = new Map(payload.answers.map((a) => [a.fieldId, a.value]));

    const answersByKey: Record<string, any> = {};
    formFields.forEach((f: any) => {
      const val = answersMap.has(f.id) ? answersMap.get(f.id) : undefined;
      answersByKey[f.fieldKey] = val;
    });

    const evaluateVisibility = (field: any) => {
      const logic = field.config?.logic?.showIf;
      if (!logic) return true;
      const targetVal = answersByKey[logic.fieldKey];
      if (targetVal === undefined || targetVal === null) return false;
      if (logic.operator === "equals") {
        return String(targetVal) === String(logic.value);
      }
      if (logic.operator === "not_equals") {
        return String(targetVal) !== String(logic.value);
      }
      if (logic.operator === "contains") {
        if (Array.isArray(targetVal)) {
          return targetVal.includes(logic.value);
        }
        return String(targetVal).toLowerCase().includes(String(logic.value).toLowerCase());
      }
      return true;
    };

    const visibleFields = formFields.filter((f: any) => evaluateVisibility(f));

    const missingRequired = visibleFields.filter((f: any) => {
      if (!f.isRequired) return false;
      const val = answersByKey[f.fieldKey];
      if (val === undefined || val === null) return true;
      if (typeof val === "string" && val.trim() === "") return true;
      if (Array.isArray(val) && val.length === 0) return true;
      return false;
    });

    if (missingRequired.length > 0) {
      throw new Error(`Missing required fields: ${missingRequired.map((f: any) => f.label).join(", ")}`);
    }

    const submission = await this.submissionQuery.createSubmission({
      formId: payload.formId,
      submittedBy: input.submittedBy,
      status: payload.status || "completed",
      submittedAt: new Date(),
    });

    if (!submission) {
      throw new Error("Failed to create submission");
    }

    const answersToInsert = visibleFields.map((f: any) => {
      let val = answersMap.has(f.id) ? answersMap.get(f.id) : undefined;
      if (val === undefined) {
        val = f.defaultValue ?? null;
      }
      if (f.type === "number") {
        val = val === null || val === "" ? null : Number(val);
      }
      if (f.type === "checkbox") {
        val = Boolean(val);
      }
      return {
        submissionId: submission.id,
        fieldId: f.id,
        value: val,
      };
    }).filter((a: any) => a !== undefined);

    const answers = await this.submissionQuery.bulkCreateAnswers(answersToInsert as any[]);

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

    const formQuery = new FormQuery();
    const formFields = await formQuery.getFieldsByForm(existingSubmission.formId);

    const answersMap = new Map(payload.answers.map((a) => [a.fieldId, a.value]));

    const answersByKey: Record<string, any> = {};
    formFields.forEach((f: any) => {
      answersByKey[f.fieldKey] = answersMap.has(f.id) ? answersMap.get(f.id) : undefined;
    });

    const evaluateVisibility = (field: any) => {
      const logic = field.config?.logic?.showIf;
      if (!logic) return true;
      const targetVal = answersByKey[logic.fieldKey];
      if (targetVal === undefined || targetVal === null) return false;
      if (logic.operator === "equals") {
        return String(targetVal) === String(logic.value);
      }
      if (logic.operator === "not_equals") {
        return String(targetVal) !== String(logic.value);
      }
      if (logic.operator === "contains") {
        if (Array.isArray(targetVal)) {
          return targetVal.includes(logic.value);
        }
        return String(targetVal).toLowerCase().includes(String(logic.value).toLowerCase());
      }
      return true;
    };

    const visibleFields = formFields.filter((f: any) => evaluateVisibility(f));

    const missingRequired = visibleFields.filter((f: any) => {
      if (!f.isRequired) return false;
      const val = answersByKey[f.fieldKey];
      if (val === undefined || val === null) return true;
      if (typeof val === "string" && val.trim() === "") return true;
      if (Array.isArray(val) && val.length === 0) return true;
      return false;
    });

    if (missingRequired.length > 0) {
      throw new Error(`Missing required fields: ${missingRequired.map((f: any) => f.label).join(", ")}`);
    }

    const answers = await this.submissionQuery.replaceSubmissionAnswers(
      payload.submissionId,
      visibleFields.map((f: any) => ({
        submissionId: payload.submissionId,
        fieldId: f.id,
        value: answersMap.has(f.id) ? answersMap.get(f.id) : (f.defaultValue ?? null),
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

  public async getExportSubmissions(formId: string): Promise<Array<any>> {
    const list = await this.submissionQuery.getFormSubmissions({ formId, page: 1, limit: 5000 });
    const submissionsWithAnswers = await Promise.all(
      list.data.map(async (sub) => {
        const answers = await this.submissionQuery.getSubmissionAnswers(sub.id);
        return {
          submission: sub,
          answers,
        };
      })
    );
    return submissionsWithAnswers;
  }
}