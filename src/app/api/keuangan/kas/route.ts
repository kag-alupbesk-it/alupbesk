import { z } from "zod";
import { createKasEntry, getKasData } from "@/backend/modules/keuangan";
import { flushWrites } from "@/services/supabase";

const kasSchema = z.object({
  tipe: z.enum(["masuk", "keluar"], { message: "Tipe transaksi tidak valid." }),
  deskripsi: z.string().trim().min(1, "Deskripsi wajib diisi."),
  jumlah: z.number().positive("Jumlah harus lebih dari nol."),
  kategori: z.enum(["eceran", "proyek", "operasional"], { message: "Kategori tidak valid." }).default("operasional"),
  tanggal: z.string().optional(),
});

export async function GET() {
  const data = getKasData();
  await flushWrites();
  return Response.json({ success: true, data });
}

export async function POST(request: Request) {
  const parsed = kasSchema.safeParse(await request.json());
  if (!parsed.success)
    return Response.json(
      { success: false, error: { code: "INVALID_KAS_ENTRY", message: parsed.error.issues[0]?.message ?? "Data transaksi tidak valid." } },
      { status: 400 },
    );

  const result = createKasEntry(parsed.data);
  await flushWrites();
  if (result.ok) return Response.json({ success: true, data: result.entry }, { status: 201 });

  if (result.code === "INVALID_AMOUNT")
    return Response.json({ success: false, error: { code: result.code, message: "Jumlah transaksi tidak valid." } }, { status: 400 });
  return Response.json(
    { success: false, error: { code: result.code, message: "Deskripsi transaksi wajib diisi." } },
    { status: 400 },
  );
}
