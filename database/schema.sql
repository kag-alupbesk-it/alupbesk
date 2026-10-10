-- =====================================================================
-- ALUPBESK — Database Schema (PostgreSQL / Supabase)
-- Skema ini memetakan seluruh entitas yang saat ini disimpan in-memory
-- (src/services/* dan src/backend/modules/*/store.ts) ke tabel relasional.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. USERS — pengguna sistem (role sesuai folder frontend)
-- ---------------------------------------------------------------------
create type user_role as enum (
    'pelanggan',
    'marketing',
    'gudang',
    'keuangan',
    'proyek',
    'field',
    'produksi',
    'manager',
    'owner'
);

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

alter table users enable row level security;

create table role_requests (
    id              uuid primary key default gen_random_uuid(),
    auth_user_id    uuid not null references auth.users(id) on delete cascade,
    profile_id      uuid not null references users(id) on delete cascade,
    requested_role  user_role not null check (requested_role <> 'owner'),
    status          text not null default 'PENDING'
                    check (status in ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by     uuid references users(id) on delete set null,
    reviewed_at     timestamptz,
    created_at      timestamptz not null default now()
);

create index idx_role_requests_pending
    on role_requests(created_at desc)
    where status = 'PENDING';
create unique index idx_role_requests_one_pending_per_user
    on role_requests(auth_user_id)
    where status = 'PENDING';
alter table role_requests enable row level security;

-- ---------------------------------------------------------------------
-- 2. PRODUCTS — katalog produk (dikelola divisi marketing, stok di gudang)
-- ---------------------------------------------------------------------
create table products (
    id          serial primary key,
    sku         text unique not null,          -- dipakai sebagai kunci relasi ke gudang_items
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

-- ---------------------------------------------------------------------
-- 11. PM PROJECT WORKFLOW â€” orders and their item snapshots
-- ---------------------------------------------------------------------
create table pm_orders (
    id                      text primary key,
    contractor_name         text not null,
    contractor_code         text not null,
    contractor_phone        text,
    project_address         text,
    entered_at              date not null default current_date,
    target_date             date not null,
    project_status          text not null check (project_status in ('menunggu_acc', 'siap_produksi', 'produksi', 'siap_kirim', 'selesai')),
    drawing_status          text not null check (drawing_status in ('menunggu_acc', 'acc_gambar', 'revisi')),
    stage                   smallint not null default 1 check (stage between 0 and 3),
    production_stage        text not null default 'pemotongan' check (production_stage in ('pemotongan', 'perakitan', 'finishing', 'qc', 'siap_kirim')),
    drawing_variant         text not null check (drawing_variant in ('curtain-wall', 'window-frame', 'ventilation', 'partition')),
    raw_image               text,
    raw_image_name          text,
    technical_note          text,
    production_image        text,
    production_image_name   text,
    production_image_size   bigint,
    production_image_type   text,
    has_production_drawing  boolean not null default false,
    revision_note           text,
    revision_count          integer not null default 0 check (revision_count >= 0),
    last_activity           text not null,
    created_at              timestamptz not null default now(),
    updated_at              timestamptz not null default now()
);

create table pm_order_items (
    id              text primary key,
    order_id        text not null references pm_orders(id) on delete cascade,
    name            text not null,
    quantity        integer not null check (quantity > 0),
    unit            text not null,
    technical_note  text not null default '',
    sort_order      integer not null default 0
);

alter table pm_orders enable row level security;
alter table pm_order_items enable row level security;

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
create index idx_pm_orders_status on pm_orders(project_status, drawing_status);
create index idx_pm_orders_target_date on pm_orders(target_date);
create index idx_pm_order_items_order_id on pm_order_items(order_id, sort_order);

create table field_deliveries (
    id text primary key,
    pm_order_id text not null unique references pm_orders(id) on delete cascade,
    contractor_name text not null,
    contractor_code text not null,
    project_address text not null default '',
    phone text,
    status text not null default 'siap-kirim' check (status in ('siap-kirim','dalam-pengiriman','selesai-kirim')),
    driver_name text,
    plate_number text,
    vehicle_type text,
    shipped_at timestamptz,
    signature_image_url text,
    project_image_url text,
    print_count integer not null default 0 check (print_count >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table field_delivery_items (
    id text primary key,
    delivery_id text not null references field_deliveries(id) on delete cascade,
    name text not null,
    category text not null default 'Material',
    specification text not null default '',
    unit text not null,
    quantity integer not null check (quantity > 0),
    quantity_shipped integer not null default 0 check (quantity_shipped >= 0 and quantity_shipped <= quantity),
    sort_order integer not null default 0
);

create table finance_dashboard (
    id smallint primary key check (id = 1),
    state jsonb not null,
    updated_at timestamptz not null default now()
);

create table contact_messages (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(name) between 2 and 120),
    email text,
    category text not null check (char_length(category) between 1 and 100),
    message text not null check (char_length(message) between 5 and 5000),
    created_at timestamptz not null default now()
);

alter table finance_dashboard enable row level security;
alter table contact_messages enable row level security;

alter table field_deliveries enable row level security;
alter table field_delivery_items enable row level security;
create index idx_field_deliveries_status on field_deliveries(status, updated_at desc);
create index idx_field_delivery_items_delivery on field_delivery_items(delivery_id, sort_order);
create index idx_contact_messages_created_at on contact_messages(created_at desc);

create or replace function delete_gudang_item_if_unused(item_id_input text)
returns boolean
language plpgsql
as $$
begin
    delete from gudang_items where id = item_id_input;
    if found then return true; end if;
    return false;
exception when foreign_key_violation then
    raise exception 'ITEM_IN_USE';
end;
$$;

create or replace function field_submit_shipment(
    delivery_id_input text,
    shipment_items jsonb,
    driver_name_input text,
    plate_number_input text,
    vehicle_type_input text,
    shipped_at_input timestamptz
) returns void language plpgsql as $$
declare
    current_status text;
    shipment_count integer;
    distinct_count integer;
    invalid_count integer;
begin
    select status into current_status from field_deliveries where id = delivery_id_input for update;
    if current_status is null or current_status = 'selesai-kirim' then raise exception 'STATUS_INVALID'; end if;
    select count(*), count(distinct item_id) into shipment_count, distinct_count
      from jsonb_to_recordset(shipment_items) as x(item_id text, quantity integer);
    if shipment_count = 0 or shipment_count <> distinct_count then raise exception 'INVALID_INPUT'; end if;
    select count(*) into invalid_count
      from jsonb_to_recordset(shipment_items) as x(item_id text, quantity integer)
      left join field_delivery_items i on i.id = x.item_id and i.delivery_id = delivery_id_input
     where i.id is null or x.quantity < 0 or x.quantity > i.quantity - i.quantity_shipped;
    if invalid_count > 0 then raise exception 'QUANTITY_EXCEEDED'; end if;
    if not exists (select 1 from jsonb_to_recordset(shipment_items) as x(item_id text, quantity integer) where x.quantity > 0) then raise exception 'INVALID_INPUT'; end if;
    update field_delivery_items i set quantity_shipped = i.quantity_shipped + x.quantity
      from jsonb_to_recordset(shipment_items) as x(item_id text, quantity integer)
     where i.id = x.item_id and i.delivery_id = delivery_id_input;
    update field_deliveries set driver_name = driver_name_input, plate_number = plate_number_input,
      vehicle_type = vehicle_type_input, status = 'dalam-pengiriman', shipped_at = shipped_at_input,
      updated_at = shipped_at_input where id = delivery_id_input;
end;
$$;

insert into faq_items (id, question, answer, sort_order, active)
values
    ('a4000000-0000-4000-8000-000000000001', 'Apakah Alupbesk melayani pemotongan custom?', 'Ya, kami menyediakan layanan pemotongan presisi sesuai gambar teknis Anda menggunakan mesin CNC cutting untuk memastikan akurasi dimensi.', 1, true),
    ('a4000000-0000-4000-8000-000000000002', 'Berapa lama estimasi pengiriman untuk luar kota?', 'Estimasi pengiriman bergantung pada lokasi proyek dan pilihan ekspedisi. Tim kami akan mengonfirmasi jadwal setelah pesanan diproses.', 2, true),
    ('a4000000-0000-4000-8000-000000000003', 'Apakah ada minimum order untuk pembelian B2B?', 'Kami melayani pembelian retail dan partai besar. Ketentuan harga distributor dapat dikonfirmasi kepada tim penjualan.', 3, true),
    ('a4000000-0000-4000-8000-000000000004', 'Bagaimana cara mendapatkan sertifikat material?', 'Sertifikat material dapat diminta saat pemesanan dan akan dikonfirmasi ketersediaannya oleh tim kami.', 4, true)
on conflict (id) do nothing;

insert into custom_services (id, icon, title, description, sort_order, active)
values
    ('a5000000-0000-4000-8000-000000000001', 'straighten', 'Potong Custom', 'Pemotongan presisi sesuai dimensi yang Anda tentukan.', 1, true),
    ('a5000000-0000-4000-8000-000000000002', 'design_services', 'Desain Rangka', 'Konsultasi dan desain rangka aluminium.', 2, true),
    ('a5000000-0000-4000-8000-000000000003', 'format_paint', 'Finishing Custom', 'Anodizing, powder coating, atau mill finish.', 3, true),
    ('a5000000-0000-4000-8000-000000000004', 'precision_manufacturing', 'Fabrikasi Lengkap', 'Dari desain hingga produk jadi siap pasang.', 4, true)
on conflict (id) do nothing;

insert into site_content (key, value)
values
    ('custom_steps', '{"steps":["Isi Form","Diskusi via WA","Penawaran Harga","Produksi"]}'::jsonb),
    ('custom_capacities', '{"capacities":[{"label":"Min. Order","value":"1 unit"},{"label":"Lead Time","value":"3–14 hari kerja"},{"label":"Toleransi","value":"±0.1 mm"},{"label":"Finishing","value":"Anodizing / Powder Coat"}]}'::jsonb),
    ('hero', '{"title":"Solusi Produk Aluminium & Komponen Industrial Terpercaya","subtitle":"Menyediakan material aluminium berkualitas tinggi dan komponen industri presisi untuk mendukung akselerasi produksi bisnis Anda di seluruh Indonesia.","imageUrl":"","primaryCta":"Lihat Katalog","primaryLink":"#katalog"}'::jsonb),
    ('profile', '{"title":"Inovasi Material untuk Masa Depan Industri","description1":"Berdiri sejak tahun 2009, Alupbesk telah bertransformasi dari penyedia lokal menjadi salah satu distributor utama komponen aluminium industrial di Asia Tenggara.","description2":"Kami percaya bahwa presisi bukan sekadar angka, melainkan pondasi dari setiap struktur yang kokoh. Dengan komitmen pada kualitas ISO, kami memastikan setiap profil yang keluar dari gudang kami memenuhi standar teknis yang ketat.","visionTitle":"Visi Kami","visionText":"Menjadi hub komponen industrial terintegrasi yang memajukan manufaktur Indonesia.","missionTitle":"Misi Kami","missionText":"Memberikan solusi material tepat waktu dengan efisiensi biaya maksimal bagi mitra.","imageUrl":"","quote":"Alupbesk memberikan standar baru dalam distribusi aluminium. Cepat, tepat, dan berkualitas.","quoteAuthor":"CEO Industrial Solution"}'::jsonb),
    ('contact', '{"title":"Ayo Berdiskusi Mengenai Proyek Anda","subtitle":"Tim ahli kami siap membantu Anda memilih komponen yang paling efisien untuk kebutuhan produksi Anda.","address":"5C9W+4XP, Karang Tengah Sitimulyo, Karang Anom, Sitimulyo, Kec. Piyungan, Kabupaten Bantul, Daerah Istimewa Yogyakarta 55792","email":"sales@alupbesk.co.id","phone":"+62 21 8901 2345 / +62 812 3456 7890","whatsapp":"6283847105847","instagram":"","linkedin":""}'::jsonb)
on conflict (key) do nothing;

-- =====================================================================
-- CATATAN UNTUK SUPABASE
-- =====================================================================
-- Akses tabel data dilakukan melalui Route Handler server dengan service role.
-- Migrasi 20261013_lockdown_public_tables.sql mengaktifkan RLS pada seluruh
-- tabel sehingga anon/authenticated tidak dapat melewati otorisasi backend.
--
--   alter table orders enable row level security;
--   create policy "marketing lihat pesanan" on orders
--     for select to authenticated
--     using (auth.jwt() ->> 'role' in ('marketing','gudang','keuangan','manager','owner'));
--
-- Kolom auth users (auth.users) bisa disambungkan ke public.users via
-- trigger on auth.users insert / on update jika autentikasi diaktifkan.
-- Auto-timestamp: gunakan trigger update kolom updated_at bila dibutuhkan.

do $$
declare
    table_name text;
begin
    foreach table_name in array array[
        'users', 'products', 'product_variants', 'orders', 'order_lines',
        'order_status_events', 'custom_requests', 'gudang_items',
        'gudang_movements', 'gudang_orders', 'project_orders',
        'project_order_items', 'kas_entries', 'penagihan',
        'marketing_banners', 'portfolio_items', 'case_studies', 'partners',
        'faq_items', 'custom_services', 'site_content', 'pm_orders',
        'pm_order_items', 'field_deliveries', 'field_delivery_items',
        'finance_dashboard', 'contact_messages', 'role_requests'
    ] loop
        if to_regclass(format('public.%I', table_name)) is not null then
            execute format(
                'alter table public.%I enable row level security',
                table_name
            );
        end if;
    end loop;
end;
$$;

create or replace function public.create_role_request_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    requested_role_text text;
    profile_id_value uuid;
    profile_active boolean;
    display_name text;
    department text;
begin
    requested_role_text := coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'requested_role'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'role'), '')
    );
    if requested_role_text is null then
        return new;
    end if;
    if requested_role_text not in (
        'marketing', 'gudang', 'keuangan', 'proyek', 'field', 'produksi'
    ) then
        raise exception 'INVALID_REQUESTED_ROLE';
    end if;

    display_name := coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
        split_part(new.email, '@', 1)
    );
    department := coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'dept'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'department'), '')
    );

    select id, active
      into profile_id_value, profile_active
      from public.users
     where lower(email) = lower(new.email)
     limit 1;
    if profile_active is true then
        raise exception 'PROFILE_ALREADY_ACTIVE';
    end if;

    if profile_id_value is null then
        insert into public.users (id, name, email, dept, role, status, active)
        values (
            new.id, display_name, lower(new.email), department,
            requested_role_text::public.user_role, 'PENDING', false
        )
        returning id into profile_id_value;
    else
        -- Profil sudah dibuat sebelumnya: samakan role/dept dengan pilihan formulir.
        update public.users
           set name = display_name,
               dept = department,
               role = requested_role_text::public.user_role,
               status = 'PENDING',
               active = false
         where id = profile_id_value;
    end if;

    if to_regclass('public.role_requests') is not null then
        delete from public.role_requests
         where profile_id = profile_id_value
           and status = 'PENDING';

        insert into public.role_requests (auth_user_id, profile_id, requested_role)
        values (new.id, profile_id_value, requested_role_text::public.user_role)
        on conflict do nothing;
    end if;
    return new;
