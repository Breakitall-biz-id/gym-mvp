"use client";
import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, DollarSign, Edit, EyeOff, Eye } from "lucide-react";
// Reactivate plan
async function handleReactivate(plan: MembershipPlan) {
  setLoading(true);
  setError(null);
  try {
    const res = await fetch(`/api/plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...plan,
        is_active: true,
      }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    fetchPlans();
  } catch (e: any) {
    setError(e.message || "Failed to reactivate plan");
  } finally {
    setLoading(false);
  }
}

import { PlanDialog } from "./plan-dialog";
import { MembershipPlan } from "@/lib/types";

export default function PlansPage() {
  // Reactivate plan
  async function handleReactivate(plan: MembershipPlan) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...plan,
          is_active: true,
        }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      fetchPlans();
    } catch (e: any) {
      setError(e.message || "Failed to reactivate plan");
    } finally {
      setLoading(false);
    }
  }
  const [tab, setTab] = React.useState<"active" | "inactive">("active");
  // Nonaktifkan plan
  async function handleDeactivate(plan: MembershipPlan) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...plan,
          is_active: false,
        }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      fetchPlans();
    } catch (e: any) {
      setError(e.message || "Failed to deactivate plan");
    } finally {
      setLoading(false);
    }
  }
  const [plans, setPlans] = React.useState<MembershipPlan[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editPlan, setEditPlan] = React.useState<MembershipPlan | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch plans from Supabase
  const fetchPlans = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("membership_plans")
      .select("*")
      .order("duration_days", { ascending: true });
    if (error) setError(error.message);
    setPlans(data || []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Add or edit plan handler
  async function handleSubmit(data: {
    name: string;
    price: number;
    duration: number;
  }) {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (editPlan) {
        res = await fetch(`/api/plans/${editPlan.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            duration_days: data.duration * 30, // convert months to days
            price_cents: data.price,
            is_active: true,
          }),
        });
      } else {
        res = await fetch("/api/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            duration_days: data.duration * 30, // convert months to days
            price_cents: data.price,
            is_active: true,
          }),
        });
      }
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      setModalOpen(false);
      setEditPlan(null);
      fetchPlans();
    } catch (e: any) {
      setError(e.message || "Failed to save plan");
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    setEditPlan(null);
    setModalOpen(true);
  }
  function handleEdit(plan: MembershipPlan) {
    setEditPlan(plan);
    setModalOpen(true);
  }

  function formatRupiah(num: number) {
    return "Rp " + num.toLocaleString("id-ID");
  }

  const filteredPlans = plans.filter((p) =>
    tab === "active" ? p.is_active : !p.is_active
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Membership Plans</h1>
          <p className="text-muted-foreground">
            Manage your gym&apos;s membership plans and pricing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-white/10 border border-white/20 p-1 shadow">
            <button
              className={`px-4 py-1 rounded-lg font-semibold text-sm transition-all ${
                tab === "active"
                  ? "bg-primary text-black shadow"
                  : "text-white/70 hover:bg-white/10"
              }`}
              onClick={() => setTab("active")}
            >
              Active
            </button>
            <button
              className={`px-4 py-1 rounded-lg font-semibold text-sm transition-all ${
                tab === "inactive"
                  ? "bg-primary text-black shadow"
                  : "text-white/70 hover:bg-white/10"
              }`}
              onClick={() => setTab("inactive")}
            >
              Inactive
            </button>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan) => (
          <Card
            key={plan.id}
            className="relative group bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl rounded-2xl transition-all duration-200 hover:scale-[1.025] hover:shadow-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "1.5px solid rgba(255,255,255,0.13)",
              boxShadow:
                "0 8px 40px 0 rgba(0,0,0,0.18), 0 2px 8px 0 rgba(184,255,0,0.06)",
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-white drop-shadow mb-1 flex items-center gap-2">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-2xl font-mono font-semibold text-primary drop-shadow mb-2">
                    {formatRupiah(plan.price_cents)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={plan.is_active ? "default" : "secondary"}
                    className={
                      plan.is_active
                        ? "bg-green-500/90 text-black"
                        : "bg-gray-500/80 text-white"
                    }
                  >
                    {plan.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {plan.is_active ? (
                    <button
                      type="button"
                      title="Deactivate Plan"
                      className="ml-1 p-1 rounded-full bg-white/10 hover:bg-red-500/80 transition text-white border border-white/20 shadow"
                      onClick={() => handleDeactivate(plan)}
                      disabled={loading}
                    >
                      <EyeOff className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      title="Reactivate Plan"
                      className="ml-1 p-1 rounded-full bg-white/10 hover:bg-green-500/80 transition text-white border border-white/20 shadow"
                      onClick={() => handleReactivate(plan)}
                      disabled={loading}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-5">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-base text-white/80">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {plan.duration_days / 30} months
                  </span>
                </div>
                <div className="flex items-center gap-2 text-base text-white/80">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {formatRupiah(
                      Math.round(plan.price_cents / (plan.duration_days / 30))
                    )}
                    <span className="ml-1 text-xs text-white/60">/month</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  Created:{" "}
                  {new Date(plan.created_at).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="pt-3 border-t border-white/10 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center gap-2 rounded-lg border-white/20 bg-white/10 hover:bg-primary/10 text-white shadow"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">
                  No membership plans
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first membership plan to get started
                </p>
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <PlanDialog
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditPlan(null);
        }}
        onSubmit={handleSubmit}
        initialData={
          editPlan
            ? {
                name: editPlan.name,
                price: editPlan.price_cents,
                duration: editPlan.duration_days / 30,
              }
            : undefined
        }
        loading={loading}
        mode={editPlan ? "edit" : "create"}
        error={error}
      />
    </div>
  );
}
