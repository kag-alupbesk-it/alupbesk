import { CuttingList } from "@/frontend/Manager/(produksi)/components/CuttingList/CuttingList";

export const metadata = {
  title: "Cutting List | Manajer Produksi",
  description: "Kelola daftar potong material per SPK dan sisa potong bahan",
};

export default function Page() {
  return <CuttingList />;
}
