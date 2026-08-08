import { z } from "zod";
import { catatPengeluaran, getKasData } from "@/backend/modules/keuangan";

const pengeluaranSchema = z.object({
  deskripsi: z.string().trim().min(1, "Deskripsi wajib diisi."),
  jumlah: z.number().positive("Jumlah harus lebih dari nol."),
});

export async function GET() {
  return Response.json({ success: true, data: getKasData() });
}

export async function POST(request: Request) {
  const parsed = pengeluaranSchema.safeParse(await request.json());
  if (!parsed.success)
    return Response.json(
      { success: false, error: { code: "INVALID_EXPENSE", message: parsed.error.issues[0]?.message ?? "Data pengeluaran tidak valid." } },
      { status: 400 },
    );

  const result = catatPengeluaran(parsed.data);
  if (result.ok) return Response.json({ success: true, data: result.entry }, { status: 201 });

  return Response.json(
    { success: false, error: { code: result.code, message: "Jumlah pengeluaran tidak valid." } },
    { status: 400 },
  );
}
