import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateMemberSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  photo_url: z.string().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();

    const { data: member, error } = await supabase
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
      .eq("id", params.id)
      .single();

    if (error || !member) {
      return NextResponse.json(
        {
          success: false,
          message: "Member not found",
        },
        { status: 404 }
      );
    }

    // Add active subscription
    const processedMember = {
      ...member,
      active_subscription:
        member.subscriptions?.find(
          (sub: any) =>
            sub.status === "active" && new Date(sub.end_date) >= new Date()
        ) || null,
    };

    return NextResponse.json({
      success: true,
      data: processedMember,
    });
  } catch (error) {
    console.error("Get member error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const validatedData = updateMemberSchema.parse(body);

    const supabase = createClient();

    const { data: member, error } = await supabase
      .from("members")
      .update({
        full_name: validatedData.full_name,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        photo_url: validatedData.photo_url || null,
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update member: " + error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: member,
      message: "Member updated successfully",
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

    console.error("Update member error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete member: " + error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (error) {
    console.error("Delete member error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
