const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

import type { Period } from "@/frontend/(manager)/types";

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

export async function fetchDashboardData(_period?: Period): Promise<DashboardData> {
  // TODO: Replace with real API call
  // const res = await fetch(`/api/manager/dashboard?period=${_period}`);
  // if (!res.ok) throw new Error("Failed to fetch dashboard data");
  // return res.json();
  await delay(500);
  return {
    financialCards: [
      { label: "Total Pendapatan", value: "Rp 0", change: "0%", positive: true, bars: [0, 0, 0, 0, 0] },
      { label: "Biaya Operasional", value: "Rp 0", change: "0%", positive: true, bars: [0, 0, 0, 0, 0] },
      { label: "Laba Bersih", value: "Rp 0", change: "0%", positive: true, bars: [0, 0, 0, 0, 0] },
    ],
    registrations: [
      { name: "-", dept: "-", date: "-", initial: "-", status: "pending" },
    ],
    activities: [
      { time: "--:-- WIB", text: "Belum ada aktivitas", tag: "System", highlight: false, system: true },
    ],
    systemStatus: { serverGudang: "--", dbLatency: "--" },
  };
}
