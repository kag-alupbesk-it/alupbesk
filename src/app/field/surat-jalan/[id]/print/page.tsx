import { SuratJalanPrintView } from "@/frontend/Manager/(field)/components";

export const metadata = {
  title: "Cetak Surat Jalan | ALUPBESK",
  description: "Surat jalan siap cetak - CV Ma Karya Artha Graha - Manajer Lapangan ALUPBESK Industrial Precision",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SuratJalanPrintView deliveryId={id} />;
}