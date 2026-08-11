import { z } from "zod";
import { deleteKasEntry, updateKasEntry } from "@/backend/modules/keuangan";
import { flushWrites } from "@/services/supabase";

const kasSchema = z.object({
  tipe: z.enum(["masuk", "keluar"], { message: "Tipe transaksi tidak valid." }),
  deskripsi: z.string().trim().min(1, "Deskripsi wajib diisi."),
  jumlah: z.number().positive("Jumlah harus lebih dari nol."),
  kategori: z.enum(["eceran", "proyek", "operasional"], { message: "Kategori tidak valid." }).default("operasional"),
  tanggal: z.string().optional(),
});

function notFound(id: string) {
  return Response.json(
    { success: false, error: { code: "KAS_ENTRY_NOT_FOUND", message: `Transaksi kas ${id} tidak ditemukan.` } },
    { status: 404 },
  );
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = kasSchema.safeParse(await request.json());
  if (!parsed.success)
    return Response.json(
      { success: false, error: { code: "INVALID_KAS_ENTRY", message: parsed.error.issues[0]?.message ?? "Data transaksi tidak valid." } },
      { status: 400 },
    );

  const result = updateKasEntry(id, parsed.data);
  await flushWrites();
  if (!result.ok) {
    if (result.code === "KAS_ENTRY_NOT_FOUND") return notFound(id);
    return Response.json({ success: false, error: { code: result.code, message: "Data transaksi tidak valid." } }, { status: 400 });
  }
  return Response.json({ success: true, data: result.entry });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = deleteKasEntry(id);
  await flushWrites();
  if (!result.ok) return notFound(id);
  return Response.json({ success: true, data: result.entry });
}
