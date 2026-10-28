import { Suspense } from "react";
import { PesananSection } from "@/frontend/Manager/(marketing)/components/pesanan";

export const metadata = {
  title: "Pesanan | ALUPBESK Marketing",
  description: "Daftar pesanan masuk dari website dan pengelolaannya",
};

export default function Page() {
  return (
    <Suspense fallback={<p className="py-10 text-center text-sm">Memuat...</p>}>
      <PesananSection />
    </Suspense>
  );
}
