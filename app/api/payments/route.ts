export async function GET() {
  try {
    const supabase = createClient();
    // Fetch payments with member and subscription info
    const { data, error } = await supabase
      .from("payments")
      .select(`*, member:member_id(*), subscription:subscription_id(id, membership_plan:plan_id(name))`)
      .order("paid_at", { ascending: false });
    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, payments: data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createClient();
    const { data, error } = await supabase
      .from("payments")
      .insert([body])
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, payment: data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...update } = body;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("payments")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, payment: data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    const supabase = createClient();
    const { error } = await supabase.from("payments").delete().eq("id", id);
    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
