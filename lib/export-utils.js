import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

/**
 * Format currency with Indian Numbering System (e.g. Rs. 32,839.92)
 */
const formatINR = (amount) => {
  const num = typeof amount === "number" ? amount : parseFloat(amount || 0);
  return `Rs. ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Helper to get user display name
 */
const getUserName = (userId, currentUser, userLookupMap) => {
  if (userId === currentUser?._id || userId === currentUser?.id) return "You";
  if (userLookupMap && userLookupMap[userId]) {
    return userLookupMap[userId].name || "User";
  }
  return "Member";
};

/**
 * Export Formatted PDF Statement
 */
export function exportToPDF({ title, entityName, expenses = [], settlements = [], currentUser, userLookupMap = {}, netBalance = 0, isGroup = false }) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const marginX = 12;
  const pageWidth = 210;
  const contentWidth = pageWidth - marginX * 2; // 186mm

  const primaryColor = [34, 197, 94]; // Green-600 #22c55e
  const lightBgColor = [248, 250, 252]; // Slate-50

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 26, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("SPLITR", marginX, 17);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("TRANSACTION STATEMENT REPORT", pageWidth - marginX, 17, { align: "right" });

  // 2. Statement Metadata Section
  let currentY = 34;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title || "Account Statement", marginX, currentY);

  currentY += 5;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Scope: ${entityName || "General Account"}`, marginX, currentY);
  doc.text(`Generated: ${format(new Date(), "dd MMM yyyy, hh:mm a")}`, pageWidth - marginX, currentY, { align: "right" });

  currentY += 4.5;
  doc.text(`Account Holder: ${currentUser?.name || "User"} (${currentUser?.email || ""})`, marginX, currentY);

  // Divider Line
  currentY += 5;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  // 3. Financial Summary Box
  currentY += 5;
  const totalExpenseSum = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalSettlementSum = settlements.reduce((sum, s) => sum + (s.amount || 0), 0);

  doc.setFillColor(...lightBgColor);
  doc.roundedRect(marginX, currentY, contentWidth, 22, 2, 2, "F");

  // Summary Metrics
  const boxY = currentY + 5.5;
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");

  doc.text("TOTAL EXPENSES", marginX + 6, boxY);
  doc.text("TOTAL SETTLEMENTS", marginX + 54, boxY);
  doc.text("TRANSACTIONS", marginX + 104, boxY);
  doc.text("NET BALANCE STATUS", pageWidth - marginX - 6, boxY, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");

  doc.text(formatINR(totalExpenseSum), marginX + 6, boxY + 6.5);
  doc.text(formatINR(totalSettlementSum), marginX + 54, boxY + 6.5);
  doc.text(`${expenses.length + settlements.length}`, marginX + 104, boxY + 6.5);

  if (netBalance > 0) {
    doc.setTextColor(22, 163, 74); // Green
    doc.text(`+${formatINR(netBalance)} (Owed)`, pageWidth - marginX - 6, boxY + 6.5, { align: "right" });
  } else if (netBalance < 0) {
    doc.setTextColor(220, 38, 38); // Red
    doc.text(`-${formatINR(Math.abs(netBalance))} (Owe)`, pageWidth - marginX - 6, boxY + 6.5, { align: "right" });
  } else {
    doc.setTextColor(100, 116, 139);
    doc.text("Settled Up", pageWidth - marginX - 6, boxY + 6.5, { align: "right" });
  }

  currentY += 28;

  // 4. Combined Transaction Table
  const allRows = [];

  expenses.forEach((exp) => {
    const payerName = getUserName(exp.paidByUserId, currentUser, userLookupMap);
    const userSplit = exp.splits?.find(
      (s) => s.userId === currentUser?._id || s.userId === currentUser?.id
    );
    const yourShare = userSplit ? userSplit.amount : 0;

    allRows.push({
      rawDate: new Date(exp.date),
      date: format(new Date(exp.date), "dd MMM yyyy"),
      type: "Expense",
      description: exp.description || "Expense",
      category: exp.category || "General",
      paidBy: payerName,
      totalAmount: formatINR(exp.amount),
      yourShare: formatINR(yourShare),
    });
  });

  settlements.forEach((set) => {
    const payerName = getUserName(set.paidByUserId, currentUser, userLookupMap);
    const receiverName = getUserName(set.receivedByUserId, currentUser, userLookupMap);

    allRows.push({
      rawDate: new Date(set.date),
      date: format(new Date(set.date), "dd MMM yyyy"),
      type: "Settlement",
      description: set.note ? `Settlement: ${set.note}` : `${payerName} paid ${receiverName}`,
      category: "Transfer",
      paidBy: payerName,
      totalAmount: formatINR(set.amount),
      yourShare: (set.paidByUserId === (currentUser?._id || currentUser?.id) || set.receivedByUserId === (currentUser?._id || currentUser?.id)) ? formatINR(set.amount) : "N/A",
    });
  });

  allRows.sort((a, b) => b.rawDate - a.rawDate);

  const tableBody = allRows.map((r) => [
    r.date,
    r.type,
    r.description,
    r.category,
    r.paidBy,
    r.totalAmount,
    r.yourShare,
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    head: [["Date", "Type", "Description", "Category", "Paid By", "Total Amount", "Your Impact"]],
    body: tableBody,
    theme: "striped",
    styles: {
      overflow: "linebreak",
      cellPadding: 2,
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: 40,
    },
    columnStyles: {
      0: { cellWidth: 23 },
      1: { cellWidth: 20, fontStyle: "bold", fontSize: 7.5 },
      2: { cellWidth: 46 },
      3: { cellWidth: 22 },
      4: { cellWidth: 24 },
      5: { cellWidth: 25, halign: "right" },
      6: { cellWidth: 26, halign: "right" },
    },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Splitr Financial Statement • Page ${data.pageNumber} of ${pageCount}`,
        marginX,
        297 - 10
      );
      doc.text(
        "Confidential & System Generated",
        pageWidth - marginX,
        297 - 10,
        { align: "right" }
      );
    },
  });

  // Save PDF
  const fileName = `${(title || "statement").toLowerCase().replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd")}.pdf`;
  doc.save(fileName);
}
