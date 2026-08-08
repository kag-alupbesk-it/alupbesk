import type {
  CreateProjectOrderInput,
  ProjectOrder,
  ProjectOrderItem,
  ProjectOrderResult,
  ProjectOrderStatus,
  ProjectProcessResult,
} from "@/backend/modules/gudang";
import type { CustomRequest } from "@/backend/modules/custom";

export type {
  CreateProjectOrderInput,
  ProjectOrder,
  ProjectOrderItem,
  ProjectOrderResult,
  ProjectOrderStatus,
  ProjectProcessResult,
};
export type { CustomRequest };

export type StatusFilter = "ALL" | ProjectOrderStatus;
export type ProjectOrderAction = "proses" | "selesai";
