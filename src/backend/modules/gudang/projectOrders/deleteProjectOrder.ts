import { projectOrders } from "./store";
import type { ProjectOrderDeleteResult } from "./types";

// Menghapus pesanan proyek yang masih "diajukan" (belum ada pemotongan stok).
export function deleteProjectOrder(id: string): ProjectOrderDeleteResult {
  const current = projectOrders.get(id);
  if (!current) return { ok: false, code: "ORDER_NOT_FOUND" };
  if (current.status !== "diajukan") return { ok: false, code: "ORDER_NOT_DELETABLE" };

  projectOrders.delete(id);
  return { ok: true };
}
