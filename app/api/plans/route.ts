import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const body = await req.json();
  // expects: { name, duration_days, price_cents, is_active }
  const { name, duration_days, price_cents, is_active } = body;
  const { data, error } = await supabase
    .from("membership_plans")
    .insert([{ name, duration_days, price_cents, is_active }])
    .select()
    .single();
  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
  return NextResponse.json({ success: true, data });
}

export async function PATCH(req: Request) {
  const supabase = createClient();
  const body = await req.json();
  // expects: { id, name, duration_days, price_cents, is_active }
  const { id, ...update } = body;
  const { data, error } = await supabase
    .from("membership_plans")
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
  return NextResponse.json({ success: true, data });
}
