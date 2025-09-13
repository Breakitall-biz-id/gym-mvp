"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { DashboardHeader } from "./dashboard-header";
import { DashboardBreadcrumb } from "./dashboard-breadcrumb";

interface DashboardWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showBreadcrumb?: boolean;
  actions?: React.ReactNode;
}

export function DashboardWrapper({
  children,
  title,
  description,
  showBreadcrumb = true,
  actions,
}: DashboardWrapperProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleMobileSidebar = () =>
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const toggleSidebarCollapse = () => setIsSidebarCollapsed((v) => !v);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onToggle={toggleMobileSidebar}
        collapsed={isSidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          onMobileMenuToggle={toggleMobileSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
          onSidebarCollapseToggle={toggleSidebarCollapse}
        />

        {/* Breadcrumb */}
        {showBreadcrumb && (
          <div className="border-b border-border px-4 md:px-10 py-3 bg-background/80 backdrop-blur-md sticky top-20 z-20">
            <DashboardBreadcrumb />
          </div>
        )}

        {/* Page Header */}
        {(title || description || actions) && (
          <div className="border-b border-border px-4 md:px-10 py-8 bg-white/5 backdrop-blur-md shadow-sm relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                {title && (
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-gray-400 mt-2 text-lg max-w-2xl">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-3">{actions}</div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-gradient-to-b from-white/5 via-transparent to-black/0">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
