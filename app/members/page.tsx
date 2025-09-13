import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { MembersClient } from "./members-client";
import { MembersGridSkeleton } from "@/components/members/member-skeleton";
import { Member } from "@/lib/types";

async function getMembers(): Promise<Member[]> {
  const supabase = createClient();

  const { data: members } = await supabase
    .from("members")
    .select(
      `
      *,
      subscriptions:subscriptions(
        id,
        start_date,
        end_date,
        status,
        membership_plan:membership_plans(name, duration_days)
      )
    `
    )
    .order("created_at", { ascending: false });

  return (
    members?.map((member) => ({
      ...member,
      active_subscription:
        member.subscriptions?.find(
          (sub: any) =>
            sub.status === "active" && new Date(sub.end_date) >= new Date()
        ) || null,
    })) || []
  );
}

function MembersLoading() {
  return (
    <div className="space-y-4">
      <MembersGridSkeleton />
    </div>
  );
}

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <Suspense fallback={<MembersLoading />}>
      <MembersClient members={members} />
    </Suspense>
  );
}
