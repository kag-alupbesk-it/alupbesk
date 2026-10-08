import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client Supabase sisi server (service role) untuk persistensi data.
// Jika kredensial belum diisi, seluruh fungsi menjadi no-op sehingga
// aplikasi tetap berjalan dengan penyimpanan in-memory.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const db: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const supabaseEnabled = db !== null;

// ---------------------------------------------------------------------
// Antrean tulis: mutasi store memanggil enqueue* (sinkron), lalu seluruh
// antrean dikirim ke Supabase pada akhir request lewat flushWrites().
// Ini membuat API fungsi store tetap sinkron seperti sebelumnya.
// ---------------------------------------------------------------------
export type DbWrite =
  | { kind: "upsert"; table: string; row: Record<string, unknown>; onConflict: string }
  | { kind: "delete"; table: string; column: string; value: string };

const writes: DbWrite[] = [];
let flushTask: Promise<void> | null = null;

export function enqueueUpsert(
  table: string,
  row: Record<string, unknown>,
  onConflict = "id",
): void {
  writes.push({ kind: "upsert", table, row, onConflict });
}

export function enqueueDelete(
  table: string,
  column: string,
  value: string,
): void {
  writes.push({ kind: "delete", table, column, value });
}

// Request mutasi harus gagal jika antrean Supabase gagal dikirim agar UI tidak
// mengira perubahan sudah tersimpan secara permanen.
export function flushWrites(): Promise<void> {
  if (flushTask) return flushTask;

  flushTask = flushPendingWrites().finally(() => {
    flushTask = null;
  });
  return flushTask;
}

async function flushPendingWrites(): Promise<void> {
  if (!db) {
    writes.length = 0;
    return;
  }
  while (writes.length) {
    const write = writes[0];
    if (!write) break;
    try {
      if (write.kind === "upsert") {
        const { error } = await db
          .from(write.table)
          .upsert(write.row, { onConflict: write.onConflict });
        if (error) throw error;
      } else {
        const { error } = await db
          .from(write.table)
          .delete()
          .eq(write.column, write.value);
        if (error) throw error;
      }
      writes.shift();
    } catch (error) {
      console.error(`[supabase] tulis ${write.table} gagal:`, error);
      // Keep the failed operation at the head of the queue. The next request
      // retries it before later writes so related records keep their order.
      throw error;
    }
  }
}
