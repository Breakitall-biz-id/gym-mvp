"use client";

import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { MemberDialog } from "@/components/members/member-dialog";
import { useRouter } from "next/navigation";

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleMemberCreate = () => {
    router.refresh();
  };

  return (
    <DashboardWrapper
      title="Members"
      description="Manage gym members and their subscriptions"
      actions={<MemberDialog mode="create" onSuccess={handleMemberCreate} />}
    >
      {children}
    </DashboardWrapper>
  );
}
