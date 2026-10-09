import ExcelJS from "exceljs";
import type { KasEntry } from "../types";

interface Transaction extends KasEntry {
  jenis: "kas_masuk" | "kas_keluar";
}

export interface CashflowExportResult {
  buffer: Buffer;
  filename: string;
}

function toBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
  return workbook.xlsx.writeBuffer() as Promise<any>;
}

function getMonthYearLabel(tanggal?: string): string {
  const date = tanggal ? new Date(tanggal) : new Date();
  const month = date.toLocaleDateString("id-ID", { month: "long" });
  const year = date.getFullYear();
  return `${month.toUpperCase()} ${year}`;
}

export async function generateCashflowExcel(transactions: Transaction[]): Promise<CashflowExportResult> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("CF");

  // Sort transactions by date
  const sorted = [...transactions].sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const monthYearLabel = getMonthYearLabel(sorted[0]?.tanggal);

  // Header
  worksheet.mergeCells("B2:H2");
  worksheet.getCell("B2").value = `CASH FLOW [${monthYearLabel}]`;
  worksheet.getCell("B2").font = { bold: true };
  worksheet.getCell("B2").alignment = { horizontal: "center" };

  worksheet.mergeCells("B3:H3");
  worksheet.getCell("B3").value = "CV. ALUPBESK";
  worksheet.getCell("B3").font = { bold: true };
  worksheet.getCell("B3").alignment = { horizontal: "center" };

  // Table headers
  let row = 4;
  worksheet.getCell(`B${row}`).value = "Date";
  worksheet.getCell(`C${row}`).value = "No. Nota";
  worksheet.getCell(`D${row}`).value = "TOKO";
  worksheet.getCell(`E${row}`).value = "Jenis";
  worksheet.getCell(`F${row}`).value = "Uraian";
  worksheet.getCell(`G${row}`).value = "Person";
  worksheet.getCell(`H${row}`).value = "Account Code";
  worksheet.mergeCells(`I${row}:K${row}`);
  worksheet.getCell(`I${row}`).value = "Cash";
  worksheet.getCell(`I${row}`).alignment = { horizontal: "center" };
  worksheet.getCell(`L${row}`).value = "Pos";

  row = 5;
  worksheet.getCell(`I${row}`).value = "Kas Masuk";
  worksheet.getCell(`J${row}`).value = "Kas Keluar";
  worksheet.getCell(`K${row}`).value = "Balance";

  // Style headers
  for (let c = 2; c <= 12; c++) {
    const col = String.fromCharCode(64 + c);
    worksheet.getCell(`${col}4`).font = { bold: true };
    worksheet.getCell(`${col}4`).alignment = { horizontal: "center" };
    worksheet.getCell(`${col}5`).font = { bold: true };
    worksheet.getCell(`${col}5`).alignment = { horizontal: "center" };
    worksheet.getCell(`${col}4`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    worksheet.getCell(`${col}5`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  }
  worksheet.getCell("I4").alignment = { horizontal: "center" };

  let dataRowStart = 6;
  let currentRow = 6;

  // Saldo bulan lalu row
  worksheet.getCell(`B${currentRow}`).value = new Date(sorted[0]?.tanggal || new Date());
  worksheet.getCell(`B${currentRow}`).numFmt = "DD/MM/YYYY";
  worksheet.getCell(`F${currentRow}`).value = "Saldo Bulan lalu";
  worksheet.getCell(`K${currentRow}`).value = 0;
  currentRow++;

  // Data rows
  sorted.forEach((trx, idx) => {
    const r = currentRow + idx;
    worksheet.getCell(`B${r}`).value = new Date(trx.tanggal);
    worksheet.getCell(`B${r}`).numFmt = "DD/MM/YYYY";
    worksheet.getCell(`C${r}`).value = (trx as any).noNota || trx.sumber || trx.id;
    worksheet.getCell(`D${r}`).value = (trx as any).toko || (trx as any).person || "";
    worksheet.getCell(`E${r}`).value = trx.jenis === "kas_masuk" ? "Kas Masuk" : "Kas Keluar";
    worksheet.getCell(`F${r}`).value = trx.deskripsi;
    worksheet.getCell(`G${r}`).value = (trx as any).person || "";
    worksheet.getCell(`H${r}`).value = (trx as any).accountCode || (trx as any).kategori || "";
    worksheet.getCell(`L${r}`).value = (trx as any).posProyek || (trx as any).pos || (trx as any).kategori || "";
    
    if (trx.jenis === "kas_masuk" || trx.tipe === "masuk") {
      worksheet.getCell(`I${r}`).value = trx.jumlah;
      worksheet.getCell(`J${r}`).value = 0;
    } else {
      worksheet.getCell(`I${r}`).value = 0;
      worksheet.getCell(`J${r}`).value = trx.jumlah;
    }
    
    // Balance formula: Balance_Sebelumnya + Kas_Masuk - Kas_Keluar
    // Previous balance is K6 if this is row 7 (first transaction after saldo), etc.
    const prevBalanceRow = r - 1;
    worksheet.getCell(`K${r}`).value = { formula: `K${prevBalanceRow}+I${r}-J${r}` };
  });

  const lastDataRow = currentRow + sorted.length - 1;

  // Format numbers
  for (let r = dataRowStart; r <= lastDataRow; r++) {
    ["I", "J", "K"].forEach((col) => {
      worksheet.getCell(`${col}${r}`).numFmt = "#,##0";
      worksheet.getCell(`${col}${r}`).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    ["B", "C", "D", "E", "F", "G", "H", "L"].forEach((col) => {
      worksheet.getCell(`${col}${r}`).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  }

  const totalRow = lastDataRow + 2;
  const summaryStart = totalRow + 2;

  // Total row
  worksheet.mergeCells(`B${totalRow}:H${totalRow}`);
  worksheet.getCell(`B${totalRow}`).value = `Total Per ${monthYearLabel}`;
  worksheet.getCell(`B${totalRow}`).font = { bold: true };
  worksheet.getCell(`I${totalRow}`).value = { formula: `SUM(I${dataRowStart + 1}:I${lastDataRow})` };
  worksheet.getCell(`J${totalRow}`).value = { formula: `SUM(J${dataRowStart + 1}:J${lastDataRow})` };
  worksheet.getCell(`K${totalRow}`).value = { formula: `K${lastDataRow}` };
  ["I", "J", "K"].forEach((col) => {
    worksheet.getCell(`${col}${totalRow}`).numFmt = "#,##0";
    worksheet.getCell(`${col}${totalRow}`).font = { bold: true };
    worksheet.getCell(`${col}${totalRow}`).border = { top: { style: "thin" }, bottom: { style: "double" } };
  });

  // Summary
  worksheet.getCell(`F${summaryStart}`).value = "Saldo Akhir";
  worksheet.getCell(`F${summaryStart + 1}`).value = "Kas Beredar";
  worksheet.getCell(`F${summaryStart + 2}`).value = "Saldo Kas Sebenarnya";
  worksheet.getCell(`K${summaryStart}`).value = { formula: `K${totalRow}` };
  worksheet.getCell(`K${summaryStart + 1}`).value = 0;
  worksheet.getCell(`K${summaryStart + 2}`).value = { formula: `K${summaryStart}-K${summaryStart + 1}` };
  ["K"].forEach((col) => {
    for (let r = summaryStart; r <= summaryStart + 2; r++) {
      worksheet.getCell(`${col}${r}`).numFmt = "#,##0";
      if (r >= summaryStart + 2) {
        worksheet.getCell(`${col}${r}`).font = { bold: true };
      }
    }
  });

  // Set column widths
  worksheet.getColumn("B").width = 12;
  worksheet.getColumn("C").width = 15;
  worksheet.getColumn("D").width = 20;
  worksheet.getColumn("E").width = 15;
  worksheet.getColumn("F").width = 30;
  worksheet.getColumn("G").width = 20;
  worksheet.getColumn("H").width = 12;
  worksheet.getColumn("I").width = 15;
  worksheet.getColumn("J").width = 15;
  worksheet.getColumn("K").width = 15;
  worksheet.getColumn("L").width = 15;

  const buffer = await toBuffer(workbook);
  const filename = `CASHFLOW_${monthYearLabel.replace(/\s+/g, "_")}.xlsx`;

  return { buffer, filename };
}
