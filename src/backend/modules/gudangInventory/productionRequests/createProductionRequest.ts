import { gudangInventoryItems } from "../items/store";
import { getCategoryById } from "../categories/getCategories";
import { persistProductionRequest, productionRequests } from "./store";
import type {
  CreateProductionRequestInput,
  ProductionRequest,
  ProductionRequestItem,
  ProductionRequestResult,
} from "./types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// Satu permintaan pending per SPK: pengiriman ulang untuk SPK yang sama
// menggantikan isinya (revisi kuantitas/barang), bukan menumpuk baru.
function findPendingRequestForSpk(spkRef: string): ProductionRequest | undefined {
  let found: ProductionRequest | undefined;
  for (const request of productionRequests.values()) {
    if (request.status !== "diajukan") continue;
    if (request.spkRef !== spkRef) continue;
    if (!found || request.createdAt > found.createdAt) found = request;
  }
  return found;
}

// Serialkan pembuatan agar dua pengiriman bersamaan tidak sama-sama membuat
// request baru: yang kedua membaca hasil replace milik yang pertama.
let createTask: Promise<unknown> = Promise.resolve();
function runSerialized(fn: () => ProductionRequestResult<ProductionRequest>): Promise<
  ProductionRequestResult<ProductionRequest>
> {
  const next = createTask.then(fn, fn);
  createTask = next.catch(() => undefined);
  return next;
}

// Membuat pengajuan material dari divisi produksi. Tiap baris diambil dari
// Master Stok agar snapshot nama/model tercatat; baris dengan barang tak
// dikenal membuat pengajuan ditolak seluruhnya.
export function createProductionRequest(
  input: CreateProductionRequestInput,
): Promise<ProductionRequestResult<ProductionRequest>> {
  return runSerialized(() => {
    const items: ProductionRequestItem[] = [];

    for (const line of input.items) {
      const quantity = Math.floor(line.quantity);
      if (quantity <= 0) continue;
      const item = gudangInventoryItems.get(line.itemId);
      if (!item) return { ok: false, code: "ITEM_NOT_FOUND" };
      items.push({
        id: crypto.randomUUID(),
        itemId: item.id,
        categoryId: item.categoryId,
        categoryName: getCategoryById(item.categoryId)?.name ?? "",
        itemName: item.itemName,
        modelNo: item.modelNo,
        brand: item.brand,
        color: item.color,
        rackGroup: item.rackGroup,
        subRow: item.subRow,
        quantity,
      });
    }

    if (items.length === 0) return { ok: false, code: "NO_ITEMS" };

    const now = new Date().toISOString();
    const spkRef = input.spkRef.trim();

    const existing = findPendingRequestForSpk(spkRef);
    if (existing) {
      existing.requestDate = input.requestDate || todayIso();
      existing.spkLabel = (input.spkLabel ?? "").trim();
      existing.requesterName = input.requesterName.trim();
      existing.note = (input.note ?? "").trim();
      existing.items = items;
      existing.updatedAt = now;
      persistProductionRequest(existing);
      return { ok: true, data: existing, replaced: true };
    }

    const request: ProductionRequest = {
      id: `pr-${crypto.randomUUID()}`,
      requestDate: input.requestDate || todayIso(),
      spkRef,
      spkLabel: (input.spkLabel ?? "").trim(),
      requesterName: input.requesterName.trim(),
      note: (input.note ?? "").trim(),
      status: "diajukan",
      items,
      createdAt: now,
      updatedAt: now,
    };
    persistProductionRequest(request);
    return { ok: true, data: request };
  });
}