import { getFieldDelivery } from "@/backend/modules/field";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  try {
    const delivery = await getFieldDelivery(id);
    if (!delivery) {
      return Response.json(
        { success: false, error: { code: "DELIVERY_NOT_FOUND", message: "Surat jalan tidak ditemukan." } },
        { status: 404 },
      );
    }
    return Response.json(
      { success: true, data: delivery },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const unavailable = error instanceof Error && error.message === "DATABASE_UNAVAILABLE";
    return Response.json(
      { success: false, error: { code: unavailable ? "DATABASE_UNAVAILABLE" : "DATABASE_ERROR", message: "Surat jalan gagal dimuat." } },
      { status: unavailable ? 503 : 500 },
    );
  }
}
