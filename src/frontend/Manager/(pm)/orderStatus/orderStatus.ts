import type { PMOrder } from "../types/types";

// Order dianggap "butuh keputusan PM" selama gambar produksi sudah tersedia tapi belum
// di-ACC, termasuk yang masih dalam siklus revisi. Filter ini dipakai bersama oleh
// dashboard, sidebar, dan halaman approval agar angka antrean tidak berbeda antar layar.
export function needsDrawingApproval(order: PMOrder) {
  if (!order.hasProductionDrawing) return false;
  return order.drawingStatus === "menunggu_acc" || order.drawingStatus === "revisi";
}
 