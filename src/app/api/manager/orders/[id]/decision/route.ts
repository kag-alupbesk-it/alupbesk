import { decideOrder, MANAGER_DECISIONS } from "@/backend/modules/manager";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) ?? {};
  const decision = (body as { decision?: unknown }).decision;
  const reason = (body as { reason?: unknown }).reason;

  if (!MANAGER_DECISIONS.includes(decision as (typeof MANAGER_DECISIONS)[number])) {
    return Response.json(
      { success: false, error: { code: "INVALID_DECISION", message: "Keputusan tidak valid." } },
      { status: 400 }
    );
  }
  if (decision === "rejected_by_manager" && !(typeof reason === "string" && reason.trim())) {
    return Response.json(
      { success: false, error: { code: "REASON_REQUIRED", message: "Alasan penolakan wajib diisi." } },
      { status: 400 }
    );
  }

  const order = decideOrder(id, decision as "confirmed" | "rejected_by_manager", typeof reason === "string" ? reason : undefined);
  if (!order) {
    return Response.json(
      { success: false, error: { code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan." } },
      { status: 404 }
    );
  }
  return Response.json({ success: true, data: order });
}
