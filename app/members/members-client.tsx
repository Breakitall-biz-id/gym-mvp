"use client";

import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Phone,
  Mail,
  Eye,
  Edit,
  RefreshCw,
} from "lucide-react";
import { Member } from "@/lib/types";
import { MemberDialog } from "@/components/members/member-dialog";
import { MemberDetailDialog } from "@/components/members/member-detail-dialog";
import { useDebounce } from "@/hooks/use-members";
import { useRouter } from "next/navigation";

interface MembersClientProps {
  members: Member[];
}

export function MembersClient({ members: initialMembers }: MembersClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState(initialMembers);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Debounce search query untuk optimasi performa
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoize filtered members untuk performa
  const filteredMembers = useMemo(() => {
    if (!debouncedSearchQuery) return members;

    const query = debouncedSearchQuery.toLowerCase();
    return members.filter(
      (member) =>
        member.full_name.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.phone?.includes(query)
    );
  }, [members, debouncedSearchQuery]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      router.refresh();
    } finally {
      // Set timeout to show loading state briefly
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [router]);

  const handleMemberUpdate = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const getStatusBadge = (member: Member) => {
    const subscription = member.active_subscription;
    if (!subscription) {
      return <Badge variant="outline">No Subscription</Badge>;
    }

    const endDate = new Date(subscription.end_date);
    const today = new Date();
    const daysLeft = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysLeft <= 7) {
      return (
        <Badge variant="outline" className="border-yellow-400 text-yellow-400">
          Expiring Soon
        </Badge>
      );
    } else {
      return <Badge variant="default">Active</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="shrink-0"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Members Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={member.photo_url || ""} />
                  <AvatarFallback>
                    {member.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{member.full_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(member.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                {getStatusBadge(member)}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <MemberDetailDialog
                      member={member}
                      onSuccess={handleMemberUpdate}
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                      }
                    />
                    <MemberDialog
                      member={member}
                      mode="edit"
                      onSuccess={handleMemberUpdate}
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Member
                        </DropdownMenuItem>
                      }
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchQuery
              ? "No members found matching your search"
              : "No members found"}
          </p>
        </div>
      )}
    </div>
  );
}
