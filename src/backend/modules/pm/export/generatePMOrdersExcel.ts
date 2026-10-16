import ExcelJS from "exceljs";
import type { PMOrder } from "@/services/pm/types";

export interface PMOrdersExportResult {
  buffer: Buffer;
  filename: string;
}

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1F2937" },
};

const LABEL_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFE5E7EB" },
};

const projectStatusLabels: Record<string, string> = {
  menunggu_acc: "Menunggu ACC",
  siap_produksi: "Siap Produksi",
  produksi: "Sedang Diproduksi",
  siap_kirim: "Siap Kirim",
  selesai: "Selesai",
};

const drawingStatusLabels: Record<string, string> = {
  menunggu_acc: "Menunggu ACC",
  acc_gambar: "ACC Gambar",
  revisi: "Revisi",
};

function toBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
  return workbook.xlsx.writeBuffer().then((value) => Buffer.from(value));
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Excel membatasi nama sheet: maksimal 31 karakter dan tidak boleh memuat
// karakter \ / ? * [ ] :. Nama juga harus unik dalam satu workbook.
function sanitizeSheetName(value: string): string {
  const cleaned = value.replace(/[\\/?*[\]:]/g, " ").replace(/\s+/g, " ").trim();
  return cleaned.slice(0, 31) || "Pesanan";
}

function buildSheetName(order: PMOrder, usedNames: Set<string>): string {
  const base = sanitizeSheetName(`${order.contractorName} ${order.enteredAt}`);
  let candidate = base;
  let counter = 2;
  while (usedNames.has(candidate)) {
    const suffix = ` (${counter})`;
    candidate = `${base.slice(0, 31 - suffix.length)}${suffix}`;
    counter += 1;
  }
  usedNames.add(candidate);
  return candidate;
}

function styleHeaderRow(row: ExcelJS.Row, columns: number): void {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.alignment = { vertical: "middle", horizontal: "center" };
  row.height = 22;
  for (let index = 1; index <= columns; index += 1) {
    const cell = row.getCell(index);
    cell.fill = HEADER_FILL;
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  }
}

function styleBodyRow(row: ExcelJS.Row, columns: number): void {
  for (let index = 1; index <= columns; index += 1) {
    row.getCell(index).border = {
      top: { style: "thin", color: { argb: "FFD1D5DB" } },
      left: { style: "thin", color: { argb: "FFD1D5DB" } },
      bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
      right: { style: "thin", color: { argb: "FFD1D5DB" } },
    };
  }
}

function addInfoRow(
  sheet: ExcelJS.Worksheet,
  rowIndex: number,
  label: string,
  value: string,
): number {
  const row = sheet.getRow(rowIndex);
  row.getCell(1).value = label;
  row.getCell(1).font = { bold: true };
  row.getCell(1).fill = LABEL_FILL;
  row.getCell(2).value = value;
  sheet.mergeCells(rowIndex, 2, rowIndex, 5);
  styleBodyRow(row, 5);
  return rowIndex + 1;
}

function writeOrderSheet(sheet: ExcelJS.Worksheet, order: PMOrder): void {
  sheet.columns = [
    { width: 20 },
    { width: 28 },
    { width: 14 },
    { width: 12 },
    { width: 40 },
  ];

  const titleRow = sheet.getRow(1);
  titleRow.getCell(1).value = `PESANAN ${order.contractorCode}`;
  titleRow.getCell(1).font = { bold: true, size: 14 };
  sheet.mergeCells(1, 1, 1, 5);
  titleRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
  titleRow.height = 24;

  let rowIndex = 3;
  rowIndex = addInfoRow(sheet, rowIndex, "Kontraktor", order.contractorName);
  rowIndex = addInfoRow(sheet, rowIndex, "Kode Produksi", order.contractorCode);
  rowIndex = addInfoRow(sheet, rowIndex, "No. Telepon", order.contractorPhone || "-");
  rowIndex = addInfoRow(sheet, rowIndex, "Alamat Proyek", order.projectAddress || "-");
  rowIndex = addInfoRow(sheet, rowIndex, "Tanggal Pemesanan", formatDate(order.enteredAt));
  rowIndex = addInfoRow(sheet, rowIndex, "Target Selesai", formatDate(order.targetDate));
  rowIndex = addInfoRow(
    sheet,
    rowIndex,
    "Status Proyek",
    projectStatusLabels[order.projectStatus] ?? order.projectStatus,
  );
  rowIndex = addInfoRow(
    sheet,
    rowIndex,
    "Status Gambar",
    drawingStatusLabels[order.drawingStatus] ?? order.drawingStatus,
  );
  if (order.technicalNote) {
    rowIndex = addInfoRow(sheet, rowIndex, "Catatan Teknis", order.technicalNote);
  }
  if (order.revisionNote) {
    rowIndex = addInfoRow(sheet, rowIndex, "Catatan Revisi", order.revisionNote);
  }

  rowIndex += 1;
  const tableHeader = sheet.getRow(rowIndex);
  tableHeader.values = ["No", "Nama Item", "Kuantitas", "Satuan", "Catatan Teknis"];
  styleHeaderRow(tableHeader, 5);
  rowIndex += 1;

  if (order.items.length === 0) {
    const emptyRow = sheet.getRow(rowIndex);
    emptyRow.getCell(1).value = "Belum ada item.";
    sheet.mergeCells(rowIndex, 1, rowIndex, 5);
    styleBodyRow(emptyRow, 5);
    return;
  }

  order.items.forEach((item, index) => {
    const row = sheet.getRow(rowIndex);
    row.values = [
      index + 1,
      item.name,
      item.quantity,
      item.unit,
      item.technicalNote || "-",
    ];
    row.getCell(3).alignment = { horizontal: "right" };
    styleBodyRow(row, 5);
    rowIndex += 1;
  });
}

export async function generatePMOrdersExcel(orders: PMOrder[]): Promise<PMOrdersExportResult> {
  const workbook = new ExcelJS.Workbook();
  const usedNames = new Set<string>();

  for (const order of orders) {
    const sheetName = buildSheetName(order, usedNames);
    const sheet = workbook.addWorksheet(sheetName);
    writeOrderSheet(sheet, order);
  }

  if (orders.length === 0) {
    const sheet = workbook.addWorksheet("Pesanan");
    sheet.getCell("A1").value = "Belum ada pesanan.";
  }

  return {
    buffer: await toBuffer(workbook),
    filename: `PESANAN_PM_${todayStamp()}.xlsx`,
  };
}
