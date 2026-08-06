import type { Banner, Promo } from "../types";

export const banners: Banner[] = [
  {
    id: "BNR-001",
    title: "Promo Akhir Tahun — Diskon 15%",
    subtitle: "Semua produk aluminium extrusion spesial tahun baru",
    imageUrl: "/banners/promo-akhir-tahun.jpg",
    linkUrl: "/katalog",
    active: true,
    order: 1,
    startDate: "2026-12-01",
    endDate: "2026-12-31",
    createdAt: "2026-11-15T08:00:00Z",
  },
  {
    id: "BNR-002",
    title: "Produk Baru: T-Slot 8080",
    subtitle: "Kokoh untuk konstruksi heavy-duty",
    imageUrl: "/banners/tslot-8080.jpg",
    linkUrl: "/katalog",
    active: true,
    order: 2,
    startDate: "2026-10-01",
    endDate: "2027-01-31",
    createdAt: "2026-09-20T10:30:00Z",
  },
  {
    id: "BNR-003",
    title: "Gratis Ongkir Jabodetabek",
    subtitle: "Min. pembelian Rp 2.000.000",
    imageUrl: "/banners/gratis-ongkir.jpg",
    linkUrl: "/katalog",
    active: false,
    order: 3,
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    createdAt: "2026-10-25T14:00:00Z",
  },
];

export const promos: Promo[] = [
  {
    id: "PRO-001",
    title: "Paket Rangka CNC 4040",
    description: "Bundel T-Slot 4040 + bracket + baut, hemat 20%",
    discount: 20,
    productIds: [1, 2],
    active: true,
    imageUrl: "/promos/cnc-bundle.jpg",
    startDate: "2026-12-01",
    endDate: "2026-12-31",
    createdAt: "2026-11-20T09:00:00Z",
  },
  {
    id: "PRO-002",
    title: "Buy 2 Get 1 — Linear Rail",
    description: "Beli 2 linear rail SBR16 gratis 1 unit",
    productIds: [3],
    active: true,
    imageUrl: "/promos/linear-rail-promo.jpg",
    startDate: "2026-11-15",
    endDate: "2027-01-15",
    createdAt: "2026-11-10T11:00:00Z",
  },
];

