import db from "..";
import { and, count, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { forms } from "../models/form.model";
import { submissions } from "../models/submission.model";
import { formComments } from "../models/comment.model";
import { users } from "../models/user.model";

export class DashboardQuery {
  public async getDashboardStats(workspaceIds: string[]) {
    if (!workspaceIds.length) {
      return {
        totalSubmissionsLastMonth: 0,
        submissionsTrend: 0,
        totalForms: 0,
        activeForms: 0,
        submissionRate: 0,
        submissionRateTrend: 0,
      };
    }

    const formsList = await db
      .select({ id: forms.id, status: forms.status })
      .from(forms)
      .where(inArray(forms.workspaceId, workspaceIds));

    const totalForms = formsList.length;
    const activeForms = formsList.filter((f) => f.status === "published").length;

    const formIds = formsList.map((f) => f.id);

    if (!formIds.length) {
      return {
        totalSubmissionsLastMonth: 0,
        submissionsTrend: 0,
        totalForms,
        activeForms,
        submissionRate: 0,
        submissionRateTrend: 0,
      };
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [subLastMonth] = await db
      .select({ count: count() })
      .from(submissions)
      .where(
        and(
          inArray(submissions.formId, formIds),
          gte(submissions.createdAt, thirtyDaysAgo)
        )
      );

    const [subPrevMonth] = await db
      .select({ count: count() })
      .from(submissions)
      .where(
        and(
          inArray(submissions.formId, formIds),
          gte(submissions.createdAt, sixtyDaysAgo),
          lt(submissions.createdAt, thirtyDaysAgo)
        )
      );

    const lastMonthCount = subLastMonth?.count ?? 0;
    const prevMonthCount = subPrevMonth?.count ?? 0;

    let submissionsTrend = 0;
    if (prevMonthCount > 0) {
      submissionsTrend = ((lastMonthCount - prevMonthCount) / prevMonthCount) * 100;
    } else if (lastMonthCount > 0) {
      submissionsTrend = 100;
    }

    const [completedLastMonth] = await db
      .select({ count: count() })
      .from(submissions)
      .where(
        and(
          inArray(submissions.formId, formIds),
          eq(submissions.status, "completed"),
          gte(submissions.createdAt, thirtyDaysAgo)
        )
      );

    const [completedPrevMonth] = await db
      .select({ count: count() })
      .from(submissions)
      .where(
        and(
          inArray(submissions.formId, formIds),
          eq(submissions.status, "completed"),
          gte(submissions.createdAt, sixtyDaysAgo),
          lt(submissions.createdAt, thirtyDaysAgo)
        )
      );

    const compLastMonthCount = completedLastMonth?.count ?? 0;
    const compPrevMonthCount = completedPrevMonth?.count ?? 0;

    const rateLastMonth = lastMonthCount > 0 ? (compLastMonthCount / lastMonthCount) * 100 : 0;
    const ratePrevMonth = prevMonthCount > 0 ? (compPrevMonthCount / prevMonthCount) * 100 : 0;

    const submissionRateTrend = rateLastMonth - ratePrevMonth;

    return {
      totalSubmissionsLastMonth: lastMonthCount,
      submissionsTrend,
      totalForms,
      activeForms,
      submissionRate: rateLastMonth,
      submissionRateTrend,
    };
  }

  public async getRecentPublishedForms(workspaceIds: string[], limit = 3) {
    if (!workspaceIds.length) return [];

    // Single query: forms + submission counts via LEFT JOIN
    const rows = await db
      .select({
        id: forms.id,
        title: forms.title,
        createdAt: forms.createdAt,
        publishedAt: forms.publishedAt,
        createdByName: users.fullName,
        submissionCount: sql<number>`cast(count(${submissions.id}) as integer)`,
      })
      .from(forms)
      .innerJoin(users, eq(forms.createdBy, users.id))
      .leftJoin(submissions, eq(submissions.formId, forms.id))
      .where(
        and(
          inArray(forms.workspaceId, workspaceIds),
          eq(forms.status, "published")
        )
      )
      .groupBy(forms.id, users.fullName)
      .orderBy(desc(forms.publishedAt), desc(forms.createdAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: row.createdAt,
      publishedAt: row.publishedAt,
      createdByName: row.createdByName,
      submissionCount: row.submissionCount ?? 0,
    }));
  }

  public async getRecentComments(workspaceIds: string[], limit = 3) {
    if (!workspaceIds.length) return [];

    const formList = await db
      .select({ id: forms.id, title: forms.title })
      .from(forms)
      .where(inArray(forms.workspaceId, workspaceIds));

    const formIds = formList.map((f) => f.id);
    if (!formIds.length) return [];

    const comments = await db
      .select({
        id: formComments.id,
        content: formComments.content,
        createdAt: formComments.createdAt,
        guestName: formComments.guestName,
        userId: formComments.userId,
        formId: formComments.formId,
        userFullName: users.fullName,
      })
      .from(formComments)
      .leftJoin(users, eq(formComments.userId, users.id))
      .where(inArray(formComments.formId, formIds))
      .orderBy(desc(formComments.createdAt))
      .limit(limit);

    return comments.map((c) => {
      const formObj = formList.find((f) => f.id === c.formId);
      return {
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        commenterName: c.userFullName || c.guestName || "Anonymous",
        formTitle: formObj?.title || "Unknown Form",
      };
    });
  }

  public async getSubmissionsTimeSeries(formIds: string[], days: number) {
    if (!formIds.length) return [];

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return db
      .select({
        formId: submissions.formId,
        createdAt: submissions.createdAt,
      })
      .from(submissions)
      .where(
        and(
          inArray(submissions.formId, formIds),
          gte(submissions.createdAt, startDate)
        )
      )
      .orderBy(submissions.createdAt);
  }
}
