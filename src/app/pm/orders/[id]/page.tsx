import { PMOrderDetail } from "@/frontend/Manager/(pm)/components/PMOrderDetail/PMOrderDetail";

export const metadata = {
  title: "Detail Proyek | Project Manager",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PMOrderDetail orderId={id} />;
}
