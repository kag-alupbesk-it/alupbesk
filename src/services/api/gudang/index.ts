import type { GudangItem, GudangMovement, GudangOrder, GudangProcessResult, GudangOrderResult, ProjectOrder, ProjectProcessResult, ProjectOrderResult, CreateProjectOrderInput } from "@/backend/modules/gudang/index";
import { request } from "../request";
export interface GudangStockInput { stok: number; minStok: number; }
export interface GudangItemInput { sku: string; jenisBarang: string; kategoriBarang: "eceran" | "proyek"; satuan: string; merek: string; warna: string; seksiLokasi: string; stokAwal: number; minStok: number; proyek?: string; catatan?: string; sumberAwal?: string; }
export interface GudangMasukInput { jumlah: number; tanggal: string; sumber: string; buktiNota?: string; catatan?: string; }
export interface GudangKeluarInput { jumlah: number; tanggal: string; tujuan: string; penerima: string; catatan?: string; }
export const gudangApi = {
  getItems: (): Promise<GudangItem[]> => request("/gudang/items"),
  createItem: (input: GudangItemInput): Promise<GudangItem> => request("/gudang/items", { method: "POST", body: JSON.stringify(input) }),
  updateStock: (id: string, input: GudangStockInput): Promise<GudangItem> => request(`/gudang/items/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteItem: (id: string): Promise<{ id: string }> => request(`/gudang/items/${id}`, { method: "DELETE" }),
  getMovements: (itemId?: string): Promise<GudangMovement[]> => request(itemId ? `/gudang/movements?itemId=${encodeURIComponent(itemId)}` : "/gudang/movements"),
  recordMasuk: (id: string, input: GudangMasukInput): Promise<GudangMovement> => request(`/gudang/items/${id}/masuk`, { method: "POST", body: JSON.stringify(input) }),
  recordKeluar: (id: string, input: GudangKeluarInput): Promise<GudangMovement> => request(`/gudang/items/${id}/keluar`, { method: "POST", body: JSON.stringify(input) }),
  getOrders: (): Promise<GudangOrder[]> => request("/gudang/orders"),
  processOrder: (id: string): Promise<GudangProcessResult> => request(`/gudang/orders/${id}/process`, { method: "POST" }),
  completeOrder: (id: string): Promise<GudangOrderResult> => request(`/gudang/orders/${id}/complete`, { method: "POST" }),
  getProjectOrders: (): Promise<ProjectOrder[]> => request("/gudang/project-orders"),
  createProjectOrder: (input: CreateProjectOrderInput): Promise<ProjectOrder> => request("/gudang/project-orders", { method: "POST", body: JSON.stringify(input) }),
  prosesProjectOrder: (id: string): Promise<ProjectProcessResult> => request(`/gudang/project-orders/${id}/proses`, { method: "POST" }),
  selesaiProjectOrder: (id: string): Promise<ProjectOrderResult> => request(`/gudang/project-orders/${id}/selesai`, { method: "POST" }),
  deleteProjectOrder: (id: string): Promise<{ id: string }> => request(`/gudang/project-orders/${id}`, { method: "DELETE" }),
};
