"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { Member } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Plus, Edit } from "lucide-react";
import { toast } from "sonner";

const memberSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  photo_url: z.string().optional(),
  plan_id: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;
// Fetch membership plans for dropdown
function usePlans() {
  const [plans, setPlans] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/plans/list")
      .then((res) => res.json())
      .then((data) => setPlans(data.plans || []));
  }, []);
  return plans;
}

interface MemberDialogProps {
  member?: Member;
  trigger?: React.ReactNode;
  mode?: "create" | "edit";
  onSuccess?: () => void;
}

export function MemberDialog({
  member,
  trigger,
  mode = "create",
  onSuccess,
}: MemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const plans = usePlans();
  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      full_name: member?.full_name || "",
      phone: member?.phone || "",
      email: member?.email || "",
      photo_url: member?.photo_url || "",
      plan_id: undefined,
    },
  });

  const onSubmit = async (data: MemberFormData) => {
    setLoading(true);
    try {
      // 1. Create or update member
      const response = await fetch(
        mode === "create" ? "/api/members" : `/api/members/${member!.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "An error occurred");
      }
      // 2. If plan selected and mode is create, create subscription
      if (mode === "create" && data.plan_id) {
        // Fetch plan detail for duration
        const plan = plans.find((p) => p.id === data.plan_id);
        if (plan) {
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + plan.duration_days);
          await fetch("/api/subscriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              member_id: result.data?.id,
              plan_id: plan.id,
              start_date: startDate.toISOString().slice(0, 10),
              end_date: endDate.toISOString().slice(0, 10),
              status: "active",
            }),
          });
        }
      }
      toast.success(
        result.message ||
          `Member ${mode === "create" ? "created" : "updated"} successfully`
      );
      setOpen(false);
      form.reset();
      onSuccess?.();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `member-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("member-photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("member-photos")
        .getPublicUrl(filePath);

      form.setValue("photo_url", data.publicUrl);
      toast.success("Photo uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const defaultTrigger =
    mode === "create" ? (
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Add Member
      </Button>
    ) : (
      <Button variant="outline" size="sm">
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
      <DialogContent
        className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden"
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
            {mode === "create" ? "Add New Member" : "Edit Member"}
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-base">
            {mode === "create"
              ? "Create a new gym member profile"
              : "Update member information"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 px-8 pb-8 pt-2"
          >
            {/* Photo Upload */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-20 w-20 shadow-lg border-2 border-primary/30 bg-white/10">
                <AvatarImage src={form.watch("photo_url")} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {form
                    .watch("full_name")
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "MB"}
                </AvatarFallback>
              </Avatar>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() =>
                    document.getElementById("photo-upload")?.click()
                  }
                  className="rounded-lg border-white/20 bg-white/10 hover:bg-primary/10 text-white shadow"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload Photo"}
                </Button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter full name"
                        {...field}
                        className="input bg-white/30 border-white/20 text-white placeholder:text-gray-400 focus:ring-primary/30 shadow-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        {...field}
                        className="input bg-white/30 border-white/20 text-white placeholder:text-gray-400 focus:ring-primary/30 shadow-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Phone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter phone number"
                        {...field}
                        className="input bg-white/30 border-white/20 text-white placeholder:text-gray-400 focus:ring-primary/30 shadow-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Membership Plan Dropdown */}
              <FormField
                control={form.control}
                name="plan_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Membership Plan</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="bg-white/30 border-white/20 text-white focus:ring-primary/30 shadow-sm">
                        <SelectValue placeholder="Select plan (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} ({plan.duration_days} hari)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="rounded-lg border-white/20 bg-white/10 hover:bg-primary/10 text-white shadow"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary text-black font-bold shadow-md hover:bg-primary/90"
              >
                {loading
                  ? "Saving..."
                  : mode === "create"
                  ? "Create Member"
                  : "Update Member"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
