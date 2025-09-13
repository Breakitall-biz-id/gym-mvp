"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Mapping path ke label yang lebih readable
const pathLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/members": "Members",
  "/checkin": "Check-in",
  "/plans": "Plans",
  "/payments": "Payments",
  "/app": "Member Portal",
  "/login": "Login",
};

// Path yang tidak perlu ditampilkan dalam breadcrumb
const hiddenPaths = ["/login", "/"];

export function DashboardBreadcrumb() {
  const pathname = usePathname();

  // Jangan tampilkan breadcrumb untuk path tertentu
  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  // Split path dan filter empty strings
  const pathSegments = pathname.split("/").filter(Boolean);

  // Jika hanya satu segment (misalnya /dashboard), tidak perlu breadcrumb
  if (pathSegments.length <= 1) {
    return null;
  }

  // Build breadcrumb items
  const breadcrumbItems = [];

  // Tambahkan home/dashboard sebagai root
  breadcrumbItems.push({
    label: "Dashboard",
    href: "/dashboard",
    isLast: false,
  });

  // Tambahkan segment lainnya
  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;

    // Skip jika ini adalah dashboard (sudah ditambahkan sebagai root)
    if (currentPath === "/dashboard") return;

    breadcrumbItems.push({
      label:
        pathLabels[currentPath] ||
        segment.charAt(0).toUpperCase() + segment.slice(1),
      href: currentPath,
      isLast,
    });
  });

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-400">
      <Home className="h-4 w-4" />

      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}

          {item.isLast ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className={cn(
                "hover:text-foreground transition-colors",
                index === 0 && "text-primary hover:text-primary/80"
              )}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
