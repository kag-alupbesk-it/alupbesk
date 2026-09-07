import { z } from "zod";
import { createCustomService, getCustomServices } from "@/backend/modules/content";
import { flushWrites } from "@/services/supabase";

export const serviceSchema = z.object({
  icon: z.string().trim().min(1, "Ikon wajib diisi."),
  title: z.string().trim().min(1, "Judul layanan wajib diisi."),
  description: z.string().trim().min(1, "Deskripsi layanan wajib diisi."),
  sortOrder: z.number().int().min(0),
  active: z.boolean(),
});

export async function GET() {
  return Response.json({ success: true, data: getCustomServices() });
}

export async function POST(request: Request) {
  const parsed = serviceSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_SERVICE", message: parsed.error.issues[0]?.message ?? "Data layanan tidak valid." } }, { status: 400 });
  }
  const service = createCustomService(parsed.data);
  await flushWrites();
  return Response.json({ success: true, data: service }, { status: 201 });
}
