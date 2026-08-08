import { projectOrders } from "./store";
import { getCustomRequests, setCustomRequestStatus } from "@/backend/modules/custom";
import { getGudangItems } from "../items/getGudangItems";
import type {
  CreateProjectOrderInput,
  ProjectOrder,
  ProjectOrderItem,
} from "./types";

export type CreateProjectOrderResult =
  | { ok: true; order: ProjectOrder }
  | {
      ok: false;
      code: "REQUEST_NOT_FOUND" | "REQUEST_ALREADY_USED" | "NO_ITEMS" | "GUDANG_ITEM_NOT_FOUND" | "PELANGGAN_REQUIRED";
    };

// Membuat pesanan proyek dari permintaan custom. Data pelanggan terisi
// otomatis dari request; barang dipilih dari item gudang kategori "proyek".
// Permintaan custom yang sudah dikonversi tidak bisa dipakai lagi.
export function createProjectOrder(input: CreateProjectOrderInput): CreateProjectOrderResult {
  const gudangItems = getGudangItems();
  const items: ProjectOrderItem[] = [];

  for (const line of input.items) {
    const item = gudangItems.find((gudangItem) => gudangItem.id === line.gudangItemId);
    if (!item) return { ok: false, code: "GUDANG_ITEM_NOT_FOUND" };
    const quantity = Math.floor(line.quantity);
    if (quantity <= 0) continue;
    items.push({
      gudangItemId: item.id,
      sku: item.sku,
      jenisBarang: item.jenisBarang,
      merek: item.merek,
      warna: item.warna,
      satuan: item.satuan,
      quantity,
    });
  }
  if (items.length === 0) return { ok: false, code: "NO_ITEMS" };

  let requestId: string | undefined;
  let perusahaan: string | undefined;
  let telepon = input.telepon?.trim();
  let catatan = input.catatan?.trim();
  let pelanggan = input.pelanggan?.trim() ?? "";

  if (input.requestId) {
    const request = getCustomRequests().find((r) => r.id === input.requestId);
    if (!request) return { ok: false, code: "REQUEST_NOT_FOUND" };
    if (request.status === "accepted" || request.status === "rejected")
      return { ok: false, code: "REQUEST_ALREADY_USED" };

    requestId = request.id;
    if (!pelanggan) pelanggan = request.nama;
    perusahaan = request.perusahaan?.trim() || undefined;
    if (!telepon) telepon = request.telp;
    catatan =
      catatan ||
      [request.layanan, request.deskripsi, request.dimensi, request.kuantitas ? `Kuantitas: ${request.kuantitas}` : undefined]
        .filter(Boolean)
        .join(" · ") ||
      undefined;
  }

  if (!pelanggan) return { ok: false, code: "PELANGGAN_REQUIRED" };

  const createdAt = new Date().toISOString();
  const order: ProjectOrder = {
    id: `prj-${Date.now()}`,
    requestId,
    namaProyek: input.namaProyek.trim(),
    pelanggan,
    perusahaan,
    telepon,
    catatan,
    items,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    status: "diajukan",
    createdAt,
    updatedAt: createdAt,
  };

  projectOrders.set(order.id, order);
  if (requestId) setCustomRequestStatus(requestId, "accepted");

  return { ok: true, order };
}
