import type { KasEntry, KasData } from "./types";

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

export function combineEntries(kas: KasData): KasEntry[] {
  return [...kas.masuk, ...kas.keluar].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const kategoriBadge: Record<string, string> = {
  eceran: "bg-secondary/10 text-secondary border-secondary/20",
  proyek: "bg-tertiary/10 text-tertiary border-tertiary/20",
  operasional: "bg-surface-variant text-on-surface-variant border-outline/30",
};
