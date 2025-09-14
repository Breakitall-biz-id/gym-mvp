import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Total members
    const { count: totalMembers, error: membersErr } = await supabase
      .from("members")
      .select("id", { count: "exact", head: true });
    if (membersErr) {
      return NextResponse.json(
        { success: false, error: "membersErr", details: membersErr },
        { status: 500 }
      );
    }

    // Active subscriptions
    const { count: activeSubscriptions, error: activeSubsErr } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");
    if (activeSubsErr) {
      return NextResponse.json(
        { success: false, error: "activeSubsErr", details: activeSubsErr },
        { status: 500 }
      );
    }

    // Expiring soon (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const today = new Date();
    const { count: expiringSoon, error: expSoonErr } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .gte("end_date", today.toISOString().split("T")[0])
      .lte("end_date", nextWeek.toISOString().split("T")[0]);
    if (expSoonErr) {
      return NextResponse.json(
        { success: false, error: "expSoonErr", details: expSoonErr },
        { status: 500 }
      );
    }

    // Today's check-ins
    const todayStr = today.toISOString().split("T")[0];
    const { count: todaysCheckins, error: todayCheckinErr } = await supabase
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .gte("checked_in_at", todayStr + "T00:00:00")
      .lte("checked_in_at", todayStr + "T23:59:59");
    if (todayCheckinErr) {
      return NextResponse.json(
        { success: false, error: "todayCheckinErr", details: todayCheckinErr },
        { status: 500 }
      );
    }

    // Monthly revenue (current month, paid only)
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const { data: payments, error: paymentsErr } = await supabase
      .from("payments")
      .select("amount_cents, paid_at, status")
      .eq("status", "paid")
      .gte("paid_at", firstOfMonth.toISOString())
      .lte("paid_at", today.toISOString());
    if (paymentsErr) {
      return NextResponse.json(
        { success: false, error: "paymentsErr", details: paymentsErr },
        { status: 500 }
      );
    }
    const monthlyRevenue = (payments || []).reduce(
      (sum, p) => sum + (p.amount_cents || 0),
      0
    );

    // Build activity chart data (last 90 days) with group-by query (MUCH FASTER)
    const chartDays = 90;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (chartDays - 1));
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = today.toISOString().split("T")[0];

    // Group check-ins by date
    const { data: checkinAgg, error: checkinAggErr } = await supabase
      .from("attendance")
      .select("checked_in_at")
      .gte("checked_in_at", startDateStr + "T00:00:00")
      .lte("checked_in_at", endDateStr + "T23:59:59");
    if (checkinAggErr) {
      return NextResponse.json(
        { success: false, error: "checkinAggErr", details: checkinAggErr },
        { status: 500 }
      );
    }

    // Group registrations by date
    const { data: regAgg, error: regAggErr } = await supabase
      .from("members")
      .select("created_at")
      .gte("created_at", startDateStr + "T00:00:00")
      .lte("created_at", endDateStr + "T23:59:59");
    if (regAggErr) {
      return NextResponse.json(
        { success: false, error: "regAggErr", details: regAggErr },
        { status: 500 }
      );
    }

    const checkinMap = new Map();
    (checkinAgg || []).forEach((row) => {
      const date = row.checked_in_at?.slice(0, 10);
      if (!date) return;
      checkinMap.set(date, (checkinMap.get(date) || 0) + 1);
    });
    const regMap = new Map();
    (regAgg || []).forEach((row) => {
      const date = row.created_at?.slice(0, 10);
      if (!date) return;
      regMap.set(date, (regMap.get(date) || 0) + 1);
    });

    // Build chart data for each day (fill 0 if no data)
    const chartData: {
      date: string;
      checkins: number;
      registrations: number;
    }[] = [];
    for (let i = 0; i < chartDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      chartData.push({
        date: dateStr,
        checkins: checkinMap.get(dateStr) || 0,
        registrations: regMap.get(dateStr) || 0,
      });
    }

    // Check-in time distribution (per hour, last 30 days)
    const checkinTimeStart = new Date(today);
    checkinTimeStart.setDate(today.getDate() - 29);
    const checkinTimeStartStr = checkinTimeStart.toISOString();
    const { data: checkinTimes, error: checkinTimesErr } = await supabase
      .from("attendance")
      .select("checked_in_at")
      .gte("checked_in_at", checkinTimeStartStr);
    if (checkinTimesErr) {
      return NextResponse.json(
        { success: false, error: "checkinTimesErr", details: checkinTimesErr },
        { status: 500 }
      );
    }

    // Aggregate per hour (0-23)
    const hourDist: number[] = Array(24).fill(0);
    (checkinTimes || []).forEach((row) => {
      if (!row.checked_in_at) return;
      const hour = new Date(row.checked_in_at).getHours();
      hourDist[hour]++;
    });

    // Top membership plans (by active subscriptions, join with membership_plans)
    const { data: planAgg, error: planAggErr } = await supabase
      .from("subscriptions")
      .select("plan_id, membership_plans(name)")
      .eq("status", "active");
    if (planAggErr) {
      return NextResponse.json(
        { success: false, error: "planAggErr", details: planAggErr },
        { status: 500 }
      );
    }

    const planCountMap = new Map();
    (planAgg || []).forEach((row) => {
      let plan = "Unknown";
      if (row.membership_plans) {
        if (Array.isArray(row.membership_plans)) {
          if (
            row.membership_plans.length > 0 &&
            typeof row.membership_plans[0] === "object" &&
            row.membership_plans[0] !== null
          ) {
            plan = row.membership_plans[0].name || "Unknown";
          }
        } else if (
          typeof row.membership_plans === "object" &&
          row.membership_plans !== null
        ) {
          plan = (row.membership_plans as any).name || "Unknown";
        }
      }
      if (plan === "Unknown" && row.plan_id) {
        plan = row.plan_id;
      }
      planCountMap.set(plan, (planCountMap.get(plan) || 0) + 1);
    });
    const topPlans = Array.from(planCountMap.entries())
      .map(([plan, count]) => ({ plan, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // top 6

    return NextResponse.json({
      success: true,
      data: {
        totalMembers,
        activeSubscriptions,
        expiringSoon,
        todaysCheckins,
        monthlyRevenue, // already in rupiah
        activityChart: chartData,
        checkinHourDist: hourDist,
        topPlans,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
