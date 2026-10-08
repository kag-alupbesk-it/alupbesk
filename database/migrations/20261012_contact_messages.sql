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
