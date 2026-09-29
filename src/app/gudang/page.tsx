import { GudangSection } from "@/frontend/Manager/(gudang)/components";

export const metadata = {
  title: "Data Gudang Inventaris | ALUPBESK",
  description: "Sistem manajemen inventaris dan seksi rak gudang ALUPBESK Industrial Precision",
};

export default function Page() {
  return <GudangSection initialItems={[]} />;
}
