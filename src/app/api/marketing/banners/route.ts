import { z } from "zod";
import { createMarketingBanner, getMarketingBanners } from "@/backend/modules/marketing";
import { flushWrites } from "@/services/supabase";
export const bannerSchema = z.object({ title: z.string().trim().min(1, "Judul banner wajib diisi."), subtitle: z.string().trim().optional(), imageUrl: z.string().trim().min(1, "URL gambar wajib diisi."), linkUrl: z.string().trim().optional(), active: z.boolean(), order: z.number().int().min(0), startDate: z.string().trim().optional(), endDate: z.string().trim().optional() });
export async function GET() { return Response.json({ success: true, data: getMarketingBanners() }); }
export async function POST(request: Request) { const parsed = bannerSchema.safeParse(await request.json()); if (!parsed.success) return Response.json({ success: false, error: { code: "INVALID_BANNER", message: parsed.error.issues[0]?.message ?? "Data banner tidak valid." } }, { status: 400 }); const banner = createMarketingBanner(parsed.data); await flushWrites(); return Response.json({ success: true, data: banner }, { status: 201 }); }
