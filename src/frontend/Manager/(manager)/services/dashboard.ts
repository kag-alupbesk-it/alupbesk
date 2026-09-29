import { request } from "@/services/api/request";
import type { Period } from "@/frontend/Manager/(manager)/types";

export interface FinancialCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  bars: number[];
}

export interface Registration {
  name: string;
  dept: string;
  date: string;
  initial: string;
  status: "pending" | "approved" | "rejected";
}

export interface Activity {
  time: string;
  text: string;
  tag?: string;
  highlight?: boolean;
  system?: boolean;
}

export interface SystemStatus {
  serverGudang: string;
  dbLatency: string;
}

export interface DashboardData {
  financialCards: FinancialCard[];
  registrations: Registration[];
  activities: Activity[];
  systemStatus: SystemStatus;
}

export function fetchDashboardData(period: Period = "monthly"): Promise<DashboardData> {
  return request<DashboardData>(`/manager/dashboard?period=${period}`);
}
