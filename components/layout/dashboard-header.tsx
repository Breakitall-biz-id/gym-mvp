"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  PanelRightOpen,
  PanelLeft,
} from "lucide-react";
import { toast } from "sonner";

interface DashboardHeaderProps {
  onMobileMenuToggle?: () => void;
  isSidebarCollapsed?: boolean;
  onSidebarCollapseToggle?: () => void;
}

import { Menu, X } from "lucide-react";

export function DashboardHeader({
  onMobileMenuToggle,
  isSidebarCollapsed,
  onSidebarCollapseToggle,
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      router.push("/login");
      router.refresh();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/members?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      className="dashboard-header border-b border-border sticky top-0 z-30 backdrop-blur-md bg-black/60 supports-[backdrop-filter]:bg-black/40 shadow-sm"
      style={{
        WebkitBackdropFilter: "blur(12px)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex h-20 items-center gap-4 px-4 md:px-8">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-xl hover:bg-primary/10 transition-colors shadow-none border border-transparent focus-visible:ring-2 focus-visible:ring-primary/30"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5 text-gray-400 hover:text-primary" />
        </Button>

        {/* Desktop Sidebar Collapse Button */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex rounded-xl hover:bg-primary/10 transition-colors shadow-none border border-transparent focus-visible:ring-2 focus-visible:ring-primary/30"
          onClick={onSidebarCollapseToggle}
          aria-label={
            isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {isSidebarCollapsed ? (
            <PanelLeft
              strokeWidth={1.5}
              className="h-5 w-5 text-gray-400 hover:text-primary"
            />
          ) : (
            <PanelLeft
              strokeWidth={1.5}
              className="h-5 w-5 text-gray-400 hover:text-primary"
            />
          )}
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 pr-4 h-11 border-0 bg-white/5 focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
          </form>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl hover:bg-primary/10 transition-colors shadow-none border border-transparent focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <Bell className="h-5 w-5 text-gray-400 hover:text-primary" />
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground shadow"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-card/80 border-border rounded-xl shadow-2xl backdrop-blur-md"
            >
              <DropdownMenuLabel className="text-white font-semibold">
                Notifications
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <div className="space-y-3 p-3">
                <div className="text-sm p-3 rounded-lg bg-white/5 hover:bg-primary/5 transition-colors">
                  <div className="font-medium text-white">
                    5 memberships expiring soon
                  </div>
                  <div className="text-gray-400">
                    Review and send renewal reminders
                  </div>
                </div>
                <div className="text-sm p-3 rounded-lg bg-white/5 hover:bg-primary/5 transition-colors">
                  <div className="font-medium text-white">
                    New member registered
                  </div>
                  <div className="text-gray-400">John Doe joined today</div>
                </div>
                <div className="text-sm p-3 rounded-lg bg-white/5 hover:bg-primary/5 transition-colors">
                  <div className="font-medium text-white">Payment received</div>
                  <div className="text-gray-400">$150 from Jane Smith</div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-primary/10 transition-colors shadow-none border border-transparent focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <Settings className="h-5 w-5 text-gray-400 hover:text-primary" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl hover:bg-primary/10 transition-colors shadow-none border border-transparent focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <User className="h-5 w-5 text-gray-400 hover:text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-card/80 border-border rounded-xl shadow-2xl backdrop-blur-md"
            >
              <DropdownMenuLabel className="text-white font-semibold">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="text-gray-400 hover:text-white hover:bg-primary/10 rounded-lg">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-400 hover:text-white hover:bg-primary/10 rounded-lg">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-gray-400 hover:text-white hover:bg-primary/10 rounded-lg"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
