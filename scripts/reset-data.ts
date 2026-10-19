/**
 * Reset seluruh data aplikasi kembali ke kondisi awal (fresh install):
 *   1. Hapus semua baris data di tabel-tabel public (urutan aman FK).
 *   2. Insert ulang seed baseline dari database/schema.sql
 *      (gudang_categories, faq_items, custom_services, site_content).
 *   3. Kosongkan file di bucket storage yang dipakai aplikasi.
 *
 * Jalankan: npx tsx scripts/reset-data.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------
// Env loader sederhana (tanpa dependensi dotenv)
// ---------------------------------------------------------------------
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

// ---------------------------------------------------------------------
// 1. Daftar tabel (anak dulu, lalu induk — aman terhadap foreign key)
//    key = kolom PK (semua tabel punya PK NOT NULL)
// ---------------------------------------------------------------------
const tables: { table: string; key: string }[] = [
  { table: "audit_logs", key: "id" },
  { table: "push_subscriptions", key: "id" },
  { table: "role_requests", key: "id" },
  { table: "order_status_events", key: "id" },
  { table: "order_lines", key: "id" },
  { table: "orders", key: "id" },
  { table: "custom_request_items", key: "id" },
  { table: "custom_requests", key: "id" },
  { table: "gudang_movements", key: "id" },
  { table: "gudang_production_request_items", key: "id" },
  { table: "gudang_production_requests", key: "id" },
  { table: "gudang_in_transactions", key: "id" },
  { table: "gudang_out_transactions", key: "id" },
  { table: "pm_cut_allocations", key: "id" },
  { table: "pm_cut_list_items", key: "id" },
  { table: "pm_cut_lists", key: "id" },
  { table: "gudang_material_lots", key: "id" },
  { table: "gudang_inventory_items", key: "id" },
  { table: "gudang_items", key: "id" },
  { table: "field_delivery_items", key: "id" },
  { table: "field_deliveries", key: "id" },
  { table: "pm_order_items", key: "id" },
  { table: "pm_orders", key: "id" },
  { table: "gudang_categories", key: "id" },
  { table: "kas_entries", key: "id" },
  { table: "finance_dashboard", key: "id" },
  { table: "contact_messages", key: "id" },
  { table: "marketing_banners", key: "id" },
  { table: "portfolio_items", key: "id" },
  { table: "case_studies", key: "id" },
  { table: "partners", key: "id" },
  { table: "faq_items", key: "id" },
  { table: "custom_services", key: "id" },
  { table: "site_content", key: "key" },
  { table: "product_variants", key: "id" },
  { table: "products", key: "id" },
  { table: "users", key: "id" },
];

async function wipeTables(): Promise<void> {
  console.log("\n=== 1. MENGHAPUS DATA TABEL ===");
  for (const { table, key } of tables) {
    const count = await db
      .from(table)
      .select("*", { count: "exact", head: true });
    if (count.error) {
      console.error(`  ${table}: gagal hitung — ${count.error.message}`);
      continue;
    }
    const total = count.count ?? 0;
    if (total === 0) {
      console.log(`  ${table}: 0 baris (lewati)`);
      continue;
    }
    const { error } = await db.from(table).delete().not(key, "is", null);
    if (error) {
      console.error(`  ${table}: GAGAL hapus ${total} baris — ${error.message}`);
    } else {
      console.log(`  ${table}: ${total} baris dihapus`);
    }
  }
}

// ---------------------------------------------------------------------
// 2. Seed baseline — identik dengan bagian SEED di database/schema.sql
// ---------------------------------------------------------------------
async function reseed(): Promise<void> {
  console.log("\n=== 2. INSERT ULANG SEED BASELINE ===");

  // Kategori gudang sengaja tidak di-seed — biar tim gudang membuatnya sendiri.
  const faqs = [
    {
      id: "a4000000-0000-4000-8000-000000000001",
      question: "Apakah Alupbesk melayani pemotongan custom?",
      answer:
        "Ya, kami menyediakan layanan pemotongan presisi sesuai gambar teknis Anda menggunakan mesin CNC cutting untuk memastikan akurasi dimensi.",
      sort_order: 1,
      active: true,
    },
    {
      id: "a4000000-0000-4000-8000-000000000002",
      question: "Berapa lama estimasi pengiriman untuk luar kota?",
      answer:
        "Estimasi pengiriman bergantung pada lokasi proyek dan pilihan ekspedisi. Tim kami akan mengonfirmasi jadwal setelah pesanan diproses.",
      sort_order: 2,
      active: true,
    },
    {
      id: "a4000000-0000-4000-8000-000000000003",
      question: "Apakah ada minimum order untuk pembelian B2B?",
      answer:
        "Kami melayani pembelian retail dan partai besar. Ketentuan harga distributor dapat dikonfirmasi kepada tim penjualan.",
      sort_order: 3,
      active: true,
    },
    {
      id: "a4000000-0000-4000-8000-000000000004",
      question: "Bagaimana cara mendapatkan sertifikat material?",
      answer:
        "Sertifikat material dapat diminta saat pemesanan dan akan dikonfirmasi ketersediaannya oleh tim kami.",
      sort_order: 4,
      active: true,
    },
  ];
  const services = [
    {
      id: "a5000000-0000-4000-8000-000000000001",
      icon: "straighten",
      title: "Potong Custom",
      description: "Pemotongan presisi sesuai dimensi yang Anda tentukan.",
      sort_order: 1,
      active: true,
    },
    {
      id: "a5000000-0000-4000-8000-000000000002",
      icon: "design_services",
      title: "Desain Rangka",
      description: "Konsultasi dan desain rangka aluminium.",
      sort_order: 2,
      active: true,
    },
    {
      id: "a5000000-0000-4000-8000-000000000003",
      icon: "format_paint",
      title: "Finishing Custom",
      description: "Anodizing, powder coating, atau mill finish.",
      sort_order: 3,
      active: true,
    },
    {
      id: "a5000000-0000-4000-8000-000000000004",
      icon: "precision_manufacturing",
      title: "Fabrikasi Lengkap",
      description: "Dari desain hingga produk jadi siap pasang.",
      sort_order: 4,
      active: true,
    },
  ];
  const siteContent = [
    {
      key: "custom_steps",
      value: { steps: ["Isi Form", "Diskusi via WA", "Penawaran Harga", "Produksi"] },
    },
    {
      key: "custom_capacities",
      value: {
        capacities: [
          { label: "Min. Order", value: "1 unit" },
          { label: "Lead Time", value: "3–14 hari kerja" },
          { label: "Toleransi", value: "±0.1 mm" },
          { label: "Finishing", value: "Anodizing / Powder Coat" },
        ],
      },
    },
    {
      key: "hero",
      value: {
        title: "Solusi Produk Aluminium & Komponen Industrial Terpercaya",
        subtitle:
          "Menyediakan material aluminium berkualitas tinggi dan komponen industri presisi untuk mendukung akselerasi produksi bisnis Anda di seluruh Indonesia.",
        imageUrl: "",
        primaryCta: "Lihat Katalog",
        primaryLink: "#katalog",
      },
    },
    {
      key: "profile",
      value: {
        title: "Inovasi Material untuk Masa Depan Industri",
        description1:
          "Berdiri sejak tahun 2009, Alupbesk telah bertransformasi dari penyedia lokal menjadi salah satu distributor utama komponen aluminium industrial di Asia Tenggara.",
        description2:
          "Kami percaya bahwa presisi bukan sekadar angka, melainkan pondasi dari setiap struktur yang kokoh. Dengan komitmen pada kualitas ISO, kami memastikan setiap profil yang keluar dari gudang kami memenuhi standar teknis yang ketat.",
        visionTitle: "Visi Kami",
        visionText: "Menjadi hub komponen industrial terintegrasi yang memajukan manufaktur Indonesia.",
        missionTitle: "Misi Kami",
        missionText:
          "Memberikan solusi material tepat waktu dengan efisiensi biaya maksimal bagi mitra.",
        imageUrl: "",
        quote:
          "Alupbesk memberikan standar baru dalam distribusi aluminium. Cepat, tepat, dan berkualitas.",
        quoteAuthor: "CEO Industrial Solution",
      },
    },
    {
      key: "contact",
      value: {
        title: "Ayo Berdiskusi Mengenai Proyek Anda",
        subtitle:
          "Tim ahli kami siap membantu Anda memilih komponen yang paling efisien untuk kebutuhan produksi Anda.",
        address:
          "5C9W+4XP, Karang Tengah Sitimulyo, Karang Anom, Sitimulyo, Kec. Piyungan, Kabupaten Bantul, Daerah Istimewa Yogyakarta 55792",
        email: "sales@alupbesk.co.id",
        phone: "+62 21 8901 2345 / +62 812 3456 7890",
        whatsapp: "6283847105847",
        instagram: "",
        linkedin: "",
      },
    },
  ];

  const jobs: { label: string; run: () => PromiseLike<{ error: { message: string } | null }> }[] = [
    { label: "faq_items", run: () => db.from("faq_items").upsert(faqs, { onConflict: "id" }) },
    { label: "custom_services", run: () => db.from("custom_services").upsert(services, { onConflict: "id" }) },
    { label: "site_content", run: () => db.from("site_content").upsert(siteContent, { onConflict: "key" }) },
  ];
  for (const job of jobs) {
    const { error } = await job.run();
    if (error) console.error(`  ${job.label}: GAGAL — ${error.message}`);
    else console.log(`  ${job.label}: ok`);
  }
}

// ---------------------------------------------------------------------
// 2b. Pastikan profil Owner tetap ada (lihat scripts/bootstrap-owner.ts)
// ---------------------------------------------------------------------
const OWNER_EMAIL = "alupbesk96@gmail.com";

async function ensureOwnerProfile(): Promise<void> {
  console.log("\n=== 2b. SELARASKAN PROFIL OWNER ===");
  const { data: authList, error } = await db.auth.admin.listUsers({ perPage: 200 });
  if (error) {
    console.error(`  gagal membaca auth.users — ${error.message}`);
    return;
  }
  const owner = (authList?.users ?? []).find(
    (user) => (user.email ?? "").toLowerCase() === OWNER_EMAIL,
  );
  if (!owner) {
    console.log(`  akun auth ${OWNER_EMAIL} tidak ditemukan (lewati)`);
    return;
  }
  const { error: upsertError } = await db.from("users").upsert(
    {
      id: owner.id,
      name: "Owner",
      email: OWNER_EMAIL,
      role: "owner",
      status: "ACTIVE",
      active: true,
      email_confirmed_at: owner.email_confirmed_at ?? null,
    },
    { onConflict: "id" },
  );
  if (upsertError) console.error(`  GAGAL — ${upsertError.message}`);
  else console.log(`  profil Owner ok (${owner.id})`);
}

// ---------------------------------------------------------------------
// 3. Kosongkan bucket storage yang dipakai aplikasi
// ---------------------------------------------------------------------
const APP_BUCKETS = ["images", "technical-drawings"];

async function listFiles(
  bucket: ReturnType<typeof db.storage.from>,
  path: string,
  depth = 0,
): Promise<string[]> {
  if (depth > 8) return [];
  const out: string[] = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const { data, error } = await bucket.list(path, { limit, offset });
    if (error) throw error;
    for (const entry of data ?? []) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;
      if (entry.id) out.push(entryPath);
      else out.push(...(await listFiles(bucket, entryPath, depth + 1)));
    }
    if (!data || data.length < limit) break;
    offset += limit;
  }
  return out;
}

async function wipeStorage(): Promise<void> {
  console.log("\n=== 3. MENGOSONGKAN FILE STORAGE ===");
  const { data: buckets, error: bucketError } = await db.storage.listBuckets();
  if (bucketError) {
    console.error(`  gagal membaca daftar bucket — ${bucketError.message}`);
    return;
  }
  const names = (buckets ?? []).map((b) => b.name);
  console.log(`  bucket di akun: ${names.join(", ") || "(kosong)"}`);

  for (const name of APP_BUCKETS) {
    if (!names.includes(name)) {
      console.log(`  ${name}: tidak ada (lewati)`);
      continue;
    }
    const bucket = db.storage.from(name);
    try {
      const files = await listFiles(bucket, "");
      if (files.length === 0) {
        console.log(`  ${name}: 0 file (lewati)`);
        continue;
      }
      let removed = 0;
      for (let i = 0; i < files.length; i += 100) {
        const chunk = files.slice(i, i + 100);
        const { error } = await bucket.remove(chunk);
        if (error) throw error;
        removed += chunk.length;
      }
      console.log(`  ${name}: ${removed} file dihapus`);
    } catch (err) {
      console.error(`  ${name}: GAGAL — ${(err as Error).message}`);
    }
  }
  const others = names.filter((n) => !APP_BUCKETS.includes(n));
  if (others.length) {
    console.log(`  bucket lain TIDAK disentuh: ${others.join(", ")}`);
  }
}

async function verify(): Promise<void> {
  console.log("\n=== 4. VERIFIKASI ===");
  for (const table of ["partners", "products", "orders", "users", "faq_items", "site_content"]) {
    const { count, error } = await db
      .from(table)
      .select("*", { count: "exact", head: true });
    console.log(`  ${table}: ${error ? `error — ${error.message}` : `${count ?? 0} baris`}`);
  }
}

async function main(): Promise<void> {
  console.log("RESET DATA APLIKASI — kondisi kembali ke 0 (fresh install)");
  await wipeTables();
  await reseed();
  await ensureOwnerProfile();
  await wipeStorage();
  await verify();
  console.log("\nSelesai.");
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
