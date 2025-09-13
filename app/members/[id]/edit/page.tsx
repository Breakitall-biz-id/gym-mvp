import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditMemberForm } from "../../components/edit-member-form";
import { Member } from "@/lib/types";

interface EditMemberPageProps {
  params: {
    id: string;
  };
}

async function getMember(id: string): Promise<Member | null> {
  const supabase = createClient();

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  return member;
}

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const member = await getMember(params.id);

  if (!member) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <EditMemberForm member={member} />
    </div>
  );
}
