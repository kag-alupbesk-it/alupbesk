import { z } from "zod";
import {
  approveProductionRequest,
  rejectProductionRequest,
} from "@/backend/modules/gudangInventory/productionRequests";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { flushWritesOrError } from "@/backend/http/flushWritesOrError";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";
import { ensureHydrated } from "@/services/supabaseHydrate";
import { recordAudit } from "@/backend/modules/audit/recordAudit";

export const dynamic = "force-dynamic";

const decisionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().trim().max(1000).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await authorizeCurrentUser(
    "/api/gudang/inventory/production-requests",
    "PATCH",
  );
  if (!access.profile) {
    return Response.json(
      {
        success: false,
        error: {
          code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message: "Hanya role gudang yang dapat memproses permintaan.",
        },
      },
      { status: access.status },
    );
  }

  await ensureHydrated();
  const parsed = decisionSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_DECISION",
          message: parsed.error.issues[0]?.message ?? "Keputusan tidak valid.",
        },
      },
      { status: 400 },
    );
  }

  const { id } = await params;
  const approvedBy = access.profile.name || "Admin Gudang";
  const result =
    parsed.data.action === "approve"
      ? approveProductionRequest(id, approvedBy)
      : rejectProductionRequest(id, approvedBy, parsed.data.reason ?? "");

  if (!result.ok) {
    const messages: Record<string, { status: number; message: string }> = {
      REQUEST_NOT_FOUND: { status: 404, message: "Permintaan tidak ditemukan." },
      REQUEST_STATUS_INVALID: {
        status: 409,
        message: "Permintaan ini sudah diproses.",
      },
      ITEM_NOT_FOUND: {
        status: 404,
        message: result.detail
          ? `Barang "${result.detail}" tidak ditemukan di Master Stok.`
          : "Barang tidak ditemukan di Master Stok.",
      },
      INSUFFICIENT_STOCK: {
        status: 409,
        message: result.detail
          ? `Stok "${result.detail}" tidak mencukupi untuk disetujui.`
          : "Stok tidak mencukupi untuk disetujui.",
      },
    };
    const mapped = messages[result.code] ?? {
      status: 400,
      message: "Permintaan gagal diproses.",
    };
    return Response.json(
      { success: false, error: { code: result.code, message: mapped.message } },
      { status: mapped.status },
    );
  }

  const flushError = await flushWritesOrError();
  if (flushError) return flushError;

  recordAudit(
    access.profile,
    "EDIT",
    "Permintaan Produksi",
    parsed.data.action === "approve"
      ? `Menyetujui permintaan produksi (${id})`
      : `Menolak permintaan produksi (${id})${parsed.data.reason ? `: ${parsed.data.reason}` : ""}`,
  );

  return Response.json({ success: true, data: result.data });
}
