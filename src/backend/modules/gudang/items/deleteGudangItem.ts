import { db } from "@/services/supabase";
import { gudangMovements } from "../movements/store";
import { gudangItems } from "./store";

export type DeleteGudangItemResult = "deleted" | "not-found" | "in-use";

export async function deleteGudangItem(id: string): Promise<DeleteGudangItemResult> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  const { data: deleted, error } = await db.rpc("delete_gudang_item_if_unused", {
    item_id_input: id,
  });
  if (error) {
    if (error.message.includes("ITEM_IN_USE")) return "in-use";
    throw error;
  }
  if (!deleted) return "not-found";

  gudangItems.delete(id);
  for (const [movementId, movement] of gudangMovements) {
    if (movement.itemId === id) gudangMovements.delete(movementId);
  }
  return "deleted";
}
