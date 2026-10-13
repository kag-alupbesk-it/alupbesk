import ExcelJS from "exceljs";
import type {
  GudangInTransactionView,
  GudangInventoryItem,
  GudangOutTransactionView,
} from "../types";

export type InventoryExportType = "items" | "in" | "out";

export interface InventoryExportResult {
  buffer: Buffer;
  filename: string;
}

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1F2937" },
};

function toBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
  return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
}

function styleHeader(sheet: ExcelJS.Worksheet, columns: number): void {
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.alignment = { vertical: "middle", horizontal: "center" };
  header.height = 22;
  for (let index = 1; index <= columns; index += 1) {
    const cell = header.getCell(index);
    cell.fill = HEADER_FILL;
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  }
}

function styleBody(sheet: ExcelJS.Worksheet, columns: number): void {
  for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex += 1) {
    const row = sheet.getRow(rowIndex);
    for (let index = 1; index <= columns; index += 1) {
      row.getCell(index).border = {
        top: { style: "thin", color: { argb: "FFD1D5DB" } },
        left: { style: "thin", color: { argb: "FFD1D5DB" } },
        bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
        right: { style: "thin", color: { argb: "FFD1D5DB" } },
      };
    }
  }
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function generateInventoryItemsExcel(
  items: GudangInventoryItem[],
  categoryNames: Map<string, string>,
): Promise<InventoryExportResult> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Master Stok");
  sheet.columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Kategori", key: "category", width: 18 },
    { header: "Nama Barang", key: "itemName", width: 28 },
    { header: "Merek", key: "brand", width: 16 },
    { header: "No. Model", key: "modelNo", width: 24 },
    { header: "Warna", key: "color", width: 14 },
    { header: "Lokasi Rak", key: "rackGroup", width: 16 },
    { header: "Baris", key: "subRow", width: 10 },
    { header: "Jumlah Stok", key: "currentStock", width: 14 },
  ];

  items.forEach((item, index) => {
    sheet.addRow({
      no: index + 1,
      category: categoryNames.get(item.categoryId) ?? "",
      itemName: item.itemName,
      brand: item.brand,
      modelNo: item.modelNo,
      color: item.color,
      rackGroup: item.rackGroup,
      subRow: item.subRow,
      currentStock: item.currentStock,
    });
  });

  styleHeader(sheet, 9);
  styleBody(sheet, 9);
  sheet.getColumn("currentStock").alignment = { horizontal: "right" };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  return {
    buffer: await toBuffer(workbook),
    filename: `MASTER_STOK_${todayStamp()}.xlsx`,
  };
}

export async function generateInventoryInExcel(
  transactions: GudangInTransactionView[],
): Promise<InventoryExportResult> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Barang Masuk");
  sheet.columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Tanggal", key: "date", width: 14 },
    { header: "Kategori", key: "category", width: 18 },
    { header: "Nama Barang", key: "itemName", width: 28 },
    { header: "Merek", key: "brand", width: 16 },
    { header: "No. Model", key: "modelNo", width: 24 },
    { header: "Warna", key: "color", width: 14 },
    { header: "Lokasi Rak", key: "rackGroup", width: 16 },
    { header: "Jumlah Masuk", key: "quantity", width: 14 },
    { header: "Penanggung Jawab", key: "createdBy", width: 20 },
  ];

  transactions.forEach((trx, index) => {
    sheet.addRow({
      no: index + 1,
      date: trx.transactionDate,
      category: trx.categoryName,
      itemName: trx.itemName,
      brand: trx.brand,
      modelNo: trx.modelNo,
      color: trx.color,
      rackGroup: trx.rackGroup,
      quantity: trx.quantity,
      createdBy: trx.createdBy,
    });
  });

  styleHeader(sheet, 10);
  styleBody(sheet, 10);
  sheet.getColumn("quantity").alignment = { horizontal: "right" };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  return {
    buffer: await toBuffer(workbook),
    filename: `BARANG_MASUK_${todayStamp()}.xlsx`,
  };
}

export async function generateInventoryOutExcel(
  transactions: GudangOutTransactionView[],
): Promise<InventoryExportResult> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Barang Keluar");
  sheet.columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Tanggal", key: "date", width: 14 },
    { header: "Kategori", key: "category", width: 18 },
    { header: "Nama Barang", key: "itemName", width: 28 },
    { header: "Merek", key: "brand", width: 16 },
    { header: "No. Model", key: "modelNo", width: 24 },
    { header: "Warna", key: "color", width: 14 },
    { header: "Lokasi Rak", key: "rackGroup", width: 16 },
    { header: "Proyek", key: "projectName", width: 24 },
    { header: "Jumlah Keluar", key: "quantity", width: 14 },
    { header: "Penanggung Jawab", key: "createdBy", width: 20 },
  ];

  transactions.forEach((trx, index) => {
    sheet.addRow({
      no: index + 1,
      date: trx.transactionDate,
      category: trx.categoryName,
      itemName: trx.itemName,
      brand: trx.brand,
      modelNo: trx.modelNo,
      color: trx.color,
      rackGroup: trx.rackGroup,
      projectName: trx.projectName,
      quantity: trx.quantity,
      createdBy: trx.createdBy,
    });
  });

  styleHeader(sheet, 11);
  styleBody(sheet, 11);
  sheet.getColumn("quantity").alignment = { horizontal: "right" };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  return {
    buffer: await toBuffer(workbook),
    filename: `BARANG_KELUAR_${todayStamp()}.xlsx`,
  };
}
