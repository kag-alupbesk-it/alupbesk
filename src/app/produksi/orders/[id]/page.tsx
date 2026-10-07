import { DetailSpkProgress } from "@/frontend/Manager/(produksi)/components/DetailSpkProgress/DetailSpkProgress";

export const metadata = {
  title: "Detail SPK & Progress | Manajer Produksi",
  description: "Rincian barang dan progress pengerjaan SPK di workshop ALUPBESK",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetailSpkProgress nomor={id} />;
}
