import { getCatalogProduct } from "@/services/catalog";
import { getGudangItems } from "../items/getGudangItems";
import type { LocalOrder } from "@/services/orders";
import type { GudangOrderSegment } from "./types";

// Menentukan segmen pesanan: tiap baris dicocokkan ke item gudang lewat SKU
// produk. Jika semua baris cocok dengan item ber-kategori "proyek" maka
// pesanan masuk segmen proyek; jika hanya sebagian, segmen campuran; jika
// tidak ada yang cocok atau semua "eceran", segmen eceran.
export function computeOrderSegment(order: Pick<LocalOrder, "items">): GudangOrderSegment {
  const gudangItems = getGudangItems();
  const segments = new Set<string>();

  for (const line of order.items) {
    const product = getCatalogProduct(line.productId);
    const sku = product?.sku ?? "";
    const item = gudangItems.find((gudangItem) => gudangItem.sku === sku);
    if (item) segments.add(item.kategoriBarang);
  }

  if (segments.has("proyek")) return segments.has("eceran") ? "mixed" : "proyek";
  return "eceran";
}
