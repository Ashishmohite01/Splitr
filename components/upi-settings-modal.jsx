"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QrCode, Check, Loader2, Edit2 } from "lucide-react";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export function UpiSettingsModal({ variant = "outline", size = "sm" }) {
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const updateUpiId = useConvexMutation(api.users.updateUpiId);

  const [open, setOpen] = useState(false);
  const [upiIdInput, setUpiIdInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser?.upiId) {
      setUpiIdInput(currentUser.upiId);
    }
  }, [currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!upiIdInput.trim()) {
      toast.error("Please enter a valid UPI ID (e.g. name@upi)");
      return;
    }

    try {
      setIsSaving(true);
      await updateUpiId.mutate({ upiId: upiIdInput.trim() });
      toast.success("UPI ID saved successfully!");
      setOpen(false);
    } catch (err) {
      console.error("Failed to update UPI ID:", err);
      toast.error("Failed to save UPI ID");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <QrCode className="h-4 w-4 text-emerald-600" />
          {currentUser?.upiId ? "My UPI ID" : "Set UPI ID"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-emerald-600" />
            Your UPI Payment Setup
          </DialogTitle>
          <DialogDescription>
            Add your Virtual Payment Address (VPA / UPI ID) so friends can pay you instantly via GPay, PhonePe, or Paytm.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID / VPA</Label>
            <Input
              id="upiId"
              placeholder="e.g. username@okaxis, 9876543210@paytm"
              value={upiIdInput}
              onChange={(e) => setUpiIdInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Example: <code className="bg-muted px-1 rounded">yourname@okaxis</code> or <code className="bg-muted px-1 rounded">mobile@ybl</code>
            </p>
          </div>

          {currentUser?.upiId && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-md flex items-center justify-between text-xs text-emerald-800">
              <span className="font-mono font-medium">{currentUser.upiId}</span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <Check className="h-3.5 w-3.5" /> Active
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save UPI ID"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
