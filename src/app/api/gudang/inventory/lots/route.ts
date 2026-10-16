import { z } from "zod";
import {
  createMaterialLot,
  getMaterialLotViews,
} from "@/backend/modules/gudangInventory/lots";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { flushWritesOrError } from "@/backend/http/flushWritesOrError";
import { ensureHydrated } from "@/services/supabaseHydrate";

export const materialLotSchema = z.object({
  itemId: z.string().min(1, "Barang wajib dipilih."),
  lotCode: z.string().optional(),
  receivedDate: z.string().optional(),
  length: z.number().positive("Panjang harus lebih dari 0.").nullable().optional(),
  width: z.number().positive("Lebar harus lebih dari 0.").nullable().optional(),
  quantity: z.number().min(0, "Jumlah tidak boleh negatif.").optional(),
  rackGroup: z.string().optional(),
  subRow: z.string().optional(),
  status: z.enum(["tersedia", "sisa", "scrap", "habis"]).optional(),
  note: z.string().optional(),
});

export async function GET() {
  await ensureHydrated();
  return Response.json({ success: true, data: getMaterialLotViews() });
}

export async function POST(request: Request) {
  await ensureHydrated();
  const parsed = materialLotSchema.safeParse(await readJsonBody(request));
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

  const result = createMaterialLot(parsed.data);
  if (!result.ok) {
    return Response.json(
      {
        success: false,
        error: { code: result.code, message: "Barang tidak ditemukan." },
      },
      { status: 404 },
    );
  }

  const flushError = await flushWritesOrError();
  if (flushError) return flushError;

  return Response.json({ success: true, data: result.data }, { status: 201 });
}
