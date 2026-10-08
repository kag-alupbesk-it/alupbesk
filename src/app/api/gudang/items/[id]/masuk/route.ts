import { z } from "zod";
import { createGudangMasuk } from "@/backend/modules/gudang/index";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { ensureHydrated } from "@/services/supabaseHydrate";
export const gudangMasukSchema = z.object({ jumlah: z.number().int().positive("Jumlah barang masuk harus lebih dari nol."), tanggal: z.string().min(1, "Tanggal wajib diisi."), sumber: z.string().min(1, "Sumber barang (supplier/tengkulak) wajib diisi."), buktiNota: z.string().optional(), catatan: z.string().optional() });
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const parsed = gudangMasukSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) return Response.json({ success: false, error: { code: "INVALID_GUDANG_MASUK", message: parsed.error.issues[0]?.message ?? "Data barang masuk tidak valid." } }, { status: 400 });
  const { id } = await params;
  const result = createGudangMasuk(id, parsed.data);
  await flushWrites();
  if (!result.ok) return Response.json({ success: false, error: { code: result.code, message: result.code === "GUDANG_ITEM_NOT_FOUND" ? "Barang tidak ditemukan." : "Data barang masuk tidak valid." } }, { status: result.code === "GUDANG_ITEM_NOT_FOUND" ? 404 : 400 });
  return Response.json({ success: true, data: result.movement });
}
