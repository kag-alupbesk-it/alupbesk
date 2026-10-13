import { productionRequests } from "./store";
import type { ProductionRequest } from "./types";

// Daftar permintaan produksi terbaru lebih dulu (berdasarkan waktu dibuat).
export function getProductionRequests(): ProductionRequest[] {
  return [...productionRequests.values()].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export function getProductionRequest(id: string): ProductionRequest | undefined {
  return productionRequests.get(id);
}
