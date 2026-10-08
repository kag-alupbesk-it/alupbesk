create table if not exists finance_dashboard (
    id smallint primary key check (id = 1),
    state jsonb not null,
    updated_at timestamptz not null default now()
);

alter table finance_dashboard enable row level security;
