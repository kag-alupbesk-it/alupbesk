import { getGudangItems } from "@/services/gudang";
import { GudangPage } from "@/frontend/(gudang)/GudangPage";

export const metadata = {
  title: "Data Gudang Inventaris | ALUPBESK",
  description: "Sistem manajemen inventaris dan seksi rak gudang ALUPBESK Industrial Precision",
};

// Server Component — data di-fetch di server agar halaman cepat dimuat (SSR).
// GudangPage (client component) hanya menerima data awal dan menangani
// interaktivitas filter/search di sisi browser.
export default async function Page() {
  const gudangItems = await getGudangItems();
  return <GudangPage initialItems={gudangItems} />;
}