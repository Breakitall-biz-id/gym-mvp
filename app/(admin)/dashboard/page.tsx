"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ChartAreaInteractive } from "@/components/gym-chart";
import { CheckinHourRadarChart } from "@/components/dashboard/checkin-hour-radar-chart";
import { TopPlansBarChart } from "@/components/dashboard/top-plans-bar-chart";
import { DataTableDemo } from "@/components/gym-data-table";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to fetch stats");
      return json.data;
    },
  });

  

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24 mb-2 bg-muted/30" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2 bg-muted/30" />
                <Skeleton className="h-4 w-16 bg-muted/20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.totalMembers?.toLocaleString() ?? "-"}
                </div>
                <p className="text-xs text-[#B8FF00]">&nbsp;</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.activeSubscriptions?.toLocaleString() ?? "-"}
                </div>
                <p className="text-xs text-[#B8FF00]">&nbsp;</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.monthlyRevenue != null
                    ? `Rp${data.monthlyRevenue.toLocaleString("id-ID")}`
                    : "-"}
                </div>
                <p className="text-xs text-[#B8FF00]">&nbsp;</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Expiring Soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.expiringSoon?.toLocaleString() ?? "-"}
                </div>
                <p className="text-xs text-orange-500">Follow up needed</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

  <ChartAreaInteractive activityChart={data?.activityChart} isLoading={isLoading} />
  <CheckinHourRadarChart checkinHourDist={data?.checkinHourDist} isLoading={isLoading} />
  <TopPlansBarChart topPlans={data?.topPlans} isLoading={isLoading} />

      {/* Upcoming Membership Expirations */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Membership Expirations</CardTitle>
          <CardDescription>
            Members whose memberships will expire soon. Follow up to retain
            them!
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Example static data, replace with real data if available */}
          <div className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/04.png" alt="Avatar" />
              <AvatarFallback className="bg-[#B8FF00] text-black">
                AR
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium leading-none">Ari Rahman</p>
              <p className="text-xs text-gray-400">Expiring in 2 days</p>
            </div>
            <Button asChild size="sm" className="ml-auto">
              <Link href="/members/1">Remind</Link>
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/05.png" alt="Avatar" />
              <AvatarFallback className="bg-[#B8FF00] text-black">
                DS
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium leading-none">Dewi Sari</p>
              <p className="text-xs text-gray-400">Expiring in 5 days</p>
            </div>
            <Button asChild size="sm" className="ml-auto">
              <Link href="/members/2">Remind</Link>
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/06.png" alt="Avatar" />
              <AvatarFallback className="bg-[#B8FF00] text-black">
                FA
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium leading-none">Fajar Andika</p>
              <p className="text-xs text-gray-400">Expiring in 7 days</p>
            </div>
            <Button asChild size="sm" className="ml-auto">
              <Link href="/members/3">Remind</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
