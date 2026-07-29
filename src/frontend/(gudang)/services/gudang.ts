const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

import type { Period } from "@/frontend/(manager)/types";

export interface GudangItem {
  id: string;
  sku: string;
  jenisBarang: "handle" | "mortise";
  merek: string;
  warna: string;
  seksiLokasi: string;
  stok: number;
  minStok: number;
  catatan?: string;
}

export interface GudangData {
  items: GudangItem[];
}

export async function fetchGudangData(_period?: Period): Promise<GudangData> {
  // TODO: Replace with real API call
  // const res = await fetch(`/api/gudang?period=${_period}`);
  // if (!res.ok) throw new Error("Failed to fetch gudang data");
  // return res.json();
  await delay(500);
  return {
    items: [],
  };
}
