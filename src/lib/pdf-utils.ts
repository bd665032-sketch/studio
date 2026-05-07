
import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportSummaryPDF = (data: any[], title: string, total: number) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(0, 35, 102); // Primary Blue
  doc.text("MINAR GO EXPATRIATE DEVELOPMENT FOUNDATION", 105, 20, { align: "center" });
  
  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text(title, 105, 30, { align: "center" });
  
  // Table
  const tableData = data.map(t => [t.n, t.d, `${t.a} BDT`]);
  (doc as any).autoTable({
    startY: 40,
    head: [["Member Name", "Date", "Amount"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillStyle: "#002366" },
  });
  
  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Total Collection: ${total} BDT`, 190, finalY, { align: "right" });
  
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(`© ${new Date().getFullYear()} Minar Go Foundation - All Rights Reserved`, 105, 285, { align: "center" });
  
  doc.save(`MinarGo_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
