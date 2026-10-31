import { z } from "zod";
import { updatePMOrder } from "@/backend/modules/pm/index";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";
import { recordAudit } from "@/backend/modules/audit/recordAudit";

const mutationSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({
    action: z.literal("revision"),
    note: z.string().trim().min(1).max(2000),
  }),
  z.object({ action: z.literal("advance") }),
  z.object({ action: z.literal("handoff") }),
  z.object({
    action: z.literal("production-stage"),
    stage: z.enum(["pemotongan", "perakitan", "finishing", "qc", "siap_kirim"]),
  }),
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await authorizeCurrentUser("/api/pm/orders/[id]", "PATCH");
  if (!access.profile) {
    return Response.json(
      {
        success: false,
        error: {
          code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message: "Akses perubahan order ditolak.",
        },
      },
      { status: access.status },
    );
  }
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        success: false,
        error: { code: "INVALID_JSON", message: "Isi request bukan JSON yang valid." },
      },
      { status: 400 },
    );
  }

  const parsed = mutationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_MUTATION",
          message: parsed.error.issues[0]?.message ?? "Perubahan order tidak valid.",
        },
      },
      { status: 400 },
    );
  }

  const allowedRoles =
    parsed.data.action === "production-stage"
      ? ["produksi"]
      : parsed.data.action === "handoff"
        ? ["produksi", "proyek"]
        : ["proyek"];
  const elevated = access.profile.role === "manager" || access.profile.role === "owner";
  if (!allowedRoles.includes(access.profile.role) && !elevated) {
    const message = parsed.data.action === "production-stage"
      ? "Hanya role produksi yang dapat mengubah tahapan produksi."
      : parsed.data.action === "handoff"
        ? "Hanya tim produksi atau proyek yang dapat meneruskan order ke lapangan."
        : "Hanya role proyek yang dapat mengubah persetujuan order.";
    return Response.json(
      { success: false, error: { code: "ROLE_FORBIDDEN", message } },
      { status: 403 },
    );
  }

  try {
    const result = await updatePMOrder(id, parsed.data);
    if (!result.ok) {
      const status =
        result.code === "DATABASE_UNAVAILABLE"
          ? 503
          : result.code === "ORDER_NOT_FOUND"
            ? 404
            : result.code === "INVALID_TRANSITION"
              ? 409
              : 500;
      return Response.json(
        {
          success: false,
          error: { code: result.code, message: result.message },
        },
        { status },
      );
    }
    const actionDetails =
      parsed.data.action === "approve"
        ? `Menyetujui order ${id}`
        : parsed.data.action === "revision"
          ? `Meminta revisi order ${id}: ${parsed.data.note}`
          : parsed.data.action === "advance"
            ? `Memajukan tahap order ${id}`
            : parsed.data.action === "handoff"
              ? `Meneruskan order ${id} ke tim lapangan`
              : `Mengubah tahap produksi order ${id} menjadi ${parsed.data.stage}`;
    recordAudit(access.profile, "EDIT", "Order Proyek", actionDetails);
    return Response.json(
      { success: true, data: result.order },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[api/pm/orders] gagal memperbarui order:", error);
    return Response.json(
      {
        success: false,
        error: { code: "DATABASE_ERROR", message: "Order gagal diperbarui." },
      },
      { status: 500 },
    );
  }
}
