"use client";
import * as React from "react";
import { PlanDialog } from "./plan-dialog";
import { Button } from "@/components/ui/button";

// TODO: Replace with Supabase fetch
const mockPlans = [
  { id: 1, name: "Gold", price: 150000, duration: 1 },
  { id: 2, name: "Silver", price: 100000, duration: 1 },
];

export function PlansClient() {
  const [plans, setPlans] = React.useState(mockPlans);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editPlan, setEditPlan] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  function handleAdd() {
    setEditPlan(null);
    setDialogOpen(true);
  }

  function handleEdit(plan: any) {
    setEditPlan(plan);
    setDialogOpen(true);
  }

  function handleSubmit(data: {
    name: string;
    price: number;
    duration: number;
  }) {
    setLoading(true);
    setTimeout(() => {
      if (editPlan) {
        setPlans(
          plans.map((p) => (p.id === editPlan.id ? { ...p, ...data } : p))
        );
      } else {
        setPlans([
          ...plans,
          {
            ...data,
            id: plans.length ? Math.max(...plans.map((p) => p.id)) + 1 : 1,
          },
        ]);
      }
      setDialogOpen(false);
      setLoading(false);
    }, 800);
  }

  function formatRupiah(num: number) {
    return "Rp " + num.toLocaleString("id-ID");
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Membership Plans</h2>
        <Button onClick={handleAdd} variant="default">
          Add Plan
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-lg bg-glass border border-neutral-800/60">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-neutral-900/60">
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Price</th>
              <th className="px-4 py-3 text-left font-semibold">
                Duration (months)
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr
                key={plan.id}
                className="border-t border-neutral-800/40 hover:bg-neutral-800/30 transition"
              >
                <td className="px-4 py-3">{plan.name}</td>
                <td className="px-4 py-3">{formatRupiah(plan.price)}</td>
                <td className="px-4 py-3">{plan.duration}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(plan)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editPlan}
        loading={loading}
      />
    </div>
  );
}
