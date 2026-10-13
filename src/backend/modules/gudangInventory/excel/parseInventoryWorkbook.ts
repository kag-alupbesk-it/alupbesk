import ExcelJS from "exceljs";

export type SheetKind = "items" | "in" | "out";

export interface ParsedItemRow {
  category: string;
  itemName: string;
  brand: string;
  modelNo: string;
  color: string;
  rackGroup: string;
  subRow: string;
  currentStock: number;
}

export interface ParsedInRow {
  transactionDate: string;
  category: string;
  itemName: string;
  modelNo: string;
  quantity: number;
  createdBy: string;
}

export interface ParsedOutRow extends ParsedInRow {
  projectName: string;
}

export interface ParsedWorkbook {
  items: ParsedItemRow[];
  inTransactions: ParsedInRow[];
  outTransactions: ParsedOutRow[];
}

type FieldName =
  | "category"
  | "itemName"
  | "brand"
  | "modelNo"
  | "color"
  | "rackGroup"
  | "subRow"
  | "currentStock"
  | "transactionDate"
  | "quantity"
  | "projectName"
  | "createdBy";

type ColumnMap = Partial<Record<FieldName, number>>;

// Sinonim header kolom (cocok untuk hasil ekspor aplikasi ini maupun file lama).
const HEADER_ALIASES: Record<FieldName, string[]> = {
  category: ["kategori", "category"],
  itemName: ["nama barang", "jenis barang", "nama item", "barang", "item name", "item"],
  brand: ["merek", "merk", "brand"],
  modelNo: ["no. model", "no model", "nomor model", "model no", "model", "sku", "kode"],
  color: ["warna", "color"],
  rackGroup: ["lokasi rak", "lokasi", "rak", "seksi lokasi", "seksi", "rack"],
  subRow: ["baris", "level", "sub row", "sub_row", "row", "sub baris"],
  currentStock: ["jumlah stok", "stok", "stock", "current stock", "jumlah"],
  transactionDate: ["tanggal", "date", "tgl"],
  quantity: ["jumlah", "qty", "kuantitas", "quantity", "jumlah masuk", "jumlah keluar"],
  projectName: ["proyek", "project", "nama proyek", "tujuan"],
  createdBy: [
    "petugas",
    "penanggung jawab",
    "pj",
    "user",
    "created by",
    "created_by",
    "oleh",
    "admin",
  ],
};

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[.:]/g, " ").replace(/\s+/g, " ").trim();
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    if (typeof object.text === "string") return object.text.trim();
    if (Array.isArray(object.richText)) {
      return object.richText
        .map((part) => (part as { text?: string }).text ?? "")
        .join("")
        .trim();
    }
    if (object.result !== undefined) return cellText(object.result);
    if (object.hyperlink !== undefined) return String(object.hyperlink).trim();
  }
  return String(value).trim();
}

function cellNumber(value: unknown): number {
  const text = cellText(value).replace(/\.(?=\d{3}\b)/g, "").replace(",", ".");
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    // Serial tanggal Excel (basis 1899-12-30).
    const ms = Math.round((value - 25569) * 86_400_000);
    const date = new Date(ms);
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  const text = cellText(value);
  if (!text) return new Date().toISOString().slice(0, 10);
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return text;
}

function detectKind(sheetName: string, index: number): SheetKind {
  const name = sheetName.toLowerCase();
  if (/keluar|\bout\b/.test(name)) return "out";
  if (/masuk|\bin\b/.test(name)) return "in";
  if (/master|stok|stock|barang|item|invent/.test(name)) return "items";
  return index === 0 ? "items" : "items";
}

function mapHeaders(row: ExcelJS.Row, kind: SheetKind): ColumnMap {
  const map: ColumnMap = {};
  const aliases = Object.entries(HEADER_ALIASES) as [FieldName, string[]][];

  row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const header = normalizeHeader(cellText(cell.value));
    if (!header) return;
    for (const [field, names] of aliases) {
      if (map[field] !== undefined) continue;
      // Kolom "jumlah" jadi stok pada sheet master, jadi kuantitas pada transaksi.
      if (field === "currentStock" && kind !== "items") continue;
      if (field === "quantity" && kind === "items") continue;
      if (names.includes(header)) {
        map[field] = colNumber;
        break;
      }
    }
  });

  return map;
}

function findHeaderRow(sheet: ExcelJS.Worksheet, kind: SheetKind): { rowNumber: number; map: ColumnMap } | null {
  const limit = Math.min(sheet.rowCount, 10);
  for (let rowNumber = 1; rowNumber <= limit; rowNumber += 1) {
    const map = mapHeaders(sheet.getRow(rowNumber), kind);
    const hasName = map.itemName !== undefined;
    const hasSignal =
      map.modelNo !== undefined ||
      map.category !== undefined ||
      map.transactionDate !== undefined;
    if (hasName && hasSignal) return { rowNumber, map };
  }
  return null;
}

// Membaca workbook (.xlsx) menjadi baris terstruktur. Sheet dideteksi dari nama
// ("Barang Masuk" / "Barang Keluar" / lainnya dianggap Master Stok), kolom
// dideteksi dari header sehingga urutan kolom bebas.
export async function parseInventoryWorkbook(
  data: ArrayBuffer | Buffer,
): Promise<ParsedWorkbook> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(data as ArrayBuffer);

  const result: ParsedWorkbook = { items: [], inTransactions: [], outTransactions: [] };

  workbook.worksheets.forEach((sheet, index) => {
    const kind = detectKind(sheet.name, index);
    const header = findHeaderRow(sheet, kind);
    if (!header) return;

    for (let rowNumber = header.rowNumber + 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
      const row = sheet.getRow(rowNumber);
      const get = (field: FieldName): string => {
        const col = header.map[field];
        return col ? cellText(row.getCell(col).value) : "";
      };
      const getRaw = (field: FieldName): unknown => {
        const col = header.map[field];
        return col ? row.getCell(col).value : undefined;
      };

      const itemName = get("itemName");
      if (!itemName && !get("modelNo")) continue;

      if (kind === "items") {
        result.items.push({
          category: get("category"),
          itemName: itemName || get("modelNo"),
          brand: get("brand"),
          modelNo: get("modelNo"),
          color: get("color"),
          rackGroup: get("rackGroup"),
          subRow: get("subRow"),
          currentStock: cellNumber(getRaw("currentStock")),
        });
        continue;
      }

      const quantity = cellNumber(getRaw("quantity"));
      if (quantity <= 0) continue;
      const base = {
        transactionDate: toIsoDate(getRaw("transactionDate")),
        category: get("category"),
        itemName: itemName || get("modelNo"),
        modelNo: get("modelNo"),
        quantity,
        createdBy: get("createdBy"),
      };

      if (kind === "in") {
        result.inTransactions.push(base);
      } else {
        result.outTransactions.push({
          ...base,
          projectName: get("projectName"),
        });
      }
    }
  });

  return result;
}
