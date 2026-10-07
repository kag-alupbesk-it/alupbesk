export type PMProjectStatus =
  | "menunggu_acc"
  | "siap_produksi"
  | "produksi"
  | "siap_kirim"
  | "selesai";

export type PMDrawingStatus = "menunggu_acc" | "acc_gambar" | "revisi";

export type PMDrawingVariant =
  | "curtain-wall"
  | "window-frame"
  | "ventilation"
  | "partition";

export type PMProductionStage =
  | "pemotongan"
  | "perakitan"
  | "finishing"
  | "qc"
  | "siap_kirim";

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
  contractorPhone?: string;
  projectAddress?: string;
  enteredAt: string;
  targetDate: string;
  projectStatus: PMProjectStatus;
  drawingStatus: PMDrawingStatus;
  stage: 0 | 1 | 2 | 3;
  productionStage: PMProductionStage;
  drawingVariant: PMDrawingVariant;
  items: PMItem[];
  rawImage?: string;
  rawImageName?: string;
  technicalNote?: string;
  productionImage?: string;
  productionImageName?: string;
  productionImageSize?: number;
  productionImageType?: string;
  hasProductionDrawing: boolean;
  revisionNote?: string;
  revisionCount: number;
  lastActivity: string;
}

export interface NewPMOrderInput {
  contractorName: string;
  contractorCode: string;
  contractorPhone?: string;
  projectAddress?: string;
  targetDate: string;
  items: Omit<PMItem, "id">[];
  rawImage?: string;
  rawImageName?: string;
}

export type PMOrderMutation =
  | { action: "approve" }
  | { action: "revision"; note: string }
  | { action: "advance" }
  | { action: "production-stage"; stage: PMProductionStage };

export type PMOrderResult =
  | { ok: true; order: PMOrder }
  | {
      ok: false;
      code:
        | "DATABASE_UNAVAILABLE"
        | "ORDER_NOT_FOUND"
        | "INVALID_TRANSITION"
        | "DATABASE_ERROR";
      message: string;
    };
