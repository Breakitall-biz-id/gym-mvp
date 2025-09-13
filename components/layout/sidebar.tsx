"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ScanLine,
  CreditCard,
  Package,
  LogOut,
  Menu,
  X,
  Dumbbell,
  GaugeCircle,
} from "lucide-react";
import { toast } from "sonner";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: GaugeCircle },
  { name: "Members", href: "/members", icon: Users },
  { name: "Check-in", href: "/checkin", icon: ScanLine },
  { name: "Plans", href: "/plans", icon: Package },
  { name: "Payments", href: "/payments", icon: CreditCard },
];

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  collapsed?: boolean;
}

export function Sidebar({
  isOpen = false,
  onToggle,
  collapsed = false,
}: SidebarProps = {}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Use external state if provided, otherwise use internal state
  const isSidebarOpen = onToggle ? isOpen : sidebarOpen;
  const toggleSidebar = onToggle || (() => setSidebarOpen(!sidebarOpen));

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      router.push("/login");
      router.refresh();
    }
  };

  // Sidebar width for smooth transition
  const sidebarWidth = collapsed ? 80 : 256; // px

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className={cn(
          "flex h-20 items-center border-b border-white/10 transition-all duration-300 backdrop-blur-md bg-white/5",
          collapsed ? "justify-center px-0" : "gap-3 px-6"
        )}
        style={{ transition: "padding 0.3s" }}
      >
        <div className="p-2 bg-primary/20 rounded-xl transition-all duration-300 shadow-md">
          <Dumbbell className="h-7 w-7 text-primary" />
        </div>
        <div
          className={cn(
            "overflow-hidden flex flex-col justify-center",
            collapsed ? "ml-0" : "ml-2"
          )}
          style={{
            maxWidth: collapsed ? 0 : 120,
            transition:
              "max-width 0.35s cubic-bezier(0.4,0,0.2,1), margin 0.3s",
          }}
        >
          <span
            className="font-bold text-xl text-white tracking-tight block transition-opacity duration-200 drop-shadow"
            style={{
              opacity: collapsed ? 0 : 1,
              transitionDelay: collapsed ? "0ms" : "250ms",
            }}
          >
            FitPro
          </span>
          <p
            className="text-xs text-gray-400 transition-opacity duration-200"
            style={{
              opacity: collapsed ? 0 : 1,
              transitionDelay: collapsed ? "0ms" : "250ms",
            }}
          >
            Gym Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          "flex-1 space-y-2 transition-all duration-300 py-6 px-2 md:px-4 bg-white/5 backdrop-blur-md",
          collapsed ? "p-2" : "p-4"
        )}
        style={{ transition: "padding 0.3s" }}
      >
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => toggleSidebar()}
              className={cn(
                "flex items-center rounded-xl transition-all duration-300 group",
                collapsed
                  ? "justify-center h-12 w-12 p-0"
                  : "gap-4 px-4 py-3 text-sm font-medium w-full",
                isActive
                  ? "bg-white/10 text-primary font-bold shadow-lg shadow-primary/10"
                  : "text-gray-400 hover:text-primary hover:bg-primary/10 hover:shadow-md"
              )}
              style={{ transition: "all 0.3s" }}
            >
              <item.icon
                strokeWidth={1.5}
                className={cn(
                  "h-5 w-5 transition-all duration-300 group-hover:text-primary",
                  isActive ? "text-primary" : "text-gray-400"
                )}
              />
              <span
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  collapsed ? "ml-0" : "ml-3",
                  isActive
                    ? "text-primary font-bold"
                    : "text-gray-400 group-hover:text-primary"
                )}
                style={{
                  maxWidth: collapsed ? 0 : 120,
                  opacity: collapsed ? 0 : 1,
                  transition:
                    "max-width 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.2s",
                  transitionDelay: collapsed ? "0ms" : "250ms",
                }}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div
        className={cn(
          "border-t border-white/10 transition-all duration-300 bg-white/5 backdrop-blur-md",
          collapsed ? "p-2" : "p-6"
        )}
        style={{ transition: "padding 0.3s" }}
      >
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start gap-4 rounded-xl transition-all duration-300 hover:bg-primary/10 hover:text-primary",
            collapsed
              ? "h-12 w-12 p-0 flex items-center justify-center"
              : "px-4 py-3 text-gray-400"
          )}
        >
          <LogOut className="h-5 w-5" />
          <span
            className={cn(
              "overflow-hidden transition-all duration-300",
              collapsed ? "ml-0" : "ml-3"
            )}
            style={{
              maxWidth: collapsed ? 0 : 120,
              opacity: collapsed ? 0 : 1,
              transition:
                "max-width 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.2s",
              transitionDelay: collapsed ? "0ms" : "250ms",
            }}
          >
            Sign out
          </span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => toggleSidebar()}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "sidebar fixed inset-y-0 left-0 z-50 md:hidden transition-all duration-300 backdrop-blur-md bg-white/10 border-r border-white/10 shadow-xl",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ width: 256, transition: "width 0.3s" }}
      >
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden md:flex md:flex-col transition-all duration-300 backdrop-blur-md bg-white/10 border-r border-white/10 shadow-xl"
        )}
        style={{ width: sidebarWidth, transition: "width 0.3s" }}
      >
        <div className="sidebar flex flex-col flex-grow">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}
