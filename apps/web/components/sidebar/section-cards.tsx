"use client";

import React from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";

interface SectionCardsProps {
  stats?: {
    totalSubmissionsLastMonth: number;
    submissionsTrend: number;
    totalForms: number;
    activeForms: number;
    submissionRate: number;
    submissionRateTrend: number;
  };
}

export function SectionCards({ stats }: SectionCardsProps) {
  const totalSubmissions = stats?.totalSubmissionsLastMonth ?? 0;
  const submissionsTrend = stats?.submissionsTrend ?? 0;
  const totalForms = stats?.totalForms ?? 0;
  const activeForms = stats?.activeForms ?? 0;
  const submissionRate = stats?.submissionRate ?? 0;
  const submissionRateTrend = stats?.submissionRateTrend ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card bg-zinc-900/35 border-zinc-800">
        <CardHeader>
          <CardDescription className="text-zinc-400">Total Submissions (1m)</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-white">
            {totalSubmissions.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={`gap-1.5 px-2 py-0.5 rounded-full text-[10px] ${submissionsTrend >= 0 ? "text-emerald-450 border-emerald-500/20 bg-emerald-500/5" : "text-red-400 border-red-500/20 bg-red-500/5"}`}>
              {submissionsTrend >= 0 ? <IconTrendingUp className="size-3" /> : <IconTrendingDown className="size-3" />}
              {submissionsTrend >= 0 ? "+" : ""}{submissionsTrend.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-2xs text-zinc-500">
          <div className="flex gap-1.5 font-medium items-center">
            {submissionsTrend >= 0 ? "Trending up this month" : "Trending down this month"}
          </div>
          <div>Compared to the previous 30 days</div>
        </CardFooter>
      </Card>

      <Card className="@container/card bg-zinc-900/35 border-zinc-800">
        <CardHeader>
          <CardDescription className="text-zinc-400">Total Forms</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-white">
            {totalForms.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-2xs text-zinc-500">
          <div>Forms across all workspaces</div>
          <div>Both draft and published configurations</div>
        </CardFooter>
      </Card>

      <Card className="@container/card bg-zinc-900/35 border-zinc-800">
        <CardHeader>
          <CardDescription className="text-zinc-400">Active Forms</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-white">
            {activeForms.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-2xs text-zinc-500">
          <div>Forms set to published status</div>
          <div>Available for submission response capture</div>
        </CardFooter>
      </Card>

      <Card className="@container/card bg-zinc-900/35 border-zinc-800">
        <CardHeader>
          <CardDescription className="text-zinc-400">Submission Rate</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-white">
            {submissionRate.toFixed(1)}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={`gap-1.5 px-2 py-0.5 rounded-full text-[10px] ${submissionRateTrend >= 0 ? "text-emerald-450 border-emerald-500/20 bg-emerald-500/5" : "text-red-400 border-red-500/20 bg-red-500/5"}`}>
              {submissionRateTrend >= 0 ? <IconTrendingUp className="size-3" /> : <IconTrendingDown className="size-3" />}
              {submissionRateTrend >= 0 ? "+" : ""}{submissionRateTrend.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-2xs text-zinc-500">
          <div className="flex gap-1.5 font-medium items-center">
            {submissionRateTrend >= 0 ? "Rate increased from last period" : "Rate decreased from last period"}
          </div>
          <div>Ratio of completed submissions to total logs</div>
        </CardFooter>
      </Card>
    </div>
  );
}
