import { marketingProductSchema } from "../route";
import { deleteMarketingProduct, updateMarketingProduct } from "@/backend/modules/marketing";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { ensureHydrated } from "@/services/supabaseHydrate";
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated(); const parsed = marketingProductSchema.safeParse(await readJsonBody(request)); if (!parsed.success) return Response.json({ success: false, error: { code: "INVALID_PRODUCT", message: parsed.error.issues[0]?.message ?? "Data produk tidak valid." } }, { status: 400 }); const { id } = await params; const product = updateMarketingProduct(Number(id), parsed.data); await flushWrites(); if (!product) return Response.json({ success: false, error: { code: "PRODUCT_NOT_FOUND", message: "Produk tidak ditemukan." } }, { status: 404 }); return Response.json({ success: true, data: product }); }
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated(); const { id } = await params; if (!deleteMarketingProduct(Number(id))) { await flushWrites(); return Response.json({ success: false, error: { code: "PRODUCT_NOT_FOUND", message: "Produk tidak ditemukan." } }, { status: 404 }); } await flushWrites(); return Response.json({ success: true, data: null }); }
