import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createMemberSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  photo_url: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const supabase = createClient();
    let query = supabase
      .from("members")
      .select(
        `
        *,
        subscriptions:subscriptions(
          id,
          start_date,
          end_date,
          status,
          membership_plan:membership_plans(name, duration_days, price_cents, id)
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data: members, error } = await query;

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch members",
        },
        { status: 500 }
      );
    }

    // Process members to add active_subscription
    const processedMembers =
      members?.map((member) => ({
        ...member,
        active_subscription:
          member.subscriptions?.find(
            (sub: any) =>
              sub.status === "active" && new Date(sub.end_date) >= new Date()
          ) || null,
      })) || [];

    let filteredMembers = processedMembers;
    if (status === "active") {
      filteredMembers = processedMembers.filter(
        (member) => member.active_subscription !== null
      );
    } else if (status === "expired") {
      filteredMembers = processedMembers.filter(
        (member) => member.active_subscription === null
      );
    } else if (status === "expiring") {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      filteredMembers = processedMembers.filter(
        (member) =>
          member.active_subscription &&
          new Date(member.active_subscription.end_date) <= nextWeek &&
          new Date(member.active_subscription.end_date) >= new Date()
      );
    }

    return NextResponse.json({
      success: true,
      members: filteredMembers,
    });
  } catch (error) {
    console.error("Get members error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createMemberSchema.parse(body);

    const supabase = createClient();

    const { data: member, error } = await supabase
      .from("members")
      .insert({
        full_name: validatedData.full_name,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        photo_url: validatedData.photo_url || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create member: " + error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: member,
      message: "Member created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Create member error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
