"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { trpc } from "~/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import { BarChart3 } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export function ChartAreaInteractive() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const timeRange = (searchParams.get("timeRange") as "90d" | "30d" | "7d") || "90d";
  const type = (searchParams.get("type") as "workspace" | "form") || "workspace";
  const selectedIds = searchParams.get("selectedIds")?.split(",").filter(Boolean) || [];

  const { data: userWorkspaces } = trpc.workspace.getUserWorkspaces.useQuery({});
  const { data: allForms } = trpc.dashboard.getAllUserForms.useQuery(undefined, {
    enabled: type === "form",
  });

  const { data: graphData, isLoading } = trpc.dashboard.getGraphData.useQuery(
    {
      timeRange,
      type,
      selectedIds,
    },
    {
      enabled: selectedIds.length > 0,
    }
  );

  const handleTimeRangeChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("timeRange", val);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleTypeChange = (val: "workspace" | "form") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", val);
    params.delete("selectedIds");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleToggleId = (id: string) => {
    let newSelected = [...selectedIds];
    if (newSelected.includes(id)) {
      newSelected = newSelected.filter((x) => x !== id);
    } else {
      if (newSelected.length >= 5) {
        toast.error("You can select up to 5 items for visualization.");
        return;
      }
      newSelected.push(id);
    }

    const params = new URLSearchParams(searchParams.toString());
    if (newSelected.length > 0) {
      params.set("selectedIds", newSelected.join(","));
    } else {
      params.delete("selectedIds");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const activeKeys = graphData && graphData.length > 0 
    ? Object.keys(graphData[0]).filter((k) => k !== "date")
    : [];

  const chartConfig: any = {};
  activeKeys.forEach((key, index) => {
    chartConfig[key] = {
      label: key,
      color: COLORS[index % COLORS.length],
    };
  });

  return (
    <Card className="borderbackdrop-blur-md">
      <CardHeader className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Submission Trends
          </CardTitle>
          <CardDescription className="text-xs">
            Monitor submission flow reactively across workspaces or individual forms
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={type} onValueChange={(val: any) => handleTypeChange(val)}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Data Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="workspace">Workspaces</SelectItem>
              <SelectItem value="form">Forms</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Label className="text-xs font-semibold">
            Select up to 5 {type === "workspace" ? "workspaces" : "forms"}:
          </Label>
          
          <div className="flex flex-wrap gap-x-5 gap-y-2.5">
            {type === "workspace" && userWorkspaces?.map((uw) => {
              const isChecked = selectedIds.includes(uw.workspace.id);
              return (
                <div key={uw.workspace.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`ws-${uw.workspace.id}`}
                    checked={isChecked}
                    onCheckedChange={() => handleToggleId(uw.workspace.id)}
                    className=" data-[state=checked]:bg-primary"
                  />
                  <Label
                    htmlFor={`ws-${uw.workspace.id}`}
                    className="text-xs  cursor-pointer select-none"
                  >
                    {uw.workspace.name}
                  </Label>
                </div>
              );
            })}

            {type === "form" && allForms?.map((f) => {
              const isChecked = selectedIds.includes(f.id);
              return (
                <div key={f.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`form-${f.id}`}
                    checked={isChecked}
                    onCheckedChange={() => handleToggleId(f.id)}
                    className=" data-[state=checked]:bg-primary"
                  />
                  <Label
                    htmlFor={`form-${f.id}`}
                    className="text-xs  cursor-pointer select-none"
                  >
                    {f.title} <span className="text-[10px] text-zinc-550 font-mono">({f.workspaceName})</span>
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        {selectedIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-2xl text-center gap-3">
            <BarChart3 className="h-8 w-8 text-zinc-650" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-350">No Data Source Selected</p>
              <p className="text-[10px] text-zinc-500">Select at least one workspace or form above to visualize telemetry.</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-24 text-xs">
            Loading analytics graph...
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={graphData}
                margin={{
                  left: 0,
                  right: 10,
                  top: 10,
                  bottom: 0,
                }}
              >
                <defs>
                  {activeKeys.map((key, idx) => {
                    const color = COLORS[idx % COLORS.length];
                    return (
                      <linearGradient
                        key={key}
                        id={`fill-${key.replace(/\s+/g, "-")}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.01} />
                      </linearGradient>
                    );
                  })}
                </defs>

                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-zinc-800/60"
                />

                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  minTickGap={24}
                  className="text-[10px] fill-zinc-500"
                  tickFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  width={30}
                  className="text-[10px] fill-zinc-500"
                />

                <ChartTooltip
                  cursor={{
                    stroke: "#3f3f46",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      labelFormatter={(value: any) =>
                        new Date(value).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                  }
                />

                <Legend className="text-[11px]" />

                {activeKeys.map((key, idx) => {
                  const color = COLORS[idx % COLORS.length];
                  return (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={color}
                      fill={`url(#fill-${key.replace(/\s+/g, "-")})`}
                      strokeWidth={2}
                      activeDot={{ r: 4 }}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}