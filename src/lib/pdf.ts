import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { OrgSettings } from "./types";

export interface PdfSection {
  heading?: string;
  head: string[];
  body: (string | number)[][];
}

const BLUE: [number, number, number] = [30, 64, 124];
const GOLD: [number, number, number] = [201, 162, 39];

export function buildReport(
  settings: OrgSettings,
  title: string,
  period: string,
  sections: PdfSection[],
  fileName: string,
  action: "save" | "print" = "save",
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  let logoBottom = 40;

  if (settings.logo) {
    try {
      doc.addImage(settings.logo, "PNG", 40, 28, 52, 52);
      logoBottom = 44;
    } catch {
      /* ignore bad logo */
    }
  }

  const textX = settings.logo ? 104 : 40;
  doc.setTextColor(...BLUE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(settings.name || "Organisation", textX, logoBottom + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90);
  const meta = [settings.address, settings.email, settings.phone].filter(Boolean).join("  •  ");
  if (meta) doc.text(meta, textX, logoBottom + 19);

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(2);
  doc.line(40, logoBottom + 34, pageW - 40, logoBottom + 34);

  doc.setTextColor(...BLUE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, 40, logoBottom + 56);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(`Reporting period: ${period}`, 40, logoBottom + 70);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - 40, logoBottom + 70, { align: "right" });

  let cursor = logoBottom + 88;

  sections.forEach((section) => {
    if (section.heading) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...BLUE);
      doc.text(section.heading, 40, cursor);
      cursor += 8;
    }
    autoTable(doc, {
      startY: cursor + 4,
      head: [section.head],
      body: section.body.length ? section.body.map((r) => r.map((c) => String(c))) : [["No records"]],
      styles: { fontSize: 8.5, cellPadding: 5, lineColor: [225, 228, 235], lineWidth: 0.5 },
      headStyles: { fillColor: BLUE, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [246, 248, 252] },
      margin: { left: 40, right: 40, bottom: 56 },
    });
    cursor = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
  });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const h = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(1);
    doc.line(40, h - 44, pageW - 40, h - 44);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(settings.reportFooter || "", 40, h - 30, { maxWidth: pageW - 160 });
    doc.text(`Page ${i} of ${pages}`, pageW - 40, h - 30, { align: "right" });
  }

  if (action === "print") {
    doc.autoPrint();
    const url = doc.output("bloburl");
    window.open(url as unknown as string, "_blank");
  } else {
    doc.save(fileName);
  }
}
