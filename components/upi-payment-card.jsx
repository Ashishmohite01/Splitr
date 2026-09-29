"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, QrCode, ExternalLink, ShieldCheck, Edit3 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export function UpiPaymentCard({
  receiverName,
  receiverUpiId = "",
  amount = 0,
  note = "Splitr Settlement",
  onUpiChange,
}) {
  const [copied, setCopied] = useState(false);
  const [customUpi, setCustomUpi] = useState(receiverUpiId);
  const [isEditingUpi, setIsEditingUpi] = useState(!receiverUpiId);

  useEffect(() => {
    setCustomUpi(receiverUpiId || "");
    setIsEditingUpi(!receiverUpiId);
  }, [receiverUpiId]);

  const activeUpiId = customUpi || receiverUpiId;
  const numAmount = typeof amount === "number" ? amount : parseFloat(amount || 0);

  // Construct standard UPI deep link string
  const upiUrl = activeUpiId
    ? `upi://pay?pa=${encodeURIComponent(activeUpiId)}&pn=${encodeURIComponent(receiverName || "Receiver")}&am=${numAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`
    : "";

  // Dynamic QR Code URL using high quality QR API
  const qrCodeImageUrl = upiUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(upiUrl)}`
    : "";

  const handleCopyUpi = () => {
    if (!activeUpiId) return;
    navigator.clipboard.writeText(activeUpiId);
    setCopied(true);
    toast.success(`Copied ${activeUpiId} to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenUpiApp = (appScheme) => {
    if (!activeUpiId) {
      toast.error("Please enter a valid UPI ID first.");
      return;
    }

    if (numAmount <= 0) {
      toast.error("Amount must be greater than zero.");
      return;
    }

    // Deep link redirect
    let link = upiUrl;
    if (appScheme === "gpay") {
      link = upiUrl.replace("upi://", "gpay://upi/");
    } else if (appScheme === "phonepe") {
      link = upiUrl.replace("upi://", "phonepe://");
    } else if (appScheme === "paytm") {
      link = upiUrl.replace("upi://", "paytmmp://");
    }

    window.location.href = link;
  };

  return (
    <Card className="border-emerald-500/30 bg-emerald-950/5 dark:bg-emerald-950/20 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 bg-emerald-500/10 border-b border-emerald-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 text-white p-1.5 rounded-md">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-emerald-900 dark:text-emerald-300">
                Instant UPI Payment
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Pay {receiverName || "Friend"} directly via QR Code or UPI Apps
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300">
            ₹{numAmount.toFixed(2)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* UPI ID Info / Edit */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>RECEIVER UPI VPA</span>
            {receiverUpiId && (
              <button
                type="button"
                onClick={() => setIsEditingUpi(!isEditingUpi)}
                className="text-emerald-600 hover:underline flex items-center gap-1"
              >
                <Edit3 className="h-3 w-3" />
                {isEditingUpi ? "Done" : "Change"}
              </button>
            )}
          </div>

          {isEditingUpi ? (
            <div className="flex gap-2">
              <Input
                placeholder="e.g. receiver@okicici or mobile@paytm"
                value={customUpi}
                onChange={(e) => {
                  setCustomUpi(e.target.value);
                  if (onUpiChange) onUpiChange(e.target.value);
                }}
                className="text-sm font-mono h-9"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between bg-background border p-2 rounded-md font-mono text-sm">
              <span className="truncate">{activeUpiId}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyUpi}
                className="h-7 px-2 text-xs"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          )}
        </div>

        {activeUpiId && numAmount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Scannable QR Code */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border shadow-xs text-center space-y-2">
              <img
                src={qrCodeImageUrl}
                alt="UPI Payment QR Code"
                width={180}
                height={180}
                className="rounded-md border p-1"
              />
              <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1 justify-center">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Scan with GPay, PhonePe, Paytm, BHIM
              </p>
            </div>

            {/* Instant App Buttons */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                LAUNCH PAYMENT APP
              </p>

              <Button
                type="button"
                variant="outline"
                className="w-full justify-between bg-blue-50/50 hover:bg-blue-100/50 dark:bg-blue-950/20 border-blue-200 text-blue-900 dark:text-blue-300"
                onClick={() => handleOpenUpiApp("gpay")}
              >
                <span className="flex items-center gap-2 font-medium text-xs">
                  🌐 Google Pay / BHIM UPI
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full justify-between bg-purple-50/50 hover:bg-purple-100/50 dark:bg-purple-950/20 border-purple-200 text-purple-900 dark:text-purple-300"
                onClick={() => handleOpenUpiApp("phonepe")}
              >
                <span className="flex items-center gap-2 font-medium text-xs">
                  🟣 PhonePe App
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-purple-600" />
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full justify-between bg-sky-50/50 hover:bg-sky-100/50 dark:bg-sky-950/20 border-sky-200 text-sky-900 dark:text-sky-300"
                onClick={() => handleOpenUpiApp("paytm")}
              >
                <span className="flex items-center gap-2 font-medium text-xs">
                  🔷 Paytm App
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-sky-600" />
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={handleCopyUpi}
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                {copied ? "Copied UPI ID!" : "Copy UPI ID"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 rounded-md text-xs text-amber-800 dark:text-amber-300">
            Enter a valid UPI ID above to generate the instant QR Code and payment app links.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
