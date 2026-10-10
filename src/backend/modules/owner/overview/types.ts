import type { Activity, Registration, SystemStatus } from "@/backend/modules/manager/types";

export type OwnerDivision =
  | "marketing"
  | "keuangan"
  | "gudang"
  | "proyek"
  | "produksi"
  | "field";

export interface OwnerMetric {
  label: string;
  value: string;
}

export interface OwnerDivisionCard {
  division: OwnerDivision;
  label: string;
  icon: string;
  href: string;
  headline: OwnerMetric;
  metrics: OwnerMetric[];
  /** Jumlah item di divisi ini yang menunggu perhatian Owner. */
  attention: number;
}

export interface OwnerAttentionItem {
  id: string;
  division: OwnerDivision;
  title: string;
  detail: string;
  href: string;
  level: "high" | "medium";
}

export interface OwnerCashPoint {
  label: string;
  masuk: number;
  keluar: number;
}

export interface OwnerOverview {
  period: string;
  cards: OwnerDivisionCard[];
  attention: OwnerAttentionItem[];
  cashflow: OwnerCashPoint[];
  totals: { saldo: number; totalMasuk: number; totalKeluar: number };
  registrations: Registration[];
  activities: Activity[];
  systemStatus: SystemStatus;
}
