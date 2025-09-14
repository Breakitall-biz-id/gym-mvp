import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardWrapper
      title="Dashboard"
      description="Welcome back! Here's what's happening at your gym."
      actions={
        <Button className="btn-primary rounded-xl shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Quick Create
        </Button>
      }
    >
      {children}
    </DashboardWrapper>
  );
}
