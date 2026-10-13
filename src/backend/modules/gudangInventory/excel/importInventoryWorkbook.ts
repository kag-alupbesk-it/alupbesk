import { gudangCategories } from "../categories/store";
import { createCategory } from "../categories/createCategory";
import { gudangInventoryItems } from "../items/store";
import { createInventoryItem } from "../items/createItem";
import { updateInventoryItem } from "../items/updateItem";
import { persistInTransaction, persistOutTransaction } from "../transactions/store";
import type { GudangInventoryItem } from "../types";
import type {
  ParsedInRow,
  ParsedOutRow,
  ParsedWorkbook,
} from "./parseInventoryWorkbook";

export interface ImportSummary {
  categoriesAdded: number;
  itemsAdded: number;
  itemsUpdated: number;
  inAdded: number;
  outAdded: number;
  skipped: number;
}

function resolveCategoryId(name: string): string {
  const trimmed = name.trim();
  if (trimmed) {
    const existing = [...gudangCategories.values()].find(
      (category) => category.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existing) return existing.id;
    return createCategory({ name: trimmed }).id;
  }
  const fallback = [...gudangCategories.values()][0];
  if (fallback) return fallback.id;
  return createCategory({ name: "Umum" }).id;
}

function findItem(
  modelNo: string,
  itemName: string,
  brand?: string,
  color?: string,
): GudangInventoryItem | undefined {
  const model = modelNo.trim().toLowerCase();
  if (model) {
    const byModel = [...gudangInventoryItems.values()].find(
      (item) => item.modelNo.toLowerCase() === model,
    );
    if (byModel) return byModel;
  }

  const name = itemName.trim().toLowerCase();
  if (!name) return undefined;
  return [...gudangInventoryItems.values()].find((item) => {
    if (item.itemName.toLowerCase() !== name) return false;
    if (brand && brand.trim() && item.brand.toLowerCase() !== brand.trim().toLowerCase()) {
      return false;
    }
    if (color && color.trim() && item.color.toLowerCase() !== color.trim().toLowerCase()) {
      return false;
    }
    return true;
  });
}

// Menerapkan hasil parse workbook ke store. Sheet master menentukan stok;
// baris transaksi hanya menambah riwayat (tidak mengubah stok) agar angka stok
// tidak terhitung ganda saat import.
export function importInventoryWorkbook(
  parsed: ParsedWorkbook,
  fallbackCreatedBy: string,
): ImportSummary {
  const summary: ImportSummary = {
    categoriesAdded: 0,
    itemsAdded: 0,
    itemsUpdated: 0,
    inAdded: 0,
    outAdded: 0,
    skipped: 0,
  };
  const initialCategoryCount = gudangCategories.size;

  for (const row of parsed.items) {
    const categoryId = resolveCategoryId(row.category);
    const existing = findItem(row.modelNo, row.itemName, row.brand, row.color);
    if (existing) {
      const result = updateInventoryItem(existing.id, {
        categoryId,
        itemName: row.itemName,
        brand: row.brand,
        modelNo: row.modelNo,
        color: row.color,
        rackGroup: row.rackGroup,
        subRow: row.subRow,
        currentStock: row.currentStock,
      });
      if (result.ok) summary.itemsUpdated += 1;
      else summary.skipped += 1;
    } else {
      const result = createInventoryItem({
        categoryId,
        itemName: row.itemName,
        brand: row.brand,
        modelNo: row.modelNo,
        color: row.color,
        rackGroup: row.rackGroup,
        subRow: row.subRow,
        currentStock: row.currentStock,
      });
      if (result.ok) summary.itemsAdded += 1;
      else summary.skipped += 1;
    }
  }

  const now = new Date().toISOString();

  const ensureItem = (row: ParsedInRow | ParsedOutRow): GudangInventoryItem | null => {
    const existing = findItem(row.modelNo, row.itemName);
    if (existing) return existing;
    const categoryId = resolveCategoryId(row.category);
    const created = createInventoryItem({
      categoryId,
      itemName: row.itemName,
      modelNo: row.modelNo,
      currentStock: 0,
    });
    if (!created.ok) return null;
    summary.itemsAdded += 1;
    return created.data;
  };

  for (const row of parsed.inTransactions) {
    const item = ensureItem(row);
    if (!item) {
      summary.skipped += 1;
      continue;
    }
    persistInTransaction({
      id: crypto.randomUUID(),
      transactionDate: row.transactionDate,
      categoryId: item.categoryId,
      itemId: item.id,
      quantity: row.quantity,
      createdBy: row.createdBy || fallbackCreatedBy,
      createdAt: now,
    });
    summary.inAdded += 1;
  }

  for (const row of parsed.outTransactions) {
    const item = ensureItem(row);
    if (!item) {
      summary.skipped += 1;
      continue;
    }
    persistOutTransaction({
      id: crypto.randomUUID(),
      transactionDate: row.transactionDate,
      categoryId: item.categoryId,
      itemId: item.id,
      projectId: null,
      projectName: row.projectName,
      source: "manual",
      quantity: row.quantity,
      createdBy: row.createdBy || fallbackCreatedBy,
      createdAt: now,
    });
    summary.outAdded += 1;
  }

  summary.categoriesAdded = gudangCategories.size - initialCategoryCount;
  return summary;
}
