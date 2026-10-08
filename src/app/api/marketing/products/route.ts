import { z } from "zod";
import { createMarketingProduct, getMarketingProducts } from "@/backend/modules/marketing/index";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { ensureHydrated } from "@/services/supabaseHydrate";
export const marketingProductSchema = z.object({ category: z.string().trim().min(1, "Kategori wajib diisi."), title: z.string().trim().min(1, "Nama produk wajib diisi."), desc: z.string().trim().min(1, "Deskripsi wajib diisi."), price: z.number().int().min(0, "Harga tidak boleh negatif."), stock: z.number().int().min(0, "Stok tidak boleh negatif."), img: z.string().trim().min(1, "URL gambar wajib diisi."), sku: z.string().trim().min(1, "SKU wajib diisi.") });
export async function GET() {
  await ensureHydrated(); return Response.json({ success: true, data: getMarketingProducts() }); }
export async function POST(request: Request) {
  await ensureHydrated(); const parsed = marketingProductSchema.safeParse(await readJsonBody(request)); if (!parsed.success) return Response.json({ success: false, error: { code: "INVALID_PRODUCT", message: parsed.error.issues[0]?.message ?? "Data produk tidak valid." } }, { status: 400 }); const product = createMarketingProduct(parsed.data); await flushWrites(); return Response.json({ success: true, data: product }, { status: 201 }); }
