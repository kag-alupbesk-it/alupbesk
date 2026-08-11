// Menjalankan sekali saat server Next.js dimulai, sebelum siap menerima
// request: muat seluruh data dari Supabase ke memori (dan seed jika kosong),
// lalu kirim antrean seed ke Supabase.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { ensureHydrated } = await import("@/services/supabaseHydrate");
  const { flushWrites } = await import("@/services/supabase");
  await ensureHydrated();
  await flushWrites();
}
