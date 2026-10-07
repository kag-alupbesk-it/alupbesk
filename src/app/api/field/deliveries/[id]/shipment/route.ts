import { submitFieldShipment } from "@/backend/modules/field";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { z } from "zod";

type Context = { params: Promise<{ id: string }> };
const schema = z.object({
  armada: z.object({
    namaSopir: z.string().trim().min(1).max(120),
    platNomor: z.string().trim().min(1).max(24),
    jenisArmada: z.string().trim().min(1).max(80),
  }),
  kirim: z.array(z.object({
    itemId: z.string().min(1),
    kuantitas: z.number().int().min(0),
  })).min(1),
});

export async function POST(request: Request, { params }: Context) {
  const parsed = schema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "INVALID_INPUT", message: "Data surat jalan belum lengkap." } },
      { status: 400 },
    );
  }

  const { id } = await params;
  try {
    const delivery = await submitFieldShipment(id, parsed.data);
    return Response.json({ success: true, data: delivery });
  } catch (error) {
    const code = error instanceof Error ? error.message : "DATABASE_ERROR";
    const notFound = code === "DELIVERY_NOT_FOUND";
    const invalid = code === "INVALID_INPUT";
    const conflict = code === "STATUS_INVALID" || code === "QUANTITY_EXCEEDED";
    const unavailable = code === "DATABASE_UNAVAILABLE";
    return Response.json(
      {
        success: false,
        error: {
          code: unavailable ? code : notFound ? code : invalid ? code : conflict ? code : "DATABASE_ERROR",
          message: notFound
            ? "Surat jalan tidak ditemukan."
            : invalid
              ? "Pilih setidaknya satu item pengiriman yang valid."
              : conflict
                ? "Jumlah atau status berubah. Muat ulang sebelum mencoba lagi."
                : unavailable
                  ? "Database belum dikonfigurasi."
                  : "Surat jalan gagal disimpan.",
        },
      },
      { status: unavailable ? 503 : notFound ? 404 : conflict ? 409 : invalid ? 400 : 500 },
    );
  }
}
