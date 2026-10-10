import { ProduksiDashboard } from "@/frontend/Manager/(produksi)/components/ProduksiDashboard/ProduksiDashboard";
import { ProduksiProvider } from "@/frontend/Manager/(produksi)/context/ProduksiContext/ProduksiContext";

export const metadata = {
  title: "Produksi | ALUPBESK Owner",
  description: "Pantau antrean SPK, gambar teknik, dan progres workshop.",
};

export default function Page() {
  return (
    <ProduksiProvider>
      <ProduksiDashboard />
    </ProduksiProvider>
  );
}
