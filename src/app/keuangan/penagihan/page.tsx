import { PenagihanSection as PenagihanPage } from "@/frontend/Manager/(keuangan)/components/penagihan";

export const metadata = {
  title: "Penagihan & Piutang | ALUPBESK",
  description: "Status pembayaran, faktur, dan piutang pesanan ALUPBESK",
};

export default function Page() {
  return <PenagihanPage />;
}
