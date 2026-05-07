
import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportSummaryPDF = (data: any[], title: string, total: number) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Font setup
  doc.setFont("helvetica", "bold");
  
  // Main Title (Black, Centered)
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("MINAR GO EXPATRIATE DEVELOPMENT FOUNDATION", pageWidth / 2, 20, { align: "center" });
  
  // Subtitle (Black, Normal, Centered)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`OFFICIAL COLLECTION SUMMARY REPORT - ${new Date().getFullYear()}`, pageWidth / 2, 30, { align: "center" });
  
  // Prepare Table Data
  const tableData = data.map(t => [
    t.n, 
    t.d, 
    `${t.a.toLocaleString()} TK`
  ]);
  
  // Generate Table
  (doc as any).autoTable({
    startY: 40,
    head: [["Member Name", "Deposit Date", "Amount (TK)"]],
    body: tableData,
    theme: "striped",
    headStyles: { 
      fillColor: [0, 35, 102], // Dark Blue from screenshot
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 11,
      halign: "left"
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
      valign: "middle"
    },
    columnStyles: {
      2: { halign: "right" } // Amount column right aligned
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245] // Light Grey Zebra rows
    },
    margin: { left: 15, right: 15 }
  });
  
  // Get the Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 12;
  
  // Footer - Total Collection (Right Aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("TOTAL COLLECTION AMOUNT", pageWidth - 55, finalY, { align: "right" });
  doc.text(`${total.toLocaleString()} TK`, pageWidth - 15, finalY, { align: "right" });
  
  // Footer - Copyright (Left Aligned, Grey)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(`© ${new Date().getFullYear()} MINAR GO EXPATRIATE DEVELOPMENT FOUNDATION`, 15, finalY);
  
  // Save PDF
  doc.save(`MinarGo_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportDemandLetterPDF = (content: string, date: string) => {
  const doc = new jsPDF();
  
  // Blue strip at top
  doc.setFillColor(0, 35, 102);
  doc.rect(0, 0, 210, 25, 'F');
  
  doc.setFontSize(18);
  doc.setTextColor(255);
  doc.text("MINAR GO EXPATRIATE DEVELOPMENT FOUNDATION", 105, 15, { align: "center" });
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  
  // Content
  const splitContent = doc.splitTextToSize(content, 180);
  doc.text(splitContent, 15, 40);
  
  // Signatures
  const bottomY = doc.internal.pageSize.getHeight() - 60;
  doc.line(15, bottomY, 75, bottomY);
  doc.text("Foundation Authorized", 15, bottomY + 5);
  
  doc.line(135, bottomY, 195, bottomY);
  doc.text("Company Receiver", 135, bottomY + 5);
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Minar Go Foundation | Mobile: +880... | Email: info@minargo.com", 105, doc.internal.pageSize.getHeight() - 10, { align: "center" });
  
  doc.save(`Demand_Letter_${date}.pdf`);
};
