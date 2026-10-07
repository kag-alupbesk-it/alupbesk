export type Period = "daily" | "weekly" | "monthly" | "yearly";

export const periodLabels: Record<Period, string> = {
  daily: "Hari Ini",
  weekly: "Minggu Ini",
  monthly: "Bulan Ini",
  yearly: "Tahun Ini",
};
