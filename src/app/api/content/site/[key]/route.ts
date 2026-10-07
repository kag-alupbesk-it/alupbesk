import { z } from "zod";
import { getSiteContentByKey, upsertSiteContent } from "@/backend/modules/content";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { ensureHydrated } from "@/services/supabaseHydrate";

const siteContentSchema = z.object({
  key: z.string().trim().min(1, "Key konten wajib diisi."),
  value: z.record(z.string(), z.unknown()),
});

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  await ensureHydrated();
  const { key } = await params;
  const content = getSiteContentByKey(key);
  if (!content) {
    return Response.json({ success: false, error: { code: "SITE_CONTENT_NOT_FOUND", message: "Konten tidak ditemukan." } }, { status: 404 });
  }
  return Response.json({ success: true, data: content });
}

export async function PUT(request: Request, { params }: { params: Promise<{ key: string }> }) {
  await ensureHydrated();
  const body = await readJsonBody(request);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json(
      { success: false, error: { code: "INVALID_SITE_CONTENT", message: "Isi request bukan object yang valid." } },
      { status: 400 },
    );
  }
  const { key } = await params;
  const parsed = siteContentSchema.safeParse({ ...(body as Record<string, unknown>), key });
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_SITE_CONTENT", message: parsed.error.issues[0]?.message ?? "Data konten tidak valid." } }, { status: 400 });
  }
  const content = upsertSiteContent(parsed.data);
  await flushWrites();
  return Response.json({ success: true, data: content });
}
