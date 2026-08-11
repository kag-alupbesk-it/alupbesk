import { persistProjectOrder, projectOrders } from "./store";
import type { ProjectOrder, ProjectOrderResult } from "./types";

// Menandai pesanan proyek yang sudah dikirim sebagai selesai.
export function selesaiProjectOrder(id: string): ProjectOrderResult {
  const current = projectOrders.get(id);
  if (!current) return { ok: false, code: "ORDER_NOT_FOUND" };
  if (current.status !== "diproses") return { ok: false, code: "ORDER_STATUS_INVALID" };

  const updated: ProjectOrder = {
    ...current,
    status: "selesai",
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  persistProjectOrder(updated);

  return { ok: true, order: updated };
}
