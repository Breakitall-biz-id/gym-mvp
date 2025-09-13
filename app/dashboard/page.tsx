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
import { DataTableDemo } from "@/components/gym-data-table";
import gymData from "./data.json";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,329</div>
            <p className="text-xs text-[#B8FF00]">+25% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Daily Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-[#B8FF00]">+10% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-[#B8FF00]">+18% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-orange-500">Follow up needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Table */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartAreaInteractive />
        </div>
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest member check-ins and registrations
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/members">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="/avatars/01.png" alt="Avatar" />
                <AvatarFallback className="bg-[#B8FF00] text-black">
                  OM
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  Olivia Martin
                </p>
                <p className="text-xs text-gray-400">Checked in at 08:30 AM</p>
              </div>
              <div className="ml-auto font-medium text-[#B8FF00]">Active</div>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="/avatars/02.png" alt="Avatar" />
                <AvatarFallback className="bg-[#B8FF00] text-black">
                  JL
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">Jackson Lee</p>
                <p className="text-xs text-gray-400">New member registration</p>
              </div>
              <div className="ml-auto font-medium text-[#B8FF00]">New</div>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="/avatars/03.png" alt="Avatar" />
                <AvatarFallback className="bg-[#B8FF00] text-black">
                  IN
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  Isabella Nguyen
                </p>
                <p className="text-xs text-gray-400">Payment processed</p>
              </div>
              <div className="ml-auto font-medium text-[#B8FF00]">Paid</div>
            </div>
          </CardContent>
        </Card>
      </div>

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
