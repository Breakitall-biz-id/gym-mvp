import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";

export default function CheckinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardWrapper>{children}</DashboardWrapper>;
}
