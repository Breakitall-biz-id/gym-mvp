"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const chartData = [
  { date: "2024-04-01", checkins: 45, registrations: 8 },
  { date: "2024-04-02", checkins: 52, registrations: 12 },
  { date: "2024-04-03", checkins: 38, registrations: 5 },
  { date: "2024-04-04", checkins: 61, registrations: 15 },
  { date: "2024-04-05", checkins: 73, registrations: 18 },
  { date: "2024-04-06", checkins: 68, registrations: 14 },
  { date: "2024-04-07", checkins: 42, registrations: 9 },
  { date: "2024-04-08", checkins: 79, registrations: 22 },
  { date: "2024-04-09", checkins: 35, registrations: 6 },
  { date: "2024-04-10", checkins: 58, registrations: 11 },
  { date: "2024-04-11", checkins: 66, registrations: 16 },
  { date: "2024-04-12", checkins: 54, registrations: 13 },
  { date: "2024-04-13", checkins: 71, registrations: 19 },
  { date: "2024-04-14", checkins: 41, registrations: 8 },
  { date: "2024-04-15", checkins: 47, registrations: 10 },
  { date: "2024-04-16", checkins: 49, registrations: 12 },
  { date: "2024-04-17", checkins: 82, registrations: 25 },
  { date: "2024-04-18", checkins: 76, registrations: 21 },
  { date: "2024-04-19", checkins: 55, registrations: 14 },
  { date: "2024-04-20", checkins: 39, registrations: 7 },
  { date: "2024-04-21", checkins: 46, registrations: 9 },
  { date: "2024-04-22", checkins: 63, registrations: 17 },
  { date: "2024-04-23", checkins: 48, registrations: 11 },
  { date: "2024-04-24", checkins: 77, registrations: 20 },
  { date: "2024-04-25", checkins: 59, registrations: 15 },
  { date: "2024-04-26", checkins: 33, registrations: 5 },
  { date: "2024-04-27", checkins: 84, registrations: 26 },
  { date: "2024-04-28", checkins: 43, registrations: 8 },
  { date: "2024-04-29", checkins: 69, registrations: 18 },
  { date: "2024-04-30", checkins: 91, registrations: 28 },
  { date: "2024-05-01", checkins: 56, registrations: 13 },
  { date: "2024-05-02", checkins: 74, registrations: 19 },
  { date: "2024-05-03", checkins: 62, registrations: 16 },
  { date: "2024-05-04", checkins: 88, registrations: 24 },
  { date: "2024-05-05", checkins: 95, registrations: 30 },
  { date: "2024-05-06", checkins: 102, registrations: 35 },
  { date: "2024-05-07", checkins: 78, registrations: 22 },
  { date: "2024-05-08", checkins: 51, registrations: 12 },
  { date: "2024-05-09", checkins: 64, registrations: 17 },
  { date: "2024-05-10", checkins: 71, registrations: 20 },
  { date: "2024-05-11", checkins: 83, registrations: 25 },
  { date: "2024-05-12", checkins: 67, registrations: 18 },
  { date: "2024-05-13", checkins: 57, registrations: 14 },
  { date: "2024-05-14", checkins: 96, registrations: 32 },
  { date: "2024-05-15", checkins: 89, registrations: 27 },
  { date: "2024-05-16", checkins: 72, registrations: 21 },
  { date: "2024-05-17", checkins: 98, registrations: 31 },
  { date: "2024-05-18", checkins: 75, registrations: 23 },
  { date: "2024-05-19", checkins: 58, registrations: 15 },
  { date: "2024-05-20", checkins: 65, registrations: 17 },
  { date: "2024-05-21", checkins: 44, registrations: 9 },
  { date: "2024-05-22", checkins: 42, registrations: 8 },
  { date: "2024-05-23", checkins: 73, registrations: 22 },
  { date: "2024-05-24", checkins: 68, registrations: 19 },
  { date: "2024-05-25", checkins: 61, registrations: 16 },
  { date: "2024-05-26", checkins: 54, registrations: 13 },
  { date: "2024-05-27", checkins: 86, registrations: 26 },
  { date: "2024-05-28", checkins: 59, registrations: 15 },
  { date: "2024-05-29", checkins: 37, registrations: 6 },
  { date: "2024-05-30", checkins: 79, registrations: 24 },
  { date: "2024-05-31", checkins: 63, registrations: 17 },
  { date: "2024-06-01", checkins: 66, registrations: 18 },
  { date: "2024-06-02", checkins: 92, registrations: 29 },
  { date: "2024-06-03", checkins: 48, registrations: 11 },
  { date: "2024-06-04", checkins: 87, registrations: 25 },
  { date: "2024-06-05", checkins: 41, registrations: 7 },
  { date: "2024-06-06", checkins: 70, registrations: 20 },
  { date: "2024-06-07", checkins: 81, registrations: 23 },
  { date: "2024-06-08", checkins: 77, registrations: 22 },
  { date: "2024-06-09", checkins: 94, registrations: 31 },
  { date: "2024-06-10", checkins: 53, registrations: 12 },
  { date: "2024-06-11", checkins: 45, registrations: 9 },
  { date: "2024-06-12", checkins: 99, registrations: 33 },
  { date: "2024-06-13", checkins: 40, registrations: 8 },
  { date: "2024-06-14", checkins: 85, registrations: 26 },
  { date: "2024-06-15", checkins: 74, registrations: 21 },
  { date: "2024-06-16", checkins: 80, registrations: 24 },
  { date: "2024-06-17", checkins: 101, registrations: 34 },
  { date: "2024-06-18", checkins: 49, registrations: 11 },
  { date: "2024-06-19", checkins: 76, registrations: 22 },
  { date: "2024-06-20", checkins: 90, registrations: 28 },
  { date: "2024-06-21", checkins: 56, registrations: 14 },
  { date: "2024-06-22", checkins: 72, registrations: 20 },
  { date: "2024-06-23", checkins: 103, registrations: 36 },
  { date: "2024-06-24", checkins: 52, registrations: 13 },
  { date: "2024-06-25", checkins: 58, registrations: 15 },
  { date: "2024-06-26", checkins: 88, registrations: 27 },
  { date: "2024-06-27", checkins: 96, registrations: 32 },
  { date: "2024-06-28", checkins: 61, registrations: 16 },
  { date: "2024-06-29", checkins: 47, registrations: 10 },
  { date: "2024-06-30", checkins: 93, registrations: 30 },
];

const chartConfig = {
  activity: {
    label: "Activity",
  },
  checkins: {
    label: "Check-ins",
    color: "#B8FF00",
  },
  registrations: {
    label: "New Members",
    color: "#A3E600",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Member Activity</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            Daily check-ins and new registrations
          </span>
          <span className="@[540px]/card:hidden">Activity overview</span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="90d" className="h-8 px-2.5">
              Last 3 months
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5">
              Last 30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5">
              Last 7 days
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="@[767px]/card:hidden flex w-40"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillCheckins" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-checkins)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-checkins)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fillRegistrations"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-registrations)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-registrations)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="registrations"
              type="natural"
              fill="url(#fillRegistrations)"
              stroke="var(--color-registrations)"
              stackId="a"
            />
            <Area
              dataKey="checkins"
              type="natural"
              fill="url(#fillCheckins)"
              stroke="var(--color-checkins)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
