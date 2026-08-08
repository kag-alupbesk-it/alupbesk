import { projectOrders } from "./store";
import type { ProjectOrder } from "./types";

// Daftar pesanan proyek, terbaru lebih dulu.
export function getProjectOrders(): ProjectOrder[] {
  return [...projectOrders.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
