import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Total payments
    const { count: totalPayments, error: totalErr } = await supabase
      .from("payments")
      .select("id", { count: "exact", head: true });
    if (totalErr) {
      return NextResponse.json(
        { success: false, error: "totalErr", details: totalErr },
        { status: 500 }
      );
    }

    // Total revenue
    const { data: revenueData, error: revenueErr } = await supabase
      .from("payments")
      .select("amount_cents")
      .neq("status", "failed");
    if (revenueErr) {
      return NextResponse.json(
        { success: false, error: "revenueErr", details: revenueErr },
        { status: 500 }
      );
    }
    const totalRevenue =
      revenueData?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0;

    // Payments this month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const { count: monthlyPayments, error: monthErr } = await supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .gte("paid_at", firstDay.toISOString())
      .lte("paid_at", lastDay.toISOString());
    if (monthErr) {
      return NextResponse.json(
        { success: false, error: "monthErr", details: monthErr },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalPayments,
        totalRevenue,
        monthlyPayments,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
