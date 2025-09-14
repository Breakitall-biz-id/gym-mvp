"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export function TopPlansBarChart() {
  const [data, setData] = useState<{ plan: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.topPlans)) {
          setData(json.data.topPlans);
        } else {
          setData([]);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <Card className="@container/card bg-white/10 border border-white/10 shadow-xl backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base font-semibold">
          Top Membership Plans
        </CardTitle>
        <CardDescription className="text-gray-400">
          Most popular plans by active members
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-72 w-full">
          {loading ? (
            <Skeleton className="w-full h-full rounded-xl bg-muted/20" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 8, bottom: 24 }}
              >
                <defs>
                  <linearGradient id="planBarFill" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#B8FF00" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#B8FF00" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <XAxis
                  type="number"
                  tick={{ fontSize: 13, fill: "#B8FF00", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="plan"
                  tick={{ fontSize: 14, fill: "#fff", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={120}
                />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload && payload.length ? (
                      <div className="rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1 text-xs shadow-xl text-white">
                        <div className="font-semibold text-[#B8FF00]">
                          {payload[0].payload.plan}
                        </div>
                        <div className="">{payload[0].value} active</div>
                      </div>
                    ) : null
                  }
                  cursor={{ fill: "#B8FF00", fillOpacity: 0.08 }}
                />
                <Bar
                  dataKey="count"
                  name="Active Members"
                  fill="url(#planBarFill)"
                  radius={[8, 8, 8, 8]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
