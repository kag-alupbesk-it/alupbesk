import { PMDashboard } from "@/frontend/Manager/(pm)/components/PMDashboard/PMDashboard";
import { PMOrderProvider } from "@/frontend/Manager/(pm)/context/PMOrderContext/PMOrderContext";

export const metadata = {
  title: "Proyek | ALUPBESK Owner",
  description: "Pantau order proyek, approval gambar, dan progres produksi.",
};

export default function Page() {
  return (
    <PMOrderProvider>
      <PMDashboard />
    </PMOrderProvider>
  );
}
