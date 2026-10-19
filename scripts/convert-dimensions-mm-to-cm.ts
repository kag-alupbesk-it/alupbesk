/**
 * Migrasi sekali jalan: konversi seluruh kolom dimensi panjang/lebar dari
 * milimeter (mm) menjadi centimeter (cm) dengan membagi 10.
 *
 * Kolom yang dikonversi:
 *   - gudang_inventory_items.length_per_unit, width_per_unit
 *   - gudang_material_lots.length, width
 *   - pm_cut_list_items.length, width
 *   - pm_cut_allocations.length_used, leftover_length
 *
 * PERINGATAN: skrip ini TIDAK idempoten. Jalankan hanya sekali.
 *   npx tsx scripts/convert-dimensions-mm-to-cm.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const raw of readFileSync(path, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[line.slice(0, eq).trim()] = value;
  }
  return out;
}

const env = loadEnv(".env");
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env");
  process.exit(1);
}
const db = createClient(url, serviceKey, { auth: { persistSession: false } });

interface Target {
  table: string;
  key: string;
  columns: string[];
}

const targets: Target[] = [
  {
    table: "gudang_inventory_items",
    key: "id",
    columns: ["length_per_unit", "width_per_unit"],
  },
  { table: "gudang_material_lots", key: "id", columns: ["length", "width"] },
  { table: "pm_cut_list_items", key: "id", columns: ["length", "width"] },
  {
    table: "pm_cut_allocations",
    key: "id",
    columns: ["length_used", "leftover_length"],
  },
];

const toCm = (value: number): number => Math.round((value / 10) * 100) / 100;

async function convertTable({ table, key, columns }: Target): Promise<void> {
  const selection = [key, ...columns].join(", ");
  const { data, error } = await db.from(table).select(selection);
  if (error) {
    console.error(`  ${table}: GAGAL baca — ${error.message}`);
    return;
  }
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  let updated = 0;
  let skipped = 0;
  for (const row of rows) {
    const patch: Record<string, number> = {};
    for (const column of columns) {
      const value = row[column];
      if (typeof value === "number" && Number.isFinite(value)) {
        patch[column] = toCm(value);
      }
    }
    if (Object.keys(patch).length === 0) {
      skipped += 1;
      continue;
    }
    const { error: updateError } = await db
      .from(table)
      .update(patch)
      .eq(key, row[key] as string);
    if (updateError) {
      console.error(`  ${table} [${String(row[key])}]: GAGAL update — ${updateError.message}`);
      continue;
    }
    updated += 1;
  }
  console.log(`  ${table}: ${updated} baris dikonversi, ${skipped} dilewati (tanpa nilai)`);
}

async function main(): Promise<void> {
  console.log("MIGRASI DIMENSI mm -> cm (÷10)");
  for (const target of targets) {
    await convertTable(target);
  }
  console.log("\nSelesai. Jangan jalankan skrip ini dua kali.");
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
