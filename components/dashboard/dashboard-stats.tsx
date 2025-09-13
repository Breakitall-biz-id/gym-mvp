"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  DollarSign,
  Activity,
  UserCheck,
  Calendar,
  Clock,
} from "lucide-react";

// Generate dummy data dengan variasi realistis
function generateDummyStats() {
  const today = new Date();
  const thisMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Base numbers yang realistis untuk gym
  const baseMembers = 85 + Math.floor(Math.random() * 30); // 85-115 members
  const baseRevenue = 15000 + Math.floor(Math.random() * 10000); // $15k-25k
  const baseCheckinsToday = 25 + Math.floor(Math.random() * 20); // 25-45 checkins
  const newMembersThisMonth = 8 + Math.floor(Math.random() * 7); // 8-15 new members

  // Calculate growth rates
  const lastMonthMembers = baseMembers - Math.floor(Math.random() * 10) + 5;
  const memberGrowthRate =
    lastMonthMembers > 0
      ? ((baseMembers - lastMonthMembers) / lastMonthMembers) * 100
      : 0;

  const lastMonthRevenue =
    baseRevenue - Math.floor(Math.random() * 5000) + 2000;
  const revenueGrowthRate =
    lastMonthRevenue > 0
      ? ((baseRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  // Members expiring in next 7 days
  const expiringMembers = 3 + Math.floor(Math.random() * 8); // 3-11 members

  return {
    totalMembers: baseMembers,
    activeMembers: baseMembers - Math.floor(Math.random() * 5), // Slightly less than total
    newMembers: newMembersThisMonth,
    memberGrowthRate,
    totalRevenue: baseRevenue,
    revenueGrowthRate,
    todaysCheckins: baseCheckinsToday,
    expiringMembers,
    lastWeekCheckins: baseCheckinsToday - Math.floor(Math.random() * 10) + 5,
  };
}

// Generate chart data untuk 30 hari terakhir
function generateCheckinChartData() {
  const data = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Simulasi pola checkin: lebih tinggi di weekdays, lebih rendah di weekend
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let baseCheckins = isWeekend
      ? 15 + Math.floor(Math.random() * 15)
      : 25 + Math.floor(Math.random() * 25);

    // Tambahkan variasi untuk hari tertentu
    if (dayOfWeek === 1) baseCheckins += 5; // Monday boost
    if (dayOfWeek === 5) baseCheckins += 3; // Friday boost

    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      checkins: baseCheckins,
      fullDate: date.toISOString().split("T")[0],
    });
  }

  return data;
}

interface DashboardStatsProps {
  refreshKey?: number; // Props untuk memaksa re-render dengan data baru
}

export function DashboardStats({ refreshKey }: DashboardStatsProps) {
  // Memoize data berdasarkan refreshKey untuk memberikan data "dinamis"
  const stats = useMemo(() => generateDummyStats(), [refreshKey]);
  const chartData = useMemo(() => generateCheckinChartData(), [refreshKey]);

  const maxCheckins = Math.max(...chartData.map((d) => d.checkins), 1);

  const getTrendIcon = (value: number) => {
    if (value > 2) return <TrendingUp className="h-3 w-3 text-green-400" />;
    if (value < -2) return <TrendingDown className="h-3 w-3 text-red-400" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 2) return "text-green-400";
    if (value < -2) return "text-red-400";
    return "text-gray-400";
  };

  return (
    <>
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-500 bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center text-xs mt-1">
              {getTrendIcon(stats.revenueGrowthRate)}
              <span
                className={`ml-1 ${getTrendColor(stats.revenueGrowthRate)}`}
              >
                {stats.revenueGrowthRate > 0 ? "+" : ""}
                {stats.revenueGrowthRate.toFixed(1)}%
              </span>
              <span className="ml-1 text-slate-400">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Active Members
            </CardTitle>
            <UserCheck className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.activeMembers}
            </div>
            <div className="flex items-center text-xs mt-1">
              {getTrendIcon(stats.memberGrowthRate)}
              <span className={`ml-1 ${getTrendColor(stats.memberGrowthRate)}`}>
                {stats.memberGrowthRate > 0 ? "+" : ""}
                {stats.memberGrowthRate.toFixed(1)}%
              </span>
              <span className="ml-1 text-slate-400">growth rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Today&apos;s Check-ins
            </CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.todaysCheckins}
            </div>
            <div className="flex items-center text-xs mt-1">
              <Calendar className="h-3 w-3 text-slate-400 mr-1" />
              <span className="text-slate-400">
                {stats.lastWeekCheckins} avg last week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Expiring Soon
            </CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.expiringMembers}
            </div>
            <div className="flex items-center text-xs mt-1">
              <Badge
                variant="outline"
                className="border-yellow-400 text-yellow-400 text-xs px-1 py-0"
              >
                Next 7 days
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Check-in Trends</CardTitle>
              <CardDescription className="text-slate-400">
                Daily member check-ins over the last 30 days
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Peak Day</div>
              <div className="text-lg font-semibold text-primary">
                {Math.max(...chartData.map((d) => d.checkins))} check-ins
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <div className="relative h-full w-full bg-gradient-to-t from-primary/10 to-transparent rounded-lg overflow-hidden border border-slate-800">
              <div className="absolute inset-0 flex items-end justify-between px-2 pb-8">
                {chartData.map((day, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center group cursor-pointer"
                    style={{ width: `${100 / chartData.length}%` }}
                  >
                    <div
                      className="w-1.5 bg-gradient-to-t from-primary to-primary/60 rounded-t-sm mb-2 transition-all duration-200 group-hover:from-primary group-hover:to-primary/80 group-hover:w-2"
                      style={{
                        height: `${(day.checkins / maxCheckins) * 220}px`,
                        minHeight: "4px",
                      }}
                    />
                    {index % 4 === 0 && (
                      <span className="text-xs text-slate-400 transform -rotate-45 origin-left mt-1">
                        {day.date}
                      </span>
                    )}

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white whitespace-nowrap">
                        <div className="font-medium">
                          {day.checkins} check-ins
                        </div>
                        <div className="text-slate-400">{day.date}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Grid lines */}
              <div className="absolute inset-0 pointer-events-none">
                {[0.25, 0.5, 0.75].map((percent) => (
                  <div
                    key={percent}
                    className="absolute left-0 right-0 border-t border-slate-800/50"
                    style={{ top: `${(1 - percent) * 100}%` }}
                  />
                ))}
              </div>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-slate-400 py-2">
                <span>{maxCheckins}</span>
                <span>{Math.floor(maxCheckins * 0.75)}</span>
                <span>{Math.floor(maxCheckins * 0.5)}</span>
                <span>{Math.floor(maxCheckins * 0.25)}</span>
                <span>0</span>
              </div>
            </div>
          </div>

          {/* Chart Summary */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-slate-400">Daily Check-ins</span>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              Average:{" "}
              {Math.floor(
                chartData.reduce((sum, day) => sum + day.checkins, 0) /
                  chartData.length
              )}{" "}
              per day
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
