import type { Banner, PemasaranOrder, LaporanRekap } from "../types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
let bannersStore: Banner[] = [];
let ordersStore: PemasaranOrder[] = [];

export async function fetchBanners(): Promise<Banner[]> {
  await delay(300);
  if (bannersStore.length === 0) {
    const { banners } = await import("../data/pemasaranData");
    bannersStore = [...banners];
  }
  return bannersStore;
}

export async function saveBanner(banner: Banner): Promise<Banner> {
  await delay(300);
  const idx = bannersStore.findIndex((b) => b.id === banner.id);
  if (idx >= 0) bannersStore[idx] = banner;
  else bannersStore.push(banner);
  bannersStore = bannersStore.sort((a, b) => a.order - b.order);
  return banner;
}

export async function deleteBanner(id: string): Promise<void> {
  await delay(200);
  bannersStore = bannersStore.filter((b) => b.id !== id);
}

export async function fetchPemasaranOrders(): Promise<PemasaranOrder[]> {
  await delay(400);
  if (ordersStore.length === 0) {
    const { dummyOrders } = await import("../data/pemasaranData");
    ordersStore = [...dummyOrders];
  }
  return ordersStore;
}

export async function confirmOrder(id: string): Promise<PemasaranOrder> {
  await delay(300);
  const idx = ordersStore.findIndex((o) => o.id === id);
  if (idx < 0) throw new Error("Pesanan tidak ditemukan");
  const now = new Date().toISOString();
  ordersStore[idx] = {
    ...ordersStore[idx],
    status: "submitted_to_manager",
    marketingConfirmedAt: now,
    submittedToManagerAt: now,
    updatedAt: now,
  };
  return ordersStore[idx];
}

export async function fetchLaporanRekap(): Promise<LaporanRekap> {
  await delay(300);
  if (ordersStore.length === 0) {
    const { dummyOrders } = await import("../data/pemasaranData");
    ordersStore = [...dummyOrders];
  }
  const totalPesanan = ordersStore.length;
  const disetujui = ordersStore.filter((o) => o.status === "confirmed").length;
  const ditolak = ordersStore.filter((o) => o.status === "rejected_by_manager").length;
  const menunggu = ordersStore.filter((o) => o.status === "pending" || o.status === "submitted_to_manager").length;
  return { totalPesanan, disetujui, ditolak, menunggu };
}
