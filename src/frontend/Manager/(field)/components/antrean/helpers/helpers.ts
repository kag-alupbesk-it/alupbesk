import type { FieldDeliveryStatus } from "../../types/types";
import type { FieldDelivery } from "../../types/types";
import type { FieldFilter } from "../types/types";

export const STATUS_LABELS: Record<FieldDeliveryStatus, string> = {
  "siap-kirim": "Siap Kirim",
  "dalam-pengiriman": "Dalam Pengiriman",
  "selesai-kirim": "Selesai Kirim",
};

export const STATUS_FILTER_LABELS: Record<FieldFilter, string> = {
  ALL: "Semua Status",
  "siap-kirim": "Siap Kirim",
  "dalam-pengiriman": "Dalam Pengiriman",
  "selesai-kirim": "Selesai Kirim",
};

export function statusDotClass(status: FieldDeliveryStatus): string {
  switch (status) {
    case "siap-kirim":
      return "bg-blue-400";
    case "dalam-pengiriman":
      return "bg-yellow-400";
    case "selesai-kirim":
      return "bg-success";
  }
}

export function statusBadgeClass(status: FieldDeliveryStatus): string {
  switch (status) {
    case "siap-kirim":
      return "bg-blue-400/10 text-blue-400 border border-blue-400/20";
    case "dalam-pengiriman":
      return "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20";
    case "selesai-kirim":
      return "bg-success/10 text-success border border-success/20";
  }
}

export function formatTanggal(value: string | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function totalKuantitas(delivery: FieldDelivery): number {
  return delivery.items.reduce((sum, item) => sum + item.kuantitas, 0);
}

export function totalTerkirim(delivery: FieldDelivery): number {
  return delivery.items.reduce((sum, item) => sum + item.kuantitasTerkirim, 0);
}

export function sisaItem(item: { kuantitas: number; kuantitasTerkirim: number }): number {
  return Math.max(0, item.kuantitas - item.kuantitasTerkirim);
}