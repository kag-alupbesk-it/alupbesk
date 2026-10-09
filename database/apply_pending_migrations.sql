-- Migrasi tertunda (20261006 s/d 20261016) — aman dijalankan berulang (idempotent).
-- Jalankan sekali di Supabase Dashboard > SQL Editor.

-- ===== database/migrations/20261006_pm_orders.sql =====
create table if not exists pm_orders (
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

create table if not exists pm_order_items (
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

create index if not exists idx_pm_orders_status
    on pm_orders(project_status, drawing_status);
create index if not exists idx_pm_orders_target_date
    on pm_orders(target_date);
create index if not exists idx_pm_order_items_order_id
    on pm_order_items(order_id, sort_order);

-- ===== database/migrations/20261007_field_deliveries.sql =====
alter table pm_orders add column if not exists contractor_phone text;
alter table pm_orders add column if not exists project_address text;

create table if not exists field_deliveries (
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

create table if not exists field_delivery_items (
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

alter table field_deliveries enable row level security;
alter table field_delivery_items enable row level security;
create index if not exists idx_field_deliveries_status on field_deliveries(status, updated_at desc);
create index if not exists idx_field_delivery_items_delivery on field_delivery_items(delivery_id, sort_order);

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
    select status into current_status
    from field_deliveries where id = delivery_id_input for update;
    if current_status is null or current_status = 'selesai-kirim' then
        raise exception 'STATUS_INVALID';
    end if;

    select count(*), count(distinct item_id)
      into shipment_count, distinct_count
      from jsonb_to_recordset(shipment_items) as x(item_id text, quantity integer);
    if shipment_count = 0 or shipment_count <> distinct_count then
        raise exception 'INVALID_INPUT';
    end if;

    select count(*) into invalid_count
    from jsonb_to_recordset(shipment_items) as x(item_id text, quantity integer)
    left join field_delivery_items i on i.id = x.item_id and i.delivery_id = delivery_id_input
    where i.id is null or x.quantity < 0 or x.quantity > i.quantity - i.quantity_shipped;
    if invalid_count > 0 then raise exception 'QUANTITY_EXCEEDED'; end if;

    if not exists (
        select 1 from jsonb_to_recordset(shipment_items) as x(item_id text, quantity integer)
        where x.quantity > 0
    ) then raise exception 'INVALID_INPUT'; end if;

    update field_delivery_items i
       set quantity_shipped = i.quantity_shipped + x.quantity
      from jsonb_to_recordset(shipment_items) as x(item_id text, quantity integer)
     where i.id = x.item_id and i.delivery_id = delivery_id_input;

    update field_deliveries
       set driver_name = driver_name_input,
           plate_number = plate_number_input,
           vehicle_type = vehicle_type_input,
           status = 'dalam-pengiriman',
           shipped_at = shipped_at_input,
           updated_at = shipped_at_input
     where id = delivery_id_input;
end;
$$;

-- ===== database/migrations/20261008_finance_dashboard.sql =====
create table if not exists finance_dashboard (
    id smallint primary key check (id = 1),
    state jsonb not null,
    updated_at timestamptz not null default now()
);

alter table finance_dashboard enable row level security;

-- ===== database/migrations/20261009_users_rls.sql =====
alter table users enable row level security;

-- ===== database/migrations/20261010_delete_gudang_item.sql =====
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

-- ===== database/migrations/20261011_public_content_seed.sql =====
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

-- ===== database/migrations/20261012_contact_messages.sql =====
create table if not exists contact_messages (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(name) between 2 and 120),
    email text,
    category text not null check (char_length(category) between 1 and 100),
    message text not null check (char_length(message) between 5 and 5000),
    created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;
create index if not exists idx_contact_messages_created_at
    on contact_messages (created_at desc);

-- ===== database/migrations/20261013_lockdown_public_tables.sql =====
-- Semua akses data aplikasi melewati Route Handler server yang memakai
-- SUPABASE_SERVICE_ROLE_KEY. Tutup akses langsung anon/authenticated agar
-- tabel tidak dapat dibaca atau diubah dengan anon key.
do $$
declare
    table_name text;
begin
    foreach table_name in array array[
        'users',
        'products',
        'product_variants',
        'orders',
        'order_lines',
        'order_status_events',
        'custom_requests',
        'gudang_items',
        'gudang_movements',
        'gudang_orders',
        'project_orders',
        'project_order_items',
        'kas_entries',
        'penagihan',
        'marketing_banners',
        'portfolio_items',
        'case_studies',
        'partners',
        'faq_items',
        'custom_services',
        'site_content',
        'pm_orders',
        'pm_order_items',
        'field_deliveries',
        'field_delivery_items',
        'finance_dashboard',
        'contact_messages'
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

-- ===== database/migrations/20261014_operational_roles.sql =====
alter type user_role add value if not exists 'proyek';
alter type user_role add value if not exists 'field';
alter type user_role add value if not exists 'produksi';

-- ===== database/migrations/20261015_role_requests.sql =====
create table if not exists role_requests (
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

create index if not exists idx_role_requests_pending
    on role_requests(created_at desc)
    where status = 'PENDING';

create unique index if not exists idx_role_requests_one_pending_per_user
    on role_requests(auth_user_id)
    where status = 'PENDING';

alter table role_requests enable row level security;

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
    requested_role_text := new.raw_user_meta_data ->> 'requested_role';
    if requested_role_text is null or requested_role_text = '' then
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
    department := nullif(trim(new.raw_user_meta_data ->> 'department'), '');

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
            new.id,
            display_name,
            lower(new.email),
            department,
            'pelanggan',
            'PENDING',
            false
        )
        returning id into profile_id_value;
    end if;

    insert into public.role_requests (
        auth_user_id,
        profile_id,
        requested_role
    ) values (
        new.id,
        profile_id_value,
        requested_role_text::public.user_role
    );

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

drop policy if exists "users read own auth profile" on public.users;
create policy "users read own auth profile" on public.users
    for select to authenticated
    using (lower(email) = lower(auth.jwt() ->> 'email'));
grant select on public.users to authenticated;

drop policy if exists "owners read role requests" on public.role_requests;
create policy "owners read role requests" on public.role_requests
    for select to authenticated
    using (
        exists (
            select 1 from public.users
             where lower(email) = lower(auth.jwt() ->> 'email')
               and active = true
               and role = 'owner'
        )
    );
grant select on public.role_requests to authenticated;

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

-- ===== database/migrations/20261016_register_profile_role.sql =====
-- Pendaftaran: role & dept di public.users mengikuti pilihan formulir,
-- bukan nilai default 'pelanggan'. Aman dijalankan berulang.

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
