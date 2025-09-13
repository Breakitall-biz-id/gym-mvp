import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardWrapper>{children}</DashboardWrapper>;
}
