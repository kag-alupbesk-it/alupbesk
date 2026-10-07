import type { ProjectOrderItem, ProjectOrderStatus } from "../types/types";

export const STATUS_LABELS: Record<ProjectOrderStatus, string> = {
  diajukan: "Diajukan",
  diproses: "Dalam Proses",
  selesai: "Selesai",
};

export const STATUS_FILTER_LABELS: Record<string, string> = {
  ALL: "Semua Status",
  diajukan: "Diajukan",
  diproses: "Dalam Proses",
  selesai: "Selesai",
};

export function statusDotClass(status: ProjectOrderStatus): string {
  switch (status) {
    case "diajukan":
      return "bg-blue-400";
    case "diproses":
      return "bg-yellow-400";
    case "selesai":
      return "bg-success";
  }
}

export function statusBadgeClass(status: ProjectOrderStatus): string {
  switch (status) {
    case "diajukan":
      return "bg-blue-400/10 text-blue-400 border border-blue-400/20";
    case "diproses":
      return "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20";
    case "selesai":
      return "bg-success/10 text-success border border-success/20";
  }
}

export function itemLabel(item: ProjectOrderItem): string {
  return `${item.jenisBarang} ${item.merek} ${item.warna}`.trim();
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
