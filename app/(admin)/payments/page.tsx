"use client";

import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSign, TrendingUp, Calendar, Plus } from "lucide-react";
import { Payment, Member } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

export default function PaymentsPage() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<any>({
    totalPayments: 0,
    totalRevenue: 0,
    monthlyPayments: 0,
  });
  const [members, setMembers] = useState<Member[]>([]);

  const [form, setForm] = useState({
    member_id: "",
    subscription_id: "manual",
    amount_cents: "",
    method: "cash",
    status: "paid",
    paid_at: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const [memberSubscriptions, setMemberSubscriptions] = useState<any[]>([]);
  const [amountWarning, setAmountWarning] = useState<string>("");

  useEffect(() => {
    fetchPayments();
    fetchStats();
    fetchMembers();
  }, []);

  const fetchPayments = async () => {
    const res = await fetch("/api/payments");
    const data = await res.json();
    setPayments(data.payments || []);
  };
  const fetchStats = async () => {
    const res = await fetch("/api/dashboard/payments");
    const data = await res.json();
    setStats(data.stats || { totalPayments: 0, totalRevenue: 0, monthlyPayments: 0 });
  };
  const fetchMembers = async () => {
    const res = await fetch("/api/members?limit=1000");
    const data = await res.json();
    setMembers(data.members || []);
  };

  const handleFormChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Fetch subscriptions when member changes
  useEffect(() => {
    if (form.member_id) {
      fetch(`/api/subscriptions?member_id=${form.member_id}`)
        .then((res) => res.json())
        .then((data) => setMemberSubscriptions(data.data || []));
    } else {
      setMemberSubscriptions([]);
    }
    // Reset subscription_id if member changes
    setForm((f) => ({ ...f, subscription_id: "manual" }));
  }, [form.member_id]);

  const handleSelectChange = (name: string, value: string) => {
    // If selecting subscription, auto-fill amount from plan price
    if (name === "subscription_id") {
      if (value !== "manual") {
        const sub = memberSubscriptions.find((s) => s.id === value);
        if (sub && sub.membership_plan && sub.membership_plan.price_cents) {
          setForm((f) => ({
            ...f,
            subscription_id: value,
            amount_cents: String(sub.membership_plan.price_cents),
          }));
          setAmountWarning("");
          return;
        }
      }
    }
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (form.subscription_id && form.subscription_id !== "manual") {
      const sub = memberSubscriptions.find(
        (s) => s.id === form.subscription_id
      );
      if (sub && sub.membership_plan && sub.membership_plan.price_cents) {
        const planPrice = Number(sub.membership_plan.price_cents);
        const entered = Number(form.amount_cents);
        if (entered !== planPrice) {
          setAmountWarning(
            `Amount must match plan price: Rp ${planPrice.toLocaleString(
              "id-ID"
            )}`
          );
          return;
        }
      }
    }
    setAmountWarning("");
    setLoading(true);
    const payload = {
      ...form,
      subscription_id:
        form.subscription_id === "manual" ? null : form.subscription_id,
      amount_cents: parseInt(form.amount_cents, 10),
      paid_at: form.paid_at ? new Date(form.paid_at).toISOString() : null,
    };
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      if (payload.subscription_id) {
        const sub = memberSubscriptions.find(
          (s) => s.id === payload.subscription_id
        );
        if (sub && sub.membership_plan) {
          const startDate =
            payload.paid_at?.slice(0, 10) ||
            new Date().toISOString().slice(0, 10);
          const endDate = new Date(startDate);
          endDate.setDate(
            endDate.getDate() + sub.membership_plan.duration_days
          );
          await fetch("/api/subscriptions", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: sub.id,
              status: "active",
              start_date: startDate,
              end_date: endDate.toISOString().slice(0, 10),
            }),
          });

          await fetch("/api/qr-tokens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              member_id: sub.member_id,
              expires_at: endDate.toISOString(),
            }),
          });
        }
      }
      setOpen(false);
      setForm({
        member_id: "",
        subscription_id: "",
        amount_cents: "",
        method: "cash",
        status: "paid",
        paid_at: new Date().toISOString().slice(0, 10),
        notes: "",
      });
      fetchPayments();
      fetchStats();
    } else {
      alert("Failed to add payment");
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-600 hover:bg-green-700">Paid</Badge>;
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-yellow-500 border-yellow-500"
          >
            Pending
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "refunded":
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  function formatRupiah(num: string | number) {
    const n = typeof num === "string" ? Number(num.replace(/[^\d]/g, "")) : num;
    return n ? "Rp " + n.toLocaleString("id-ID") : "";
  }

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return <Badge variant="outline">Cash</Badge>;
      case "transfer":
        return <Badge variant="outline">Transfer</Badge>;
      case "ewallet":
        return <Badge variant="outline">E-Wallet</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            Track and manage member payments
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent
            className="sm:max-w-[420px] rounded-2xl p-0 overflow-hidden"
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
                Record Payment
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-base">
                Add a new payment for a member.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-8 px-8 pb-8 pt-2">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="member_id" className="text-white">
                    Member *
                  </Label>
                  <Select
                    value={form.member_id}
                    onValueChange={(v) => handleSelectChange("member_id", v)}
                  >
                    <SelectTrigger
                      id="member_id"
                      className="bg-white/30 border-white/20 text-white focus:ring-primary/30 shadow-sm"
                    >
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Subscription dropdown, only show if member selected */}
                {form.member_id && (
                  <div className="space-y-2">
                    <Label htmlFor="subscription_id" className="text-white">
                      Subscription
                    </Label>
                    <Select
                      value={form.subscription_id}
                      onValueChange={(v) =>
                        handleSelectChange("subscription_id", v)
                      }
                    >
                      <SelectTrigger
                        id="subscription_id"
                        className="bg-white/30 border-white/20 text-white focus:ring-primary/30 shadow-sm"
                      >
                        <SelectValue placeholder="Manual Payment (no subscription)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">
                          Manual Payment (no subscription)
                        </SelectItem>
                        {memberSubscriptions.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.membership_plan?.name || "Plan"} ({sub.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="amount_cents" className="text-white">
                    Amount (Rupiah) *
                  </Label>
                  <Input
                    id="amount_cents"
                    name="amount_cents"
                    value={formatRupiah(form.amount_cents)}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        amount_cents: e.target.value.replace(/[^\d]/g, ""),
                      });
                      // If subscription selected, validate live
                      if (
                        form.subscription_id &&
                        form.subscription_id !== "manual"
                      ) {
                        const sub = memberSubscriptions.find(
                          (s) => s.id === form.subscription_id
                        );
                        if (
                          sub &&
                          sub.membership_plan &&
                          sub.membership_plan.price_cents
                        ) {
                          const planPrice = Number(
                            sub.membership_plan.price_cents
                          );
                          const entered = Number(
                            e.target.value.replace(/[^\d]/g, "")
                          );
                          if (entered !== planPrice) {
                            setAmountWarning(
                              `Amount must match plan price: Rp ${planPrice.toLocaleString(
                                "id-ID"
                              )}`
                            );
                          } else {
                            setAmountWarning("");
                          }
                        }
                      } else {
                        setAmountWarning("");
                      }
                    }}
                    placeholder="e.g. 150000"
                    inputMode="numeric"
                    required
                    className="bg-white/30 border-white/20 text-white placeholder:text-gray-400 focus:ring-primary/30 shadow-sm"
                  />
                  {amountWarning && (
                    <div className="text-sm text-red-500 mt-1">
                      {amountWarning}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="method" className="text-white">
                      Method *
                    </Label>
                    <Select
                      value={form.method}
                      onValueChange={(v) => handleSelectChange("method", v)}
                    >
                      <SelectTrigger
                        id="method"
                        className="bg-white/30 border-white/20 text-white focus:ring-primary/30 shadow-sm"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="ewallet">E-Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="status" className="text-white">
                      Status *
                    </Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) => handleSelectChange("status", v)}
                    >
                      <SelectTrigger
                        id="status"
                        className="bg-white/30 border-white/20 text-white focus:ring-primary/30 shadow-sm"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paid_at" className="text-white">
                    Paid At *
                  </Label>
                  <Input
                    id="paid_at"
                    name="paid_at"
                    type="date"
                    value={form.paid_at}
                    onChange={handleFormChange}
                    required
                    className="bg-white/30 border-white/20 text-white placeholder:text-gray-400 focus:ring-primary/30 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-white">
                    Notes
                  </Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    placeholder="(optional)"
                    className="bg-white/30 border-white/20 text-white placeholder:text-gray-400 focus:ring-primary/30 shadow-sm"
                  />
                </div>
              </div>
              <DialogFooter className="pt-4 flex justify-end gap-3">
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
                  {loading ? "Saving..." : "Save Payment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.totalPayments}
            </div>
            <p className="text-xs text-muted-foreground">
              Total payment transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRupiah(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total revenue received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payments This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats.monthlyPayments}
            </div>
            <p className="text-xs text-muted-foreground">Payments in current month</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No payments recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={payment.member?.photo_url || ""} />
                      <AvatarFallback>
                        {payment.member?.full_name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("") || "N/A"}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-medium">
                        {payment.member?.full_name || "Unknown Member"}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          {payment.subscription?.membership_plan?.name ||
                            "Manual Payment"}
                        </span>
                        {payment.notes && (
                          <>
                            <span>•</span>
                            <span>{payment.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatRupiah(payment.amount_cents)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          payment.paid_at || payment.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      {getStatusBadge(payment.status)}
                      {getMethodBadge(payment.method)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
