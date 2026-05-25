"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { ChartAreaInteractive } from "~/components/sidebar/chart-area-interactive";
import { DataTable } from "~/components/sidebar/data-table";
import { SectionCards } from "~/components/sidebar/section-cards";
import data from "../../../data.json";

interface AnalyticsPageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { workspaceSlug } = use(params);
  const searchParams = useSearchParams();
  const activeType = searchParams.get("type") || "overview";

  return (
    <div className="flex flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <div className="space-y-0.5">
        <h2 className="text-xl font-bold tracking-tight">Workspace Analytics</h2>
        <p className="text-xs text-muted-foreground">
          Performance and responses metrics for workspace: <span className="font-mono text-[11px] text-foreground">{workspaceSlug}</span>
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {activeType === "overview" && (
          <div className="flex flex-col gap-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
          </div>
        )}

        {activeType === "submissions" && (
          <div className="flex flex-col gap-6">
            <DataTable data={data} />
          </div>
        )}

        {activeType === "device" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border/80 bg-card/50 p-6 rounded-xl shadow-xs flex flex-col gap-2">
              <span className="text-xs text-muted-foreground font-medium">Desktop Visitors</span>
              <span className="text-2xl font-bold">64.2%</span>
              <span className="text-[10px] text-emerald-500 font-medium">↑ 2.4% from last week</span>
            </div>
            <div className="border border-border/80 bg-card/50 p-6 rounded-xl shadow-xs flex flex-col gap-2">
              <span className="text-xs text-muted-foreground font-medium">Mobile Visitors</span>
              <span className="text-2xl font-bold">30.1%</span>
              <span className="text-[10px] text-emerald-500 font-medium">↑ 5.1% from last week</span>
            </div>
            <div className="border border-border/80 bg-card/50 p-6 rounded-xl shadow-xs flex flex-col gap-2">
              <span className="text-xs text-muted-foreground font-medium">Tablet Visitors</span>
              <span className="text-2xl font-bold">5.7%</span>
              <span className="text-[10px] text-destructive font-medium">↓ 0.8% from last week</span>
            </div>
          </div>
        )}

        {activeType === "country" && (
          <div className="border border-border/80 bg-card/50 p-6 rounded-xl shadow-xs space-y-4">
            <h3 className="text-sm font-semibold">Top Countries</h3>
            <div className="space-y-3">
              {[
                { name: "United States", share: "45%", count: "1,240 views" },
                { name: "India", share: "22%", count: "612 views" },
                { name: "United Kingdom", share: "12%", count: "330 views" },
                { name: "Germany", share: "8%", count: "216 views" },
                { name: "Others", share: "13%", count: "360 views" },
              ].map((c) => (
                <div key={c.name} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 border-border/40">
                  <span className="text-sm">{c.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold">{c.share}</span>
                    <span className="text-xs text-muted-foreground">{c.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
