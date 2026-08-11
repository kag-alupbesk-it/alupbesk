import { persistCustomRequest, customRequests } from "./store";
import type { CustomRequest, CustomRequestStatus } from "./types";

// Mengubah status permintaan custom. Dipakai gudang saat permintaan custom
// dikonversi menjadi pesanan proyek (status -> "accepted").
export function setCustomRequestStatus(
  id: string,
  status: CustomRequestStatus,
): CustomRequest | null {
  const existing = customRequests.get(id);
  if (!existing) return null;

  const updated: CustomRequest = {
    ...existing,
    status,
    updatedAt: new Date().toISOString(),
  };
  persistCustomRequest(updated);

  return updated;
}
