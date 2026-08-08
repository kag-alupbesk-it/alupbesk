import type { ProjectOrder } from "./types";

const now = Date.now();
const iso = (offsetMinutes: number): string =>
  new Date(now - offsetMinutes * 60000).toISOString();

// Seed data awal agar halaman pesanan proyek bisa diuji; ganti dengan data
// nyata saat database aktif.
export const projectOrders = new Map<string, ProjectOrder>([
  [
    "prj-1001",
    {
      id: "prj-1001",
      namaProyek: "Proyek Apartemen Citra 2",
      pelanggan: "PT Bangun Perkasa",
      perusahaan: "PT Bangun Perkasa",
      telepon: "081234567890",
      catatan: "Kebutuhan kusen & mortise untuk tower B.",
      items: [
        {
          gudangItemId: "gd-103",
          sku: "KSN-ALU-900",
          jenisBarang: "kusen",
          merek: "ALUP",
          warna: "Natural Anodized",
          satuan: "batang",
          quantity: 20,
        },
        {
          gudangItemId: "gd-102",
          sku: "MRT-SLD-SS-808",
          jenisBarang: "mortise",
          merek: "SOLID",
          warna: "Stainless Steel",
          satuan: "set",
          quantity: 4,
        },
      ],
      totalQuantity: 24,
      status: "diajukan",
      createdAt: iso(120),
      updatedAt: iso(120),
    },
  ],
  [
    "prj-1002",
    {
      id: "prj-1002",
      namaProyek: "Proyek Apartemen Citra 2",
      pelanggan: "CV Sinergi Konstruksi",
      perusahaan: "CV Sinergi Konstruksi",
      telepon: "081298765432",
      catatan: "Kusen untuk lantai 5–9.",
      items: [
        {
          gudangItemId: "gd-103",
          sku: "KSN-ALU-900",
          jenisBarang: "kusen",
          merek: "ALUP",
          warna: "Natural Anodized",
          satuan: "batang",
          quantity: 10,
        },
      ],
      totalQuantity: 10,
      status: "diproses",
      createdAt: iso(200),
      updatedAt: iso(100),
      processedAt: iso(100),
    },
  ],
]);
