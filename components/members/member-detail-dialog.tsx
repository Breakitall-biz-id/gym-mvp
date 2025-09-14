"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Member } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { MemberDialog } from "./member-dialog";

interface MemberDetailDialogProps {
  member: Member;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function MemberDetailDialog({
  member,
  trigger,
  onSuccess,
}: MemberDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/members/${member.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to delete member");
      }

      toast.success(result.message || "Member deleted successfully");
      setOpen(false);
      onSuccess?.();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete member");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = () => {
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

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Eye className="h-4 w-4 mr-2" />
      View
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent
        className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.30)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1.5px solid rgba(255,255,255,0.10)",
          boxShadow:
            "0 8px 40px 0 rgba(0,0,0,0.18), 0 2px 8px 0 rgba(184,255,0,0.06)",
        }}
      >
        <DialogHeader className="px-8 pt-8 pb-2">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow">
            Member Details
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-base">
            View and manage member information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 px-8 pb-8 pt-2">
          {/* Member Info */}
          <div className="flex items-start space-x-4 bg-white/10 rounded-xl p-6 shadow border border-white/10">
            <Avatar className="h-16 w-16 shadow border-2 border-primary/30 bg-white/10">
              <AvatarImage src={member.photo_url || ""} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {member.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white drop-shadow">
                  {member.full_name}
                </h3>
                {getStatusBadge()}
              </div>

              <div className="space-y-1 text-sm text-gray-300">
                {member.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {member.email}
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {member.phone}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Joined {format(new Date(member.created_at), "MMM dd, yyyy")}
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="bg-white/10 rounded-xl p-6 shadow border border-white/10">
            <h4 className="font-medium mb-3 flex items-center gap-2 text-white">
              <CreditCard className="h-4 w-4" />
              Subscriptions
            </h4>
            {member.subscriptions && member.subscriptions.length > 0 ? (
              <div className="space-y-4">
                {member.subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="border-b border-white/10 pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">
                        {sub.membership_plan?.name || "-"}
                      </span>
                      <span className="capitalize text-xs px-2 py-1 rounded bg-white/20 text-white">
                        {sub.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-300">Start:</span>
                      <span className="text-white">
                        {sub.start_date
                          ? format(new Date(sub.start_date), "MMM dd, yyyy")
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">End:</span>
                      <span className="text-white">
                        {sub.end_date
                          ? format(new Date(sub.end_date), "MMM dd, yyyy")
                          : "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-300">No subscriptions</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <div className="flex space-x-2">
              <MemberDialog
                member={member}
                mode="edit"
                onSuccess={() => {
                  onSuccess?.();
                  setOpen(false);
                }}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-white/20 bg-white/10 hover:bg-primary/10 text-white shadow"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                }
              />

              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-white/20 bg-white/10 hover:bg-primary/10 text-white shadow"
              >
                <Activity className="h-4 w-4 mr-2" />
                View Activity
              </Button>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-lg shadow"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the member &ldquo;{member.full_name}&rdquo; and remove all
                    associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? "Deleting..." : "Delete Member"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
