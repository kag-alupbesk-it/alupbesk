import { request } from "@/services/api/request";
import type { Period } from "@/frontend/Manager/(manager)/types/types";

export interface Metric {
  label: string;
  value: string;
  sub: string | null;
  icon: string | null;
  isProgress?: boolean;
}

export interface Statement {
  period: string;
  revenue: string;
  profit: string;
  margin: string;
}

export interface Expense {
  label: string;
  value: string;
  pct: number;
  color: string;
}

export interface BarData {
  value: number;
  label?: string;
}

export interface FinancialsData {
  metrics: Metric[];
  statements: Statement[];
  expenses: Expense[];
  barChart: BarData[];
  donut: { value: number; label: string; color: string }[];
}

export function fetchFinancialsData(period: Period = "monthly", opts?: { startDate?: string; endDate?: string }): Promise<FinancialsData> {
  return request<FinancialsData>(`/manager/financials?period=${period}`);
}
