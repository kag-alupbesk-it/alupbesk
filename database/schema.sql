-- =====================================================================
-- ALUPBESK — Database Schema (PostgreSQL / Supabase)
-- Skema ini memetakan seluruh entitas yang saat ini disimpan in-memory
-- (src/services/* dan src/backend/modules/*/store.ts) ke tabel relasional.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. USERS — pengguna sistem (role sesuai folder frontend)
-- ---------------------------------------------------------------------
create type user_role as enum ('pelanggan', 'marketing', 'gudang', 'keuangan', 'manager', 'owner');

create table users (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    email       text unique,
    phone       text,
    dept        text,                -- departemen/layanan
    role        user_role not null default 'pelanggan',
    status      text not null default 'ACTIVE', -- ACTIVE | INACTIVE | PENDING
    active      boolean not null default true,
    created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. PRODUCTS — katalog produk (dikelola divisi marketing, stok di gudang)
-- ---------------------------------------------------------------------
create table products (
    id          serial primary key,
    sku         text unique not null,          -- dipakai sebagai kunci relasi ke gudang_items
    badge       text,
    badge_bg    text default 'bg-success',
    category    text not null,
    title       text not null,
    description text,
    price       numeric(15,2) not null check (price >= 0),
    stock       integer not null default 0 check (stock >= 0),
    img         text,
    datasheet   text,
    best_seller boolean not null default false,
    sold_count  integer not null default 0,
    highlights  jsonb not null default '[]',   -- string[]
    specs       jsonb not null default '[]',   -- [{label, value}]
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- Varian produk (Ukuran, Panjang, Warna) — dinormalisasi dari ProductVariant
create table product_variants (
    id          serial primary key,
    product_id  integer not null references products(id) on delete cascade,
    name        text not null,                 -- "Ukuran" | "Panjang" | "Warna"
    options     jsonb not null default '[]',   -- string[]
    colors      jsonb                            -- hex string[] untuk opsi warna
);

-- ---------------------------------------------------------------------
-- 3. ORDERS + ORDER LINES — pesanan checkout pelanggan
-- ---------------------------------------------------------------------
-- Status pesanan mengikuti alur: marketing → manager → gudang

-- (pending → submitted_to_manager → confirmed/rejected → processing → completed/cancelled)
create type order_status as enum (
    'pending',
    'submitted_to_manager',
    'confirmed',
    'rejected_by_manager',
    'processing',
    'completed',
    'cancelled'
);

create table orders (
    id                  text primary key,      -- format "ord-<random>"
    status              order_status not null default 'pending',
    customer_name       text not null,
    customer_phone      text not null,
    customer_email      text,
    customer_address    text not null,
    customer_note       text,
    total               numeric(15,2) not null default 0 check (total >= 0),
    manager_decision_at timestamptz,
    manager_rejection_reason text,
    marketing_confirmed_at  timestamptz,       -- kolom spesifik marketing
    submitted_to_manager_at timestamptz,
    processed_at        timestamptz,           -- kolom spesifik gudang
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

-- Baris detail pesanan (OrderLine: snapshot title/harga saat pesanan dibuat)
create table order_lines (
    id          serial primary key,
    order_id    text not null references orders(id) on delete cascade,
    product_id  integer not null references products(id),
    quantity    integer not null check (quantity > 0),
    variants    jsonb,                          -- Record<string,string> pilihan varian
    note        text,
    title       text not null,                  -- snapshot nama produk
    unit_price  numeric(15,2) not null,         -- snapshot harga saat order
    subtotal    numeric(15,2) not null
);

-- Riwayat perubahan status pesanan (untuk timeline / activity log)
create table order_status_events (
    id          bigserial primary key,
    order_id    text not null references orders(id) on delete cascade,
    status      order_status not null,
    created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. CUSTOM REQUESTS — permintaan jasa custom (asal proyek & user manager)
-- ---------------------------------------------------------------------
create type custom_request_status as enum ('submitted', 'reviewed', 'quoted', 'accepted', 'rejected');

create table custom_requests (
    id          text primary key,
    nama        text not null,
    perusahaan  text,
    email       text,
    telp        text not null,
    layanan     text not null,
    deskripsi   text not null,
    dimensi     text,
    kuantitas   text,
    deadline    text,
    status      custom_request_status not null default 'submitted',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5. GUDANG — item barang & pergerakan stok
-- ---------------------------------------------------------------------
create type kategori_barang as enum ('eceran', 'proyek');

create table gudang_items (
    id              text primary key,           -- format "gd-<n>"
    sku             text unique not null,       -- cocok dengan products.sku
    jenis_barang    text not null,
    kategori_barang kategori_barang not null,
    satuan          text not null,
    merek           text not null,
    warna           text,
    seksi_lokasi    text,
    stok            numeric(15,2) not null default 0 check (stok >= 0),
    min_stok        numeric(15,2) not null default 0,
    proyek          text,                       -- hanya untuk kategori 'proyek'
    catatan         text,
    created_at      timestamptz not null default now()
);

create type movement_tipe as enum ('masuk', 'keluar');

-- Riwayat barang masuk (supplier + bukti nota) & keluar (tujuan + penerima)
create table gudang_movements (
    id            uuid primary key default gen_random_uuid(),
    item_id       text not null references gudang_items(id) on delete cascade,
    tipe          movement_tipe not null,
    jumlah        numeric(15,2) not null check (jumlah > 0),
    tanggal       date not null,
    sumber        text,                          -- masuk: supplier/tengkulak
    bukti_nota    text,                          -- masuk: file nota
    tujuan        text,                          -- keluar: proyek/penjualan
    penerima      text,                          -- keluar: nama penerima
    catatan       text,
    stok_sebelum  numeric(15,2) not null,
    stok_sesudah  numeric(15,2) not null,
    created_at    timestamptz not null default now()
);

-- Segmen pesanan di gudang (barang proyek / eceran / campuran)
create type gudang_order_segment as enum ('eceran', 'proyek', 'mixed');

-- Pesanan yang ditangani gudang: status subset dari orders + metadata gudang
create table gudang_orders (
    order_id      text primary key references orders(id) on delete cascade,
    status        text not null check (status in ('confirmed', 'processing', 'completed')),
    segmen        gudang_order_segment not null,
    processed_at  timestamptz
);

-- ---------------------------------------------------------------------
-- 6. PROJECT ORDERS — pesanan proyek dari request custom, barang dari gudang
-- ---------------------------------------------------------------------
create type project_order_status as enum ('diajukan', 'diproses', 'selesai');

create table project_orders (
    id              text primary key,           -- format "prj-<random>"
    request_id      text references custom_requests(id),
    nama_proyek     text not null,
    pelanggan       text not null,
    perusahaan      text,
    telepon         text,
    catatan         text,
    total_quantity  integer not null default 0 check (total_quantity >= 0),
    status          project_order_status not null default 'diajukan',
    processed_at    timestamptz,
    completed_at    timestamptz,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- Snapshot barang proyek saat pesanan dibuat
create table project_order_items (
    id              serial primary key,
    project_order_id text not null references project_orders(id) on delete cascade,
    gudang_item_id  text not null references gudang_items(id),
    sku             text not null,
    jenis_barang    text not null,
    merek           text,
    warna           text,
    satuan          text,
    quantity        integer not null check (quantity > 0)
);

-- ---------------------------------------------------------------------
-- 7. KEUANGAN — buku kas & penagihan
-- ---------------------------------------------------------------------
create type kas_tipe as enum ('masuk', 'keluar');
create type kas_kategori as enum ('eceran', 'proyek', 'operasional');
create type payment_status as enum ('belum_bayar', 'lunas');

create table kas_entries (
    id          text primary key,               -- "kas-<uuid>" atau "masuk-<orderId>" (otomatis)
    tipe        kas_tipe not null,
    sumber      text not null,                  -- "Pesanan ord-..." | "Pesanan proyek prj-..."
    deskripsi   text not null,
    jumlah      numeric(15,2) not null check (jumlah >= 0),
    kategori    kas_kategori not null default 'operasional',
    tanggal     date not null default current_date,
    created_at  timestamptz not null default now()
);

-- Status pembayaran per pesanan (penagihan). Key = id pesanan (ord-*/prj-*).
create table penagihan (
    order_id    text primary key,               -- FK ke orders / project_orders
    order_type  text not null check (order_type in ('pesanan', 'proyek')),
    status      payment_status not null default 'belum_bayar',
    updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 8. MARKETING — banner promo
-- ---------------------------------------------------------------------
create table marketing_banners (
    id          uuid primary key default gen_random_uuid(),
    title       text not null,
    subtitle    text,
    image_url   text not null,
    link_url    text,
    active      boolean not null default true,
    sort_order  integer not null default 0,
    start_date  date,
    end_date    date,
    created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 9. PORTOFOLIO — proyek & studi kasus
-- ---------------------------------------------------------------------
create table portfolio_items (
    id          serial primary key,
    client      text not null,
    industry    text not null,
    title       text not null,
    challenge   text not null,
    solution    text not null,
    result      text not null,
    img         text,
    tags        jsonb not null default '[]',    -- string[]
    year        integer
);

create table case_studies (
    id          serial primary key,
    client      text not null,
    logo        text,                           -- inisial/abbrev placeholder
    industry    text not null,
    title       text not null,
    description text,
    metrics     jsonb not null default '[]',    -- [{label, value}]
    img         text,
    year        integer
);

-- ---------------------------------------------------------------------
-- 10. KONTEN WEBSITE — data CMS yang dikelola admin marketing
-- ---------------------------------------------------------------------

-- Mitra / partner (logo ditampilkan sebagai strip di beranda)
create table partners (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    initials    text not null,
    logo_url    text,
    sort_order  integer not null default 0,
    active      boolean not null default true,
    created_at  timestamptz not null default now()
);

-- FAQ (tanya-jawab ditampilkan di beranda)
create table faq_items (
    id          uuid primary key default gen_random_uuid(),
    question    text not null,
    answer      text not null,
    sort_order  integer not null default 0,
    active      boolean not null default true,
    created_at  timestamptz not null default now()
);

-- Layanan jasa custom
create table custom_services (
    id          uuid primary key default gen_random_uuid(),
    icon        text not null,
    title       text not null,
    description text not null,
    sort_order  integer not null default 0,
    active      boolean not null default true,
    created_at  timestamptz not null default now()
);

-- Konten situs dinamis (hero, profil/tentang, kontak, steps custom, kapasitas)
-- Data berbentuk key-value; value disimpan sebagai jsonb untuk fleksibilitas.
create table site_content (
    key         text primary key,
    value       jsonb not null,
    updated_at  timestamptz not null default now()
);

-- =====================================================================
-- INDEX
-- =====================================================================
create index idx_products_category on products(category);
create index idx_products_sku on products(sku);
create index idx_orders_status on orders(status);
create index idx_orders_created_at on orders(created_at desc);
create index idx_order_lines_order_id on order_lines(order_id);
create index idx_gudang_items_kategori on gudang_items(kategori_barang);
create index idx_gudang_items_sku on gudang_items(sku);
create index idx_gudang_movements_item_id on gudang_movements(item_id);
create index idx_kas_entries_tanggal on kas_entries(tanggal);
create index idx_custom_requests_status on custom_requests(status);
create index idx_project_orders_status on project_orders(status);

-- =====================================================================
-- CATATAN UNTUK SUPABASE
-- =====================================================================
-- Aktifkan Row Level Security dan buat policy per role:
--
--   alter table orders enable row level security;
--   create policy "marketing lihat pesanan" on orders
--     for select to authenticated
--     using (auth.jwt() ->> 'role' in ('marketing','gudang','keuangan','manager','owner'));
--
-- Kolom auth users (auth.users) bisa disambungkan ke public.users via
-- trigger on auth.users insert / on update jika autentikasi diaktifkan.
-- Auto-timestamp: gunakan trigger update kolom updated_at bila dibutuhkan.
