"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ChevronDownIcon } from "lucide-react";
import { MembershipPlan, Member } from "@/lib/types";
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
  LayoutGrid,
  TableIcon,
} from "lucide-react";
import { MemberDialog } from "@/components/members/member-dialog";
import { MemberDetailDialog } from "@/components/members/member-detail-dialog";
import { useDebounce } from "@/hooks/use-members";
import { DatePickerField } from "@/components/ui/datepicker-field";

export function MembersClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [filterOpen, setFilterOpen] = useState(false);

  // Query members
  const {
    data: members = [],
    isLoading,
    isError,
  } = useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await fetch("/api/members?limit=1000");
      const data = await res.json();
      return data.members || [];
    },
    refetchOnWindowFocus: true,
  });

  // Filter state: join date
const [joinDateFrom, setJoinDateFrom] = React.useState<Date>()
  const [joinDateTo, setJoinDateTo] = React.useState<Date | undefined>();
  const [membershipFrom, setMembershipFrom] = React.useState<Date | undefined>();
  const [membershipTo, setMembershipTo] = React.useState<Date | undefined>();

  const [planId, setPlanId] = useState<string>("all");
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  useEffect(() => {
    setLoadingPlans(true);
    fetch("/api/plans/list")
      .then((res) => res.json())
      .then((data) => setPlans(data.plans || []))
      .finally(() => setLoadingPlans(false));
  }, []);

  // Filtered data: search, join date, membership period, plan
  const filteredMembers = useMemo(() => {
    let result = [...members];
    // Search
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (member) =>
          member.full_name.toLowerCase().includes(query) ||
          member.email?.toLowerCase().includes(query) ||
          member.phone?.includes(query)
      );
    }

    // Join Date filter
    if (joinDateFrom) {
      result = result.filter((m) => {
        const joined = new Date(m.created_at);
        return joined >= joinDateFrom;
      });
    }
    if (joinDateTo) {
      result = result.filter((m) => {
        const joined = new Date(m.created_at);
        return joined <= joinDateTo;
      });
    }

    if (planId && planId !== "all") {
      result = result.filter((m) =>
        m.subscriptions?.some((s) =>
          s.membership_plan?.id && String(s.membership_plan.id) === String(planId)
        )
      );
    }

    if (membershipFrom) {
      result = result.filter((m) =>
        m.subscriptions?.some((s) => {
          if (!s.start_date) return false;
          return new Date(s.start_date) >= membershipFrom;
        })
      );
    }
    if (membershipTo) {
      result = result.filter((m) =>
        m.subscriptions?.some((s) => {
          if (!s.end_date) return false;
          return new Date(s.end_date) <= membershipTo;
        })
      );
    }

    return result;
  }, [members, debouncedSearchQuery, joinDateFrom, joinDateTo, planId, membershipFrom, membershipTo]);

  const handleMemberUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["members"] });
  };

  function getStatusBadge(member: Member) {
    if (member.subscriptions && member.subscriptions.length > 0) {
      const sorted = [...member.subscriptions].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const sub = sorted[0];
      let badgeColor: "default" | "outline" | "destructive" | "secondary" =
        "default";
      let badgeText = sub.status.charAt(0).toUpperCase() + sub.status.slice(1);
      if (sub.status === "pending") badgeColor = "outline";
      if (sub.status === "expired") badgeColor = "destructive";
      if (sub.status === "cancelled") badgeColor = "secondary";
      return (
        <div className="flex flex-col gap-1">
          <Badge variant={badgeColor}>{badgeText}</Badge>
          <span className="text-xs text-muted-foreground">
            {sub.membership_plan?.name ? sub.membership_plan.name + " | " : ""}
            {sub.start_date
              ? new Date(sub.start_date).toLocaleDateString()
              : "-"}
            {sub.end_date
              ? " - " + new Date(sub.end_date).toLocaleDateString()
              : ""}
          </span>
        </div>
      );
    }
    return <Badge variant="outline">No Subscription</Badge>;
  }

  return (
    <div className="space-y-4">
      {/* Search, View Toggle & Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-11 border-0 bg-white/5 focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2 bg-white/10 border border-white/20 rounded-xl shadow-sm px-2 py-1 backdrop-blur-md">
            <button
              type="button"
              aria-label="Card View"
              className={`rounded-lg p-2 hover:bg-primary/10 ${
                viewMode === "card"
                  ? "bg-primary/20 text-primary shadow"
                  : "text-gray-300"
              }`}
              onClick={() => setViewMode("card")}
            >
              <LayoutGrid strokeWidth={1.5} className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Table View"
              className={`rounded-lg p-2 hover:bg-primary/10 ${
                viewMode === "table"
                  ? "bg-primary/20 text-primary shadow"
                  : "text-gray-300"
              }`}
              onClick={() => setViewMode("table")}
            >
              <TableIcon strokeWidth={1.5} className="h-4 w-4" />
            </button>
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className="ml-2"
          >
            Filters
          </Button>
        </div>
      </div>

      {/* Filter Sheet */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <form className="space-y-6 mt-4">
            {/* Join Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <DatePickerField
                label="Join Date From"
                value={joinDateFrom}
                onChange={setJoinDateFrom}
                className="w-full"
              />
              <DatePickerField
                label="Join Date To"
                value={joinDateTo}
                onChange={setJoinDateTo}
                className="w-full"
              />
            </div>




            {/* Membership Plan */}
            <div>
              <Label className="block mb-1">Membership Plan</Label>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingPlans ? "Loading..." : "All Plans"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Membership Period */}
            <div>
              <Label className="block mb-1">Membership Period</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DatePickerField
                  label="Period From"
                  value={membershipFrom}
                  onChange={setMembershipFrom}
                  className="w-full"
                />
                <DatePickerField
                  label="Period To"
                  value={membershipTo}
                  onChange={setMembershipTo}
                  className="w-full"
                />
              </div>
            </div>

            <SheetFooter className="pt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setJoinDateFrom(undefined)
                  setJoinDateTo(undefined)
                  setMembershipFrom(undefined)
                  setMembershipTo(undefined)
                  setPlanId("all")
                }}
              >
                Reset
              </Button>
              <Button type="submit">Apply Filters</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Members List / Table */}
      {viewMode === "card" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="text-center py-8 col-span-full">Loading...</div>
          ) : isError ? (
            <div className="text-center py-8 col-span-full text-red-500">
              Failed to load members
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 col-span-full">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No members found matching your search"
                  : "No members found"}
              </p>
            </div>
          ) : (
            filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={member.photo_url || ""} />
                      <AvatarFallback>
                        {member.full_name
                          .split(" ")
                          .map((n) => n[0])
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
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
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
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
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
            ))
          )}
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-red-500">
                    Failed to load members
                  </TableCell>
                </TableRow>
              ) : filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    {searchQuery
                      ? "No members found matching your search"
                      : "No members found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.photo_url || ""} />
                        <AvatarFallback>
                          {member.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {member.full_name}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>
                      {new Date(member.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(member)}</TableCell>
                    <TableCell>
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
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
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
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Member
                              </DropdownMenuItem>
                            }
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
