import { db } from "@/services/supabase";

// Kode produksi milik perusahaan (bukan kontraktor), format "PRD-YYMM-####".
// Nomor urut dihitung dari kode bulan berjalan yang sudah ada di database.
export async function generateProductionCode(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `PRD-${yy}${mm}-`;

  if (!db) {
    throw new Error("DATABASE_UNAVAILABLE");
  }

  const { data, error } = await db
    .from("pm_orders")
    .select("contractor_code")
    .like("contractor_code", `${prefix}%`);

  if (error) {
    throw new Error(error.message);
  }

  let max = 0;
  for (const row of data ?? []) {
    const match = /(\d+)\s*$/.exec(row.contractor_code ?? "");
    if (match) max = Math.max(max, Number(match[1]));
  }

  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}
