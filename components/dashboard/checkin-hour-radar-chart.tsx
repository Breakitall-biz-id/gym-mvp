"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const hourLabels = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

interface CheckinHourRadarChartProps {
  checkinHourDist?: number[];
  isLoading?: boolean;
}

export function CheckinHourRadarChart({
  checkinHourDist = [],
  isLoading,
}: CheckinHourRadarChartProps) {
  const data = (checkinHourDist || [])
    .map((count: number, i: number) => ({
      hour: hourLabels[i],
      count,
    }))
    .filter((d: { hour: string; count: number }) => d.count > 0);

  return (
    <Card className="@container/card bg-white/10 border border-white/10 shadow-xl backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base font-semibold">
          Check-in Hour Distribution
        </CardTitle>
        <CardDescription className="text-gray-400">
          Distribution of member check-in times (last 30 days)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-72 w-full">
          {isLoading ? (
            <Skeleton className="w-full h-full rounded-xl bg-muted/20" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 8, right: 16, left: 8, bottom: 24 }}
              >
                <defs>
                  <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B8FF00" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#B8FF00" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 13, fill: "#B8FF00", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 13, fill: "#B8FF00", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload && payload.length ? (
                      <div className="rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1 text-xs shadow-xl text-white">
                        <div className="font-semibold text-[#B8FF00]">
                          {payload[0].payload.hour}
                        </div>
                        <div className="">{payload[0].value} check-in</div>
                      </div>
                    ) : null
                  }
                  cursor={{ fill: "#B8FF00", fillOpacity: 0.08 }}
                />
                <Bar
                  dataKey="count"
                  name="Check-in"
                  fill="url(#barFill)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
