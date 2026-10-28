import { PMOrderDetail } from "@/frontend/Manager/(pm)/components/PMOrderDetail/PMOrderDetail";
import { PMOrderProvider } from "@/frontend/Manager/(pm)/context/PMOrderContext/PMOrderContext";

export const metadata = {
  title: "Detail Proyek | Owner ALUPBESK",
  description: "Detail order proyek dalam mode pantau Owner.",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PMOrderProvider>
      <PMOrderDetail orderId={id} />
    </PMOrderProvider>
  );
}
