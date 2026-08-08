import { setPembayaranLunas } from "@/backend/modules/keuangan";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = setPembayaranLunas(id);
  if (result.ok) return Response.json({ success: true, data: result.item });

  return Response.json(
    { success: false, error: { code: result.code, message: "Tagihan tidak ditemukan." } },
    { status: 404 },
  );
}
