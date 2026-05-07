
import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportSummaryPDF = (data: any[], title: string, total: number) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(30, 64, 175); // Navy Blue
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("MINAR GO EXPATRIATE DEVELOPMENT FOUNDATION", pageWidth / 2, 15, { align: "center" });
  
  doc.setFontSize(11);
  doc.setTextColor(212, 175, 55); // Golden
  doc.text(`COLLECTION SUMMARY REPORT - ${title.toUpperCase()}`, pageWidth / 2, 25, { align: "center" });
  
  // Table
  const tableData = data.map(t => [
    t.n, 
    t.d, 
    `${t.a.toLocaleString()} TK`
  ]);
  
  (doc as any).autoTable({
    startY: 45,
    head: [["Member Name", "Date", "Amount (TK)"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 2: { halign: "right" } },
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  // Summary Info
  doc.setFontSize(12);
  doc.setTextColor(30, 64, 175);
  doc.text(`TOTAL COLLECTION: ${total.toLocaleString()} TK`, 15, finalY);
  
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, 15, finalY + 10);
  doc.text("© Minar Go Expatriate Development Foundation", pageWidth - 15, finalY + 10, { align: "right" });
  
  doc.save(`MinarGo_Report_${title}.pdf`);
};
