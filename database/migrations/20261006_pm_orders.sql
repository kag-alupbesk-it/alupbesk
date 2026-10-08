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
