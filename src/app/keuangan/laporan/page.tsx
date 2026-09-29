import { LaporanSection as LaporanPage } from "@/frontend/Manager/(keuangan)/components/laporan";

export const metadata = {
  title: "Laporan Keuangan | ALUPBESK",
  description: "Laporan revenue, profit, dan komposisi penjualan ALUPBESK",
};

export default function Page() {
  return <LaporanPage />;
}
