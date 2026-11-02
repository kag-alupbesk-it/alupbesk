import { KeuanganDashboard } from "@/frontend/Manager/(keuangan)/components/finance";

export const metadata = {
  title: "Keuangan | ALUPBESK",
  description: "Dashboard keuangan dengan tab kas, grafik, dan termin",
};

export default function Page() {
  return <KeuanganDashboard />;
}
