import { z } from "zod";
import {
  createProductionRequest,
  getProductionRequests,
} from "@/backend/modules/gudangInventory/productionRequests";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { flushWritesOrError } from "@/backend/http/flushWritesOrError";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";
import { ensureHydrated } from "@/services/supabaseHydrate";
import { recordAudit } from "@/backend/modules/audit/recordAudit";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  requestDate: z.string().min(1).optional(),
  spkRef: z.string().trim().min(1, "SPK wajib dipilih.").max(120),
  spkLabel: z.string().trim().max(200).optional(),
  requesterName: z.string().trim().max(160).optional(),
  note: z.string().max(1000).optional(),
  items: z
    .array(
      z.object({
        itemId: z.string().min(1),
        quantity: z.number().int().positive("Jumlah harus lebih dari 0."),
      }),
    )
    .min(1, "Minimal satu barang harus diajukan.")
    .max(200),
});

const ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  ITEM_NOT_FOUND: { status: 404, message: "Barang tidak ditemukan di Master Stok." },
  NO_ITEMS: { status: 400, message: "Minimal satu barang harus diajukan." },
};

export async function GET() {
  const access = await authorizeCurrentUser("/api/produksi/permintaan", "GET");
  if (!access.profile) {
    return Response.json(
      {
        success: false,
        error: {
          code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message: "Akses permintaan material ditolak.",
        },
      },
      { status: access.status },
    );
  }

  await ensureHydrated();
  return Response.json(
    { success: true, data: getProductionRequests() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const access = await authorizeCurrentUser("/api/produksi/permintaan", "POST");
  if (!access.profile) {
    return Response.json(
      {
        success: false,
        error: {
          code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message: "Hanya role produksi yang dapat mengajukan material.",
        },
      },
      { status: access.status },
    );
  }

  await ensureHydrated();
  const parsed = createSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: parsed.error.issues[0]?.message ?? "Data pengajuan tidak valid.",
        },
      },
      { status: 400 },
    );
  }

  const result = await createProductionRequest({
    requestDate: parsed.data.requestDate ?? "",
    spkRef: parsed.data.spkRef,
    spkLabel: parsed.data.spkLabel,
    requesterName: parsed.data.requesterName?.trim() || access.profile.name || "Produksi",
    note: parsed.data.note,
    items: parsed.data.items,
  });

  if (!result.ok) {
    const mapped = ERROR_MESSAGES[result.code] ?? {
      status: 400,
      message: "Pengajuan gagal disimpan.",
    };
    return Response.json(
      { success: false, error: { code: result.code, message: mapped.message } },
      { status: mapped.status },
    );
  }

  const flushError = await flushWritesOrError();
  if (flushError) return flushError;

  recordAudit(access.profile, "CREATE", "Permintaan Produksi", `Mengajukan permintaan material untuk ${parsed.data.spkRef}`);

  return Response.json(
    {
      success: true,
      data: { request: result.data, replaced: result.replaced ?? false },
    },
    { status: 201 },
  );
}
