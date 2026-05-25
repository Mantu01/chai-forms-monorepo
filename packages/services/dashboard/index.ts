import { DashboardQuery, WorkspaceQuery, FormQuery } from "@repo/database/queries";
import { forms, inArray, db } from "@repo/database";

export class DashboardService {
  private readonly dashboardQuery = new DashboardQuery();
  private readonly workspaceQuery = new WorkspaceQuery();
  private readonly formQuery = new FormQuery();

  public async getDashboardData(userId: string) {
    const userWorkspaces = await this.workspaceQuery.getUserWorkspaces(userId);
    const workspaceIds = userWorkspaces.map((uw) => uw.workspace.id);

    const stats = await this.dashboardQuery.getDashboardStats(workspaceIds);
    const recentForms = await this.dashboardQuery.getRecentPublishedForms(workspaceIds, 3);
    const recentComments = await this.dashboardQuery.getRecentComments(workspaceIds, 3);

    return {
      stats,
      recentForms,
      recentComments,
    };
  }

  public async getAllUserForms(userId: string) {
    const userWorkspaces = await this.workspaceQuery.getUserWorkspaces(userId);
    const workspaceIds = userWorkspaces.map((uw) => uw.workspace.id);
    if (!workspaceIds.length) return [];

    const formsList = await db
      .select({
        id: forms.id,
        title: forms.title,
        workspaceId: forms.workspaceId,
      })
      .from(forms)
      .where(inArray(forms.workspaceId, workspaceIds));

    return formsList.map((f) => {
      const ws = userWorkspaces.find((uw) => uw.workspace.id === f.workspaceId);
      return {
        id: f.id,
        title: f.title,
        workspaceName: ws?.workspace.name || "Unknown Workspace",
      };
    });
  }

  public async getGraphData(userId: string, input: {
    timeRange: "90d" | "30d" | "7d";
    type: "workspace" | "form";
    selectedIds: string[];
  }) {
    const userWorkspaces = await this.workspaceQuery.getUserWorkspaces(userId);
    const workspaceIds = userWorkspaces.map((uw) => uw.workspace.id);

    if (input.selectedIds.length === 0) {
      return [];
    }

    const days = input.timeRange === "7d" ? 7 : input.timeRange === "30d" ? 30 : 90;
    const now = new Date();

    const dateLabels: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dateLabels.push(d.toISOString().split("T")[0]!);
    }

    if (input.type === "workspace") {
      const selectedWorkspaces = userWorkspaces.filter((uw) =>
        input.selectedIds.includes(uw.workspace.id)
      );

      const seriesData: Array<any> = dateLabels.map((date) => {
        const item: any = { date };
        for (const uw of selectedWorkspaces) {
          item[uw.workspace.name] = 0;
        }
        return item;
      });

      for (const uw of selectedWorkspaces) {
        const formsList = await this.formQuery.getFormsByWorkspace(uw.workspace.id);
        const formIds = formsList.map((f) => f.id);
        if (formIds.length > 0) {
          const subs = await this.dashboardQuery.getSubmissionsTimeSeries(formIds, days);
          for (const s of subs) {
            if (s.createdAt) {
              const dateStr = s.createdAt.toISOString().split("T")[0]!;
              const targetRow = seriesData.find((row) => row.date === dateStr);
              if (targetRow) {
                targetRow[uw.workspace.name] = (targetRow[uw.workspace.name] || 0) + 1;
              }
            }
          }
        }
      }

      return seriesData;
    } else {
      const formsList = await this.formQuery.getManyFormsByIds(input.selectedIds);
      const allowedForms = formsList.filter((f) => workspaceIds.includes(f.workspaceId));

      const seriesData: Array<any> = dateLabels.map((date) => {
        const item: any = { date };
        for (const f of allowedForms) {
          item[f.title] = 0;
        }
        return item;
      });

      for (const f of allowedForms) {
        const subs = await this.dashboardQuery.getSubmissionsTimeSeries([f.id], days);
        for (const s of subs) {
          if (s.createdAt) {
            const dateStr = s.createdAt.toISOString().split("T")[0]!;
            const targetRow = seriesData.find((row) => row.date === dateStr);
            if (targetRow) {
              targetRow[f.title] = (targetRow[f.title] || 0) + 1;
            }
          }
        }
      }

      return seriesData;
    }
  }
}
