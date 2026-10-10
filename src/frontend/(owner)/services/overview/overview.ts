import { request } from "@/services/api/request";
import type { Period } from "@/frontend/(owner)/types/types";
import type {
  Activity,
  Registration,
  SystemStatus,
} from "@/frontend/(owner)/services/dashboard/dashboard";

export interface OwnerMetric {
  label: string;
  value: string;
}

export interface OwnerDivisionCard {
  division: string;
  label: string;
  icon: string;
  href: string;
  headline: OwnerMetric;
  metrics: OwnerMetric[];
  attention: number;
}

export interface OwnerAttentionItem {
  id: string;
  division: string;
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

export function fetchOwnerOverview(period: Period = "monthly"): Promise<OwnerOverview> {
  return request<OwnerOverview>(`/owner/overview?period=${period}`);
}
