import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const member_id = searchParams.get("member_id");
    if (!member_id) {
      return NextResponse.json({ success: false, message: "member_id required" }, { status: 400 });
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, membership_plan:plan_id(name, duration_days)")
      .eq("member_id", member_id)
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
