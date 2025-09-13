"use client";

import { Sidebar } from "./sidebar";
import { DashboardHeader } from "./dashboard-header";
import { DashboardBreadcrumb } from "./dashboard-breadcrumb";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showBreadcrumb?: boolean;
}

export function DashboardLayout({
  children,
  title,
  description,
  showBreadcrumb = true,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Breadcrumb */}
        {showBreadcrumb && (
          <div className="border-b border-border px-4 md:px-6 py-3">
            <DashboardBreadcrumb />
          </div>
        )}

        {/* Page Header */}
        {(title || description) && (
          <div className="border-b border-border px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-gray-400 mt-1">{description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
