import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemberDetail } from "../components/member-detail";
import { Member } from "@/lib/types";

interface MemberPageProps {
  params: {
    id: string;
  };
}

async function getMember(id: string): Promise<Member | null> {
  const supabase = createClient();

  const { data: member } = await supabase
    .from("members")
    .select(
      `
      *,
      subscriptions:subscriptions(
        id,
        start_date,
        end_date,
        status,
        membership_plan:membership_plans(name, duration_days, price_cents)
      )
    `
    )
    .eq("id", id)
    .single();

  if (!member) return null;

  return {
    ...member,
    active_subscription:
      member.subscriptions?.find(
        (sub: any) =>
          sub.status === "active" && new Date(sub.end_date) >= new Date()
      ) || null,
  };
}

export default async function MemberPage({ params }: MemberPageProps) {
  const member = await getMember(params.id);

  if (!member) {
    notFound();
  }

  return <MemberDetail member={member} />;
}
