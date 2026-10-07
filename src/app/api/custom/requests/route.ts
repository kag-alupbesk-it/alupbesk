import { z } from "zod";
import { createCustomRequest, getCustomRequests } from "@/backend/modules/custom";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { ensureHydrated } from "@/services/supabaseHydrate";
const requestSchema = z.object({ nama: z.string().trim().min(1, "Nama wajib diisi."), perusahaan: z.string().trim().optional(), email: z.string().trim().email("Email tidak valid.").optional().or(z.literal("")), telp: z.string().trim().min(1, "Nomor WhatsApp wajib diisi."), layanan: z.string().trim().min(1, "Layanan wajib dipilih."), deskripsi: z.string().trim().min(1, "Deskripsi kebutuhan wajib diisi."), dimensi: z.string().trim().optional(), kuantitas: z.string().trim().optional(), deadline: z.string().trim().optional() });
export async function GET() {
  await ensureHydrated(); return Response.json({ success: true, data: getCustomRequests() }); }
export async function POST(request: Request) {
  await ensureHydrated(); const parsed = requestSchema.safeParse(await readJsonBody(request)); if (!parsed.success) return Response.json({ success: false, error: { code: "INVALID_CUSTOM_REQUEST", message: parsed.error.issues[0]?.message ?? "Data request tidak valid." } }, { status: 400 }); const created = createCustomRequest(parsed.data); await flushWrites(); return Response.json({ success: true, data: created }, { status: 201 }); }
