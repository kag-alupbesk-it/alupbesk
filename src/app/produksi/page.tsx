import { ProduksiDashboard } from "@/frontend/Manager/(produksi)/components/ProduksiDashboard";

export const metadata = {
  title: "Antrean Produksi | Manajer Produksi",
  description: "Unggah gambar teknik kerja dan pantau progres pengerjaan barang di workshop ALUPBESK",
};

export default function Page() {
  return <ProduksiDashboard />;
}
