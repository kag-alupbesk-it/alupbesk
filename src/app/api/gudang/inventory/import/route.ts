import {
  importInventoryWorkbook,
  parseInventoryWorkbook,
} from "@/backend/modules/gudangInventory/excel";
import { getAuthenticatedProfile } from "@/backend/auth/getAuthenticatedProfile";
import { flushWritesOrError } from "@/backend/http/flushWritesOrError";
import { ensureHydrated } from "@/services/supabaseHydrate";

export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  await ensureHydrated();
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return Response.json(
        {
          success: false,
          error: { code: "FILE_REQUIRED", message: "Berkas Excel wajib diunggah." },
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return Response.json(
        {
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: "Ukuran berkas melebihi batas 5 MB.",
          },
        },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseInventoryWorkbook(buffer);

    const profile = await getAuthenticatedProfile();
    const summary = importInventoryWorkbook(parsed, profile?.name ?? "Admin Gudang");

    const flushError = await flushWritesOrError();
    if (flushError) return flushError;

    const total = parsed.items.length + parsed.inTransactions.length + parsed.outTransactions.length;
    if (total === 0) {
      return Response.json(
        {
          success: false,
          error: {
            code: "NO_DATA",
            message: "Tidak ada data yang terbaca. Periksa kembali format berkas.",
          },
        },
        { status: 400 },
      );
    }

    return Response.json({ success: true, data: summary });
  } catch (error) {
    console.error("[api/gudang/inventory/import] error:", error);
    return Response.json(
      {
        success: false,
        error: {
          code: "IMPORT_FAILED",
          message: "Gagal mengimpor berkas. Pastikan berkas .xlsx yang valid.",
        },
      },
      { status: 500 },
    );
  }
}
