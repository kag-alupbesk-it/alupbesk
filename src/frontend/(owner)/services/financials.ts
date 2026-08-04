const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

import type { Period } from "@/frontend/(owner)/types";

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

export async function fetchFinancialsData(_period?: Period): Promise<FinancialsData> {
  // TODO: Replace with real API call
  // const res = await fetch(`/api/owner/financials?period=${_period}`);
  // if (!res.ok) throw new Error("Failed to fetch financials data");
  // return res.json();
  await delay(500);
  return {
    metrics: [
      { label: "Net Revenue", value: "$0", sub: null, icon: "trending_up" },
      { label: "Profit Margin", value: "0%", sub: null, icon: null, isProgress: true },
      { label: "Total OpEx", value: "$0", sub: null, icon: "account_balance_wallet" },
      { label: "Quick Ratio", value: "0", sub: null, icon: "equalizer" },
    ],
    statements: [
      { period: "Q4 2024 Interim", revenue: "$0", profit: "$0", margin: "0%" },
    ],
    expenses: [
      { label: "Logistics", value: "$0", pct: 0, color: "bg-secondary" },
      { label: "Production", value: "$0", pct: 0, color: "bg-on-surface-variant" },
      { label: "Payroll", value: "$0", pct: 0, color: "bg-outline" },
    ],
    barChart: [
      { value: 0 }, { value: 0 }, { value: 0 },
      { value: 0 }, { value: 0 }, { value: 0 },
      { value: 0 }, { value: 0 }, { value: 0 },
    ],
    donut: [
      { value: 0, label: "Logistics", color: "var(--color-secondary)" },
      { value: 0, label: "Production", color: "var(--color-on-surface-variant)" },
      { value: 0, label: "Payroll", color: "var(--color-outline)" },
    ],
  };
}
