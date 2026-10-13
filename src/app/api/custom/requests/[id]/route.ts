import { z } from "zod";
import { setCustomRequestStatus } from "@/backend/modules/custom/index";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { ensureHydrated } from "@/services/supabaseHydrate";

const statusSchema = z.object({
  status: z.enum(["submitted", "reviewed", "quoted", "accepted", "rejected"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const parsed = statusSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_CUSTOM_STATUS", message: "Status request tidak valid." } }, { status: 400 });
  }
  const { id } = await params;
  const updated = setCustomRequestStatus(id, parsed.data.status);
  await flushWrites();
  if (!updated) {
    return Response.json({ success: false, error: { code: "CUSTOM_REQUEST_NOT_FOUND", message: "Request tidak ditemukan." } }, { status: 404 });
  }
  return Response.json({ success: true, data: updated });
}