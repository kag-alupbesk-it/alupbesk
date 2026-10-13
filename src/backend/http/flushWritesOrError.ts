import { flushWrites } from "@/services/supabase";

/**
 * Mengirim antrean tulis ke Supabase untuk Route Handler mutasi. Bila gagal,
 * mengembalikan Response JSON yang konsisten agar klien tidak menerima 500
 * mentah (non-JSON) dari error yang tak tertangani.
 *
 * Pemakaian:
 *   const flushError = await flushWritesOrError();
 *   if (flushError) return flushError;
 */
export async function flushWritesOrError(): Promise<Response | null> {
  try {
    await flushWrites();
    return null;
  } catch (error) {
    console.error("[gudang-inventory] gagal menyimpan ke database:", error);
    return Response.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Data gagal disimpan ke database. Silakan coba lagi.",
        },
      },
      { status: 500 },
    );
  }
}
