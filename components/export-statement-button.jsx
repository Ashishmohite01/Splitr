"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileText } from "lucide-react";
import { exportToPDF } from "@/lib/export-utils";
import { toast } from "sonner";

export function ExportStatementButton({
  title,
  entityName,
  expenses = [],
  settlements = [],
  currentUser,
  userLookupMap = {},
  netBalance = 0,
  isGroup = false,
  variant = "outline",
  size = "default",
  className = "",
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    let toastId;
    try {
      setIsExporting(true);
      toastId = toast.loading("Generating PDF statement...");

      // Small async tick so browser renders loading state before CPU PDF generation
      await new Promise((resolve) => setTimeout(resolve, 100));

      exportToPDF({
        title,
        entityName,
        expenses,
        settlements,
        currentUser,
        userLookupMap,
        netBalance,
        isGroup,
      });

      toast.success("PDF Statement downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("PDF Export error:", error);
      if (toastId) {
        toast.error("Failed to generate PDF statement.", { id: toastId });
      } else {
        toast.dismiss();
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={isExporting}
      onClick={handleExportPDF}
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Export PDF
    </Button>
  );
}
