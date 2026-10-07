import type { GudangOrderSegment, GudangOrderStatus } from "../types/types";

export const STATUS_LABELS: Record<GudangOrderStatus, string> = {
  confirmed: "Menunggu Proses",
  processing: "Dalam Proses",
  completed: "Selesai",
};

export const STATUS_FILTER_LABELS: Record<string, string> = {
  ALL: "Semua Status",
  confirmed: "Menunggu Proses",
  processing: "Dalam Proses",
  completed: "Selesai",
};

export const SEGMEN_LABELS: Record<GudangOrderSegment, string> = {
  eceran: "Eceran",
  proyek: "Proyek",
  mixed: "Campuran",
};

export const SEGMEN_FILTER_LABELS: Record<string, string> = {
  ALL: "Semua Segmen",
  eceran: "Eceran",
  proyek: "Proyek",
  mixed: "Campuran",
};

// Warna badge segmen mengikuti konvensi Data Gudang: proyek = tertiary,
// eceran = success, campuran = secondary.
export function segmenBadgeClass(segmen: GudangOrderSegment): string {
  switch (segmen) {
    case "proyek":
      return "bg-tertiary/10 text-tertiary border border-tertiary/20";
    case "mixed":
      return "bg-secondary/10 text-secondary border border-secondary/20";
    case "eceran":
      return "bg-success/10 text-success border border-success/20";
  }
}

export function statusDotClass(status: GudangOrderStatus): string {
  switch (status) {
    case "confirmed":
      return "bg-blue-400";
    case "processing":
      return "bg-yellow-400";
    case "completed":
      return "bg-success";
  }
}

export function statusBadgeClass(status: GudangOrderStatus): string {
  switch (status) {
    case "confirmed":
      return "bg-blue-400/10 text-blue-400 border border-blue-400/20";
    case "processing":
      return "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20";
    case "completed":
      return "bg-success/10 text-success border border-success/20";
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
