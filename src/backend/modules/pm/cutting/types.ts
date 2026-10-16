// Tipe domain modul BOM/Cutting: daftar potong material per SPK (order PM).

export type CutListStatus = "draft" | "diproses" | "selesai";
export type LeftoverStatus = "reusable" | "scrap";

export interface PMCutAllocation {
  id: string;
  cutListItemId: string;
  lotId: string | null;
  quantity: number;
  lengthUsed: number | null;
  leftoverLength: number | null;
  leftoverStatus: LeftoverStatus;
  createdAt: string;
}

export interface PMCutListItem {
  id: string;
  cutListId: string;
  componentName: string;
  quantity: number;
  length: number | null;
  width: number | null;
  materialItemId: string | null;
  note: string;
  sortOrder: number;
  allocations: PMCutAllocation[];
}

export interface PMCutList {
  id: string;
  orderId: string;
  title: string;
  note: string;
  status: CutListStatus;
  createdBy: string;
  items: PMCutListItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PMCutListItemInput {
  componentName: string;
  quantity: number;
  length?: number | null;
  width?: number | null;
  materialItemId?: string | null;
  note?: string;
}

export interface CreateCutListInput {
  orderId: string;
  title?: string;
  note?: string;
  items: PMCutListItemInput[];
}

export interface UpdateCutListInput {
  title?: string;
  note?: string;
  items?: PMCutListItemInput[];
}

// Satu alokasi eksekusi: ambil `quantity` potong sepanjang `lengthUsed` dari
// sebuah lot. Sisa potong dicatat reusable atau scrap sesuai keputusan operator.
export interface ExecuteAllocationInput {
  cutListItemId: string;
  lotId: string;
  quantity: number;
  lengthUsed?: number | null;
  leftoverStatus: LeftoverStatus;
}

export type PMCutErrorCode =
  | "ORDER_NOT_FOUND"
  | "CUT_LIST_NOT_FOUND"
  | "CUT_LIST_ITEM_NOT_FOUND"
  | "LOT_NOT_FOUND"
  | "ITEM_NOT_FOUND"
  | "INSUFFICIENT_LOT"
  | "INVALID_INPUT"
  | "DATABASE_UNAVAILABLE";

export type PMCutResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: PMCutErrorCode; message: string };
