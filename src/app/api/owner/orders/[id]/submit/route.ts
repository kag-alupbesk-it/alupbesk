import { submitOrderToManager } from "@/backend/modules/marketing/index";
import { flushWrites } from "@/services/supabase";
import { ensureHydrated } from "@/services/supabaseHydrate";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await params;
  const order = submitOrderToManager(id);
  await flushWrites();
  if (!order) {
    return Response.json(
      { success: false, error: { code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan." } },
      { status: 404 },
    );
  }
  return Response.json({ success: true, data: order });
}