// Penanda bahwa cache hydrasi in-memory sudah usang karena ada penulisan baru.
// Dipisah ke modul tanpa dependensi agar supabase.ts dapat menandai tanpa
// membuat impor melingkar dengan supabaseHydrate.ts.
let stale = false;

export function markHydrationStale(): void {
  stale = true;
}

export function consumeHydrationStale(): boolean {
  const value = stale;
  stale = false;
  return value;
}
