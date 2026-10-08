import { submitFieldPod } from "@/backend/modules/field/index";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { z } from "zod";

type Context = { params: Promise<{ id: string }> };
const schema = z.object({
  signatureImagePath: z.string().url().max(2048),
  projectImagePath: z.string().url().max(2048),
});

export async function POST(request: Request, { params }: Context) {
  const parsed = schema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "INVALID_INPUT", message: "Unggah kedua foto bukti terlebih dahulu." } },
      { status: 400 },
    );
  }

  const { id } = await params;
  try {
    const delivery = await submitFieldPod(id, parsed.data);
    return Response.json({ success: true, data: delivery });
  } catch (error) {
    const unavailable = error instanceof Error && error.message === "DATABASE_UNAVAILABLE";
    const notFound = error instanceof Error && error.message === "DELIVERY_NOT_FOUND";
    return Response.json(
      {
        success: false,
        error: {
          code: unavailable ? "DATABASE_UNAVAILABLE" : notFound ? "DELIVERY_NOT_FOUND" : "DATABASE_ERROR",
          message: unavailable
            ? "Database belum dikonfigurasi."
            : notFound
              ? "Surat jalan tidak ditemukan."
              : "Bukti terima gagal disimpan.",
        },
      },
      { status: unavailable ? 503 : notFound ? 404 : 500 },
    );
  }
}
