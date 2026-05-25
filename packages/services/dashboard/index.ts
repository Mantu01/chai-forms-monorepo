import { DashboardQuery } from "@repo/database/queries";

export class DashboardService {
  constructor(private readonly dashboardQuery = new DashboardQuery()) {}

  public async getDashboardStats(userId: string) {
    if (!userId) throw new Error("User id is required");

    const workspaceIds = await this.dashboardQuery.getUserWorkspaceIds(userId);
    if (!workspaceIds.length) {
      return {
        totalForms: 0,
        activeForms: 0,
        submissionsLastMonth: 0,
        submissionsPrevMonth: 0,
        submissionRateLastMonth: 0,
        submissionRatePrevMonth: 0,
      };
    }

    const formsStats = await this.dashboardQuery.getFormsStats(workspaceIds);

    const now = new Date();
    const lastMonthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const prevMonthStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const lastMonthStats = await this.dashboardQuery.getSubmissionsStats(workspaceIds, lastMonthStart, now);
    const prevMonthStats = await this.dashboardQuery.getSubmissionsStats(workspaceIds, prevMonthStart, lastMonthStart);

    const submissionRateLastMonth = lastMonthStats.total > 0
      ? Math.round((lastMonthStats.completed / lastMonthStats.total) * 100)
      : 0;

    const submissionRatePrevMonth = prevMonthStats.total > 0
      ? Math.round((prevMonthStats.completed / prevMonthStats.total) * 100)
      : 0;

    return {
      totalForms: formsStats.totalForms,
      activeForms: formsStats.activeForms,
      submissionsLastMonth: lastMonthStats.total,
      submissionsPrevMonth: prevMonthStats.total,
      submissionRateLastMonth,
      submissionRatePrevMonth,
    };
  }

  public async getDashboardTimeSeries(userId: string, input: { workspaceIds?: string[]; formIds?: string[]; timeframe: "7d" | "30d" | "90d" }) {
    if (!userId) throw new Error("User id is required");

    const userWorkspaceIds = await this.dashboardQuery.getUserWorkspaceIds(userId);
    if (!userWorkspaceIds.length) return [];

    let targetWorkspaceIds = input.workspaceIds || [];
    let targetFormIds = input.formIds || [];

    if (targetWorkspaceIds.length === 0 && targetFormIds.length === 0) {
      targetWorkspaceIds = userWorkspaceIds;
    } else if (targetWorkspaceIds.length > 0) {
      targetWorkspaceIds = targetWorkspaceIds.filter((id) => userWorkspaceIds.includes(id));
    }

    let days = 7;
    if (input.timeframe === "30d") days = 30;
    if (input.timeframe === "90d") days = 90;

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);

    const subs = await this.dashboardQuery.getSubmissionsTimeSeries(targetWorkspaceIds, targetFormIds, startDate, now);

    const dateMap = new Map<string, number>();
    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      if (dateStr) {
        dateMap.set(dateStr, 0);
      }
    }

    for (const sub of subs) {
      if (sub.createdAt) {
        const dateStr = new Date(sub.createdAt).toISOString().split("T")[0];
        if (dateStr && dateMap.has(dateStr)) {
          dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
        }
      }
    }

    const result: Array<{ date: string; count: number }> = [];
    dateMap.forEach((count, date) => {
      result.push({ date, count });
    });

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  public async getDashboardFooter(userId: string) {
    if (!userId) throw new Error("User id is required");

    const workspaceIds = await this.dashboardQuery.getUserWorkspaceIds(userId);
    if (!workspaceIds.length) {
      return {
        recentPublishedForms: [],
        latestComments: [],
      };
    }

    const recentPublishedForms = await this.dashboardQuery.getRecentPublishedForms(workspaceIds, 3);
    const latestComments = await this.dashboardQuery.getLatestComments(workspaceIds, 3);

    return {
      recentPublishedForms,
      latestComments,
    };
  }
}
