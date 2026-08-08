import type {
  GudangOrder,
  GudangOrderStatus,
  GudangOrderSegment,
  GudangOrderDeduction,
  GudangProcessResult,
  GudangOrderResult,
} from "@/backend/modules/gudang";

export type {
  GudangOrder,
  GudangOrderStatus,
  GudangOrderSegment,
  GudangOrderDeduction,
  GudangProcessResult,
  GudangOrderResult,
};

export type StatusFilter = "ALL" | GudangOrderStatus;
export type SegmentFilter = "ALL" | GudangOrderSegment;

export type OrderAction = "process" | "complete";
