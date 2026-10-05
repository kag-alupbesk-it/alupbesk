create table if not exists keuangan_records (
    id          text primary key,
    jenis       text not null check (jenis in ('approval', 'petty_cash', 'termin', 'payroll')),
    data        jsonb not null,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index if not exists idx_keuangan_records_jenis on keuangan_records(jenis);
