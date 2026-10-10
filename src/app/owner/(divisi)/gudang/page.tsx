import { GudangSection } from "@/frontend/Manager/(gudang)/components";

export const metadata = {
  title: "Inventory | ALUPBESK Owner",
  description: "Pantau stok gudang, pesanan, dan kritikalitas inventaris.",
};

export default function Page() {
  return <GudangSection initialItems={[]} />;
}
