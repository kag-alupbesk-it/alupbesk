import {
  deleteMaterialLot,
  updateMaterialLot,
} from "@/backend/modules/gudangInventory/lots";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { flushWritesOrError } from "@/backend/http/flushWritesOrError";
import { ensureHydrated } from "@/services/supabaseHydrate";
import { materialLotSchema } from "../route";
import { recordAuditForCurrentUser } from "@/backend/modules/audit/recordAudit";

const updateSchema = materialLotSchema.partial();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureHydrated();
  const parsed = updateSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_LOT",
          message: parsed.error.issues[0]?.message ?? "Data lot tidak valid.",
        },
      },
      { status: 400 },
    );
  }

  const { id } = await params;
  const result = updateMaterialLot(id, parsed.data);
  if (!result.ok) {
    const notFound = result.code === "LOT_NOT_FOUND";
    return Response.json(
      {
        success: false,
        error: {
          code: result.code,
          message: notFound ? "Lot tidak ditemukan." : "Barang tidak ditemukan.",
        },
      },
      { status: notFound ? 404 : 400 },
    );
  }

  const flushError = await flushWritesOrError();
  if (flushError) return flushError;

  await recordAuditForCurrentUser("EDIT", "Lot Bahan", `Mengubah lot bahan (${id})`);
  return Response.json({ success: true, data: result.data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureHydrated();
  const { id } = await params;
  const result = deleteMaterialLot(id);
  if (!result.ok) {
    return Response.json(
      {
        success: false,
        error: { code: "LOT_NOT_FOUND", message: "Lot tidak ditemukan." },
      },
      { status: 404 },
    );
  }

  const flushError = await flushWritesOrError();
  if (flushError) return flushError;

  await recordAuditForCurrentUser("DELETE", "Lot Bahan", `Menghapus lot bahan (${id})`);
  return Response.json({ success: true, data: result.data });
}
