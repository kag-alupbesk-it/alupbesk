import { z } from "zod";
import { createGudangKeluar } from "@/backend/modules/gudang";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { ensureHydrated } from "@/services/supabaseHydrate";
export const gudangKeluarSchema = z.object({ jumlah: z.number().int().positive("Jumlah barang keluar harus lebih dari nol."), tanggal: z.string().min(1, "Tanggal wajib diisi."), tujuan: z.string().min(1, "Tujuan barang (proyek/penjualan) wajib diisi."), penerima: z.string().min(1, "Penerima barang wajib diisi."), catatan: z.string().optional() });
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const parsed = gudangKeluarSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) return Response.json({ success: false, error: { code: "INVALID_GUDANG_KELUAR", message: parsed.error.issues[0]?.message ?? "Data barang keluar tidak valid." } }, { status: 400 });
  const { id } = await params;
  const result = createGudangKeluar(id, parsed.data);
  await flushWrites();
  if (!result.ok) return Response.json({ success: false, error: { code: result.code, message: result.code === "GUDANG_ITEM_NOT_FOUND" ? "Barang tidak ditemukan." : "Stok tidak cukup untuk barang keluar." } }, { status: result.code === "GUDANG_ITEM_NOT_FOUND" ? 404 : 400 });
  return Response.json({ success: true, data: result.movement });
}
