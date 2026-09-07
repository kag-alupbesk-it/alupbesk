import { serviceSchema } from "../route";
import { deleteCustomService, updateCustomService } from "@/backend/modules/content";
import { flushWrites } from "@/services/supabase";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = serviceSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_SERVICE", message: parsed.error.issues[0]?.message ?? "Data layanan tidak valid." } }, { status: 400 });
  }
  const { id } = await params;
  const service = updateCustomService(id, parsed.data);
  await flushWrites();
  if (!service) {
    return Response.json({ success: false, error: { code: "SERVICE_NOT_FOUND", message: "Layanan tidak ditemukan." } }, { status: 404 });
  }
  return Response.json({ success: true, data: service });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!deleteCustomService(id)) {
    await flushWrites();
    return Response.json({ success: false, error: { code: "SERVICE_NOT_FOUND", message: "Layanan tidak ditemukan." } }, { status: 404 });
  }
  await flushWrites();
  return Response.json({ success: true, data: null });
}
