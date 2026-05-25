import { and, asc, count, desc, eq, gte, inArray, lte } from "drizzle-orm";
import db from "..";
import { forms } from "../models/form.model";
import { submissionAnswers, submissions } from "../models/submission.model";
import { workspaceMembers, workspaces } from "../models/workspace.model";
import { formComments } from "../models/comment.model";
import { users } from "../models/user.model";

export class DashboardQuery {
  public async getUserWorkspaceIds(userId: string) {
    const list = await db
      .select({ workspaceId: workspaceMembers.workspaceId })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId));
    return list.map((item) => item.workspaceId);
  }

  public async getFormsStats(workspaceIds: string[]) {
    if (!workspaceIds.length) {
      return { totalForms: 0, activeForms: 0 };
    }

    const [totalRes] = await db
      .select({ count: count() })
      .from(forms)
      .where(inArray(forms.workspaceId, workspaceIds));

    const [activeRes] = await db
      .select({ count: count() })
      .from(forms)
      .where(and(inArray(forms.workspaceId, workspaceIds), eq(forms.status, "published")));

    return {
      totalForms: totalRes?.count ?? 0,
      activeForms: activeRes?.count ?? 0,
    };
  }

  public async getSubmissionsStats(workspaceIds: string[], startDate: Date, endDate: Date) {
    if (!workspaceIds.length) {
      return { total: 0, completed: 0 };
    }

    const formList = await db
      .select({ id: forms.id })
      .from(forms)
      .where(inArray(forms.workspaceId, workspaceIds));

    if (!formList.length) {
      return { total: 0, completed: 0 };
    }

    const formIds = formList.map((f) => f.id);

    const [totalRes] = await db
      .select({ count: count() })
      .from(submissions)
      .where(
        and(
          inArray(submissions.formId, formIds),
          gte(submissions.createdAt, startDate),
          lte(submissions.createdAt, endDate)
        )
      );

    const [completedRes] = await db
      .select({ count: count() })
      .from(submissions)
      .where(
        and(
          inArray(submissions.formId, formIds),
          eq(submissions.status, "completed"),
          gte(submissions.createdAt, startDate),
          lte(submissions.createdAt, endDate)
        )
      );

    return {
      total: totalRes?.count ?? 0,
      completed: completedRes?.count ?? 0,
    };
  }

  public async getRecentPublishedForms(workspaceIds: string[], limit = 3) {
    if (!workspaceIds.length) return [];

    const list = await db
      .select({
        id: forms.id,
        title: forms.title,
        slug: forms.slug,
        status: forms.status,
        createdAt: forms.createdAt,
        createdBy: forms.createdBy,
        creatorName: users.fullName,
      })
      .from(forms)
      .leftJoin(users, eq(forms.createdBy, users.id))
      .where(and(inArray(forms.workspaceId, workspaceIds), eq(forms.status, "published")))
      .orderBy(desc(forms.createdAt))
      .limit(limit);

    const result = [];
    for (const f of list) {
      const [res] = await db
        .select({ count: count() })
        .from(submissions)
        .where(eq(submissions.formId, f.id));

      result.push({
        ...f,
        submissionsCount: res?.count ?? 0,
      });
    }

    return result;
  }

  public async getLatestComments(workspaceIds: string[], limit = 3) {
    if (!workspaceIds.length) return [];

    const formList = await db
      .select({ id: forms.id })
      .from(forms)
      .where(inArray(forms.workspaceId, workspaceIds));

    if (!formList.length) return [];

    const formIds = formList.map((f) => f.id);

    return db
      .select({
        id: formComments.id,
        content: formComments.content,
        createdAt: formComments.createdAt,
        guestName: formComments.guestName,
        formId: formComments.formId,
        formTitle: forms.title,
        userFullName: users.fullName,
        userProfileImageUrl: users.profileImageUrl,
      })
      .from(formComments)
      .innerJoin(forms, eq(formComments.formId, forms.id))
      .leftJoin(users, eq(formComments.userId, users.id))
      .where(inArray(formComments.formId, formIds))
      .orderBy(desc(formComments.createdAt))
      .limit(limit);
  }

  public async getSubmissionsTimeSeries(workspaceIds: string[], formIds: string[], startDate: Date, endDate: Date) {
    let filteredFormIds: string[] = [];

    if (formIds.length > 0) {
      filteredFormIds = formIds;
    } else if (workspaceIds.length > 0) {
      const formList = await db
        .select({ id: forms.id })
        .from(forms)
        .where(inArray(forms.workspaceId, workspaceIds));
      filteredFormIds = formList.map((f) => f.id);
    }

    if (!filteredFormIds.length) return [];

    return db
      .select({
        id: submissions.id,
        formId: submissions.formId,
        createdAt: submissions.createdAt,
        status: submissions.status,
      })
      .from(submissions)
      .where(
        and(
          inArray(submissions.formId, filteredFormIds),
          gte(submissions.createdAt, startDate),
          lte(submissions.createdAt, endDate)
        )
      )
      .orderBy(asc(submissions.createdAt));
  }
}