end;
$$;

drop trigger if exists on_auth_user_role_request on auth.users;
create trigger on_auth_user_role_request
after insert on auth.users
for each row execute function public.create_role_request_for_auth_user();

create or replace function public.review_role_request(
    request_id_input uuid,
    decision_input text,
    reviewer_id_input uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    request_row public.role_requests%rowtype;
    reviewer_role public.user_role;
begin
    if decision_input not in ('approve', 'reject') then
        raise exception 'INVALID_DECISION';
    end if;

    select role into reviewer_role
      from public.users
     where id = reviewer_id_input
       and active = true;
    if reviewer_role is distinct from 'owner'::public.user_role then
        raise exception 'ROLE_FORBIDDEN';
    end if;

    select * into request_row
      from public.role_requests
     where id = request_id_input
     for update;
    if not found then
        raise exception 'ROLE_REQUEST_NOT_FOUND';
    end if;
    if request_row.status <> 'PENDING' then
        raise exception 'ROLE_REQUEST_ALREADY_REVIEWED';
    end if;

    if decision_input = 'approve' then
        update public.users
           set role = request_row.requested_role,
               status = 'ACTIVE',
               active = true
         where id = request_row.profile_id;
        update public.role_requests
           set status = 'APPROVED',
               reviewed_by = reviewer_id_input,
               reviewed_at = now()
         where id = request_row.id;
    else
        update public.users
           set status = 'SUSPENDED',
               active = false
         where id = request_row.profile_id;
        update public.role_requests
           set status = 'REJECTED',
               reviewed_by = reviewer_id_input,
               reviewed_at = now()
         where id = request_row.id;
    end if;

    return jsonb_build_object(
        'id', request_row.id,
        'profile_id', request_row.profile_id,
        'requested_role', request_row.requested_role,
        'status', case when decision_input = 'approve' then 'APPROVED' else 'REJECTED' end
    );
end;
$$;

revoke all on function public.review_role_request(uuid, text, uuid)
    from public, anon, authenticated;
grant execute on function public.review_role_request(uuid, text, uuid)
    to service_role;

drop policy if exists "owners read role requests" on role_requests;
create policy "owners read role requests" on role_requests
    for select to authenticated
    using (
        exists (
            select 1 from public.users
             where lower(email) = lower(auth.jwt() ->> 'email')
               and active = true
               and role = 'owner'
        )
    );
drop policy if exists "users read own auth profile" on users;
create policy "users read own auth profile" on users
    for select to authenticated
    using (lower(email) = lower(auth.jwt() ->> 'email'));
grant select on users to authenticated;
grant select on role_requests to authenticated;

do $$
begin
    if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
       and not exists (
        select 1 from pg_publication_tables
         where pubname = 'supabase_realtime'
           and schemaname = 'public'
           and tablename = 'role_requests'
       ) then
        alter publication supabase_realtime add table public.role_requests;
    end if;
end;
$$;
