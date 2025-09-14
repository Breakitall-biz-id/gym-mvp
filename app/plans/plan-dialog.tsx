import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; price: number; duration: number }) => void;
  initialData?: { name: string; price: number; duration: number };
  loading?: boolean;
  mode?: "create" | "edit";
  error?: string | null;
}

export function PlanDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  loading,
  mode = "create",
  error,
}: PlanDialogProps) {
  const [name, setName] = React.useState(initialData?.name || "");
  const [price, setPrice] = React.useState(
    initialData?.price?.toString() || ""
  );
  const [duration, setDuration] = React.useState(
    initialData?.duration?.toString() || ""
  );

  React.useEffect(() => {
    setName(initialData?.name || "");
    setPrice(initialData?.price?.toString() || "");
    setDuration(initialData?.duration?.toString() || "");
  }, [initialData, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      price: Number(price.replace(/[^\d]/g, "")),
      duration: Number(duration),
    });
  }

  // Format price as rupiah
  function formatRupiah(value: string) {
    const number = value.replace(/[^\d]/g, "");
    return number ? "Rp " + Number(number).toLocaleString("id-ID") : "";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
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
            {mode === "edit" || initialData ? "Edit Plan" : "Add New Plan"}
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-base">
            {mode === "edit" || initialData
              ? "Update membership plan details"
              : "Create a new membership plan for your gym"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8 px-8 pb-8 pt-2">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="plan-name" className="text-white">
                Plan Name *
              </Label>
              <Input
                id="plan-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gold, Silver, Platinum"
                required
                autoFocus
                className="bg-white/30 border-white/20 text-white placeholder:text-gray-400 focus:ring-primary/30 shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-price" className="text-white">
                Price (Rupiah) *
              </Label>
              <Input
                id="plan-price"
                value={formatRupiah(price)}
                onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="e.g. 150000"
                inputMode="numeric"
                required
                className="bg-white/30 border-white/20 text-white placeholder:text-gray-400 focus:ring-primary/30 shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-duration" className="text-white">
                Duration (months) *
              </Label>
              <Input
                id="plan-duration"
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value.replace(/[^\d]/g, ""))
                }
                placeholder="e.g. 1, 3, 12"
                inputMode="numeric"
                required
                className="bg-white/30 border-white/20 text-white placeholder:text-gray-400 focus:ring-primary/30 shadow-sm"
              />
            </div>
            {error && <div className="text-red-500 text-sm pt-2">{error}</div>}
          </div>
          <DialogFooter className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
                : mode === "edit" || initialData
                ? "Update Plan"
                : "Create Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
