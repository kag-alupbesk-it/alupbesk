import { db } from "@/services/supabase";

// Kode produksi milik perusahaan (bukan kontraktor), format "[INISIAL][NOMOR][KABUPATEN]" atau "PRD-YYMM-####".
export async function generateProductionCode(input?: { companyName?: string, kabupaten?: string }): Promise<string> {
  const now = new Date();
  
  if (!input?.kabupaten) {
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

  // Pola baru: [INISIAL][NOMOR][KABUPATEN]
  const kab = input.kabupaten.replace(/[^a-zA-Z0-9]/g, "");
  const company = input.companyName?.trim() || "PRD";
  const initials = company.split(" ").filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 3).join("");
  const prefix = `${initials}`;
  
  if (!db) {
    throw new Error("DATABASE_UNAVAILABLE");
  }

  const { data, error } = await db
    .from("pm_orders")
    .select("contractor_code")
    .like("contractor_code", `${prefix}%${kab}`);

  if (error) {
    throw new Error(error.message);
  }

  let max = 0;
  const regex = new RegExp(`^${prefix}(\\d+)${kab}$`, 'i');
  for (const row of data ?? []) {
    const match = regex.exec(row.contractor_code ?? "");
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `${prefix}${max + 1}${kab}`;
}

