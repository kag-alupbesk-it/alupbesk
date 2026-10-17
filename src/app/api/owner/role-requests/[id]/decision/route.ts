import { z } from "zod";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";
import { reviewRoleRequest } from "@/backend/modules/roleRequests/index";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { recordAudit } from "@/backend/modules/audit/recordAudit";

const decisionSchema = z.object({
  decision: z.enum(["approve", "reject"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await authorizeCurrentUser(
    "/api/owner/role-requests/[id]/decision",
    "POST",
  );
  if (!access.profile) {
    return Response.json(
      {
        success: false,
        error: {
          code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message: "Hanya Owner yang dapat menyetujui permintaan role.",
        },
      },
      { status: access.status },
    );
  }

  const parsed = decisionSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_DECISION",
          message: "Keputusan permintaan role tidak valid.",
        },
      },
      { status: 400 },
    );
  }

  const { id } = await params;
  try {
    await reviewRoleRequest(
      id,
      parsed.data.decision,
      access.profile.role,
      access.profile.id,
    );
    recordAudit(access.profile, "EDIT", "Permintaan Role", `${parsed.data.decision === "approve" ? "Menyetujui" : "Menolak"} permintaan role ${id}`);
    return Response.json({ success: true, data: { id } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "DATABASE_UNAVAILABLE" ? 503
      : code === "EMAIL_NOT_CONFIRMED" ? 409
      : code === "ROLE_FORBIDDEN" ? 403
        : code.includes("NOT_FOUND") ? 404
          : code.includes("ALREADY_REVIEWED") ? 409
            : 500;
    return Response.json(
      {
        success: false,
        error: {
          code: status === 500 ? "DATABASE_ERROR" : code,
          message: status === 404
            ? "Permintaan role tidak ditemukan."
            : code === "EMAIL_NOT_CONFIRMED"
              ? "Email harus diverifikasi sebelum role dapat disetujui."
              : status === 409
              ? "Permintaan ini sudah ditinjau. Muat ulang daftar."
              : status === 403
                ? "Hanya Owner yang dapat menyetujui permintaan role."
                : "Permintaan role gagal diproses.",
        },
      },
      { status },
    );
  }
}
