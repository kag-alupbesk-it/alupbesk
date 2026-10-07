import { getFieldDeliveries } from "@/backend/modules/field";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const deliveries = await getFieldDeliveries();
    return Response.json(
      { success: true, data: deliveries },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const unavailable = error instanceof Error && error.message === "DATABASE_UNAVAILABLE";
    console.error("[api/field/deliveries] gagal memuat data:", error);
    return Response.json(
      {
        success: false,
        error: {
          code: unavailable ? "DATABASE_UNAVAILABLE" : "DATABASE_ERROR",
          message: unavailable
            ? "Database belum dikonfigurasi."
            : "Data pengiriman gagal dimuat.",
        },
      },
      { status: unavailable ? 503 : 500 },
    );
  }
}
