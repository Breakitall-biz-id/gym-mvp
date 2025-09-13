import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const body = await req.json();
  // expects: { name, duration_days, price_cents, is_active }
  const { name, duration_days, price_cents, is_active } = body;
  const { data, error } = await supabase
    .from("membership_plans")
    .update({ name, duration_days, price_cents, is_active })
    .eq("id", params.id)
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
