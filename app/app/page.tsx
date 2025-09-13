import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QrCode, Calendar, CreditCard, Activity } from "lucide-react";
import { QRModal } from "./qr-modal";

function MemberAppLoading() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center pt-4">
          <div className="h-20 w-20 bg-gray-700 rounded-full mx-auto mb-4" />
          <div className="h-6 bg-gray-700 rounded w-32 mx-auto mb-2" />
          <div className="h-4 bg-gray-700 rounded w-24 mx-auto" />
        </div>

        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-700 rounded w-24" />
                <div className="h-6 bg-gray-700 rounded w-32" />
                <div className="h-3 bg-gray-700 rounded w-40" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

async function getMemberData() {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("member_id")
    .eq("id", user.id)
    .single();

  if (!profile?.member_id) {
    redirect("/login");
  }

  // Get member details with active subscription
  const { data: member } = await supabase
    .from("members")
    .select(
      `
      *,
      subscriptions:subscriptions!inner(
        id,
        start_date,
        end_date,
        status,
        membership_plan:membership_plans(name, duration_days, price_cents)
      )
    `
    )
    .eq("id", profile.member_id)
    .single();

  if (!member) redirect("/login");

  // Get active subscription
  const activeSubscription = member.subscriptions?.find(
    (sub: any) =>
      sub.status === "active" && new Date(sub.end_date) >= new Date()
  );

  // Get QR token
  const { data: qrToken } = await supabase
    .from("qr_tokens")
    .select("token, expires_at")
    .eq("member_id", member.id)
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .single();

  // Get this month's visits
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const { count: monthlyVisits } = await supabase
    .from("attendance")
    .select("*", { count: "exact", head: true })
    .eq("member_id", member.id)
    .gte("checked_in_at", firstOfMonth.toISOString());

  // Get recent payments
  const { data: recentPayments } = await supabase
    .from("payments")
    .select("id, amount_cents, method, status, paid_at, created_at")
    .eq("member_id", member.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Get recent attendance
  const { data: recentAttendance } = await supabase
    .from("attendance")
    .select("id, checked_in_at")
    .eq("member_id", member.id)
    .order("checked_in_at", { ascending: false })
    .limit(10);

  return {
    member,
    activeSubscription,
    qrToken: qrToken?.token || null,
    monthlyVisits: monthlyVisits || 0,
    recentPayments: recentPayments || [],
    recentAttendance: recentAttendance || [],
  };
}

export default async function MemberAppPage() {
  return (
    <Suspense fallback={<MemberAppLoading />}>
      <MemberAppContent />
    </Suspense>
  );
}

async function MemberAppContent() {
  const {
    member,
    activeSubscription,
    qrToken,
    monthlyVisits,
    recentPayments,
    recentAttendance,
  } = await getMemberData();

  const isActive =
    activeSubscription && new Date(activeSubscription.end_date) >= new Date();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4">
          <Avatar className="h-20 w-20 mx-auto mb-4">
            <AvatarImage src={member.photo_url || ""} />
            <AvatarFallback className="text-lg">
              {member.full_name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-gray-400">{member.full_name}</p>
        </div>

        {/* Membership Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Membership</CardTitle>
                <CardDescription>
                  {activeSubscription?.membership_plan?.name ||
                    "No active plan"}
                </CardDescription>
              </div>
              {isActive ? (
                <Badge className="bg-green-600 hover:bg-green-700">
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary">Expired</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {activeSubscription ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Start Date:</span>
                  <span>
                    {new Date(
                      activeSubscription.start_date
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">End Date:</span>
                  <span>
                    {new Date(activeSubscription.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span>
                    {activeSubscription.membership_plan?.duration_days} days
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">
                No active membership. Contact gym staff to renew.
              </p>
            )}
          </CardContent>
        </Card>

        {/* QR Code Section */}
        {isActive && qrToken && (
          <Card>
            <CardContent className="p-6 text-center">
              <QrCode className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Check-in QR Code</h3>
              <p className="text-sm text-gray-400 mb-4">
                Show this QR code at the gym to check in
              </p>
              <QRModal memberName={member.full_name} token={qrToken} />
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">This Month</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyVisits}</div>
              <p className="text-xs text-gray-400">Visits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Total Visits</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentAttendance.length}
              </div>
              <p className="text-xs text-gray-400">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No check-ins yet</p>
            ) : (
              <div className="space-y-2">
                {recentAttendance.slice(0, 5).map((attendance: any) => (
                  <div
                    key={attendance.id}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {new Date(attendance.checked_in_at).toLocaleDateString()}
                    </span>
                    <span className="text-gray-400">
                      {new Date(attendance.checked_in_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                No payments recorded
              </p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">
                        ${(payment.amount_cents / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400 capitalize">
                        {payment.method} •{" "}
                        {new Date(
                          payment.paid_at || payment.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        payment.status === "paid" ? "default" : "secondary"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
