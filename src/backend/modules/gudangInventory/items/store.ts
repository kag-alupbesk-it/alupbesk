import { enqueueUpsert } from "@/services/supabase";
import type { GudangInventoryItem } from "../types";

// Master stok gudang. Kosong saat belum ada data; terisi dari Supabase ketika
// hydrate berjalan dan dari input admin gudang.
export const gudangInventoryItems = new Map<string, GudangInventoryItem>();

export function persistInventoryItem(item: GudangInventoryItem): void {
  gudangInventoryItems.set(item.id, item);
  enqueueUpsert(
    "gudang_inventory_items",
    {
      id: item.id,
      category_id: item.categoryId,
      item_name: item.itemName,
      brand: item.brand,
      model_no: item.modelNo,
      color: item.color,
      rack_group: item.rackGroup,
      sub_row: item.subRow,
      current_stock: item.currentStock,
      unit: item.unit,
      material_kind: item.materialKind,
      length_per_unit: item.lengthPerUnit,
      width_per_unit: item.widthPerUnit,
      weight_per_unit: item.weightPerUnit,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    },
    "id",
  );
}
