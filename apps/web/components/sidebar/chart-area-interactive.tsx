"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

import { useIsMobile } from "~/hooks/use-mobile"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "~/components/ui/toggle-group"

export const description = "Interactive visitors analytics chart"

const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150,tablet:342 },
  { date: "2024-04-02", desktop: 97, mobile: 180,tablet:342 },
  { date: "2024-04-03", desktop: 167, mobile: 120,tablet:342 },
  { date: "2024-04-04", desktop: 242, mobile: 260,tablet:342 },
  { date: "2024-04-05", desktop: 373, mobile: 290,tablet:342 },
  { date: "2024-04-06", desktop: 301, mobile: 340,tablet:342 },
  { date: "2024-04-07", desktop: 245, mobile: 180,tablet:342 },
  { date: "2024-04-08", desktop: 409, mobile: 320,tablet:342 },
  { date: "2024-04-09", desktop: 59, mobile: 110,tablet:342 },
  { date: "2024-04-10", desktop: 261, mobile: 190,tablet:342 },
  { date: "2024-04-11", desktop: 327, mobile: 350,tablet:342 },
  { date: "2024-04-12", desktop: 292, mobile: 210,tablet:342 },
  { date: "2024-04-13", desktop: 342, mobile: 380,tablet:342 },
  { date: "2024-04-14", desktop: 137, mobile: 220,tablet:342 },
  { date: "2024-04-15", desktop: 120, mobile: 170,tablet:342 },
  { date: "2024-04-16", desktop: 138, mobile: 190,tablet:342 },
  { date: "2024-04-17", desktop: 446, mobile: 360,tablet:342 },
  { date: "2024-04-18", desktop: 364, mobile: 410,tablet:342 },
  { date: "2024-04-19", desktop: 243, mobile: 180,tablet:342 },
  { date: "2024-04-20", desktop: 89, mobile: 150,tablet:342 },
  { date: "2024-04-21", desktop: 137, mobile: 200,tablet:342 },
  { date: "2024-04-22", desktop: 224, mobile: 170,tablet:342 },
  { date: "2024-04-23", desktop: 138, mobile: 230,tablet:342 },
  { date: "2024-04-24", desktop: 387, mobile: 290,tablet:342 },
  { date: "2024-04-25", desktop: 215, mobile: 250,tablet:342 },
  { date: "2024-04-26", desktop: 75, mobile: 130,tablet:342 },
  { date: "2024-04-27", desktop: 383, mobile: 420,tablet:342 },
  { date: "2024-04-28", desktop: 122, mobile: 180,tablet:342 },
  { date: "2024-04-29", desktop: 315, mobile: 240,tablet:342 },
  { date: "2024-04-30", desktop: 454, mobile: 380,tablet:342 },
  { date: "2024-05-01", desktop: 165, mobile: 220,tablet:342 },
  { date: "2024-05-02", desktop: 293, mobile: 310,tablet:342 },
  { date: "2024-05-03", desktop: 247, mobile: 190,tablet:342 },
  { date: "2024-05-04", desktop: 385, mobile: 420,tablet:342 },
  { date: "2024-05-05", desktop: 481, mobile: 390,tablet:342 },
  { date: "2024-05-06", desktop: 498, mobile: 520,tablet:342 },
  { date: "2024-05-07", desktop: 388, mobile: 300,tablet:342 },
  { date: "2024-05-08", desktop: 149, mobile: 210,tablet:342 },
  { date: "2024-05-09", desktop: 227, mobile: 180,tablet:342 },
  { date: "2024-05-10", desktop: 293, mobile: 330,tablet:342 },
  { date: "2024-05-11", desktop: 335, mobile: 270,tablet:342 },
  { date: "2024-05-12", desktop: 197, mobile: 240,tablet:342 },
  { date: "2024-05-13", desktop: 197, mobile: 160,tablet:342 },
  { date: "2024-05-14", desktop: 448, mobile: 490,tablet:342 },
  { date: "2024-05-15", desktop: 473, mobile: 380,tablet:342 },
  { date: "2024-05-16", desktop: 338, mobile: 400,tablet:342 },
  { date: "2024-05-17", desktop: 499, mobile: 420,tablet:342 },
  { date: "2024-05-18", desktop: 315, mobile: 350,tablet:342 },
  { date: "2024-05-19", desktop: 235, mobile: 180,tablet:342 },
  { date: "2024-05-20", desktop: 177, mobile: 230,tablet:342 },
  { date: "2024-05-21", desktop: 82, mobile: 140,tablet:342 },
  { date: "2024-05-22", desktop: 81, mobile: 120,tablet:342 },
  { date: "2024-05-23", desktop: 252, mobile: 290,tablet:2 },
  { date: "2024-05-24", desktop: 294, mobile: 220,tablet:342 },
  { date: "2024-05-25", desktop: 201, mobile: 250,tablet:342 },
  { date: "2024-05-26", desktop: 213, mobile: 170,tablet:342 },
  { date: "2024-05-27", desktop: 420, mobile: 460,tablet:342 },
  { date: "2024-05-28", desktop: 233, mobile: 190,tablet:342 },
  { date: "2024-05-29", desktop: 78, mobile: 130,tablet:342 },
  { date: "2024-05-30", desktop: 340, mobile: 280,tablet:342 },
  { date: "2024-05-31", desktop: 178, mobile: 230,tablet:342 },
  { date: "2024-06-01", desktop: 178, mobile: 200,tablet:342 },
  { date: "2024-06-02", desktop: 470, mobile: 410,tablet:742 },
  { date: "2024-06-03", desktop: 103, mobile: 160,tablet:342 },
  { date: "2024-06-04", desktop: 439, mobile: 380,tablet:342 },
  { date: "2024-06-05", desktop: 88, mobile: 140,tablet:342 },
  { date: "2024-06-06", desktop: 294, mobile: 250,tablet:342 },
  { date: "2024-06-07", desktop: 323, mobile: 370,tablet:342 },
  { date: "2024-06-08", desktop: 385, mobile: 320,tablet:342 },
  { date: "2024-06-09", desktop: 438, mobile: 480,tablet:342 },
  { date: "2024-06-10", desktop: 155, mobile: 200,tablet:342 },
  { date: "2024-06-11", desktop: 92, mobile: 150,tablet:342 },
  { date: "2024-06-12", desktop: 492, mobile: 420,tablet:42 },
  { date: "2024-06-13", desktop: 81, mobile: 130,tablet:342 },
  { date: "2024-06-14", desktop: 426, mobile: 380,tablet:342 },
  { date: "2024-06-15", desktop: 307, mobile: 350,tablet:342 },
  { date: "2024-06-16", desktop: 371, mobile: 310,tablet:342 },
  { date: "2024-06-17", desktop: 475, mobile: 520,tablet:342 },
  { date: "2024-06-18", desktop: 107, mobile: 170,tablet:342 },
  { date: "2024-06-19", desktop: 341, mobile: 290,tablet:342 },
  { date: "2024-06-20", desktop: 408, mobile: 450,tablet:342 },
  { date: "2024-06-21", desktop: 169, mobile: 210,tablet:842 },
  { date: "2024-06-22", desktop: 317, mobile: 270,tablet:642 },
  { date: "2024-06-23", desktop: 480, mobile: 530,tablet:142 },
  { date: "2024-06-24", desktop: 132, mobile: 180,tablet:342 },
  { date: "2024-06-25", desktop: 141, mobile: 190,tablet:382 },
  { date: "2024-06-26", desktop: 434, mobile: 380,tablet:362 },
  { date: "2024-06-27", desktop: 448, mobile: 490,tablet:342 },
  { date: "2024-06-28", desktop: 149, mobile: 200,tablet:32 },
  { date: "2024-06-29", desktop: 103, mobile: 160,tablet:342 },
  { date: "2024-06-30", desktop: 446, mobile: 400,tablet:342 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#10b981",
  },
  tablet: {
    label: "Tablet",
    color: "#f59e0b",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()

  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date("2024-04-12")

    let daysToSubtract = 90

    if (timeRange === "30d") {
      daysToSubtract = 30
    }

    if (timeRange === "7d") {
      daysToSubtract = 7
    }

    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return chartData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate
    })
  }, [timeRange])

  return (
    <Card className="@container/card border-none shadow-sm">
      <CardHeader className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-xl font-semibold">
            Total Visitors
          </CardTitle>

          <CardDescription className="mt-1">
            Visitor analytics across desktop, mobile and tablet
          </CardDescription>
        </div>

        <CardAction>
          {/* Desktop Toggle */}
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => value && setTimeRange(value)}
            variant="outline"
            className="hidden @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">
              Last 3 months
            </ToggleGroupItem>

            <ToggleGroupItem value="30d">
              Last 30 days
            </ToggleGroupItem>

            <ToggleGroupItem value="7d">
              Last 7 days
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Mobile Select */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              size="sm"
              aria-label="Select range"
              className="w-40 @[767px]/card:hidden"
            >
              <SelectValue placeholder="Select range" />
            </SelectTrigger>

            <SelectContent className="rounded-xl">
              <SelectItem value="90d">
                Last 3 months
              </SelectItem>

              <SelectItem value="30d">
                Last 30 days
              </SelectItem>

              <SelectItem value="7d">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-6 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="h-95 w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{
                left: 12,
                right: 12,
                top: 10,
                bottom: 0,
              }}
            >
              <defs>
                {/* Desktop */}
                <linearGradient
                  id="fillDesktop"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={chartConfig.desktop.color}
                    stopOpacity={0.4}
                  />

                  <stop
                    offset="95%"
                    stopColor={chartConfig.desktop.color}
                    stopOpacity={0.05}
                  />
                </linearGradient>

                {/* Mobile */}
                <linearGradient
                  id="fillMobile"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={chartConfig.mobile.color}
                    stopOpacity={0.4}
                  />

                  <stop
                    offset="95%"
                    stopColor={chartConfig.mobile.color}
                    stopOpacity={0.05}
                  />
                </linearGradient>

                {/* Tablet */}
                <linearGradient
                  id="fillTablet"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={chartConfig.tablet.color}
                    stopOpacity={0.4}
                  />

                  <stop
                    offset="95%"
                    stopColor={chartConfig.tablet.color}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-muted"
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={24}
                tickFormatter={(value) => {
                  return new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={40}
              />

              <ChartTooltip
                cursor={{
                  stroke: "#94a3b8",
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

              <Legend />

              {/* Mobile */}
              <Area
                type="monotone"
                dataKey="mobile"
                stroke={chartConfig.mobile.color}
                fill="url(#fillMobile)"
                strokeWidth={3}
                activeDot={{ r: 6 }}
              />

              {/* Desktop */}
              <Area
                type="monotone"
                dataKey="desktop"
                stroke={chartConfig.desktop.color}
                fill="url(#fillDesktop)"
                strokeWidth={3}
                activeDot={{ r: 6 }}
              />

              {/* Tablet */}
              <Area
                type="monotone"
                dataKey="tablet"
                stroke={chartConfig.tablet.color}
                fill="url(#fillTablet)"
                strokeWidth={3}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}