import { z } from "zod";
import { createProjectOrder } from "@/backend/modules/gudang";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { ensureHydrated } from "@/services/supabaseHydrate";

const createSchema = z.object({
  requestId: z.string().optional(),
  namaProyek: z.string().trim().min(1, "Nama proyek wajib diisi."),
  pelanggan: z.string().trim().optional(),
  telepon: z.string().trim().optional(),
  catatan: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        gudangItemId: z.string().min(1),
        quantity: z.number().int().positive("Jumlah harus lebih dari nol."),
      }),
    )
    .min(1, "Pilih minimal satu barang proyek."),
});

export async function POST(request: Request) {
  await ensureHydrated();
  const parsed = createSchema.safeParse(await readJsonBody(request));
  if (!parsed.success)
    return Response.json(
      { success: false, error: { code: "INVALID_PROJECT_ORDER", message: parsed.error.issues[0]?.message ?? "Data pesanan proyek tidak valid." } },
      { status: 400 },
    );

  const result = createProjectOrder(parsed.data);
  await flushWrites();
  if (result.ok) return Response.json({ success: true, data: result.order }, { status: 201 });

  if (result.code === "REQUEST_NOT_FOUND")
    return Response.json({ success: false, error: { code: result.code, message: "Permintaan custom tidak ditemukan." } }, { status: 404 });
  if (result.code === "REQUEST_ALREADY_USED")
    return Response.json({ success: false, error: { code: result.code, message: "Permintaan custom ini sudah dikonversi menjadi pesanan proyek." } }, { status: 409 });
  if (result.code === "GUDANG_ITEM_NOT_FOUND")
    return Response.json({ success: false, error: { code: result.code, message: "Ada barang proyek yang tidak terdaftar di gudang." } }, { status: 404 });
  if (result.code === "PELANGGAN_REQUIRED")
    return Response.json({ success: false, error: { code: result.code, message: "Nama pelanggan wajib diisi." } }, { status: 400 });
  return Response.json({ success: false, error: { code: result.code, message: "Pilih minimal satu barang proyek." } }, { status: 400 });
}
