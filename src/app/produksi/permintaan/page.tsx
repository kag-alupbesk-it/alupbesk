import { PengajuanGudang } from "@/frontend/Manager/(produksi)/components/PengajuanGudang/PengajuanGudang";

export const metadata = {
  title: "Permintaan Material | Manajer Produksi",
  description: "Ajukan kebutuhan material produksi ke gudang ALUPBESK",
};

export default function Page() {
  return <PengajuanGudang />;
}
