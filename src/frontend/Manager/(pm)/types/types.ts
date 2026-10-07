export type ProjectStatus =
  | "menunggu_acc"
  | "siap_produksi"
  | "produksi"
  | "siap_kirim"
  | "selesai";

export type DrawingStatus = "menunggu_acc" | "acc_gambar" | "revisi";

export type DrawingVariant = "curtain-wall" | "window-frame" | "ventilation" | "partition";

export interface PMItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  technicalNote: string;
}

export interface PMOrder {
  id: string;
  contractorName: string;
  contractorCode: string;
  enteredAt: string;
  targetDate: string;
  projectStatus: ProjectStatus;
  drawingStatus: DrawingStatus;
  stage: 0 | 1 | 2 | 3;
  drawingVariant: DrawingVariant;
  items: PMItem[];
  rawImage?: string;
  rawImageName?: string;
  productionImage?: string;
  productionImageName?: string;
  hasProductionDrawing: boolean;
  revisionNote?: string;
  revisionCount: number;
  lastActivity: string;
}

export interface NewPMOrderInput {
  contractorName: string;
  contractorCode: string;
  targetDate: string;
  items: Omit<PMItem, "id">[];
  rawImage?: string;
  rawImageName?: string;
}

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
