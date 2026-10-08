import { z } from "zod";
import { deleteGudangItem, updateGudangStock } from "@/backend/modules/gudang/index";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { flushWrites } from "@/services/supabase";
import { ensureHydrated } from "@/services/supabaseHydrate";

export const gudangStockSchema = z.object({
  stok: z.number().int().min(0, "Stok tidak boleh negatif."),
  minStok: z.number().int().min(0, "Minimum stok tidak boleh negatif."),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureHydrated();
  const parsed = gudangStockSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_GUDANG_STOCK",
          message: parsed.error.issues[0]?.message ?? "Data stok tidak valid.",
        },
      },
      { status: 400 },
    );
  }

  const { id } = await params;
  const item = updateGudangStock(id, parsed.data);
  await flushWrites();
  if (!item) {
    return Response.json(
      {
        success: false,
        error: { code: "GUDANG_ITEM_NOT_FOUND", message: "Barang tidak ditemukan." },
      },
      { status: 404 },
    );
  }
  return Response.json({ success: true, data: item });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureHydrated();
  const { id } = await params;
  let deleted: Awaited<ReturnType<typeof deleteGudangItem>>;
  try {
    deleted = await deleteGudangItem(id);
  } catch (error) {
    const unavailable = error instanceof Error && error.message === "DATABASE_UNAVAILABLE";
    return Response.json(
      { success: false, error: { code: unavailable ? "DATABASE_UNAVAILABLE" : "DATABASE_ERROR", message: unavailable ? "Database belum dikonfigurasi." : "Barang gagal dihapus." } },
      { status: unavailable ? 503 : 500 },
    );
  }
  if (deleted === "not-found") {
    return Response.json(
      {
        success: false,
        error: { code: "GUDANG_ITEM_NOT_FOUND", message: "Barang tidak ditemukan." },
      },
      { status: 404 },
    );
  }
  if (deleted === "in-use") {
    return Response.json(
      {
        success: false,
        error: { code: "GUDANG_ITEM_IN_USE", message: "Barang masih digunakan oleh pesanan proyek." },
      },
      { status: 409 },
    );
  }
  return Response.json({ success: true, data: { id } });
}
