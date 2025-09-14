import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const body = await req.json();
  const { member_id, expires_at } = body;

  if (!member_id || !expires_at) {
    return NextResponse.json({ error: "member_id and expires_at required" }, { status: 400 });
  }

  const qrToken =  uuidv4();

  await supabase
    .from("qr_tokens")
    .delete()
    .eq("member_id", member_id);

  const { data, error } = await supabase
    .from("qr_tokens")
    .insert([
      {
        token: `qr_${qrToken}`,
        member_id,
        expires_at,
      },
    ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data?.[0] });
}