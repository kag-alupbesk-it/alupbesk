import { bannerSchema } from "../route";
import { deleteMarketingBanner, updateMarketingBanner } from "@/backend/modules/marketing";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { ensureHydrated } from "@/services/supabaseHydrate";
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated(); const parsed = bannerSchema.safeParse(await readJsonBody(request)); if (!parsed.success) return Response.json({ success: false, error: { code: "INVALID_BANNER", message: parsed.error.issues[0]?.message ?? "Data banner tidak valid." } }, { status: 400 }); const { id } = await params; const banner = updateMarketingBanner(id, parsed.data); await flushWrites(); if (!banner) return Response.json({ success: false, error: { code: "BANNER_NOT_FOUND", message: "Banner tidak ditemukan." } }, { status: 404 }); return Response.json({ success: true, data: banner }); }
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated(); const { id } = await params; if (!deleteMarketingBanner(id)) { await flushWrites(); return Response.json({ success: false, error: { code: "BANNER_NOT_FOUND", message: "Banner tidak ditemukan." } }, { status: 404 }); } await flushWrites(); return Response.json({ success: true, data: null }); }
