import ExcelJS from "exceljs";
import { TransaksiKas } from "../types/types";

function getMonthYearLabel(tanggal?: string): string {
  const date = tanggal ? new Date(tanggal) : new Date();
  const month = date.toLocaleDateString("id-ID", { month: "long" });
  const year = date.getFullYear();
  return `${month.toUpperCase()} ${year}`;
}

export async function exportCashflowToExcel(transaksi?: TransaksiKas[]) {
  const data = transaksi || [];
  const sorted = [...data].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("CF");
  let monthYearLabel = getMonthYearLabel(sorted[0]?.tanggal);
  if (sorted.length > 0) {
    const minDate = sorted[0].tanggal;
    const maxDate = sorted[sorted.length - 1].tanggal;
    if (minDate === maxDate) {
      const d = new Date(minDate);
      monthYearLabel = d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
    } else {
      const d1 = new Date(minDate);
      const d2 = new Date(maxDate);
      monthYearLabel = d1.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }).toUpperCase() + " - " + d2.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
    }
  }

  worksheet.mergeCells("B2:K2");
  worksheet.getCell("B2").value = `CASH FLOW [${monthYearLabel}]`;
  worksheet.getCell("B2").font = { bold: true };
  worksheet.getCell("B2").alignment = { horizontal: "center" };

  worksheet.mergeCells("B3:K3");
  worksheet.getCell("B3").value = "CV. ALUPBESK";
  worksheet.getCell("B3").alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getCell("B3").font = { bold: true };
  worksheet.getCell("B3").alignment = { horizontal: "center" };

  let row = 4;
  worksheet.getCell(`B${row}`).value = "Date";
  worksheet.getCell(`C${row}`).value = "No. Nota";
  worksheet.getCell(`D${row}`).value = "Person";
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

  let dataRowStart = 6;
  let currentRow = 6;
  worksheet.getCell(`B${currentRow}`).value = new Date(sorted[0]?.tanggal || new Date());
  worksheet.getCell(`B${currentRow}`).numFmt = "DD/MM/YYYY";
  worksheet.getCell(`F${currentRow}`).value = "Saldo Bulan lalu";
  worksheet.getCell(`K${currentRow}`).value = 0;
  currentRow++;

  sorted.forEach((trx, idx) => {
    const r = currentRow + idx;
    worksheet.getCell(`B${r}`).value = new Date(trx.tanggal);
    worksheet.getCell(`B${r}`).numFmt = "DD/MM/YYYY";
    worksheet.getCell(`C${r}`).value = trx.noNota || trx.id;
    worksheet.getCell(`D${r}`).value = trx.person || "";
    worksheet.getCell(`E${r}`).value = trx.jenis === "kas_masuk" ? "Kas Masuk" : trx.jenis === "kas_keluar" ? "Kas Keluar" : "Kas Beredar";
    worksheet.getCell(`F${r}`).value = trx.uraian;
    worksheet.getCell(`G${r}`).value = trx.person || "";
    worksheet.getCell(`H${r}`).value = (trx as any).accountCode || trx.kategori || "";
    worksheet.getCell(`L${r}`).value = trx.posProyek || trx.kategori || "";
    
    if (trx.jenis === "kas_masuk") {
      worksheet.getCell(`I${r}`).value = trx.nominal;
      worksheet.getCell(`J${r}`).value = 0;
    } else {
      worksheet.getCell(`I${r}`).value = 0;
      worksheet.getCell(`J${r}`).value = trx.nominal;
    }
    worksheet.getCell(`K${r}`).value = { formula: `K${r - 1}+I${r}-J${r}` };
  });

  const lastDataRow = currentRow + sorted.length - 1;
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
  worksheet.mergeCells(`B${totalRow}:H${totalRow}`);
  worksheet.getCell(`B${totalRow}`).value = `Total Per ${monthYearLabel}`;
  worksheet.getCell(`B${totalRow}`).font = { bold: true };
  worksheet.getCell(`I${totalRow}`).value = { formula: `SUM(I${currentRow}:I${lastDataRow})` };
  worksheet.getCell(`J${totalRow}`).value = { formula: `SUM(J${currentRow}:J${lastDataRow})` };
  worksheet.getCell(`K${totalRow}`).value = { formula: `K${lastDataRow}` };
  ["I", "J", "K"].forEach((col) => {
    worksheet.getCell(`${col}${totalRow}`).numFmt = "#,##0";
    worksheet.getCell(`${col}${totalRow}`).font = { bold: true };
    worksheet.getCell(`${col}${totalRow}`).border = { top: { style: "thin" }, bottom: { style: "double" } };
  });

  worksheet.getCell(`F${summaryStart}`).value = "Saldo Akhir";
  worksheet.getCell(`F${summaryStart + 1}`).value = "Kas Beredar";
  worksheet.getCell(`F${summaryStart + 2}`).value = "Saldo Kas Sebenarnya";
  worksheet.getCell(`K${summaryStart}`).value = { formula: `K${totalRow}` };
  worksheet.getCell(`K${summaryStart + 1}`).value = sorted
    .filter((t) => t.jenis === "kas_beredar")
    .reduce((sum, t) => sum + t.nominal, 0);
  worksheet.getCell(`K${summaryStart + 2}`).value = { formula: `K${summaryStart}-K${summaryStart + 1}` };
  ["K"].forEach((col) => {
    for (let r = summaryStart; r <= summaryStart + 2; r++) {
      worksheet.getCell(`${col}${r}`).numFmt = "#,##0";
      if (r >= summaryStart + 2) {
        worksheet.getCell(`${col}${r}`).font = { bold: true };
      }
    }
  });

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

  const buffer = await workbook.xlsx.writeBuffer();
  let filename = "CASHFLOW.xlsx";
  if (sorted.length > 0) {
    const minDate = sorted[0].tanggal;
    const maxDate = sorted[sorted.length - 1].tanggal;
    const fmt = (dstr: string) => {
      const d = new Date(dstr);
      const y = d.getFullYear();
      const m = String(d.getMonth()+1).padStart(2,"0");
      const day = String(d.getDate()).padStart(2,"0");
      return `${y}-${m}-${day}`;
    };
    if (minDate === maxDate) filename = `CASHFLOW_${fmt(minDate)}.xlsx`;
    else filename = `CASHFLOW_${fmt(minDate)}_${fmt(maxDate)}.xlsx`;
  } else {
    filename = `CASHFLOW_${monthYearLabel.replace(/\s+/g, "_")}.xlsx`;
  }
  const blob = new Blob([buffer as any], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
