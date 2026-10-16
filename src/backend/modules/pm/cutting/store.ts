import { enqueueDelete, enqueueUpsert } from "@/services/supabase";
import type { PMCutList } from "./types";

// Daftar potong (cutting list) per SPK. Terisi dari Supabase saat hydrate dan
// dari input divisi produksi. Kosong berarti belum ada daftar.
export const pmCutLists = new Map<string, PMCutList>();

export function persistCutList(list: PMCutList): void {
  pmCutLists.set(list.id, list);
  enqueueUpsert(
    "pm_cut_lists",
    {
      id: list.id,
      order_id: list.orderId,
      title: list.title,
      note: list.note,
      status: list.status,
      created_by: list.createdBy,
      created_at: list.createdAt,
      updated_at: list.updatedAt,
    },
    "id",
  );
  enqueueDelete("pm_cut_list_items", "cut_list_id", list.id);
  for (const item of list.items) {
    enqueueUpsert(
      "pm_cut_list_items",
      {
        id: item.id,
        cut_list_id: item.cutListId,
        component_name: item.componentName,
        quantity: item.quantity,
        length: item.length,
        width: item.width,
        material_item_id: item.materialItemId,
        note: item.note,
        sort_order: item.sortOrder,
      },
      "id",
    );
    enqueueDelete("pm_cut_allocations", "cut_list_item_id", item.id);
    for (const alloc of item.allocations) {
      enqueueUpsert(
        "pm_cut_allocations",
        {
          id: alloc.id,
          cut_list_item_id: alloc.cutListItemId,
          lot_id: alloc.lotId,
          quantity: alloc.quantity,
          length_used: alloc.lengthUsed,
          leftover_length: alloc.leftoverLength,
          leftover_status: alloc.leftoverStatus,
          created_at: alloc.createdAt,
        },
        "id",
      );
    }
  }
}

export function removeCutList(id: string): void {
  pmCutLists.delete(id);
  // FK on delete cascade menghapus item & alokasi terkait.
  enqueueDelete("pm_cut_lists", "id", id);
}
