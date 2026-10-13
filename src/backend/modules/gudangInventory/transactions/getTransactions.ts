import { gudangCategories } from "../categories/store";
import { gudangInventoryItems } from "../items/store";
import { gudangInTransactions, gudangOutTransactions } from "./store";
import type {
  GudangInTransaction,
  GudangInTransactionView,
  GudangOutTransaction,
  GudangOutTransactionView,
} from "../types";

function categoryName(categoryId: string): string {
  return gudangCategories.get(categoryId)?.name ?? "";
}

function byDateDesc(
  left: GudangInTransaction | GudangOutTransaction,
  right: GudangInTransaction | GudangOutTransaction,
): number {
  const byDate = right.transactionDate.localeCompare(left.transactionDate);
  if (byDate !== 0) return byDate;
  return right.createdAt.localeCompare(left.createdAt);
}

// Riwayat barang masuk dilengkapi nama kategori, barang, dan model agar UI
// maupun ekspor tidak perlu join manual.
export function getInTransactions(): GudangInTransactionView[] {
  return [...gudangInTransactions.values()]
    .map((trx) => {
      const item = gudangInventoryItems.get(trx.itemId);
      return {
        ...trx,
        categoryName: categoryName(trx.categoryId),
        itemName: item?.itemName ?? "",
        modelNo: item?.modelNo ?? "",
        brand: item?.brand ?? "",
        color: item?.color ?? "",
        rackGroup: item?.rackGroup ?? "",
      };
    })
    .sort(byDateDesc);
}

export function getOutTransactions(): GudangOutTransactionView[] {
  return [...gudangOutTransactions.values()]
    .map((trx) => {
      const item = gudangInventoryItems.get(trx.itemId);
      return {
        ...trx,
        categoryName: categoryName(trx.categoryId),
        itemName: item?.itemName ?? "",
        modelNo: item?.modelNo ?? "",
        brand: item?.brand ?? "",
        color: item?.color ?? "",
        rackGroup: item?.rackGroup ?? "",
      };
    })
    .sort(byDateDesc);
}
