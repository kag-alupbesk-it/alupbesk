import type { FinancialsData, Period } from "./types";

export const barLabels: Record<Period, string[]> = {
  daily: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
  weekly: ["W1", "W2", "W3", "W4"],
  monthly: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
  yearly: ["Q1", "Q2", "Q3", "Q4"],
};

export function emptyFinancials(): FinancialsData {
  return { metrics: [], statements: [], expenses: [], barChart: [], donut: [] };
}
