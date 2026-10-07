create table if not exists partners (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    initials text not null,
    logo_url text,
    sort_order integer not null default 0,
    active boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists faq_items (
    id uuid primary key default gen_random_uuid(),
    question text not null,
    answer text not null,
    sort_order integer not null default 0,
    active boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists custom_services (
    id uuid primary key default gen_random_uuid(),
    icon text not null,
    title text not null,
    description text not null,
    sort_order integer not null default 0,
    active boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists site_content (
    key text primary key,
    value jsonb not null,
    updated_at timestamptz not null default now()
);

create table if not exists portfolio_items (
    id serial primary key,
    client text not null,
    industry text not null,
    title text not null,
    challenge text not null,
    solution text not null,
    result text not null,
    img text,
    tags jsonb not null default '[]',
    year integer
);

create table if not exists case_studies (
    id serial primary key,
    client text not null,
    logo text,
    industry text not null,
    title text not null,
    description text,
    metrics jsonb not null default '[]',
    img text,
    year integer
);

create index if not exists idx_partners_active_sort
    on partners (active, sort_order);
create index if not exists idx_faq_items_active_sort
    on faq_items (active, sort_order);
create index if not exists idx_custom_services_active_sort
    on custom_services (active, sort_order);

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
