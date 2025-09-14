import { Suspense } from "react";
import { MembersClient } from "./members-client";
import { MembersGridSkeleton } from "@/components/members/member-skeleton";


function MembersLoading() {
  return (
    <div className="space-y-4">
      <MembersGridSkeleton />
    </div>
  );
}

export default async function MembersPage() {

  return (
    <Suspense fallback={<MembersLoading />}>
      <MembersClient />
    </Suspense>
  );
}
