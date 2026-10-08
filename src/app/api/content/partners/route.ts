import { z } from "zod";
import { createPartner, getPartners } from "@/backend/modules/content/index";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { ensureHydrated } from "@/services/supabaseHydrate";

export const partnerSchema = z.object({
  name: z.string().trim().min(1, "Nama mitra wajib diisi."),
  initials: z.string().trim().min(1, "Inisial mitra wajib diisi."),
  logoUrl: z.string().trim().optional(),
  sortOrder: z.number().int().min(0),
  active: z.boolean(),
});

export async function GET() {
  await ensureHydrated();
  return Response.json({ success: true, data: getPartners() });
}

export async function POST(request: Request) {
  await ensureHydrated();
  const parsed = partnerSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_PARTNER", message: parsed.error.issues[0]?.message ?? "Data mitra tidak valid." } }, { status: 400 });
  }
  const partner = createPartner(parsed.data);
  await flushWrites();
  return Response.json({ success: true, data: partner }, { status: 201 });
}
