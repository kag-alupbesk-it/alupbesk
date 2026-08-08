import { KasSection as KasPage } from "@/frontend/(keuangan)/components/kas";

export const metadata = {
  title: "Kas Masuk & Keluar | ALUPBESK",
  description: "Manajemen kas masuk, pengeluaran, dan saldo ALUPBESK",
};

export default function Page() {
  return <KasPage />;
}
