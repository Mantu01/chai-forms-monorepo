"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "~/trpc/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Spinner } from "~/components/ui/spinner";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import {
  FileText,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Calendar,
  Layers,
  CheckSquare
} from "lucide-react";

export default function DashboardPage() {
  const queryClient = useQueryClient();

  const { data: selectionType } = useQuery({
    queryKey: ["dashboardSelectionType"],
    queryFn: () => "workspace",
    initialData: "workspace",
  });

  const { data: timeframe } = useQuery({
    queryKey: ["dashboardTimeframe"],
    queryFn: () => "30d" as "7d" | "30d" | "90d",
    initialData: "30d" as "7d" | "30d" | "90d",
  });

  const { data: selectedWorkspaceIds } = useQuery({
    queryKey: ["dashboardSelectedWorkspaces"],
    queryFn: () => ([] as string[]),
    initialData: ([] as string[]),
  });

  const { data: selectedFormIds } = useQuery({
    queryKey: ["dashboardSelectedForms"],
    queryFn: () => ([] as string[]),
    initialData: ([] as string[]),
  });

  const { data: stats, isLoading: statsLoading } = trpc.dashboard.getStats.useQuery();
  const { data: footer, isLoading: footerLoading } = trpc.dashboard.getFooter.useQuery();
  const { data: workspaces, isLoading: workspacesLoading } = trpc.workspace.getUserWorkspaces.useQuery({});

  const { data: workspaceForms } = trpc.form.getFormsByWorkspace.useQuery(
    { workspaceId: selectedWorkspaceIds[0] || "" },
    { enabled: selectedWorkspaceIds.length > 0 }
  );

  const { data: timeSeries, isLoading: chartLoading } = trpc.dashboard.getTimeSeries.useQuery({
    workspaceIds: selectionType === "workspace" ? selectedWorkspaceIds : [],
    formIds: selectionType === "form" ? selectedFormIds : [],
    timeframe,
  });

  const handleSelectionTypeToggle = (type: "workspace" | "form") => {
    queryClient.setQueryData(["dashboardSelectionType"], type);
    queryClient.setQueryData(["dashboardSelectedWorkspaces"], []);
    queryClient.setQueryData(["dashboardSelectedForms"], []);
  };

  const handleTimeframeToggle = (tf: "7d" | "30d" | "90d") => {
    queryClient.setQueryData(["dashboardTimeframe"], tf);
  };

  const handleWorkspaceToggle = (wId: string) => {
    const current = selectedWorkspaceIds;
    let next: string[];
    if (current.includes(wId)) {
      next = current.filter((id) => id !== wId);
    } else {
      next = [...current, wId].slice(0, 5);
    }
    queryClient.setQueryData(["dashboardSelectedWorkspaces"], next);
  };

  const handleFormToggle = (fId: string) => {
    const current = selectedFormIds;
    let next: string[];
    if (current.includes(fId)) {
      next = current.filter((id) => id !== fId);
    } else {
      next = [...current, fId].slice(0, 5);
    }
    queryClient.setQueryData(["dashboardSelectedForms"], next);
  };

  if (statsLoading || footerLoading || workspacesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Spinner />
      </div>
    );
  }

  const submissionsChange = stats && stats.submissionsPrevMonth > 0
    ? Math.round(((stats.submissionsLastMonth - stats.submissionsPrevMonth) / stats.submissionsPrevMonth) * 100)
    : 0;

  const rateChange = stats
    ? stats.submissionRateLastMonth - stats.submissionRatePrevMonth
    : 0;

  const allFormsList = workspaceForms || [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-5">
        <div className="space-y-1">
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Live Dashboard Analytics
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            System Overview
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Monitor real-time responses, form conversions, and collaborative workspace feedback metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-2xs font-semibold text-zinc-400 font-mono">SUBMISSIONS (30D)</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-xl font-bold text-white">{stats?.submissionsLastMonth ?? 0}</div>
            <div className="flex items-center gap-1 text-[10px]">
              {submissionsChange >= 0 ? (
                <span className="text-emerald-450 flex items-center">
                  <ArrowUpRight className="h-3 w-3" />
                  +{submissionsChange}%
                </span>
              ) : (
                <span className="text-red-450 flex items-center">
                  <ArrowDownRight className="h-3 w-3" />
                  {submissionsChange}%
                </span>
              )}
              <span className="text-zinc-550">vs previous 30 days</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-2xs font-semibold text-zinc-400 font-mono">TOTAL FORMS</span>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-xl font-bold text-white">{stats?.totalForms ?? 0}</div>
            <div className="text-[10px] text-zinc-550">Across all collaborative environments</div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-2xs font-semibold text-zinc-400 font-mono">ACTIVE FORMS</span>
            <CheckSquare className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-xl font-bold text-white">{stats?.activeForms ?? 0}</div>
            <div className="text-[10px] text-zinc-550">Published forms accepting submissions</div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-2xs font-semibold text-zinc-400 font-mono">COMPLETION RATE</span>
            <TrendingUp className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-xl font-bold text-white">{stats?.submissionRateLastMonth ?? 0}%</div>
            <div className="flex items-center gap-1 text-[10px]">
              {rateChange >= 0 ? (
                <span className="text-emerald-450 flex items-center">
                  <ArrowUpRight className="h-3 w-3" />
                  +{rateChange}%
                </span>
              ) : (
                <span className="text-red-450 flex items-center">
                  <ArrowDownRight className="h-3 w-3" />
                  {rateChange}%
                </span>
              )}
              <span className="text-zinc-550">vs last month conversion</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-800/60">
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" />
              Submissions Trend Visualization
            </CardTitle>
            <CardDescription className="text-2xs text-zinc-450">
              Filter by specific workspaces or select individual forms to compare performance indexes.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-zinc-950 p-1 border border-zinc-850 rounded-xl">
              <Button
                variant={selectionType === "workspace" ? "default" : "ghost"}
                size="xs"
                onClick={() => handleSelectionTypeToggle("workspace")}
                className="h-7 text-3xs rounded-lg font-semibold px-3"
              >
                Workspaces
              </Button>
              <Button
                variant={selectionType === "form" ? "default" : "ghost"}
                size="xs"
                onClick={() => handleSelectionTypeToggle("form")}
                className="h-7 text-3xs rounded-lg font-semibold px-3"
              >
                Forms
              </Button>
            </div>

            <div className="flex bg-zinc-950 p-1 border border-zinc-850 rounded-xl">
              {(["7d", "30d", "90d"] as const).map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? "default" : "ghost"}
                  size="xs"
                  onClick={() => handleTimeframeToggle(tf)}
                  className="h-7 text-3xs rounded-lg font-semibold px-2.5 uppercase"
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 border-r border-zinc-800/60 pr-4 space-y-3.5">
              <span className="text-3xs font-bold text-zinc-450 tracking-wider uppercase block">
                {selectionType === "workspace" ? "AVAILABLE WORKSPACES" : "AVAILABLE FORMS"}
              </span>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {selectionType === "workspace" ? (
                  (workspaces || []).map((w) => {
                    const isChecked = selectedWorkspaceIds.includes(w.workspace.id);
                    return (
                      <Button
                        key={w.workspace.id}
                        variant={isChecked ? "default" : "outline"}
                        onClick={() => handleWorkspaceToggle(w.workspace.id)}
                        className="w-full justify-start h-8 text-3xs rounded-xl"
                      >
                        {w.workspace.name}
                      </Button>
                    );
                  })
                ) : (
                  <>
                    <select
                      onChange={(e) => {
                        queryClient.setQueryData(["dashboardSelectedWorkspaces"], [e.target.value]);
                        queryClient.setQueryData(["dashboardSelectedForms"], []);
                      }}
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-800 bg-zinc-950 text-white text-3xs focus:outline-none mb-3 cursor-pointer"
                    >
                      <option value="" disabled selected>
                        Select Workspace first
                      </option>
                      {(workspaces || []).map((w) => (
                        <option key={w.workspace.id} value={w.workspace.id}>
                          {w.workspace.name}
                        </option>
                      ))}
                    </select>
                    {allFormsList.map((f) => {
                      const isChecked = selectedFormIds.includes(f.id);
                      return (
                        <Button
                          key={f.id}
                          variant={isChecked ? "default" : "outline"}
                          onClick={() => handleFormToggle(f.id)}
                          className="w-full justify-start h-8 text-3xs rounded-xl"
                        >
                          {f.title}
                        </Button>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            <div className="md:col-span-3 flex flex-col justify-center min-h-[250px]">
              {chartLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Spinner />
                </div>
              ) : (selectionType === "workspace" && selectedWorkspaceIds.length === 0) ||
                (selectionType === "form" && selectedFormIds.length === 0) ? (
                <div className="text-center py-10 text-zinc-550 text-xs font-medium space-y-1">
                  <Layers className="h-8 w-8 mx-auto mb-2 text-zinc-650" />
                  <p>Select the data source for visualization</p>
                  <p className="text-[10px] text-zinc-700">Choose at least one workspace or form on the left</p>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "12px" }}
                        labelStyle={{ color: "#a1a1aa", fontSize: "9px" }}
                        itemStyle={{ color: "#ffffff", fontSize: "10px" }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md">
          <CardHeader className="border-b border-zinc-800/60 pb-3">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-emerald-500" />
              Recently Published Forms
            </CardTitle>
            <CardDescription className="text-3xs text-zinc-450">
              Up to three recently featured workspace structures.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {!footer?.recentPublishedForms || footer.recentPublishedForms.length === 0 ? (
              <p className="text-3xs text-zinc-550 text-center py-6">No published forms found in active spaces.</p>
            ) : (
              footer.recentPublishedForms.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-900/60 bg-zinc-950/40">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-zinc-200 truncate">{f.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-550">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-3 w-3 text-zinc-650" />
                        {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "N/A"}
                      </span>
                      <span>•</span>
                      <span>By {f.creatorName || "Anonymous"}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-3xs px-2.5 py-0.5 border-zinc-850 font-mono text-zinc-350">
                    {f.submissionsCount} submissions
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md">
          <CardHeader className="border-b border-zinc-800/60 pb-3">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-amber-500" />
              Latest Discussion Feed
            </CardTitle>
            <CardDescription className="text-3xs text-zinc-450">
              Community reviews and collaborative requests across environments.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {!footer?.latestComments || footer.latestComments.length === 0 ? (
              <p className="text-3xs text-zinc-550 text-center py-6">No discussions received on public forms yet.</p>
            ) : (
              footer.latestComments.map((c: any) => {
                const displayName = c.userFullName || c.guestName || "Anonymous";
                return (
                  <div key={c.id} className="flex gap-3 p-3 rounded-xl border border-zinc-900/60 bg-zinc-950/40">
                    <Avatar className="h-7 w-7 ring-1 ring-zinc-800">
                      {c.userProfileImageUrl && <AvatarImage src={c.userProfileImageUrl} />}
                      <AvatarFallback className="text-[10px] bg-zinc-850 text-zinc-400">
                        {displayName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-200">{displayName}</span>
                        <span className="text-[9px] text-zinc-550">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-350 truncate">{c.content}</p>
                      <p className="text-[9px] text-amber-450 font-mono">Form: {c.formTitle}</p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}