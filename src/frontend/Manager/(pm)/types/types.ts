export type {
  PMItem,
  PMOrder,
  NewPMOrderInput,
} from "@/services/pm/types";

import type {
  PMDrawingStatus,
  PMDrawingVariant,
  PMProjectStatus,
  PMProductionStage,
} from "@/services/pm/types";

export type DrawingStatus = PMDrawingStatus;
export type ProjectStatus = PMProjectStatus;
export type DrawingVariant = PMDrawingVariant;
export type ProductionStage = PMProductionStage;

export const projectStatusLabels: Record<ProjectStatus, string> = {
  menunggu_acc: "Menunggu ACC",
  siap_produksi: "Siap Produksi",
  produksi: "Sedang Diproduksi",
  siap_kirim: "Siap Kirim",
  selesai: "Selesai",
};

export const drawingStatusLabels: Record<DrawingStatus, string> = {
  menunggu_acc: "Menunggu ACC",
  acc_gambar: "ACC Gambar",
  revisi: "Revisi",
};

export const statusFilterLabels: Record<ProjectStatus | "all", string> = {
  all: "Semua Status",
  menunggu_acc: "Menunggu ACC",
  siap_produksi: "Siap Produksi",
  produksi: "Sedang Diproduksi",
  siap_kirim: "Siap Kirim",
  selesai: "Selesai",
};
