"use client";

import React, { Suspense } from "react";
import { ChartAreaInteractive } from "~/components/sidebar/chart-area-interactive";
import { SectionCards } from "~/components/sidebar/section-cards";
import { RecentActivity } from "~/components/sidebar/recent-activity";
import { Spinner } from "~/components/ui/spinner";
import { trpc } from "~/trpc/client";

export const dynamic = "force-dynamic";

function AnalyticsContent() {
  const { data: dashboardData, isLoading } = trpc.dashboard.getDashboardData.useQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-6 py-6">
        <SectionCards stats={dashboardData?.stats} />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <RecentActivity
          recentForms={dashboardData?.recentForms || []}
          recentComments={dashboardData?.recentComments || []}
        />
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-950 min-h-screen">
      <Suspense fallback={<div className="flex justify-center py-20"><Spinner /></div>}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}

export default DashboardPage;