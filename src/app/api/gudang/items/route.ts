import { z } from "zod";
import { getGudangItems, createGudangItem } from "@/backend/modules/gudang";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { ensureHydrated } from "@/services/supabaseHydrate";
export const gudangItemSchema = z.object({ sku: z.string().min(1, "SKU wajib diisi."), jenisBarang: z.string().min(1, "Jenis barang wajib diisi."), kategoriBarang: z.enum(["eceran", "proyek"], { message: "Kategori barang tidak valid." }), satuan: z.string().min(1, "Satuan wajib diisi."), merek: z.string().min(1, "Merek wajib diisi."), warna: z.string().min(1, "Warna wajib diisi."), seksiLokasi: z.string().min(1, "Lokasi / seksi wajib diisi."), stokAwal: z.number().int().min(0, "Stok awal tidak boleh negatif."), minStok: z.number().int().min(0, "Minimum stok tidak boleh negatif."), proyek: z.string().optional(), catatan: z.string().optional(), sumberAwal: z.string().optional() });
export async function GET() {
  await ensureHydrated(); return Response.json({ success: true, data: getGudangItems() }); }
export async function POST(request: Request) {
  await ensureHydrated();
  const parsed = gudangItemSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) return Response.json({ success: false, error: { code: "INVALID_GUDANG_ITEM", message: parsed.error.issues[0]?.message ?? "Data barang tidak valid." } }, { status: 400 });
  const result = createGudangItem(parsed.data);
  await flushWrites();
  if (!result.ok) return Response.json({ success: false, error: { code: "DUPLICATE_SKU", message: "SKU sudah terdaftar di gudang." } }, { status: 409 });
  return Response.json({ success: true, data: result.item }, { status: 201 });
}
