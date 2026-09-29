import type { PenagihanItem } from "./types";

export function formatRp(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function computeTotals(items: PenagihanItem[]) {
  const total = items.reduce((sum, item) => sum + item.nilai, 0);
  const piutang = items.filter((item) => item.status === "belum_bayar").reduce((sum, item) => sum + item.nilai, 0);
  const lunas = items.filter((item) => item.status === "lunas").reduce((sum, item) => sum + item.nilai, 0);
  return { total, piutang, lunas };
}
