import { getGudangItems } from "@/services/gudang";
import { GudangSection } from "@/frontend/(gudang)/components";

export const metadata = {
  title: "Data Gudang Inventaris | ALUPBESK",
  description: "Sistem manajemen inventaris dan seksi rak gudang ALUPBESK Industrial Precision",
};

export default async function Page() {
  const gudangItems = await getGudangItems();
  return <GudangSection initialItems={gudangItems} />;
}
